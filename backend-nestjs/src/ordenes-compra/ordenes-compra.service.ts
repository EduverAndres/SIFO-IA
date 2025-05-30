// backend-nestjs/src/ordenes-compra/ordenes-compra.service.ts - Versión completa
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { DetalleOrden } from './detalle-orden.entity';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { EstadoOrden } from './dto/update-estado-orden.dto';

interface FiltrosOrden {
  estado?: string;
  proveedor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable()
export class OrdenesCompraService {
  constructor(
    @InjectRepository(OrdenCompra)
    private ordenesCompraRepository: Repository<OrdenCompra>,
    @InjectRepository(DetalleOrden)
    private detallesOrdenRepository: Repository<DetalleOrden>,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService,
    private dataSource: DataSource,
  ) { }

  async updateEstado(id: number, estado: EstadoOrden, observaciones?: string): Promise<OrdenCompra | null> {
    const orden = await this.ordenesCompraRepository.findOne({ where: { id } });
    if (!orden) {
      return null;
    }
    orden.estado = estado;
    if (observaciones !== undefined) {
      orden.observaciones = observaciones;
    }
    await this.ordenesCompraRepository.save(orden);
    return await this.findOne(id); // Devuelve la orden con relaciones
  }

  async remove(id: number): Promise<boolean> {
    const orden = await this.ordenesCompraRepository.findOne({ where: { id } });
    if (!orden) {
      return false;
    }
    await this.ordenesCompraRepository.remove(orden);
    return true;
  }

  async findAll(filtros: FiltrosOrden = {}): Promise<OrdenCompra[]> {
    const queryBuilder = this.ordenesCompraRepository
      .createQueryBuilder('orden')
      .leftJoinAndSelect('orden.proveedor', 'proveedor')
      .leftJoinAndSelect('orden.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .orderBy('orden.fecha_orden', 'DESC');

    // Aplicar filtros
    if (filtros.estado) {
      queryBuilder.andWhere('orden.estado = :estado', { estado: filtros.estado });
    }

    if (filtros.proveedor) {
      queryBuilder.andWhere('proveedor.nombre LIKE :proveedor', {
        proveedor: `%${filtros.proveedor}%`
      });
    }

    if (filtros.fechaDesde && filtros.fechaHasta) {
      queryBuilder.andWhere('orden.fecha_orden BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<OrdenCompra | null> {
    return await this.ordenesCompraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'detalles', 'detalles.producto']
    });
  }

  // backend-nestjs/src/ordenes-compra/ordenes-compra.service.ts
  // Corregir la función createOrdenCompra

