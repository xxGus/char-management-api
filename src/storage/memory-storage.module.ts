import { Global, Module } from '@nestjs/common';
import { MemoryStorageService } from './memory-storage.service';
import { CHARACTER_REPOSITORY } from './interfaces/character-repository.interface';

@Global()
@Module({
  providers: [
    MemoryStorageService,
    {
      provide: CHARACTER_REPOSITORY,
      useExisting: MemoryStorageService
    }
  ],
  exports: [CHARACTER_REPOSITORY, MemoryStorageService]
})
export class MemoryStorageModule {}
