import {
  JobType,
  calculateAttackModifier,
  calculateSpeedModifier,
  getJobDefinition
} from '../src/character/job-definitions';

describe('Job modifier calculations', () => {
  it('computes warrior modifiers correctly', () => {
    const stats = getJobDefinition(JobType.Warrior).baseStats;
    expect(calculateAttackModifier(JobType.Warrior, stats)).toBeCloseTo(9);
    expect(calculateSpeedModifier(JobType.Warrior, stats)).toBeCloseTo(4);
  });

  it('computes mage modifiers with decimals', () => {
    const stats = getJobDefinition(JobType.Mage).baseStats;
    expect(calculateAttackModifier(JobType.Mage, stats)).toBeCloseTo(14.2);
    expect(calculateSpeedModifier(JobType.Mage, stats)).toBeCloseTo(2.9);
  });
});
