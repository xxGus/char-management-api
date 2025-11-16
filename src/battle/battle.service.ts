import { BadRequestException, Injectable } from '@nestjs/common';
import { CharacterService } from '../character/character.service';
import { BattleEngine } from './battle-engine';
import { StartBattleDto } from './dto/start-battle.dto';
import { CharacterStatus } from '../character/character.entity';

@Injectable()
export class BattleService {
  constructor(
    private readonly characterService: CharacterService,
    private readonly battleEngine: BattleEngine
  ) {}

  startBattle(dto: StartBattleDto) {
    if (dto.characterA === dto.characterB) {
      throw new BadRequestException('A character cannot battle themselves.');
    }

    const characterA = this.characterService.getCharacterOrThrow(dto.characterA);
    const characterB = this.characterService.getCharacterOrThrow(dto.characterB);

    if (characterA.status === CharacterStatus.Dead || characterB.status === CharacterStatus.Dead) {
      throw new BadRequestException('Both characters must be alive to battle.');
    }

    const result = this.battleEngine.runBattle(characterA, characterB);

    return {
      winner: {
        id: result.winner.id,
        name: result.winner.name,
        job: result.winner.job,
        currentHp: result.winner.currentHp
      },
      loser: {
        id: result.loser.id,
        name: result.loser.name,
        job: result.loser.job,
        currentHp: result.loser.currentHp,
        status: result.loser.status
      },
      log: result.log
    };
  }
}
