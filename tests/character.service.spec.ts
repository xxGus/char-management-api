import { Test } from '@nestjs/testing';
import { CharacterService } from '../src/character/character.service';
import { MemoryStorageModule } from '../src/storage/memory-storage.module';
import { JobType } from '../src/jobs/job-definitions';
import { CreateCharacterDto } from '../src/character/dto/create-character.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CharacterStatus } from '../src/character/character.entity';

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
    expect(character.status).toBe(CharacterStatus.Alive);
  });

  it('rejects names shorter than 4 characters', () => {
    const dto: CreateCharacterDto = { name: 'Bad', job: JobType.Mage };
    expect(() => service.createCharacter(dto)).toThrow(BadRequestException);
  });

  it('rejects names longer than 15 characters', () => {
    const dto: CreateCharacterDto = { name: 'ABCDEFGHIJKLMNOP', job: JobType.Mage } as CreateCharacterDto;
    expect(() => service.createCharacter(dto)).toThrow(BadRequestException);
  });

  it('rejects names with invalid characters', () => {
    const dto: CreateCharacterDto = { name: 'Bad123', job: JobType.Thief } as CreateCharacterDto;
    expect(() => service.createCharacter(dto)).toThrow(BadRequestException);
  });

  it('rejects invalid job names', () => {
    const dto = { name: 'ValidName', job: 'Samurai' as unknown as JobType };
    expect(() => service.createCharacter(dto)).toThrow(BadRequestException);
  });

  it('assigns correct base stats for every job', () => {
    const warrior = service.createCharacter({ name: 'WarA', job: JobType.Warrior });
    const thief = service.createCharacter({ name: 'ThiefA', job: JobType.Thief });
    const mage = service.createCharacter({ name: 'MageA', job: JobType.Mage });

    expect(warrior.stats).toEqual({ hp: 20, str: 10, dex: 5, int: 5 });
    expect(thief.stats).toEqual({ hp: 15, str: 4, dex: 10, int: 4 });
    expect(mage.stats).toEqual({ hp: 12, str: 5, dex: 6, int: 10 });
  });

  it('calculates correct attack and speed modifiers for each job', () => {
    const warrior = service.createCharacter({ name: 'WarB', job: JobType.Warrior });
    const thief = service.createCharacter({ name: 'ThiefB', job: JobType.Thief });
    const mage = service.createCharacter({ name: 'MageB', job: JobType.Mage });

    expect(warrior.attackModifier).toBeCloseTo(9);
    expect(warrior.speedModifier).toBeCloseTo(4);
    expect(thief.attackModifier).toBeCloseTo(12);
    expect(thief.speedModifier).toBeCloseTo(8);
    expect(mage.attackModifier).toBeCloseTo(14.2);
    expect(mage.speedModifier).toBeCloseTo(2.9);
  });

  it('paginates characters', () => {
    service.createCharacter({ name: 'Alpha', job: JobType.Warrior });
    service.createCharacter({ name: 'Bravo', job: JobType.Thief });
    service.createCharacter({ name: 'Charlie', job: JobType.Mage });

    const result = service.listPaginated(2, 1);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Bravo');
  });

  it('returns characters by id and throws when not found', () => {
    const created = service.createCharacter({ name: 'Lookup', job: JobType.Warrior });
    expect(service.findOne(created.id)).toEqual(created);
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('stores characters in memory and generates unique ids', () => {
    const first = service.createCharacter({ name: 'StoreOne', job: JobType.Warrior });
    const second = service.createCharacter({ name: 'StoreTwo', job: JobType.Mage });

    const list = service.listPaginated(1, 10);
    expect(list.total).toBeGreaterThanOrEqual(2);
    expect(first.id).not.toEqual(second.id);
  });
});
