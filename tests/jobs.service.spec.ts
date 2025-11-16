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
});
