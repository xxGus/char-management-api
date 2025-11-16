import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('character')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.characterService.createCharacter(dto);
  }

  @Get('list')
  list() {
    return this.characterService.findAll().map((character) => ({
      id: character.id,
      name: character.name,
      job: character.job,
      alive: character.alive,
      status: character.alive ? 'alive' : 'dead'
    }));
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
      alive: character.alive
    };
  }
}
