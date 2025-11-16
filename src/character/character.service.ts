import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MemoryStorageService } from '../storage/memory-storage.service';
import { Character, CharacterStatus } from './character.entity';
import {
  JobType,
  calculateAttackModifier,
  calculateSpeedModifier,
  getJobDefinition
} from '../jobs/job-definitions';
import { CreateCharacterDto } from './dto/create-character.dto';
import { NameValidator } from './validation/name-validator';

@Injectable()
export class CharacterService {
  constructor(private readonly storage: MemoryStorageService) {}

  listPaginated(page: number, limit: number) {
    const all = this.storage.getAllCharacters();
    const total = all.length;
    const sanitizedLimit = limit < 1 ? 1 : limit;
    const sanitizedPage = page < 1 ? 1 : page;
    const start = (sanitizedPage - 1) * sanitizedLimit;
    const items = all.slice(start, start + sanitizedLimit);

    return {
      total,
      page: sanitizedPage,
      limit: sanitizedLimit,
      items
    };
  }

  createCharacter(dto: CreateCharacterDto): Character {
    try {
      NameValidator.ensureValid(dto.name);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    const job = dto.job as JobType;
    let jobDefinition;
    try {
      jobDefinition = getJobDefinition(job);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    const stats = { ...jobDefinition.baseStats };
    const attackModifier = calculateAttackModifier(job, stats);
    const speedModifier = calculateSpeedModifier(job, stats);

    const character: Character = {
      id: randomUUID(),
      name: dto.name,
      job,
      stats,
      maxHp: stats.hp,
      currentHp: stats.hp,
      attackModifier,
      speedModifier,
      status: CharacterStatus.Alive
    };

    this.storage.saveCharacter(character);
    return character;
  }

  findOne(id: string): Character {
    return this.getCharacterOrThrow(id);
  }

  getCharacterOrThrow(id: string): Character {
    const character = this.storage.getCharacter(id);
    if (!character) {
      throw new NotFoundException(`Character ${id} was not found`);
    }
    return character;
  }
}
