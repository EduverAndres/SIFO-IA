import { Controller, Get } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { Proveedor } from './proveedor.entity';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  findAll(): Promise<Proveedor[]> {
    return this.proveedoresService.findAll();
  }
}