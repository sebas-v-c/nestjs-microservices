import { Controller } from '@nestjs/common';
import { FuenteService } from './fuente.service';
import { FuenteServiceControllerMethods } from '@app/proto-types/financiero';

@Controller()
@FuenteServiceControllerMethods()
export class FinancieroController {
  constructor(private readonly fuenteService: FuenteService) {}

  getFuentes() {
    return this.fuenteService.getFuentes();
  }
}
