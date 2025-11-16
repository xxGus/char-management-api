import { IsUUID } from 'class-validator';

export class StartBattleDto {
  @IsUUID()
  characterA!: string;

  @IsUUID()
  characterB!: string;
}
