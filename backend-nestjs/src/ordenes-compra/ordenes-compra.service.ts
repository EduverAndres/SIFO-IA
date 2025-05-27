import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';

@Injectable()
export class OrdenesCompraService {
  constructor(
    @InjectRepository(OrdenCompra)
    private ordenesCompraRepository: Repository<OrdenCompra>,
    @InjectRepository(DetalleOrden)
    private detallesOrdenRepository: Repository<DetalleOrden>,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService,
    private dataSource: DataSource, // Para transacciones
  ) {}

  async createOrdenCompra(createOrdenDto: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Proveedor
      const proveedor = await this.proveedoresService.findOne(createOrdenDto.id_proveedor);
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${createOrdenDto.id_proveedor} no encontrado.`);
      }

      // 2. Crear la Orden de Compra (sin detalles aún)
      const nuevaOrden = queryRunner.manager.create(OrdenCompra, {
        proveedor: proveedor,
        fecha_entrega: createOrdenDto.fecha_entrega,
        archivo_adjunto_url: createOrdenDto.archivo_adjunto_url, // Ahora esperamos la URL del archivo
      });
      await queryRunner.manager.save(nuevaOrden);

      // 3. Validar y crear los detalles de la orden
      const erroresValidacion: string[] = [];
      const detallesParaGuardar: DetalleOrden[] = [];

      for (const detalleDto of createOrdenDto.detalles) {
        if (detalleDto.cantidad <= 0) {
          erroresValidacion.push(`La cantidad para el producto ${detalleDto.id_producto} debe ser positiva.`);
          continue;
        }

        const producto = await this.productosService.findOne(detalleDto.id_producto);
        if (!producto) {
          erroresValidacion.push(`Producto con ID ${detalleDto.id_producto} no encontrado.`);
          continue;
        }

        // Validación de stock máximo
        if (producto.stock_actual + detalleDto.cantidad > producto.stock_maximo) {
          erroresValidacion.push(
            `La cantidad solicitada (${detalleDto.cantidad}) para el producto '${producto.nombre}' (ID: ${producto.id}) excede su stock máximo permitido (${
              producto.stock_maximo - producto.stock_actual
            } disponibles para añadir).`,
          );
          continue;
        }

        const nuevoDetalle = queryRunner.manager.create(DetalleOrden, {
          orden: nuevaOrden,
          producto: producto,
          cantidad: detalleDto.cantidad,
          precio_unitario: detalleDto.precio_unitario,
        });
        detallesParaGuardar.push(nuevoDetalle);
      }

      if (erroresValidacion.length > 0) {
        throw new BadRequestException(
          'Errores de validación en los detalles de la orden.',
          erroresValidacion.join('\n'),
        );
      }

      await queryRunner.manager.save(detallesParaGuardar);

      await queryRunner.commitTransaction();
      return nuevaOrden;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err; // Re-lanzar excepciones controladas
      }
      console.error('Error al crear orden de compra:', err);
      throw new InternalServerErrorException('No se pudo guardar la orden de compra. Inténtalo de nuevo.');
    } finally {
      await queryRunner.release();
    }
  }
}