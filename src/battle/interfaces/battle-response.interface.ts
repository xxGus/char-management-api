import { CharacterStatus } from '../../character/character.entity';
import { JobType } from '../../jobs/job-definitions';

export interface BattleParticipantResponse {
  id: string;
  name: string;
  job: JobType;
  currentHp: number;
  status: CharacterStatus;
}

export interface BattleResultResponse {
  winner: BattleParticipantResponse;
  loser: BattleParticipantResponse;
  log: string[];
}
