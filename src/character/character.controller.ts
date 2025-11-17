import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { ListCharactersQueryDto } from './dto/list-characters-query.dto';
import {
  CharacterDetailResponse,
  CharacterListResponse,
  CharacterSummaryResponse
} from './interfaces/character-response.interface';
import { Character } from './character.entity';

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post()
  create(@Body() dto: CreateCharacterDto): CharacterDetailResponse {
    const created = this.characterService.createCharacter(dto);
    return this.toDetailResponse(created);
  }

  @Get('list')
  list(@Query() query: ListCharactersQueryDto): CharacterListResponse {
    const paginated = this.characterService.listPaginated(query.page, query.limit);
    const totalPages = paginated.total === 0 ? 1 : Math.ceil(paginated.total / paginated.limit);
    return {
      pagination: {
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        totalPages
      },
      data: paginated.items.map((character) => this.toSummaryResponse(character))
    };
  }

  @Get(':id')
  getDetails(@Param('id') id: string): CharacterDetailResponse {
    const character = this.characterService.findOne(id);
    return this.toDetailResponse(character);
  }

  private toSummaryResponse(character: Character): CharacterSummaryResponse {
    return {
      id: character.id,
      name: character.name,
      job: character.job,
      currentHp: character.currentHp,
      status: character.status
    };
  }

  private toDetailResponse(character: Character): CharacterDetailResponse {
    return {
      ...this.toSummaryResponse(character),
      maxHp: character.maxHp,
      stats: character.stats,
      attackModifier: character.attackModifier,
      speedModifier: character.speedModifier
    };
  }
}
