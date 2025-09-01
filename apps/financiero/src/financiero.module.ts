import { Module } from '@nestjs/common';
import { FinancieroController } from './financiero.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaService } from '@app/prisma';
import { ConfigModule /*, ConfigService */ } from '@nestjs/config';
import { FuenteService } from './fuente.service';

/**
 * Módulo raíz del microservicio de Financiero (gRPC).
 *
 * Responsabilidades:
 * - Cargar configuración de entorno para el servicio (variables .env).
 * - Declarar el controlador gRPC que implementa los handlers del contrato.
 * - Registrar servicios de dominio (FuenteService) y el proveedor de acceso a datos (PrismaService).
 *
 * Detalles:
 * - `ConfigModule.forRoot({ isGlobal: true })` hace disponible la configuración
 *   en todo el contenedor del microservicio sin necesidad de reimportar el módulo.
 * - `PrismaService` actúa como gateway a la base de datos.
 * - `FuenteService` encapsula la lógica de negocio relacionada con "Fuentes".
 *
 * Nota:
 * - El bloque de TypeORM está comentado como referencia de configuración alternativa.
 */
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
