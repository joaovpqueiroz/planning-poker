export type Role = 'player' | 'spectator';

export type DeckType = 'fibonacci' | 'scrum' | 'tshirt' | 'powers-of-2' | 'custom';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  isFacilitator: boolean;
  vote: string | null;
  hasVoted: boolean;
  connected: boolean;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  link?: string;
  finalEstimate?: string;
  status: 'pending' | 'voting' | 'completed';
  createdAt: number;
}

export interface RoomState {
  id: string;
  name: string;
  deckType: DeckType;
  customDeck?: string[];
  users: Record<string, User>;
  currentStoryId: string | null;
  stories: Story[];
  isRevealed: boolean;
  allowAnyoneReveal: boolean;
  createdAt: number;
  lastActive: number;
}

export interface RoundStats {
  average: number | null;
  median: number | null;
  consensus: boolean;
  agreementRate: number;
  distribution: Record<string, number>;
  minVotes: { value: string; users: string[] } | null;
  maxVotes: { value: string; users: string[] } | null;
  totalVotes: number;
}

export const PRESET_DECKS: Record<Exclude<DeckType, 'custom'>, string[]> = {
  scrum: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  'powers-of-2': ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
};
