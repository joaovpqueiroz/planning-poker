import { RoundStats, User } from '../types.js';

export function calculateRoundStats(users: Record<string, User>): RoundStats {
  const activePlayers = Object.values(users).filter(
    (u) => u.connected && u.role === 'player' && u.vote !== null
  );

  const totalVotes = activePlayers.length;
  const distribution: Record<string, number> = {};

  if (totalVotes === 0) {
    return {
      average: null,
      median: null,
      consensus: false,
      agreementRate: 0,
      distribution: {},
      minVotes: null,
      maxVotes: null,
      totalVotes: 0,
    };
  }

  // Distribution
  for (const player of activePlayers) {
    const vote = player.vote!;
    distribution[vote] = (distribution[vote] || 0) + 1;
  }

  // Consensus & Agreement
  let maxCount = 0;
  for (const count of Object.values(distribution)) {
    if (count > maxCount) maxCount = count;
  }
  const agreementRate = Math.round((maxCount / totalVotes) * 100);
  const consensus = Object.keys(distribution).length === 1 && totalVotes > 1;

  // Numeric calculations
  const numericEntries: { user: string; value: number; raw: string }[] = [];
  for (const player of activePlayers) {
    const val = parseFloat(player.vote!);
    if (!isNaN(val)) {
      numericEntries.push({
        user: player.name,
        value: val,
        raw: player.vote!,
      });
    }
  }

  let average: number | null = null;
  let median: number | null = null;
  let minVotes: { value: string; users: string[] } | null = null;
  let maxVotes: { value: string; users: string[] } | null = null;

  if (numericEntries.length > 0) {
    // Average
    const sum = numericEntries.reduce((acc, curr) => acc + curr.value, 0);
    average = Math.round((sum / numericEntries.length) * 10) / 10;

    // Median
    const sorted = [...numericEntries].sort((a, b) => a.value - b.value);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
      median = sorted[mid].value;
    } else {
      median = Math.round(((sorted[mid - 1].value + sorted[mid].value) / 2) * 10) / 10;
    }

    const minVal = sorted[0].value;
    const maxVal = sorted[sorted.length - 1].value;

    if (minVal !== maxVal) {
      const minUsers = sorted.filter((e) => e.value === minVal).map((e) => e.user);
      const maxUsers = sorted.filter((e) => e.value === maxVal).map((e) => e.user);
      minVotes = { value: String(minVal), users: minUsers };
      maxVotes = { value: String(maxVal), users: maxUsers };
    }
  }

  return {
    average,
    median,
    consensus,
    agreementRate,
    distribution,
    minVotes,
    maxVotes,
    totalVotes,
  };
}
