import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { CharacterStatus } from '../src/character/character.entity';
import { RandomService } from '../src/common/random.service';

class SequenceRandomService extends RandomService {
  private queue = [5, 1, 4, 2, 6, 1, 5, 3, 2, 4];

  randomInt(max: number): number {
    const safeMax = Math.max(0, Math.round(max));
    if (safeMax === 0) {
      return 0;
    }
    const value =
      this.queue.length > 0 ? this.queue.shift()! : Math.floor(Math.random() * (safeMax + 1));
    return Math.min(value, safeMax);
  }
}

describe('RPG API (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(RandomService)
      .useClass(SequenceRandomService)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );
    await app.init();
    const fastify = app.getHttpAdapter().getInstance();
    if (typeof fastify.ready === 'function') {
      await fastify.ready();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the happy path for character creation, listing, jobs, and battles', async () => {
    const warriorRes = await app.inject({
      method: 'POST',
      url: '/character',
      payload: { name: 'Ajax_', job: 'Warrior' }
    });
    expect(warriorRes.statusCode).toBe(201);
    const warrior = warriorRes.json();

    const mageRes = await app.inject({
      method: 'POST',
      url: '/character',
      payload: { name: 'Zelda_', job: 'Mage' }
    });
    expect(mageRes.statusCode).toBe(201);
    const mage = mageRes.json();

    expect(warrior.status).toBe(CharacterStatus.Alive);
    expect(mage.stats.hp).toBe(12);

    const jobsRes = await app.inject({ method: 'GET', url: '/jobs' });
    expect(jobsRes.statusCode).toBe(200);
    const jobsBody = jobsRes.json();
    expect(jobsBody.jobs).toHaveLength(3);
    expect(jobsBody.jobs.map((job: any) => job.name)).toEqual(['Warrior', 'Thief', 'Mage']);

    const listRes = await app.inject({ method: 'GET', url: '/character/list' });
    expect(listRes.statusCode).toBe(200);
    const listBody = listRes.json();
    expect(listBody.data).toHaveLength(2);

    const battleRes = await app.inject({
      method: 'POST',
      url: '/battle',
      payload: { characterA: warrior.id, characterB: mage.id }
    });
    expect(battleRes.statusCode).toBe(201);
    const battleBody = battleRes.json();
    expect(battleBody.log[0]).toContain('Battle between');
    expect(battleBody.winner.status).toBe(CharacterStatus.Alive);
    expect(battleBody.loser.status).toBe(CharacterStatus.Dead);
    expect(battleBody.log[battleBody.log.length - 1]).toContain('wins the battle');

    const detailsRes = await app.inject({ method: 'GET', url: `/character/${mage.id}` });
    expect(detailsRes.statusCode).toBe(200);
    const detailsBody = detailsRes.json();
    expect(detailsBody.status === CharacterStatus.Dead || detailsBody.status === CharacterStatus.Alive).toBe(true);

    const postBattleList = await app.inject({ method: 'GET', url: '/character/list' });
    const postListBody = postBattleList.json();
    const mageSummary = postListBody.data.find((c: any) => c.id === mage.id);
    expect(mageSummary).toBeDefined();
    expect(mageSummary.status).toBe(CharacterStatus.Dead);
    expect(mageSummary.currentHp).toBe(0);
    const warriorSummary = postListBody.data.find((c: any) => c.id === warrior.id);
    expect(warriorSummary.status).toBe(CharacterStatus.Alive);
  });
});
