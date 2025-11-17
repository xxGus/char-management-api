import { CharacterStatus, CharacterStats } from '../character.entity';
import { JobType } from '../../jobs/job-definitions';

export interface CharacterSummaryResponse {
  id: string;
  name: string;
  job: JobType;
  currentHp: number;
  status: CharacterStatus;
}

export interface PaginationMetaResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CharacterListResponse {
  pagination: PaginationMetaResponse;
  data: CharacterSummaryResponse[];
}

export interface CharacterDetailResponse extends CharacterSummaryResponse {
  maxHp: number;
  stats: CharacterStats;
  attackModifier: number;
  speedModifier: number;
}
