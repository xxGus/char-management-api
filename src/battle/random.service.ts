import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
  randomInt(max: number): number {
    if (max <= 0) {
      return 0;
    }
    const capped = Math.round(max);
    const safeMax = capped < 0 ? 0 : capped;
    return Math.floor(Math.random() * (safeMax + 1));
  }
}
