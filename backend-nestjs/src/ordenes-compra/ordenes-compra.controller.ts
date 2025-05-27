import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { OrdenesCompraService } from './ordenes-compra.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer'; // <-- ¡IMPORTANTE! Añadimos diskStorage

// Configuración de Multer para guardar archivos en el disco
const storage = diskStorage({ // <-- Usamos diskStorage para crear la instancia del motor de almacenamiento
  destination: './uploads', // Directorio donde se guardarán los archivos temporalmente. ¡Asegúrate de que esta carpeta exista!
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

  @Post('upload') // Nuevo endpoint para la subida de archivos
  @UseInterceptors(FileInterceptor('archivo_adjunto', { storage })) // Usamos la instancia 'storage'
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Límite de 5MB
          new FileTypeValidator({ fileType: /(pdf|jpg|jpeg|png)/ }), // Tipos de archivo permitidos
        ],
      }),
    )
    file: Express.Multer.File, // Ya deberías tener @types/multer instalado para este tipo
  ) {
    if (!file) {
      return { message: 'No se subió ningún archivo.' };
    }
    // En un entorno real, guardarías la URL permanente del archivo en la base de datos
    // o en un servicio de almacenamiento en la nube después de moverlo de la carpeta 'uploads'.
    return {
      message: 'Archivo subido exitosamente.',
      filename: file.filename, // Devuelve el nombre del archivo guardado por Multer
      filepath: file.path, // Devuelve la ruta completa del archivo en el servidor
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createOrdenDto: CreateOrdenCompraDto,
    @Res() res: Response,
  ) {
    try {
      const orden = await this.ordenesCompraService.createOrdenCompra(createOrdenDto);
      return res.status(HttpStatus.CREATED).json({
        mensaje: 'Orden de compra creada exitosamente.',
        id_orden: orden.id,
      });
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST || error.status === HttpStatus.NOT_FOUND) {
        return res.status(error.status).json({
          error: error.response?.message || error.message,
          detalles: error.response?.detalles || null,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Error interno del servidor',
        mensaje: 'No se pudo procesar la solicitud.',
      });
    }
  }
}