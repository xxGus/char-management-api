import { IsEnum, Matches, MaxLength, MinLength } from 'class-validator';
import { JobType } from '../../jobs/job-definitions';

export class CreateCharacterDto {
  @Matches(/^[A-Za-z_]+$/, {
    message: 'Name must contain only letters or underscores'
  })
  @MinLength(4)
  @MaxLength(15)
  name!: string;

  @IsEnum(JobType)
  job!: JobType;
}
