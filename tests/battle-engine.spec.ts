import { BattleEngine } from '../src/battle/battle-engine';
import { RandomService } from '../src/common/random.service';
import { Character, CharacterStatus } from '../src/character/character.entity';
import { JobType } from '../src/jobs/job-definitions';

class QueueRandomService extends RandomService {
  private queue: number[];

  constructor(values: number[]) {
    super();
    this.queue = [...values];
  }

  randomInt(_max: number): number {
    if (this.queue.length === 0) {
      throw new Error('No random values left in queue');
    }
    return this.queue.shift()!;
  }
}

function buildCharacter(name: string, overrides?: Partial<Character>): Character {
  const base: Character = {
    id: name,
    name,
    job: JobType.Warrior,
    stats: { hp: 10, str: 5, dex: 5, int: 5 },
    maxHp: 10,
    currentHp: 10,
    attackModifier: 5,
    speedModifier: 3,
    status: CharacterStatus.Alive
  };
  return { ...base, ...overrides };
}

describe('BattleEngine', () => {
  it('rerolls tied speed checks until there is a winner', () => {
    const random = new QueueRandomService([2, 2, 3, 1, 5]);
    const engine = new BattleEngine(random);
    const alpha = buildCharacter('Alpha', { currentHp: 5, maxHp: 5, attackModifier: 5, speedModifier: 5 });
    const beta = buildCharacter('Beta', { currentHp: 5, maxHp: 5, attackModifier: 5, speedModifier: 5 });

    const result = engine.runBattle(alpha, beta);
    expect(result.log[1]).toContain('Alpha 3 speed was faster than Beta 1 speed');
    expect(result.log.filter((line) => line.includes('speed was faster'))).toHaveLength(1);
    expect(result.loser.status).toBe(CharacterStatus.Dead);
  });

  it('applies rolled damage to the defender HP and logs it', () => {
    const random = new QueueRandomService([3, 1, 3, 0, 2, 1, 4]);
    const engine = new BattleEngine(random);
    const alpha = buildCharacter('Alpha', { attackModifier: 6, speedModifier: 4 });
    const beta = buildCharacter('Beta', { currentHp: 7, maxHp: 7, attackModifier: 4, speedModifier: 3 });

    const result = engine.runBattle(alpha, beta);
    expect(result.log[2]).toBe('Alpha attacks Beta for 3, Beta has 4 HP remaining.');
  });

  it('marks losers as dead when HP reaches zero', () => {
    const random = new QueueRandomService([4, 1, 8]);
    const engine = new BattleEngine(random);
    const alpha = buildCharacter('Alpha', { attackModifier: 8, speedModifier: 6 });
    const beta = buildCharacter('Beta', { currentHp: 8, maxHp: 8, attackModifier: 3, speedModifier: 2 });

    const result = engine.runBattle(alpha, beta);
    expect(result.loser.status).toBe(CharacterStatus.Dead);
    expect(result.loser.currentHp).toBe(0);
  });

  it('produces a consistent log for a complete battle flow', () => {
    const random = new QueueRandomService([5, 3, 4, 2, 6, 1, 5]);
    const engine = new BattleEngine(random);
    const alpha = buildCharacter('Alpha', { attackModifier: 6, speedModifier: 5 });
    const beta = buildCharacter('Beta', { currentHp: 6, maxHp: 6, attackModifier: 4, speedModifier: 3 });

    const result = engine.runBattle(alpha, beta);
    expect(result.log[0]).toBe(
      'Battle between Alpha (Warrior) - 10 HP and Beta (Warrior) - 6 HP begins!'
    );
    expect(result.log[result.log.length - 1]).toBe(
      `${result.winner.name} wins the battle! ${result.winner.name} still has ${result.winner.currentHp} HP remaining!`
    );
    expect(result.winner.name).toBe('Alpha');
    expect(result.log.length).toBeGreaterThan(2);
  });
});
