import { Test } from '@nestjs/testing';
import { CharacterController } from '../src/character/character.controller';
import { CharacterService } from '../src/character/character.service';
import { CharacterStatus } from '../src/character/character.entity';
import { CreateCharacterDto } from '../src/character/dto/create-character.dto';

type CharacterServiceMock = Pick<CharacterService, 'createCharacter' | 'listPaginated' | 'findOne'>;

function createServiceMock(): jest.Mocked<CharacterServiceMock> {
  return {
    createCharacter: jest.fn(),
    listPaginated: jest.fn(),
    findOne: jest.fn()
  } as jest.Mocked<CharacterServiceMock>;
}

describe('CharacterController', () => {
  let controller: CharacterController;
  let service: jest.Mocked<CharacterServiceMock>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [{ provide: CharacterService, useValue: createServiceMock() }]
    }).compile();

    controller = moduleRef.get(CharacterController);
    service = moduleRef.get(CharacterService) as jest.Mocked<CharacterServiceMock>;
  });

  it('calls service.createCharacter when creating', () => {
    const dto = { name: 'Artemis', job: 'Warrior' } as CreateCharacterDto;
    const created = {
      id: '1',
      name: 'Artemis',
      job: 'Warrior',
      currentHp: 20,
      maxHp: 20,
      stats: { hp: 20, str: 10, dex: 5, int: 5 },
      attackModifier: 9,
      speedModifier: 4,
      status: CharacterStatus.Alive
    } as any;
    service.createCharacter.mockReturnValue(created);

    expect(controller.create(dto)).toEqual({
      id: '1',
      name: 'Artemis',
      job: 'Warrior',
      currentHp: 20,
      status: CharacterStatus.Alive,
      maxHp: 20,
      stats: { hp: 20, str: 10, dex: 5, int: 5 },
      attackModifier: 9,
      speedModifier: 4
    });
    expect(service.createCharacter).toHaveBeenCalledWith(dto);
  });

  it('maps paginated characters into response shape with status and HP', () => {
    service.listPaginated.mockReturnValue({
      total: 2,
      page: 1,
      limit: 10,
      items: [
        {
          id: '1',
          name: 'Hero',
          job: 'Warrior',
          currentHp: 12,
          status: CharacterStatus.Alive
        },
        {
          id: '2',
          name: 'Rogue',
          job: 'Thief',
          currentHp: 0,
          status: CharacterStatus.Dead
        }
      ]
    } as any);

    const response = controller.list({ page: 1, limit: 10 });
    expect(service.listPaginated).toHaveBeenCalledWith(1, 10);
    expect(response).toEqual({
      pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      data: [
        {
          id: '1',
          name: 'Hero',
          job: 'Warrior',
          currentHp: 12,
          status: CharacterStatus.Alive
        },
        {
          id: '2',
          name: 'Rogue',
          job: 'Thief',
          currentHp: 0,
          status: CharacterStatus.Dead
        }
      ]
    });
  });

  it('returns full character details via service', () => {
    const character = {
      id: '1',
      name: 'MageX',
      job: 'Mage',
      currentHp: 4,
      maxHp: 12,
      stats: { hp: 12, str: 5, dex: 6, int: 10 },
      attackModifier: 14.2,
      speedModifier: 2.9,
      status: CharacterStatus.Dead
    } as any;
    service.findOne.mockReturnValue(character);

    expect(controller.getDetails('1')).toEqual(character);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
