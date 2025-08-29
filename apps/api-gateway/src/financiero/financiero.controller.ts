import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  FUENTE_SERVICE_NAME,
  FINANCIERO_PACKAGE_NAME,
  FuenteServiceClient,
} from '@app/proto-types/financiero';

@Controller('financiero')
export class FinancieroController implements OnModuleInit {
  private fuenteService: FuenteServiceClient;
  constructor(
    @Inject(FINANCIERO_PACKAGE_NAME)
    private readonly financieroClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fuenteService =
      this.financieroClient.getService<FuenteServiceClient>(
        FUENTE_SERVICE_NAME,
      );
  }

  @Get()
  async getFuentes() {
    return await firstValueFrom(this.fuenteService.getFuentes({}));
  }
}
