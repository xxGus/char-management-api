import { Injectable } from '@nestjs/common';
import { JobDefinitionSummary } from './job.interface';

const JOBS: JobDefinitionSummary[] = [
  {
    name: 'Warrior',
    lifePoints: 20,
    strength: 10,
    dexterity: 5,
    intelligence: 5,
    attackFormula: '80% of Strength + 20% Dexterity',
    speedFormula: '60% Dexterity + 20% Intelligence'
  },
  {
    name: 'Thief',
    lifePoints: 15,
    strength: 4,
    dexterity: 10,
    intelligence: 4,
    attackFormula: '25% of Strength + 100% Dexterity + 25% Intelligence',
    speedFormula: '80% Dexterity'
  },
  {
    name: 'Mage',
    lifePoints: 12,
    strength: 5,
    dexterity: 6,
    intelligence: 10,
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
