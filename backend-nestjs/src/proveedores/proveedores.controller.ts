// backend-nestjs/src/proveedores/proveedores.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  HttpStatus,
  HttpException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { Proveedor } from './proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  async findAll(): Promise<Proveedor[]> {
    try {
      return await this.proveedoresService.findAll();
    } catch (error) {
      throw new HttpException(
        'Error al obtener proveedores',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Proveedor> {
    try {
      const proveedor = await this.proveedoresService.findOne(id);
      if (!proveedor) {
        throw new HttpException(
          `Proveedor con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return proveedor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener proveedor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    try {
      return await this.proveedoresService.create(createProveedorDto);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un proveedor con este correo electrónico',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Error al crear proveedor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedorDto: UpdateProveedorDto
  ): Promise<Proveedor> {
    try {
      const proveedor = await this.proveedoresService.update(id, updateProveedorDto);
      if (!proveedor) {
        throw new HttpException(
          `Proveedor con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return proveedor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Ya existe un proveedor con este correo electrónico',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Error al actualizar proveedor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      const result = await this.proveedoresService.remove(id);
      if (!result) {
        throw new HttpException(
          `Proveedor con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return { message: `Proveedor con ID ${id} eliminado exitosamente` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          'No se puede eliminar el proveedor porque tiene órdenes de compra asociadas',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Error al eliminar proveedor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}