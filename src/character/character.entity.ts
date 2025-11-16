import { JobType } from './job-definitions';

export interface CharacterStats {
  hp: number;
  str: number;
  dex: number;
  int: number;
}

export interface Character {
  id: string;
  name: string;
  job: JobType;
  stats: CharacterStats;
  maxHp: number;
  currentHp: number;
  attackModifier: number;
  speedModifier: number;
  alive: boolean;
}
