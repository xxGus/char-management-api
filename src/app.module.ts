import { Module } from '@nestjs/common';
import { CharacterModule } from './character/character.module';
import { BattleModule } from './battle/battle.module';
import { MemoryStorageModule } from './storage/memory-storage.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [MemoryStorageModule, CharacterModule, BattleModule, JobsModule]
})
export class AppModule {}
