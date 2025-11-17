import { JobsService } from '../src/jobs/jobs.service';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(() => {
    service = new JobsService();
  });

  it('returns exactly three jobs with stats embedded', () => {
    const jobs = service.getJobs();
    expect(jobs).toHaveLength(3);

    for (const job of jobs) {
      expect(job).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          stats: expect.objectContaining({
            hp: expect.any(Number),
            str: expect.any(Number),
            dex: expect.any(Number),
            int: expect.any(Number)
          }),
          attackFormula: expect.any(String),
          speedFormula: expect.any(String)
        })
      );
    }

    expect(jobs.map((job) => job.name)).toEqual(['Warrior', 'Thief', 'Mage']);
  });

  it('returns the correct base values for each job', () => {
    const jobs = service.getJobs();
    expect(jobs.find((job) => job.name === 'Warrior')).toEqual({
      name: 'Warrior',
      stats: { hp: 20, str: 10, dex: 5, int: 5 },
      attackFormula: '80% of Strength + 20% Dexterity',
      speedFormula: '60% Dexterity + 20% Intelligence'
    });
    expect(jobs.find((job) => job.name === 'Thief')).toEqual({
      name: 'Thief',
      stats: { hp: 15, str: 4, dex: 10, int: 4 },
      attackFormula: '25% of Strength + 100% Dexterity + 25% Intelligence',
      speedFormula: '80% Dexterity'
    });
    expect(jobs.find((job) => job.name === 'Mage')).toEqual({
      name: 'Mage',
      stats: { hp: 12, str: 5, dex: 6, int: 10 },
      attackFormula: '20% of Strength + 20% Dexterity + 120% Intelligence',
      speedFormula: '40% Dexterity + 10% Strength'
    });
  });
});
