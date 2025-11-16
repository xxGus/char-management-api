import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { ListCharactersQueryDto } from './dto/list-characters-query.dto';

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.characterService.createCharacter(dto);
  }

  @Get('list')
  list(@Query() query: ListCharactersQueryDto) {
    const paginated = this.characterService.listPaginated(query.page, query.limit);
    const totalPages = paginated.total === 0 ? 1 : Math.ceil(paginated.total / paginated.limit);
    return {
      pagination: {
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        totalPages
      },
      data: paginated.items.map((character) => ({
        id: character.id,
        name: character.name,
        job: character.job,
        status: character.status
      }))
    };
  }

  @Get(':id')
  getDetails(@Param('id') id: string) {
    const character = this.characterService.findOne(id);
    return {
      id: character.id,
      name: character.name,
      job: character.job,
      currentHp: character.currentHp,
      maxHp: character.maxHp,
      stats: character.stats,
      attackModifier: character.attackModifier,
      speedModifier: character.speedModifier,
      status: character.status
    };
  }
}
