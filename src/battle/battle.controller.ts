import { Body, Controller, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { StartBattleDto } from './dto/start-battle.dto';

@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  startBattle(@Body() dto: StartBattleDto) {
    return this.battleService.startBattle(dto);
  }
}
