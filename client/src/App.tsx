import React, { useEffect, useState } from 'react';
import { usePokerSocket } from './hooks/usePokerSocket';
import { Navbar } from './components/layout/Navbar';
import { PokerTable } from './components/poker/PokerTable';
import { CardDeck } from './components/poker/CardDeck';
import { RoundStatsPanel } from './components/poker/RoundStatsPanel';
import { StoryManager } from './components/story/StoryManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { LobbyModal } from './components/lobby/LobbyModal';
import { CreateRoomLanding } from './components/lobby/CreateRoomLanding';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { DeckType, Role } from './types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function App() {
  const [roomId, setRoomId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });

  const [hasJoined, setHasJoined] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
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
    transferFacilitator,
    updateProfile,
  } = usePokerSocket(roomId || undefined);

  // Generate or retrieve persistent user ID
  const [userId] = useState(() => {
    let id = localStorage.getItem('poker_userid');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('poker_userid', id);
    }
    return id;
  });

  // Check URL changes (e.g. back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setRoomId(params.get('room'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler to create a new room from the landing page
  const handleCreateRoom = async (data: {
    roomName: string;
    userName: string;
    avatar: string;
    deckType: DeckType;
  }) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.roomName,
          deckType: data.deckType,
        }),
      });
      const json = await res.json();
      if (json.roomId) {
        const newUrl = `${window.location.pathname}?room=${json.roomId}`;
        window.history.pushState({}, '', newUrl);
        setRoomId(json.roomId);

        // Join room immediately as creator
        joinRoom(json.roomId, {
          id: userId,
          name: data.userName,
          avatar: data.avatar,
          role: 'player',
        });
        setHasJoined(true);
      }
    } catch (err) {
      console.error('Falha ao criar sala:', err);
      alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
  };

  // Handler to join by room code
  const handleJoinByCode = (code: string) => {
    const newUrl = `${window.location.pathname}?room=${code}`;
    window.history.pushState({}, '', newUrl);
    setRoomId(code);
  };

  // Handler when user submits their profile in LobbyModal
  const handleLobbyJoin = (data: { name: string; avatar: string; role: Role }) => {
    if (!roomId) return;
    joinRoom(roomId, {
      id: userId,
      name: data.name,
      avatar: data.avatar,
      role: data.role,
    });
    setHasJoined(true);
  };

  // If no room is selected, show Landing Page
  if (!roomId) {
    return (
      <CreateRoomLanding
        onCreateRoom={handleCreateRoom}
        onJoinByCode={handleJoinByCode}
      />
    );
  }

  // If user hasn't joined this room yet, show LobbyModal
  if (!hasJoined && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <LobbyModal
          roomName={room ? room.name : `Sala #${roomId}`}
          onJoin={handleLobbyJoin}
        />
      </div>
    );
  }

  // Active room view
  const currentStory = room?.stories.find((s) => s.id === room.currentStoryId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-32">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />

      {/* Top Navbar */}
      {room && (
        <Navbar
          room={room}
          currentUser={currentUser}
          isConnected={isConnected}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Main Board Arena */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex-1 flex flex-col items-center">
        {room && (
          <>
            {/* Story / Backlog Manager */}
            <StoryManager
              stories={room.stories}
              currentStoryId={room.currentStoryId}
              isFacilitator={!!currentUser?.isFacilitator}
              onAddStory={addStory}
              onSelectStory={selectStory}
            />

            {/* Poker Table Surface & Seats */}
            <PokerTable
              room={room}
              currentUser={currentUser}
              stats={stats}
              onReveal={revealCards}
              onReset={resetRound}
              onTransferFacilitator={transferFacilitator}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Stats Panel (when revealed) */}
            {room.isRevealed && stats && (
              <RoundStatsPanel
                stats={stats}
                currentStory={currentStory}
                isFacilitator={!!currentUser?.isFacilitator}
                onSaveEstimate={estimateStory}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Card Deck */}
      {room && currentUser && (
        <CardDeck
          deckType={room.deckType}
          customDeck={room.customDeck}
          selectedVote={currentUser.vote}
          isRevealed={room.isRevealed}
          isSpectator={currentUser.role === 'spectator'}
          onSelectVote={castVote}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && room && (
        <SettingsModal
          room={room}
          currentUser={currentUser}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={updateSettings}
          onTransferFacilitator={transferFacilitator}
        />
      )}

      {/* Edit Profile Modal */}
      {isProfileOpen && currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onSave={updateProfile}
        />
      )}
    </div>
  );
}

export default App;
