import { Module } from '@nestjs/common';
import { FinancieroController } from './financiero.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaService } from '@app/prisma';
import { ConfigModule /*, ConfigService */ } from '@nestjs/config';
import { FuenteService } from './fuente.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    /*
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('PG_HOST'),
        port: parseInt(cfg.get('PG_PORT', '5432')),
        username: cfg.get('PG_USER'),
        password: cfg.get('PG_PASSWORD'),
        database: cfg.get('PG_DB'),
        entities: [__dirname + '/!**!/!*.entity.{js,ts}'],
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
*/
  ],
  controllers: [FinancieroController],
  providers: [PrismaService, FuenteService],
})
export class FinancieroModule {}
