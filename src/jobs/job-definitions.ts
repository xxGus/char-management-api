import { CharacterStats } from '../character/character.entity';

export enum JobType {
  Warrior = 'Warrior',
  Thief = 'Thief',
  Mage = 'Mage'
}

export interface JobDefinition {
  type: JobType;
  baseStats: CharacterStats;
}

const jobDefinitions: Record<JobType, JobDefinition> = {
  [JobType.Warrior]: {
    type: JobType.Warrior,
    baseStats: { hp: 20, str: 10, dex: 5, int: 5 }
  },
  [JobType.Thief]: {
    type: JobType.Thief,
    baseStats: { hp: 15, str: 4, dex: 10, int: 4 }
  },
  [JobType.Mage]: {
    type: JobType.Mage,
    baseStats: { hp: 12, str: 5, dex: 6, int: 10 }
  }
};

const attackCalculators: Record<JobType, (stats: CharacterStats) => number> = {
  [JobType.Warrior]: (stats) => 0.8 * stats.str + 0.2 * stats.dex,
  [JobType.Thief]: (stats) => 0.25 * stats.str + stats.dex + 0.25 * stats.int,
  [JobType.Mage]: (stats) => 0.2 * stats.str + 0.2 * stats.dex + 1.2 * stats.int
};

const speedCalculators: Record<JobType, (stats: CharacterStats) => number> = {
  [JobType.Warrior]: (stats) => 0.6 * stats.dex + 0.2 * stats.int,
  [JobType.Thief]: (stats) => 0.8 * stats.dex,
  [JobType.Mage]: (stats) => 0.4 * stats.dex + 0.1 * stats.str
};

export function getJobDefinition(job: JobType): JobDefinition {
  const definition = jobDefinitions[job];
  if (!definition) {
    throw new Error(`Unsupported job: ${job}`);
  }
  return definition;
}

export function calculateAttackModifier(job: JobType, stats: CharacterStats): number {
  return Number(attackCalculators[job](stats).toFixed(2));
}

export function calculateSpeedModifier(job: JobType, stats: CharacterStats): number {
  return Number(speedCalculators[job](stats).toFixed(2));
}

export function listSupportedJobs(): JobType[] {
  return Object.values(JobType);
}
