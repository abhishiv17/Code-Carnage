'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/* ─── Types ─── */
export interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  /** true = this user creates the offer (caller) */
  isCaller: boolean;
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  screenSharing: boolean;
  connectionState: RTCPeerConnectionState | 'new';
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => Promise<void>;
  hangUp: () => void;
}

/* ─── ICE config with free STUN + TURN ─── */
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'stun:stun.relay.metered.ca:80',
    },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'e8dd65c092bfccf46b5c1953',
      credential: 'sPaZ8oMLkLfTYDgf',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'e8dd65c092bfccf46b5c1953',
      credential: 'sPaZ8oMLkLfTYDgf',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'e8dd65c092bfccf46b5c1953',
      credential: 'sPaZ8oMLkLfTYDgf',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'e8dd65c092bfccf46b5c1953',
      credential: 'sPaZ8oMLkLfTYDgf',
    },
  ],
  iceCandidatePoolSize: 10,
};

/* ─── Signaling message types ─── */
type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'hangup' | 'ready' | 'renegotiate';

interface SignalPayload {
  type: SignalType;
  sender: string;
  data: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
}

/* ─── Hook ─── */
export function useWebRTC({
  sessionId,
  userId,
  isCaller,
}: UseWebRTCOptions): UseWebRTCReturn {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const supabaseRef = useRef(createClient());
  const makingOfferRef = useRef(false);
  const peerReadyRef = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | 'new'>('new');

  /* ── helpers ── */
  const broadcast = useCallback(
    (payload: SignalPayload) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload,
      });
    },
    [],
  );

  /* ── Create offer (called by polite/impolite negotiation) ── */
  const createAndSendOffer = useCallback(
    async (pc: RTCPeerConnection) => {
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        if (pc.signalingState !== 'stable') return;
        await pc.setLocalDescription(offer);
        broadcast({ type: 'offer', sender: userId, data: pc.localDescription!.toJSON() });
      } catch (err) {
        console.error('[useWebRTC] createOffer error', err);
      } finally {
        makingOfferRef.current = false;
      }
    },
    [broadcast, userId],
  );

  /* ── initialise media + peer connection ── */
  useEffect(() => {
    if (!sessionId || !userId) return;

    let isMounted = true;
    const supabase = supabaseRef.current;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    async function init() {
      /* 1. Get local media — graceful fallback */
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (mediaErr) {
        console.warn('[useWebRTC] Camera/mic unavailable, trying audio-only…', mediaErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (isMounted) setCameraOn(false);
        } catch {
          console.error('[useWebRTC] No media devices available');
          stream = new MediaStream(); // empty stream – still allows receiving
        }
      }

      if (!isMounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
      setLocalStream(stream);

      /* 2. Create peer connection */
      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      /* Add local tracks */
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      /* Remote stream */
      const remote = new MediaStream();
      if (isMounted) setRemoteStream(remote);

      pc.ontrack = (e) => {
        e.streams[0]?.getTracks().forEach((t) => {
          if (!remote.getTracks().find((rt) => rt.id === t.id)) {
            remote.addTrack(t);
          }
        });
        if (isMounted) setRemoteStream(new MediaStream(remote.getTracks()));
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          broadcast({
            type: 'ice-candidate',
            sender: userId,
            data: e.candidate.toJSON(),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (isMounted) setConnectionState(pc.connectionState);
        // Attempt reconnection on failure
        if (pc.connectionState === 'failed') {
          console.warn('[useWebRTC] Connection failed, restarting ICE…');
          pc.restartIce();
          if (isCaller) {
            createAndSendOffer(pc);
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected') {
          console.warn('[useWebRTC] ICE disconnected, will try reconnecting…');
        }
      };

      // Perfect negotiation: handle renegotiation needs
      pc.onnegotiationneeded = async () => {
        if (isCaller && peerReadyRef.current) {
          await createAndSendOffer(pc);
        }
      };

      /* 3. Supabase Broadcast channel for signaling */
      const channel = supabase.channel(`webrtc-${sessionId}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'signal' }, async ({ payload }) => {
          const msg = payload as SignalPayload;
          if (msg.sender === userId) return; // ignore own

          try {
            /* Peer announced they are ready */
            if (msg.type === 'ready') {
              peerReadyRef.current = true;
              // If I'm the caller, now send the offer
              if (isCaller && pc.signalingState === 'stable') {
                await createAndSendOffer(pc);
              }
              return;
            }

            /* Peer wants renegotiation */
            if (msg.type === 'renegotiate') {
              if (isCaller) {
                await createAndSendOffer(pc);
              }
              return;
            }

            if (msg.type === 'offer' && msg.data) {
              // "Perfect negotiation" — polite peer rolls back
              const offerCollision =
                makingOfferRef.current || pc.signalingState !== 'stable';
              const isPolite = !isCaller;

              if (offerCollision && !isPolite) {
                // Impolite peer ignores incoming offer during collision
                return;
              }

              if (offerCollision && isPolite) {
                await Promise.all([
                  pc.setLocalDescription({ type: 'rollback' }),
                ]);
              }

              await pc.setRemoteDescription(
                new RTCSessionDescription(msg.data as RTCSessionDescriptionInit),
              );
              // flush pending candidates
              for (const c of pendingCandidates) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              }
              pendingCandidates.length = 0;

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              broadcast({ type: 'answer', sender: userId, data: answer });
            }

            if (msg.type === 'answer' && msg.data) {
              if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(msg.data as RTCSessionDescriptionInit),
                );
                // flush pending candidates
                for (const c of pendingCandidates) {
                  await pc.addIceCandidate(new RTCIceCandidate(c));
                }
                pendingCandidates.length = 0;
              }
            }

            if (msg.type === 'ice-candidate' && msg.data) {
              if (pc.remoteDescription) {
                await pc.addIceCandidate(
                  new RTCIceCandidate(msg.data as RTCIceCandidateInit),
                );
              } else {
                pendingCandidates.push(msg.data as RTCIceCandidateInit);
              }
            }

            if (msg.type === 'hangup') {
              pc.close();
              if (isMounted) setConnectionState('closed' as RTCPeerConnectionState);
            }
          } catch (err) {
            console.error('[useWebRTC] signaling error', err);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Announce we are ready
            broadcast({ type: 'ready', sender: userId, data: null });

            // If caller, wait a beat then send offer
            // (peer may already be subscribed)
            if (isCaller) {
              setTimeout(async () => {
                if (pc.signalingState === 'stable' && !pc.remoteDescription) {
                  await createAndSendOffer(pc);
                }
              }, 1000);
            }
          }
        });

      channelRef.current = channel;
    }

    init().catch(console.error);

    return () => {
      isMounted = false;
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userId, isCaller]);

  /* ── toggle camera ── */
  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  }, []);

  /* ── toggle mic ── */
  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  }, []);

  /* ── toggle screen share (replaceTrack, no renegotiation) ── */
  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const videoSender = pc
      .getSenders()
      .find((s) => s.track?.kind === 'video');
    if (!videoSender) return;

    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false,
        });
        const screenTrack = displayStream.getVideoTracks()[0];

        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          if (cameraTrackRef.current) {
            videoSender.replaceTrack(cameraTrackRef.current);
          }
          setScreenSharing(false);
        };

        await videoSender.replaceTrack(screenTrack);
        setScreenSharing(true);
      } catch {
        // User cancelled the screen picker
        console.log('[useWebRTC] screen share cancelled');
      }
    } else {
      // Switch back to camera
      if (cameraTrackRef.current) {
        await videoSender.replaceTrack(cameraTrackRef.current);
      }
      setScreenSharing(false);
    }
  }, [screenSharing]);

  /* ── hang up ── */
  const hangUp = useCallback(() => {
    broadcast({ type: 'hangup', sender: userId, data: null });
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setConnectionState('closed' as RTCPeerConnectionState);
  }, [broadcast, userId]);

  return {
    localStream,
    remoteStream,
    cameraOn,
    micOn,
    screenSharing,
    connectionState,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    hangUp,
  };
}
