// backend-nestjs/src/productos/productos.controller.ts
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
import { ProductosService } from './productos.service';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async findAll(): Promise<Producto[]> {
    try {
      return await this.productosService.findAll();
    } catch (error) {
      throw new HttpException(
        'Error al obtener productos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Producto> {
    try {
      const producto = await this.productosService.findOne(id);
      if (!producto) {
        throw new HttpException(
          `Producto con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return producto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener producto',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createProductoDto: CreateProductoDto): Promise<Producto> {
    try {
      return await this.productosService.create(createProductoDto);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new HttpException(
        'Error al crear producto',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto
  ): Promise<Producto> {
    try {
      const producto = await this.productosService.update(id, updateProductoDto);
      if (!producto) {
        throw new HttpException(
          `Producto con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return producto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar producto',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      const result = await this.productosService.remove(id);
      if (!result) {
        throw new HttpException(
          `Producto con ID ${id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }
      return { message: `Producto con ID ${id} eliminado exitosamente` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new HttpException(
          'No se puede eliminar el producto porque tiene órdenes de compra asociadas',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Error al eliminar producto',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stock/alertas')
  async getAlertasStock(): Promise<{ productosConStockBajo: Producto[] }> {
    try {
      const productos = await this.productosService.getProductosConStockBajo();
      return { productosConStockBajo: productos };
    } catch (error) {
      throw new HttpException(
        'Error al obtener alertas de stock',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}