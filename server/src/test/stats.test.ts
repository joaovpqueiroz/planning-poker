import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateRoundStats } from '../utils/stats.js';
import { RoomManager } from '../store/roomManager.js';
import { User } from '../types.js';

describe('Planning Poker - Statistics Calculator', () => {
  it('should calculate average, median, and detect min/max divergence correctly', () => {
    const users: Record<string, User> = {
      u1: { id: 'u1', name: 'Dev 1', avatar: '🦊', role: 'player', isFacilitator: true, vote: '3', hasVoted: true, connected: true },
      u2: { id: 'u2', name: 'Dev 2', avatar: '🐼', role: 'player', isFacilitator: false, vote: '5', hasVoted: true, connected: true },
      u3: { id: 'u3', name: 'Dev 3', avatar: '🦁', role: 'player', isFacilitator: false, vote: '8', hasVoted: true, connected: true },
    };

    const stats = calculateRoundStats(users);

    // Sum: 3 + 5 + 8 = 16. Avg: 16 / 3 = 5.3
    assert.strictEqual(stats.average, 5.3);
    assert.strictEqual(stats.median, 5);
    assert.strictEqual(stats.consensus, false);
    assert.strictEqual(stats.totalVotes, 3);
    assert.strictEqual(stats.minVotes?.value, '3');
    assert.deepStrictEqual(stats.minVotes?.users, ['Dev 1']);
    assert.strictEqual(stats.maxVotes?.value, '8');
    assert.deepStrictEqual(stats.maxVotes?.users, ['Dev 3']);
  });

  it('should detect 100% consensus when all players vote the same', () => {
    const users: Record<string, User> = {
      u1: { id: 'u1', name: 'Alice', avatar: '🦊', role: 'player', isFacilitator: true, vote: '5', hasVoted: true, connected: true },
      u2: { id: 'u2', name: 'Bob', avatar: '🐼', role: 'player', isFacilitator: false, vote: '5', hasVoted: true, connected: true },
      u3: { id: 'u3', name: 'Carol', avatar: '🦁', role: 'player', isFacilitator: false, vote: '5', hasVoted: true, connected: true },
    };

    const stats = calculateRoundStats(users);

    assert.strictEqual(stats.average, 5);
    assert.strictEqual(stats.median, 5);
    assert.strictEqual(stats.consensus, true);
    assert.strictEqual(stats.agreementRate, 100);
    assert.strictEqual(stats.minVotes, null);
    assert.strictEqual(stats.maxVotes, null);
  });

  it('should ignore spectators and disconnected players', () => {
    const users: Record<string, User> = {
      u1: { id: 'u1', name: 'Dev', avatar: '🦊', role: 'player', isFacilitator: false, vote: '5', hasVoted: true, connected: true },
      u2: { id: 'u2', name: 'Observer PO', avatar: '🦉', role: 'spectator', isFacilitator: true, vote: null, hasVoted: false, connected: true },
      u3: { id: 'u3', name: 'Offline Dev', avatar: '🐱', role: 'player', isFacilitator: false, vote: '13', hasVoted: true, connected: false },
    };

    const stats = calculateRoundStats(users);

    assert.strictEqual(stats.totalVotes, 1);
    assert.strictEqual(stats.average, 5);
  });
});

describe('Planning Poker - RoomManager State Management', () => {
  it('should create room and handle user voting lifecycle', () => {
    const manager = new RoomManager();
    const room = manager.createRoom('Sprint Planning', 'scrum');

    assert.ok(room.id);
    assert.strictEqual(room.name, 'Sprint Planning');

    // First user joins and becomes facilitator
    const { user: user1 } = manager.joinRoom(room.id, {
      id: 'usr-1',
      name: 'Facilitator Ana',
      avatar: '🦊',
      role: 'player',
    });
    assert.strictEqual(user1.isFacilitator, true);

    // Second user joins as player
    const { user: user2 } = manager.joinRoom(room.id, {
      id: 'usr-2',
      name: 'Dev Bob',
      avatar: '🐼',
      role: 'player',
    });
    assert.strictEqual(user2.isFacilitator, false);

    // Votes
    manager.castVote(room.id, 'usr-1', '5');
    manager.castVote(room.id, 'usr-2', '8');

    const updatedRoom = manager.getRoom(room.id)!;
    assert.strictEqual(updatedRoom.users['usr-1'].hasVoted, true);
    assert.strictEqual(updatedRoom.users['usr-2'].hasVoted, true);
    assert.strictEqual(updatedRoom.isRevealed, false);

    // Reveal cards
    manager.revealCards(room.id, 'usr-1');
    assert.strictEqual(manager.getRoom(room.id)!.isRevealed, true);

    // Add Story and save estimate
    manager.addStory(room.id, 'JIRA-101 Login OAuth');
    const storyId = manager.getRoom(room.id)!.stories[0].id;
    manager.saveStoryEstimate(room.id, storyId, '8');

    assert.strictEqual(manager.getRoom(room.id)!.stories[0].finalEstimate, '8');
    assert.strictEqual(manager.getRoom(room.id)!.stories[0].status, 'completed');

    // Reset round
    manager.resetRound(room.id, 'usr-1');
    assert.strictEqual(manager.getRoom(room.id)!.isRevealed, false);
    assert.strictEqual(manager.getRoom(room.id)!.users['usr-1'].hasVoted, false);
    assert.strictEqual(manager.getRoom(room.id)!.users['usr-1'].vote, null);
  });
});
