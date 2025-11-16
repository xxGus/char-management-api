import { CharacterStats } from '../character/character.entity';

export interface JobDefinitionSummary {
  name: string;
  stats: CharacterStats;
  attackFormula: string;
  speedFormula: string;
}
