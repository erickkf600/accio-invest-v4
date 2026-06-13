import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { PrismaService } from '../app/prisma/prisma.service';
import { PositionSyncService } from '../portfolio/position-sync.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const syncService = app.get(PositionSyncService);

  const tickerUsers = await prisma.operation.findMany({
    where: {
      OR: [{ tipo: 'Compra' }, { tipo: 'Venda' }],
    },
    select: {
      ticker: true,
      createdBy: true,
    },
    distinct: ['ticker', 'createdBy'],
  });

  console.log(`Found ${tickerUsers.length} distinct (ticker, user) pairs to sync.`);

  let count = 0;
  for (const row of tickerUsers) {
    if (row.ticker && row.createdBy) {
      await syncService.syncPosition(row.ticker, row.createdBy);
      count++;
      if (count % 50 === 0) {
        console.log(`Progress: ${count}/${tickerUsers.length}`);
      }
    }
  }

  console.log(`Sync complete. ${count} positions updated.`);
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
