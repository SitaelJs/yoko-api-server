import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    //@ts-expect-error type error on string beforeexit expect to be type never
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
