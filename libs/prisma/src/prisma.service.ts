import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

/**
 * Servicio de acceso a datos basado en Prisma.
 *
 * - Extiende `PrismaClient` para exponer los modelos generados por Prisma.
 * - Implementa `OnModuleInit` para establecer la conexión al inicializar el módulo.
 *
 * Uso recomendado:
 * - Inyectar `PrismaService` en los servicios de dominio para realizar consultas.
 * - Centralizar aquí configuraciones transversales de Prisma (middlewares, logging, etc.).
 *
 * Notas:
 * - Considera implementar `OnModuleDestroy` o manejar el cierre con `app.enableShutdownHooks()`
 *   para ejecutar `$disconnect()` en apagados controlados de la aplicación.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Hook del ciclo de vida de NestJS.
   * Establece la conexión con la base de datos usando `PrismaClient.$connect()`.
   *
   * Se invoca automáticamente cuando el módulo que provee este servicio
   * termina su fase de inicialización.
   *
   * @returns Promesa resuelta al completar la conexión.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Hook de apagado para cerrar la conexión con la base de datos.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
