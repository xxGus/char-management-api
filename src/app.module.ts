import { Module } from '@nestjs/common';
import { CharacterModule } from './character/character.module';
import { BattleModule } from './battle/battle.module';
import { MemoryStorageModule } from './storage/memory-storage.module';
import { JobsModule } from './jobs/jobs.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [MemoryStorageModule, CharacterModule, BattleModule, JobsModule, MetricsModule]
})
export class AppModule {}
