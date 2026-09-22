import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './store/roomManager.js';
import { calculateRoundStats } from './utils/stats.js';
import { RoomState, User } from './types.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();

// Helper to hide votes before cards are revealed
function sanitizeRoomForUser(room: RoomState, recipientUserId: string): RoomState {
  if (room.isRevealed) {
    return room;
  }

  const maskedUsers: Record<string, User> = {};
  for (const [id, user] of Object.entries(room.users)) {
    if (id === recipientUserId) {
      maskedUsers[id] = user;
    } else {
      maskedUsers[id] = {
        ...user,
        vote: null, // Hidden until revealed
      };
    }
  }

  return {
    ...room,
    users: maskedUsers,
  };
}

// Broadcasts customized state to each user in room
function broadcastRoomState(roomId: string, extraEvent?: { name: string; data: any }) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const stats = room.isRevealed ? calculateRoundStats(room.users) : null;

  // Emit to each socket connected to the room
  const sockets = io.sockets.adapter.rooms.get(roomId);
  if (sockets) {
    for (const socketId of sockets) {
      const socket = io.sockets.sockets.get(socketId);
      const userId = (socket as any)?.userId;
      if (socket && userId) {
        const sanitized = sanitizeRoomForUser(room, userId);
        socket.emit('room:updated', { room: sanitized, stats });
        if (extraEvent) {
          socket.emit(extraEvent.name, extraEvent.data);
        }
      }
    }
  }
}

// REST endpoints
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/rooms', (req, res) => {
  const { name, deckType, customDeck } = req.body;
  const room = roomManager.createRoom(name, deckType, customDeck);
  res.json({ roomId: room.id, name: room.name });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = roomManager.getRoom(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  res.json({ id: room.id, name: room.name, deckType: room.deckType });
});

// Socket.io handlers
io.on('connection', (socket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  socket.on('room:join', ({ roomId, user: userData }) => {
    currentRoomId = roomId;
    currentUserId = userData.id;
    (socket as any).userId = userData.id;

    socket.join(roomId);
    const { room, user } = roomManager.joinRoom(roomId, userData);

    const stats = room.isRevealed ? calculateRoundStats(room.users) : null;
    socket.emit('room:joined', {
      room: sanitizeRoomForUser(room, userData.id),
      currentUser: user,
      stats,
    });

    broadcastRoomState(roomId);
  });

  socket.on('vote:cast', ({ vote }) => {
    if (!currentRoomId || !currentUserId) return;
    roomManager.castVote(currentRoomId, currentUserId, vote);
    broadcastRoomState(currentRoomId);
  });

  socket.on('cards:reveal', () => {
    if (!currentRoomId || !currentUserId) return;
    const room = roomManager.revealCards(currentRoomId, currentUserId);
    if (room) {
      const stats = calculateRoundStats(room.users);
      broadcastRoomState(currentRoomId, {
        name: 'cards:revealed',
        data: { stats, consensus: stats.consensus },
      });
    }
  });

  socket.on('round:reset', () => {
    if (!currentRoomId || !currentUserId) return;
    const room = roomManager.resetRound(currentRoomId, currentUserId);
    if (room) {
      broadcastRoomState(currentRoomId, { name: 'round:reset', data: {} });
    }
  });

  socket.on('settings:update', (settings) => {
    if (!currentRoomId || !currentUserId) return;
    roomManager.updateSettings(currentRoomId, currentUserId, settings);
    broadcastRoomState(currentRoomId);
  });

  socket.on('story:add', ({ title, description, link }) => {
    if (!currentRoomId) return;
    roomManager.addStory(currentRoomId, title, description, link);
    broadcastRoomState(currentRoomId);
  });

  socket.on('story:select', ({ storyId }) => {
    if (!currentRoomId) return;
    roomManager.setCurrentStory(currentRoomId, storyId);
    broadcastRoomState(currentRoomId);
  });

  socket.on('story:estimate', ({ storyId, estimate }) => {
    if (!currentRoomId) return;
    roomManager.saveStoryEstimate(currentRoomId, storyId, estimate);
    broadcastRoomState(currentRoomId);
  });

  socket.on('story:update', ({ storyId, updates }) => {
    if (!currentRoomId) return;
    roomManager.updateStory(currentRoomId, storyId, updates);
    broadcastRoomState(currentRoomId);
  });

  socket.on('story:delete', ({ storyId }) => {
    if (!currentRoomId) return;
    roomManager.deleteStory(currentRoomId, storyId);
    broadcastRoomState(currentRoomId);
  });

  socket.on('facilitator:transfer', ({ targetUserId }) => {
    if (!currentRoomId || !currentUserId) return;
    roomManager.transferFacilitator(currentRoomId, currentUserId, targetUserId);
    broadcastRoomState(currentRoomId);
  });

  socket.on('user:update-profile', ({ name, avatar, role }) => {
    if (!currentRoomId || !currentUserId) return;
    roomManager.updateUserProfile(currentRoomId, currentUserId, { name, avatar, role });
    broadcastRoomState(currentRoomId);
  });

  socket.on('disconnect', () => {
    if (currentRoomId && currentUserId) {
      roomManager.leaveRoom(currentRoomId, currentUserId);
      broadcastRoomState(currentRoomId);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Planning Poker Server] Running on http://localhost:${PORT}`);
});
