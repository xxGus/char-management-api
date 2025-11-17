import { Test } from '@nestjs/testing';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateCharacterDto } from '../src/character/dto/create-character.dto';
import { ListCharactersQueryDto } from '../src/character/dto/list-characters-query.dto';
import { StartBattleDto } from '../src/battle/dto/start-battle.dto';
import { JobType } from '../src/jobs/job-definitions';
import { randomUUID } from 'crypto';

describe('DTO validations', () => {
  let pipe: ValidationPipe;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ValidationPipe,
          useFactory: () =>
            new ValidationPipe({
              whitelist: true,
              forbidNonWhitelisted: true,
              transform: true
            })
        }
      ]
    }).compile();

    pipe = moduleRef.get(ValidationPipe);
  });

  it('rejects invalid character names and jobs', async () => {
    await expect(
      pipe.transform(
        { name: 'Bad!', job: 'Samurai' },
        { type: 'body', metatype: CreateCharacterDto }
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects payloads with extra properties for CreateCharacterDto', async () => {
    await expect(
      pipe.transform(
        { name: 'ValidName', job: JobType.Mage, extra: 'x' },
        { type: 'body', metatype: CreateCharacterDto }
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('transforms and validates pagination query params', async () => {
    const result = await pipe.transform(
      { page: '2', limit: '5' },
      { type: 'query', metatype: ListCharactersQueryDto }
    );
    expect(result).toEqual({ page: 2, limit: 5 });
  });

  it('validates StartBattleDto UUIDs', async () => {
    await expect(
      pipe.transform(
        { characterA: 'invalid', characterB: randomUUID() },
        { type: 'body', metatype: StartBattleDto }
      )
    ).rejects.toThrow(BadRequestException);
  });
});
