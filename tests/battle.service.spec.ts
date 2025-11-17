import { Test } from '@nestjs/testing';
import { BattleService } from '../src/battle/battle.service';
import { BattleEngine } from '../src/battle/battle-engine';
import { CharacterService } from '../src/character/character.service';
import { MemoryStorageService } from '../src/storage/memory-storage.service';
import { RandomService } from '../src/common/random.service';
import { CharacterStatus } from '../src/character/character.entity';
import { JobType } from '../src/jobs/job-definitions';
import { BadRequestException } from '@nestjs/common';

class ControlledRandomService extends RandomService {
  private queue: number[] = [];

  setQueue(values: number[]) {
    this.queue = [...values];
  }

  randomInt(_max: number): number {
    if (this.queue.length === 0) {
      return 0;
    }
    return this.queue.shift()!;
  }
}

describe('BattleService', () => {
  let battleService: BattleService;
  let characterService: CharacterService;
  let randomService: ControlledRandomService;

  function createCombatants() {
    const warrior = characterService.createCharacter({ name: 'WarriorX', job: JobType.Warrior });
    const mage = characterService.createCharacter({ name: 'MageY', job: JobType.Mage });
    return { warrior, mage };
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BattleService,
        BattleEngine,
        CharacterService,
        MemoryStorageService,
        { provide: RandomService, useClass: ControlledRandomService }
      ]
    }).compile();

    battleService = moduleRef.get(BattleService);
    characterService = moduleRef.get(CharacterService);
    randomService = moduleRef.get(RandomService);
  });

  it('prevents a character from battling themselves', () => {
    const { warrior } = createCombatants();
    expect(() =>
      battleService.startBattle({ characterA: warrior.id, characterB: warrior.id })
    ).toThrow(BadRequestException);
  });

  it('selects the starting attacker using the higher speed roll and logs the correct line', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 4;
    mage.maxHp = 4;
    randomService.setQueue([5, 1, 4, 2, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.log[1]).toBe(
      `${warrior.name} 5 speed was faster than ${mage.name} 1 speed and will begin this round.`
    );
    expect(result.winner.id).toBe(warrior.id);
  });

  it('rerolls ties and omits them from the log', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 5;
    mage.maxHp = 5;
    warrior.attackModifier = 5;
    randomService.setQueue([3, 3, 4, 1, 5, 2, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.log[1]).toContain('4 speed was faster');
    expect(result.log[1]).not.toContain('3 speed was faster');
  });

  it('calculates damage within modifiers and subtracts HP without dropping below zero', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 6;
    mage.maxHp = 6;
    randomService.setQueue([4, 2, 6, 1, 10]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    const attackLine = result.log.find((line) => line.startsWith(`${warrior.name} attacks`));
    if (!attackLine) {
      throw new Error('Expected attack line from warrior');
    }
    const damage = Number(attackLine.split('for ')[1].split(',')[0]);
    expect(damage).toBeGreaterThanOrEqual(0);
    expect(damage).toBeLessThanOrEqual(warrior.attackModifier);
    expect(result.loser.currentHp).toBeGreaterThanOrEqual(0);
  });

  it('stops the round immediately when the first attack kills the defender', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 5;
    mage.maxHp = 5;
    randomService.setQueue([5, 1, 10]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    const attackLines = result.log.filter((line) => line.includes('attacks'));
    expect(attackLines).toHaveLength(1);
    expect(result.loser.status).toBe(CharacterStatus.Dead);
  });

  it('keeps the winners remaining HP and flags losers as dead', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 4;
    mage.maxHp = 4;
    randomService.setQueue([5, 1, 4, 2, 4]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.winner.status).toBe(CharacterStatus.Alive);
    expect(result.loser.status).toBe(CharacterStatus.Dead);
    const expectedHp = result.winner.id === warrior.id ? warrior.currentHp : mage.currentHp;
    expect(result.winner.currentHp).toBe(expectedHp);
  });

  it('produces full battle logs with the required format', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 3;
    mage.maxHp = 3;
    randomService.setQueue([4, 1, 3, 2, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.log[0]).toBe(
      `Battle between ${warrior.name} (Warrior) - ${warrior.maxHp} HP and ${mage.name} (Mage) - ${mage.maxHp} HP begins!`
    );
    expect(result.log[result.log.length - 1]).toBe(
      `${result.winner.name} wins the battle! ${result.winner.name} still has ${result.winner.currentHp} HP remaining!`
    );
  });

  it('handles zero damage rounds without breaking the loop', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 5;
    mage.maxHp = 5;
    randomService.setQueue([4, 1, 0, 0, 6, 1, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.log.some((line) => line.includes('for 0'))).toBe(true);
    expect(result.winner.status).toBe(CharacterStatus.Alive);
  });

  it('allows battles even when speed modifiers are zero', () => {
    const { warrior, mage } = createCombatants();
    warrior.speedModifier = 0;
    mage.speedModifier = 0;
    mage.currentHp = 5;
    mage.maxHp = 5;
    randomService.setQueue([1, 0, 5, 1, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.log[1]).toContain('1 speed');
  });

  it('supports characters with zero attack modifier (only opponent can deal damage)', () => {
    const { warrior, mage } = createCombatants();
    warrior.attackModifier = 0;
    warrior.currentHp = 3;
    warrior.maxHp = 3;
    randomService.setQueue([4, 1, 0, 3, 4, 2, 5]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    const zeroDamageLines = result.log.filter((line) =>
      line.startsWith(`${warrior.name} attacks`) && line.includes('for 0')
    );
    expect(zeroDamageLines.length).toBeGreaterThan(0);
    expect(result.winner.name).toBe(mage.name);
  });

  it('handles HP edge cases such as HP = 1', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 1;
    mage.maxHp = 1;
    randomService.setQueue([4, 1, 2]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    expect(result.loser.currentHp).toBe(0);
    expect(result.loser.status).toBe(CharacterStatus.Dead);
  });

  it('ensures battle logs never include mutual tie results', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 4;
    mage.maxHp = 4;
    warrior.attackModifier = 4;
    randomService.setQueue([0, 0, 3, 1, 4]);
    const result = battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    const speedLines = result.log.filter((line) => line.includes('speed was faster'));
    speedLines.forEach((line) => {
      const matches = line.match(/ (\\d+) speed was faster than .* (\\d+) speed/);
      if (matches) {
        expect(matches[1]).not.toBe(matches[2]);
      }
    });
  });

  it('updates stored characters so listings reflect HP and status after battle', () => {
    const { warrior, mage } = createCombatants();
    mage.currentHp = 6;
    mage.maxHp = 6;
    randomService.setQueue([5, 1, 6, 2, 6]);
    battleService.startBattle({ characterA: warrior.id, characterB: mage.id });
    const list = characterService.listPaginated(1, 10);
    const storedMage = list.items.find((item) => item.id === mage.id)!;
    expect(storedMage.status).toBe(CharacterStatus.Dead);
    expect(storedMage.currentHp).toBe(0);
  });
});
