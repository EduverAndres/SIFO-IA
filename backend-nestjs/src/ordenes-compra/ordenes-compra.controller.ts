// backend-nestjs/src/ordenes-compra/ordenes-compra.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { OrdenesCompraService } from './ordenes-compra.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { FiltrosOrdenDto } from './dto/filtros-orden.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { OrdenCompra } from './orden-compra.entity';

// Configuración de Multer para guardar archivos
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
  },
});

@Controller('ordenes-compra')
export class OrdenesCompraController {
  constructor(private readonly ordenesCompraService: OrdenesCompraService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() filtros: FiltrosOrdenDto): Promise<OrdenCompra[]> {
    try {
      return await this.ordenesCompraService.findAll(filtros);
    } catch (error) {
      throw new HttpException(
        'Error al obtener órdenes de compra',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('estadisticas')
  async getEstadisticas() {
    try {
      return await this.ordenesCompraService.getEstadisticas();
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrdenCompra> {
    try {
      const orden = await this.ordenesCompraService.findOne(id);
      if (!orden) {
        throw new HttpException(
          `Orden de compra con ID ${id} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }
      return orden;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener orden de compra',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo_adjunto', { storage }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(pdf|jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException(
          'No se subió ningún archivo',
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        message: 'Archivo subido exitosamente.',
        filename: file.filename,
        filepath: file.path,
        url: `/uploads/${file.filename}`
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al subir archivo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true 
  }))
  async create(@Body() createOrdenDto: CreateOrdenCompraDto): Promise<{ 
    mensaje: string; 
    orden: OrdenCompra 
  }> {
    try {
      const orden = await this.ordenesCompraService.createOrdenCompra(createOrdenDto);
      return {
        mensaje: 'Orden de compra creada exitosamente.',
        orden: orden
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al crear orden de compra:', error);
      throw new HttpException(
        error.message || 'Error interno del servidor al crear orden de compra',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/estado')
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true 
  }))
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoOrdenDto
  ): Promise<{ mensaje: string; orden: OrdenCompra }> {
    try {
      const orden = await this.ordenesCompraService.updateEstado(id, updateEstadoDto.estado);
      if (!orden) {
        throw new HttpException(
          `Orden de compra con ID ${id} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }

      // Si se proporcionaron observaciones, actualizarlas
      if (updateEstadoDto.observaciones) {
        orden.observaciones = updateEstadoDto.observaciones;
        // Aquí podrías guardar las observaciones si es necesario
      }

      return {
        mensaje: `Estado de la orden ${id} actualizado a ${updateEstadoDto.estado}`,
        orden: orden
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al actualizar estado de la orden',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      const result = await this.ordenesCompraService.remove(id);
      if (!result) {
        throw new HttpException(
          `Orden de compra con ID ${id} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }
      return { message: `Orden de compra con ID ${id} eliminada exitosamente` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al eliminar orden de compra',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}