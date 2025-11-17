import { Injectable } from '@nestjs/common';
import { Character, CharacterStatus } from '../character/character.entity';
import { RandomService } from '../common/random.service';

export interface BattleLog {
  winner: Character;
  loser: Character;
  log: string[];
}

@Injectable()
export class BattleEngine {
  constructor(private readonly randomService: RandomService) {}

  runBattle(characterA: Character, characterB: Character): BattleLog {
    const log: string[] = [
      `Battle between ${characterA.name} (${characterA.job}) - ${characterA.currentHp} HP and ${characterB.name} (${characterB.job}) - ${characterB.currentHp} HP begins!`
    ];

    while (characterA.status === CharacterStatus.Alive && characterB.status === CharacterStatus.Alive) {
      const initiative = this.determineInitiative(characterA, characterB);
      log.push(
        `${initiative.first.name} ${initiative.firstRoll} speed was faster than ${initiative.second.name} ${initiative.secondRoll} speed and will begin this round.`
      );

      this.performAttack(initiative.first, initiative.second, log);
      if (initiative.second.status === CharacterStatus.Dead) {
        break;
      }
      this.performAttack(initiative.second, initiative.first, log);
    }

    const winner = characterA.status === CharacterStatus.Alive ? characterA : characterB;
    const loser = winner === characterA ? characterB : characterA;
    log.push(`${winner.name} wins the battle! ${winner.name} still has ${winner.currentHp} HP remaining!`);

    return { winner, loser, log };
  }

  private determineInitiative(characterA: Character, characterB: Character) {
    if (characterA.speedModifier <= 0 && characterB.speedModifier <= 0) {
      const fallback = this.randomService.randomInt(1);
      if (fallback === 0) {
        return { first: characterA, second: characterB, firstRoll: 1, secondRoll: 0 };
      }
      return { first: characterB, second: characterA, firstRoll: 1, secondRoll: 0 };
    }

    let rollA = 0;
    let rollB = 0;

    do {
      rollA = this.randomService.randomInt(characterA.speedModifier);
      rollB = this.randomService.randomInt(characterB.speedModifier);
    } while (rollA === rollB);

    if (rollA > rollB) {
      return { first: characterA, second: characterB, firstRoll: rollA, secondRoll: rollB };
    }

    return { first: characterB, second: characterA, firstRoll: rollB, secondRoll: rollA };
  }

  private performAttack(attacker: Character, defender: Character, log: string[]) {
    const damage = this.randomService.randomInt(attacker.attackModifier);
    defender.currentHp = Math.max(0, defender.currentHp - damage);
    defender.status = defender.currentHp === 0 ? CharacterStatus.Dead : defender.status;
    log.push(`${attacker.name} attacks ${defender.name} for ${damage}, ${defender.name} has ${defender.currentHp} HP remaining.`);
  }
}
