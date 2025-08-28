import { Controller, Get } from '@nestjs/common';
import { FuenteService } from './fuente.service';

@Controller()
export class FinancieroController {
  constructor(private readonly fuenteService: FuenteService) {}

  @Get('fuentes')
  async getFuentes() {
    return this.fuenteService.getFuentes();
  }
}
