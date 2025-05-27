import { Controller, Get } from '@nestjs/common';

@Controller('ia-service')
export class IaServiceController {
  @Get('suggest-products')
  getSuggestedProducts(): string {
    // Aquí se integraría la llamada a FastAPI para la IA de Google
    return 'Endpoint de IA para sugerir productos (futura implementación con FastAPI)';
  }
}