
import { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { supabase } from '@/integrations/supabase/client';

interface Peer {
  id: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
}

export const useWebRTC = (roomId: string, userId: string) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const peersRef = useRef<Peer[]>([]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: false 
        });
        setLocalStream(stream);
        stream.getAudioTracks()[0].enabled = false; // Start muted
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initializeMedia();

    const channel = supabase.channel(`room:${roomId}`)
      .on('broadcast', { event: 'user-joined' }, ({ payload }) => {
        createPeer(payload.userId, false, localStream);
      })
      .on('broadcast', { event: 'user-left' }, ({ payload }) => {
        const peer = peersRef.current.find(p => p.id === payload.userId);
        if (peer) {
          peer.peer.destroy();
          setPeers(prev => prev.filter(p => p.id !== payload.userId));
          peersRef.current = peersRef.current.filter(p => p.id !== payload.userId);
        }
      })
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        if (payload.target === userId) {
          createPeer(payload.caller, false, localStream, payload.signal);
        }
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        const peer = peersRef.current.find(p => p.id === payload.caller);
        if (peer) {
          peer.peer.signal(payload.signal);
        }
      })
      .subscribe();

    // Announce joining
    channel.send({
      type: 'broadcast',
      event: 'user-joined',
      payload: { userId }
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(peer => peer.peer.destroy());
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, localStream]);

  const createPeer = (peerId: string, initiator: boolean, stream: MediaStream | null, signal?: any) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: stream || undefined
    });

    peer.on('signal', (data) => {
      const channel = supabase.channel(`room:${roomId}`);
      channel.send({
        type: 'broadcast',
        event: initiator ? 'offer' : 'answer',
        payload: {
          signal: data,
          caller: userId,
          target: peerId
        }
      });
    });

    peer.on('stream', (remoteStream) => {
      setPeers(prev => prev.map(p => 
        p.id === peerId ? { ...p, stream: remoteStream } : p
      ));
    });

    if (signal) {
      peer.signal(signal);
    }

    const newPeer = { id: peerId, peer };
    peersRef.current.push(newPeer);
    setPeers(prev => [...prev, newPeer]);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return {
    peers,
    localStream,
    isMuted,
    isConnected,
    toggleMute
  };
};
