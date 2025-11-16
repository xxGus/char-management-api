import { Module } from '@nestjs/common';
import { CharacterModule } from '../character/character.module';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { BattleEngine } from './battle-engine';
import { RandomService } from './random.service';

@Module({
  imports: [CharacterModule],
  controllers: [BattleController],
  providers: [BattleService, BattleEngine, RandomService]
})
export class BattleModule {}
