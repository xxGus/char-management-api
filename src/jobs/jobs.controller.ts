import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  getJobs() {
    const jobs = this.jobsService.getJobs().map(({ name, stats, attackFormula, speedFormula }) => ({
      name,
      stats,
      attackFormula,
      speedFormula
    }));

    return { success: true, jobs };
  }
}
