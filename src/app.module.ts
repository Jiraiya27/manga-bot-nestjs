import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { RoomModule } from './room/room.module';
import { DBModule } from './db.module';

@Module({
  imports: [ConfigModule, DBModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
