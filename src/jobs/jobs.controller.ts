import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDefinitionSummary } from './job.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  getJobs(): JobDefinitionSummary[] {
    return this.jobsService.getJobs();
  }
}
