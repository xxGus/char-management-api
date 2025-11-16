import { Test } from '@nestjs/testing';
import { CharacterService } from '../src/character/character.service';
import { MemoryStorageModule } from '../src/storage/memory-storage.module';
import { JobType } from '../src/jobs/job-definitions';
import { CreateCharacterDto } from '../src/character/dto/create-character.dto';
import { BadRequestException } from '@nestjs/common';

describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemoryStorageModule],
      providers: [CharacterService]
    }).compile();

    service = moduleRef.get(CharacterService);
  });

  it('creates a warrior with expected stats', () => {
    const dto: CreateCharacterDto = { name: 'Artemis', job: JobType.Warrior };
    const character = service.createCharacter(dto);

    expect(character.stats).toEqual({ hp: 20, str: 10, dex: 5, int: 5 });
    expect(character.currentHp).toBe(20);
    expect(character.attackModifier).toBeCloseTo(9);
    expect(character.speedModifier).toBeCloseTo(4);
    expect(character.alive).toBe(true);
  });

  it('throws for an invalid name', () => {
    const dto: CreateCharacterDto = { name: 'Bad', job: JobType.Mage };
    expect(() => service.createCharacter(dto)).toThrow(BadRequestException);
  });
});
