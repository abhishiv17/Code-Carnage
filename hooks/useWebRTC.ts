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

/* ─── STUN config ─── */
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

/* ─── Signaling message types ─── */
type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'hangup';

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

  /* ── initialise media + peer connection ── */
  useEffect(() => {
    if (!sessionId || !userId) return;

    let isMounted = true;
    const supabase = createClient();
    const pendingCandidates: RTCIceCandidateInit[] = [];

    async function init() {
      /* 1. Get local media */
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (!isMounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      cameraTrackRef.current =
        stream.getVideoTracks()[0] ?? null;
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
        e.streams[0]?.getTracks().forEach((t) => remote.addTrack(t));
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
      };

      /* 3. Supabase Broadcast channel */
      const channel = supabase.channel(`webrtc-${sessionId}`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'signal' }, async ({ payload }) => {
          const msg = payload as SignalPayload;
          if (msg.sender === userId) return; // ignore own

          try {
            if (msg.type === 'offer' && msg.data) {
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
              await pc.setRemoteDescription(
                new RTCSessionDescription(msg.data as RTCSessionDescriptionInit),
              );
              // flush pending candidates
              for (const c of pendingCandidates) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              }
              pendingCandidates.length = 0;
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
          if (status === 'SUBSCRIBED' && isCaller) {
            // Caller creates the offer after channel ready
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            broadcast({ type: 'offer', sender: userId, data: offer });
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
        const supabase = createClient();
        supabase.removeChannel(channelRef.current);
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
          video: true,
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
