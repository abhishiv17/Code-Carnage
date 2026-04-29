'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WEBRTC_CONFIG } from '@/lib/constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

type SignalType = 'peer-joined' | 'peer-present' | 'offer' | 'answer' | 'ice-candidate';

interface SignalPayload {
  type: SignalType;
  senderId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  error: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
  endCall: () => void;
}

export function useWebRTC({ sessionId, userId }: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const makingOfferRef = useRef(false);
  const iceQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOfferRef = useRef(false);

  // Broadcast signal through Supabase Realtime
  const sendSignal = useCallback((payload: Omit<SignalPayload, 'senderId'>) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: { ...payload, senderId: userId },
    });
  }, [userId]);

  // Create RTCPeerConnection with handlers
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);

    // Add local tracks to connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Collect remote tracks
    const remote = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(remote);
    };

    // Trickle ICE — send candidates as they arrive
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnecting(false);
        setIsConnected(true);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    // Perfect negotiation: handle negotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        sendSignal({ type: 'offer', offer: pc.localDescription!.toJSON() });
      } catch (err) {
        console.error('[WebRTC] negotiation error:', err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal]);

  // Handle incoming signals from remote peer
  const handleSignal = useCallback(async (payload: SignalPayload) => {
    // Ignore own signals
    if (payload.senderId === userId) return;
    const pc = pcRef.current;
    if (!pc) return;

    try {
      if (payload.type === 'peer-joined') {
        sendSignal({ type: 'peer-present' });
      }

      if (payload.type === 'peer-joined' || payload.type === 'peer-present') {
        const isCaller = userId < payload.senderId;
        if (isCaller && !hasSentOfferRef.current) {
          hasSentOfferRef.current = true;
          makingOfferRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: 'offer', offer: pc.localDescription!.toJSON() });
          makingOfferRef.current = false;
        }
      }

      if (payload.type === 'offer') {
        const isPolite = userId > payload.senderId;
        const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
        if (offerCollision && !isPolite) return;

        if (offerCollision) {
          await pc.setLocalDescription({ type: 'rollback' });
        }
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer!));
        await pc.setLocalDescription();
        sendSignal({ type: 'answer', answer: pc.localDescription!.toJSON() });

        for (const candidate of iceQueueRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceQueueRef.current = [];
      }

      if (payload.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer!));
        for (const candidate of iceQueueRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceQueueRef.current = [];
      }

      if (payload.type === 'ice-candidate' && payload.candidate) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else {
          iceQueueRef.current.push(payload.candidate);
        }
      }
    } catch (err) {
      console.error('[WebRTC] signal handling error:', err);
    }
  }, [userId, sendSignal]);

  // --- Main init effect ---
  useEffect(() => {
    if (!sessionId || !userId) return;

    let mounted = true;
    const supabase = createClient();

    const init = async () => {
      try {
        // 1. Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Store camera track for screen-share swap
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) cameraTrackRef.current = videoTrack;

        // 2. Create peer connection
        const pc = createPeerConnection(stream);

        // 3. Join Supabase Broadcast channel for signaling
        const channel = supabase.channel(`webrtc-${sessionId}`, {
          config: { broadcast: { self: false } },
        });

        channel.on('broadcast', { event: 'webrtc-signal' }, ({ payload }) => {
          handleSignal(payload as SignalPayload);
        });

        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            sendSignal({ type: 'peer-joined' });
          }
        });

        channelRef.current = channel;
      } catch (err) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to access camera/mic';
        setError(msg);
        setIsConnecting(false);
      }
    };

    init();

    return () => {
      mounted = false;
      // Cleanup
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (channelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, userId, createPeerConnection, handleSignal, sendSignal]);

  // --- Controls ---

  const toggleMic = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
    if (!videoSender) return;

    if (isScreenSharing) {
      // Switch back to camera
      const camTrack = cameraTrackRef.current;
      if (camTrack) {
        await videoSender.replaceTrack(camTrack);
        // Update local stream so local preview shows camera again
        const stream = localStreamRef.current;
        if (stream) {
          const oldTrack = stream.getVideoTracks()[0];
          if (oldTrack) stream.removeTrack(oldTrack);
          stream.addTrack(camTrack);
          setLocalStream(new MediaStream(stream.getTracks()));
        }
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        await videoSender.replaceTrack(screenTrack);

        // Update local stream preview to show screen
        const stream = localStreamRef.current;
        if (stream) {
          const oldTrack = stream.getVideoTracks()[0];
          if (oldTrack) stream.removeTrack(oldTrack);
          stream.addTrack(screenTrack);
          setLocalStream(new MediaStream(stream.getTracks()));
        }

        setIsScreenSharing(true);

        // Auto-revert when user clicks browser "Stop sharing" button
        screenTrack.onended = () => {
          const cam = cameraTrackRef.current;
          if (cam && videoSender) {
            videoSender.replaceTrack(cam);
            const s = localStreamRef.current;
            if (s) {
              const old = s.getVideoTracks()[0];
              if (old) s.removeTrack(old);
              s.addTrack(cam);
              setLocalStream(new MediaStream(s.getTracks()));
            }
          }
          setIsScreenSharing(false);
        };
      } catch {
        // User cancelled screen share picker — do nothing
      }
    }
  }, [isScreenSharing]);

  const endCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    endCall,
  };
}
