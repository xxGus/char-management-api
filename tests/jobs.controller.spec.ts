import { Test } from '@nestjs/testing';
import { JobsController } from '../src/jobs/jobs.controller';
import { JobsService } from '../src/jobs/jobs.service';

const mockJobs = [
  {
    name: 'Warrior',
    lifePoints: 20,
    strength: 10,
    dexterity: 5,
    intelligence: 5,
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

  it('returns jobs res from service', () => {
    expect(controller.getJobs()).toEqual(mockJobs);
    expect(service.getJobs).toHaveBeenCalledTimes(1);
  });
});
