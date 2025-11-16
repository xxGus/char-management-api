import { Injectable } from '@nestjs/common';
import { JobDefinitionSummary } from './job.interface';

const JOBS: JobDefinitionSummary[] = [
  {
    name: 'Warrior',
    stats: { hp: 20, str: 10, dex: 5, int: 5 },
    attackFormula: '80% of Strength + 20% Dexterity',
    speedFormula: '60% Dexterity + 20% Intelligence'
  },
  {
    name: 'Thief',
    stats: { hp: 15, str: 4, dex: 10, int: 4 },
    attackFormula: '25% of Strength + 100% Dexterity + 25% Intelligence',
    speedFormula: '80% Dexterity'
  },
  {
    name: 'Mage',
    stats: { hp: 12, str: 5, dex: 6, int: 10 },
    attackFormula: '20% of Strength + 20% Dexterity + 120% Intelligence',
    speedFormula: '40% Dexterity + 10% Strength'
  }
];

@Injectable()
export class JobsService {
  getJobs(): JobDefinitionSummary[] {
    return JOBS;
  }
}
