import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomState, RoundStats, User, Role } from '../types';
import { playConsensusSound, playRevealSound, playVoteSound } from '../utils/audio';
import { fireConsensusConfetti } from '../utils/confetti';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function usePokerSocket(roomId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<RoundStats | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room:joined', (data: { room: RoomState; currentUser: User; stats: RoundStats | null }) => {
      setRoom(data.room);
      setCurrentUser(data.currentUser);
      setStats(data.stats);
    });

    socket.on('room:updated', (data: { room: RoomState; stats: RoundStats | null }) => {
      setRoom(data.room);
      setStats(data.stats);

      // Keep currentUser synchronized with latest room state
      setCurrentUser((prev) => {
        if (!prev) return null;
        return data.room.users[prev.id] || prev;
      });
    });

    socket.on('cards:revealed', (data: { stats: RoundStats; consensus: boolean }) => {
      playRevealSound();
      if (data.consensus) {
        setTimeout(() => {
          playConsensusSound();
          fireConsensusConfetti();
        }, 300);
      }
    });

    socket.on('round:reset', () => {
      // Audio or feedback if needed
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback(
    (targetRoomId: string, userData: { id: string; name: string; avatar: string; role: 'player' | 'spectator' }) => {
      if (!socketRef.current) return;
      socketRef.current.emit('room:join', { roomId: targetRoomId, user: userData });
    },
    []
  );

  const castVote = useCallback(
    (vote: string) => {
      if (!socketRef.current || !room || room.isRevealed) return;
      playVoteSound();
      socketRef.current.emit('vote:cast', { vote });
    },
    [room]
  );

  const revealCards = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('cards:reveal');
  }, []);

  const resetRound = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('round:reset');
  }, []);

  const updateSettings = useCallback(
    (settings: { deckType?: any; allowAnyoneReveal?: boolean; customDeck?: string[] }) => {
      if (!socketRef.current) return;
      socketRef.current.emit('settings:update', settings);
    },
    []
  );

  const addStory = useCallback((title: string, description?: string, link?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('story:add', { title, description, link });
  }, []);

  const selectStory = useCallback((storyId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('story:select', { storyId });
  }, []);

  const estimateStory = useCallback((storyId: string, estimate: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('story:estimate', { storyId, estimate });
  }, []);

  const updateStory = useCallback(
    (storyId: string, updates: { title?: string; description?: string; link?: string }) => {
      if (!socketRef.current) return;
      socketRef.current.emit('story:update', { storyId, updates });
    },
    []
  );

  const deleteStory = useCallback((storyId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('story:delete', { storyId });
  }, []);

  const transferFacilitator = useCallback((targetUserId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('facilitator:transfer', { targetUserId });
  }, []);

  const updateProfile = useCallback(
    (data: { name: string; avatar: string; role?: Role }) => {
      if (!socketRef.current) return;
      localStorage.setItem('poker_username', data.name);
      localStorage.setItem('poker_avatar', data.avatar);
      if (data.role) {
        localStorage.setItem('poker_role', data.role);
      }
      socketRef.current.emit('user:update-profile', data);
    },
    []
  );

  return {
    isConnected,
    room,
    currentUser,
    stats,
    joinRoom,
    castVote,
    revealCards,
    resetRound,
    updateSettings,
    addStory,
    selectStory,
    estimateStory,
    updateStory,
    deleteStory,
    transferFacilitator,
    updateProfile,
  };
}
