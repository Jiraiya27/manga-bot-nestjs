import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService: ConfigService = app.get(ConfigService);
  await app.listen(configService.PORT);
  Logger.log(`Application listening on port: ${configService.PORT}`);
}
bootstrap();