  async createOrdenCompra(createOrdenDto: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('[DEBUG] Datos recibidos:', JSON.stringify(createOrdenDto, null, 2));

      // 1. Validar Proveedor
      const proveedor = await this.proveedoresService.findOne(createOrdenDto.id_proveedor);
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${createOrdenDto.id_proveedor} no encontrado.`);
      }

      // 2. Crear la Orden de Compra
      const nuevaOrden = queryRunner.manager.create(OrdenCompra, {
        proveedor: proveedor,
        fecha_entrega: new Date(createOrdenDto.fecha_entrega),
        archivo_adjunto_url: createOrdenDto.archivo_adjunto_url,
        estado: EstadoOrden.PENDIENTE,
        total: 0
      });
      await queryRunner.manager.save(nuevaOrden);
      console.log('[DEBUG] Orden creada:', nuevaOrden.id);

      // 3. Validar y crear los detalles de la orden
      const erroresValidacion: string[] = [];
      const detallesParaGuardar: DetalleOrden[] = [];
      let totalOrden = 0;

      if (!createOrdenDto.detalles || createOrdenDto.detalles.length === 0) {
        throw new BadRequestException('La orden debe tener al menos un detalle.');
      }

      for (const [index, detalleDto] of createOrdenDto.detalles.entries()) {
        console.log(`[DEBUG] Procesando detalle ${index + 1}:`, detalleDto);

        // Validaciones mejoradas
        if (!detalleDto.id_producto) {
          erroresValidacion.push(`Detalle ${index + 1}: ID del producto es requerido.`);
          continue;
        }

        if (!detalleDto.cantidad || detalleDto.cantidad <= 0) {
          erroresValidacion.push(`Detalle ${index + 1}: La cantidad debe ser un número positivo mayor a 0.`);
          continue;
        }

        if (!detalleDto.precio_unitario || detalleDto.precio_unitario <= 0) {
          erroresValidacion.push(`Detalle ${index + 1}: El precio unitario debe ser un número positivo mayor a 0.`);
          continue;
        }

        // Validar que id_producto sea un número válido
        const idProducto = parseInt(detalleDto.id_producto.toString());
        if (isNaN(idProducto)) {
          erroresValidacion.push(`Detalle ${index + 1}: ID del producto debe ser un número válido.`);
          continue;
        }

        const producto = await this.productosService.findOne(idProducto);
        if (!producto) {
          erroresValidacion.push(`Detalle ${index + 1}: Producto con ID ${idProducto} no encontrado.`);
          continue;
        }

        // Validación de stock máximo
        const verificacionStock = await this.productosService.verificarStock(
          idProducto,
          detalleDto.cantidad
        );

        if (!verificacionStock.disponible) {
          erroresValidacion.push(
            `Detalle ${index + 1}: La cantidad solicitada (${detalleDto.cantidad}) para el producto '${producto.nombre}' excede su stock máximo. Máximo disponible: ${verificacionStock.puedeAgregar}`,
          );
          continue;
        }

        const subtotal = detalleDto.cantidad * detalleDto.precio_unitario;
        totalOrden += subtotal;

        const nuevoDetalle = queryRunner.manager.create(DetalleOrden, {
          orden: nuevaOrden,
          producto: producto,
          cantidad: detalleDto.cantidad,
          precio_unitario: detalleDto.precio_unitario,
        });
        detallesParaGuardar.push(nuevoDetalle);
        console.log(`[DEBUG] Detalle ${index + 1} validado correctamente`);
      }

      if (erroresValidacion.length > 0) {
        console.log('[DEBUG] Errores de validación:', erroresValidacion);
        throw new BadRequestException({
          message: 'Errores de validación en los detalles de la orden',
          errors: erroresValidacion, // Cambiar 'detalles' por 'errors' para consistencia
          detalles: erroresValidacion // Mantener ambos por compatibilidad
        });
      }

      if (detallesParaGuardar.length === 0) {
        throw new BadRequestException('La orden debe tener al menos un detalle válido.');
      }

      // Guardar detalles
      await queryRunner.manager.save(detallesParaGuardar);
      console.log(`[DEBUG] ${detallesParaGuardar.length} detalles guardados`);

      // Actualizar el total de la orden
      nuevaOrden.total = totalOrden;
      await queryRunner.manager.save(nuevaOrden);
      console.log(`[DEBUG] Total de la orden actualizado: ${totalOrden}`);

      await queryRunner.commitTransaction();

      // Retornar la orden completa con relaciones
      const ordenCompleta = await this.findOne(nuevaOrden.id);
      if (!ordenCompleta) {
        throw new InternalServerErrorException('No se pudo recuperar la orden de compra recién creada.');
      }

      console.log('[DEBUG] Orden de compra creada exitosamente:', ordenCompleta.id);
      return ordenCompleta;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('[ERROR] Error al crear orden de compra:', err);

      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Error interno del servidor al crear la orden de compra.');
    } finally {
      await queryRunner.release();
    }
  }

  async getEstadisticas(): Promise<any> {
    // Implementación básica temporal
    return { total: 0, pendientes: 0, aprobadas: 0, completadas: 0, canceladas: 0 };
  }
}