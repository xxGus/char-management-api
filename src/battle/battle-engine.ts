import { Injectable } from '@nestjs/common';
import { Character } from '../character/character.entity';
import { RandomService } from './random.service';

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

    while (characterA.alive && characterB.alive) {
      const initiative = this.determineInitiative(characterA, characterB);
      log.push(
        `${initiative.first.name} ${initiative.firstRoll} speed was faster than ${initiative.second.name} ${initiative.secondRoll} speed and will begin this round.`
      );

      this.performAttack(initiative.first, initiative.second, log);
      if (!initiative.second.alive) {
        break;
      }
      this.performAttack(initiative.second, initiative.first, log);
    }

    const winner = characterA.alive ? characterA : characterB;
    const loser = winner === characterA ? characterB : characterA;
    log.push(`${winner.name} wins the battle! ${winner.name} still has ${winner.currentHp} HP remaining!`);

    return { winner, loser, log };
  }

  private determineInitiative(characterA: Character, characterB: Character) {
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
    if (defender.currentHp === 0) {
      defender.alive = false;
    }
    log.push(`${attacker.name} attacks ${defender.name} for ${damage}, ${defender.name} has ${defender.currentHp} HP remaining.`);
  }
}
