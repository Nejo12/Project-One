import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.enableCors({
    origin: process.env.APP_BASE_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
