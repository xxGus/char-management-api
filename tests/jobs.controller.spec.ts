import { Test } from '@nestjs/testing';
import { JobsController } from '../src/jobs/jobs.controller';
import { JobsService } from '../src/jobs/jobs.service';

const mockJobs = [
  {
    name: 'Warrior',
    stats: { hp: 20, str: 10, dex: 5, int: 5 },
    attackFormula: 'mock attack',
    speedFormula: 'mock speed'
  }
];

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [JobsService]
    })
      .overrideProvider(JobsService)
      .useValue({ getJobs: jest.fn().mockReturnValue(mockJobs) })
      .compile();

    controller = moduleRef.get(JobsController);
    service = moduleRef.get(JobsService);
  });

  it('maps service stats into API response shape', () => {
    expect(controller.getJobs()).toEqual({
      success: true,
      jobs: [
        {
          name: 'Warrior',
          stats: { hp: 20, str: 10, dex: 5, int: 5 },
          attackFormula: 'mock attack',
          speedFormula: 'mock speed'
        }
      ]
    });
    expect(service.getJobs).toHaveBeenCalledTimes(1);
  });
});
