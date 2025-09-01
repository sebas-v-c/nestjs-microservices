import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  FUENTE_SERVICE_NAME,
  FINANCIERO_PACKAGE_NAME,
  FuenteServiceClient,
} from '@app/proto-types/financiero';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

/**
 * Controlador HTTP del dominio Financiero en el API Gateway.
 *
 * - Expone endpoints REST y delega llamadas al microservicio gRPC de Financiero.
 * - Inicializa el cliente gRPC tipado en el ciclo de vida del módulo.
 */
@ApiTags('Financiero')
@ApiBearerAuth() // protegido por guard global; usa Authorization: Bearer <JWT>
@Controller('financiero')
export class FinancieroController implements OnModuleInit {
  /**
   * Cliente gRPC tipado para el servicio `FuenteService`.
   * Se asigna en `onModuleInit` usando el `ClientGrpc` inyectado.
   */
  private fuenteService: FuenteServiceClient;

  /**
   * Inyecta el cliente gRPC del paquete Financiero.
   *
   * @param financieroClient ClientGrpc configurado con FINANCIERO_PACKAGE_NAME.
   */
  constructor(
    @Inject(FINANCIERO_PACKAGE_NAME)
    private readonly financieroClient: ClientGrpc,
  ) {}

  /**
   * Hook del ciclo de vida de NestJS.
   * Obtiene la implementación del `FuenteServiceClient` a partir del `ClientGrpc`.
   */
  onModuleInit() {
    this.fuenteService =
      this.financieroClient.getService<FuenteServiceClient>(
        FUENTE_SERVICE_NAME,
      );
  }

  /**
   * GET /financiero/fuentes
   *
   * Recupera el listado de fuentes desde el microservicio Financiero.
   * Realiza la llamada gRPC `getFuentes` y transforma el Observable a Promesa.
   *
   * @returns Promesa resuelta con la respuesta gRPC `{ fuentes: Fuente[] }`.
   * @throws Propaga errores gRPC; se recomienda usar un filtro de excepciones
   *         para traducirlos a códigos HTTP adecuados.
   */
  @ApiOperation({ summary: 'Listar fuentes financieras' })
  @ApiOkResponse({
    description: 'Listado de fuentes recuperado correctamente',
    schema: {
      type: 'object',
      properties: {
        fuentes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fnt_id: { type: 'integer', example: 3 },
              fnt_nombre: { type: 'string', example: 'Recursos Propios' },
              fnt_descripcion: {
                type: 'string',
                example: 'Ingresos de la entidad',
              },
            },
          },
        },
      },
    },
  })
  @Get('fuentes')
  async getFuentes() {
    return await firstValueFrom(this.fuenteService.getFuentes({}));
  }
}
