import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function runResetSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('--- EXECUTING TOTAL DATABASE RESET & RE-SEED ---');
  const result = await authService.resetDatabaseAndSeed();
  console.log('Result:', JSON.stringify(result, null, 2));

  await app.close();
  process.exit(0);
}

runResetSeed().catch((err) => {
  console.error('Reset seed failed:', err);
  process.exit(1);
});
