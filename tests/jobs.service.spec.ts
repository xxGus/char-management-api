import { JobsService } from '../src/jobs/jobs.service';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(() => {
    service = new JobsService();
  });

  it('returns exactly three jobs with required properties', () => {
    const jobs = service.getJobs();
    expect(jobs).toHaveLength(3);

    for (const job of jobs) {
      expect(job).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          lifePoints: expect.any(Number),
          strength: expect.any(Number),
          dexterity: expect.any(Number),
          intelligence: expect.any(Number),
          attackFormula: expect.any(String),
          speedFormula: expect.any(String)
        })
      );
    }

    expect(jobs.map((job) => job.name)).toEqual(['Warrior', 'Thief', 'Mage']);
  });
});
