import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { ConfigModule } from './config/config.module';
import { DBModule } from './db.module';
import { LineModule } from './line/line.module';

@Module({
  imports: [ConfigModule, DBModule, LineModule],
  controllers: [AppController],
})
export class AppModule {}
