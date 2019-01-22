import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';

function databaseOrmModule(): DynamicModule {
  const config = new ConfigService();
  return TypeOrmModule.forRoot({
    type: 'postgres',
    url: config.DATABASE_URL,
    entities: ['src/**/*.entity.{ts,js}'],
    synchronize: true,
  });
}

@Module({
  imports: [databaseOrmModule()],
})
export class DBModule {}
