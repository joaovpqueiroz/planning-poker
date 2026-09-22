import { DeckType, RoomState, Story, User } from '../types.js';

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();

  createRoom(name: string, deckType: DeckType = 'scrum', customDeck?: string[]): RoomState {
    // Generate a friendly 6-character room code or random ID
    const id = this.generateRoomId();
    const room: RoomState = {
      id,
      name: name.trim() || 'Planning Poker Session',
      deckType,
      customDeck,
      users: {},
      currentStoryId: null,
      stories: [],
      isRevealed: false,
      allowAnyoneReveal: false,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    this.rooms.set(id, room);
    return room;
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(
    roomId: string,
    userData: { id: string; name: string; avatar: string; role: 'player' | 'spectator' }
  ): { room: RoomState; user: User } {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(`Sala ${roomId}`);
      room.id = roomId;
      this.rooms.set(roomId, room);
    }

    room.lastActive = Date.now();

    // Check if user already exists (reconnection)
    const existingUser = room.users[userData.id];
    const isFirstUser = Object.values(room.users).filter((u) => u.connected).length === 0;

    const user: User = {
      id: userData.id,
      name: userData.name.trim() || 'Anônimo',
      avatar: userData.avatar || '🦊',
      role: userData.role || 'player',
      isFacilitator: existingUser ? existingUser.isFacilitator : isFirstUser,
      vote: existingUser ? existingUser.vote : null,
      hasVoted: existingUser ? existingUser.hasVoted : false,
      connected: true,
    };

    room.users[userData.id] = user;
    return { room, user };
  }

  leaveRoom(roomId: string, userId: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const user = room.users[userId];
    if (user) {
      user.connected = false;

      // If facilitator left, assign next connected user
      if (user.isFacilitator) {
        user.isFacilitator = false;
        const nextConnected = Object.values(room.users).find((u) => u.connected && u.id !== userId);
        if (nextConnected) {
          nextConnected.isFacilitator = true;
        }
      }
    }

    room.lastActive = Date.now();
    return room;
  }

  castVote(roomId: string, userId: string, vote: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room || room.isRevealed) return undefined;

    const user = room.users[userId];
    if (!user || user.role !== 'player') return undefined;

    // Toggle vote if clicking the same card
    if (user.vote === vote) {
      user.vote = null;
      user.hasVoted = false;
    } else {
      user.vote = vote;
      user.hasVoted = true;
    }

    room.lastActive = Date.now();
    return room;
  }

  revealCards(roomId: string, userId: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const user = room.users[userId];
    if (!room.allowAnyoneReveal && (!user || !user.isFacilitator)) {
      return undefined;
    }

    room.isRevealed = true;
    room.lastActive = Date.now();
    return room;
  }

  resetRound(roomId: string, userId: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const user = room.users[userId];
    if (!room.allowAnyoneReveal && (!user || !user.isFacilitator)) {
      return undefined;
    }

    room.isRevealed = false;
    for (const u of Object.values(room.users)) {
      u.vote = null;
      u.hasVoted = false;
    }

    room.lastActive = Date.now();
    return room;
  }

  updateSettings(
    roomId: string,
    userId: string,
    settings: { deckType?: DeckType; customDeck?: string[]; allowAnyoneReveal?: boolean }
  ): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const user = room.users[userId];
    if (!user || !user.isFacilitator) return undefined;

    if (settings.deckType !== undefined) room.deckType = settings.deckType;
    if (settings.customDeck !== undefined) room.customDeck = settings.customDeck;
    if (settings.allowAnyoneReveal !== undefined) room.allowAnyoneReveal = settings.allowAnyoneReveal;

    room.lastActive = Date.now();
    return room;
  }

  addStory(roomId: string, title: string, description?: string, link?: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const story: Story = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description?.trim(),
      link: link?.trim(),
      status: room.stories.length === 0 ? 'voting' : 'pending',
      createdAt: Date.now(),
    };

    room.stories.push(story);
    if (!room.currentStoryId) {
      room.currentStoryId = story.id;
    }

    room.lastActive = Date.now();
    return room;
  }

  setCurrentStory(roomId: string, storyId: string | null): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    room.currentStoryId = storyId;
    room.isRevealed = false;
    for (const u of Object.values(room.users)) {
      u.vote = null;
      u.hasVoted = false;
    }

    for (const s of room.stories) {
      if (s.id === storyId) s.status = 'voting';
      else if (s.status === 'voting') s.status = 'pending';
    }

    room.lastActive = Date.now();
    return room;
  }

  saveStoryEstimate(roomId: string, storyId: string, estimate: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const story = room.stories.find((s) => s.id === storyId);
    if (story) {
      story.finalEstimate = estimate;
      story.status = 'completed';
    }

    room.lastActive = Date.now();
    return room;
  }

  transferFacilitator(roomId: string, currentId: string, targetId: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const current = room.users[currentId];
    const target = room.users[targetId];

    if (current?.isFacilitator && target) {
      current.isFacilitator = false;
      target.isFacilitator = true;
    }

    room.lastActive = Date.now();
    return room;
  }

  private generateRoomId(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
