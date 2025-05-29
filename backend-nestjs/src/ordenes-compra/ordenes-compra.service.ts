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
  ) {}

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

      // 2. Crear la Orden de Compra
      const nuevaOrden = queryRunner.manager.create(OrdenCompra, {
        proveedor: proveedor,
        fecha_entrega: new Date(createOrdenDto.fecha_entrega),
        archivo_adjunto_url: createOrdenDto.archivo_adjunto_url,
        estado: EstadoOrden.PENDIENTE,
        total: 0
      });
      await queryRunner.manager.save(nuevaOrden);

      // 3. Validar y crear los detalles de la orden
      const erroresValidacion: string[] = [];
      const detallesParaGuardar: DetalleOrden[] = [];
      let totalOrden = 0;

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
        const verificacionStock = await this.productosService.verificarStock(
          detalleDto.id_producto, 
          detalleDto.cantidad
        );

        if (!verificacionStock.disponible) {
          erroresValidacion.push(
            `La cantidad solicitada (${detalleDto.cantidad}) para el producto '${producto.nombre}' excede su stock máximo. Máximo disponible para agregar: ${verificacionStock.puedeAgregar}`,
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
      }

      if (erroresValidacion.length > 0) {
        throw new BadRequestException({
          message: 'Errores de validación en los detalles de la orden.',
          detalles: erroresValidacion
        });
      }

      if (detallesParaGuardar.length === 0) {
        throw new BadRequestException('La orden debe tener al menos un detalle válido.');
      }

      // Guardar detalles
      await queryRunner.manager.save(detallesParaGuardar);

      // Actualizar el total de la orden
      nuevaOrden.total = totalOrden;
      await queryRunner.manager.save(nuevaOrden);

      await queryRunner.commitTransaction();

      // Retornar la orden completa con relaciones
      const ordenCompleta = await this.findOne(nuevaOrden.id);
      if (!ordenCompleta) {
        throw new InternalServerErrorException('No se pudo recuperar la orden de compra recién creada.');
      }
      return ordenCompleta;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      console.error('Error al crear orden de compra:', err);
      throw new InternalServerErrorException('No se pudo guardar la orden de compra. Inténtalo de nuevo.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateEstado(id: number, nuevoEstado: EstadoOrden): Promise<OrdenCompra | null> {
    const orden = await this.findOne(id);
    if (!orden) {
      return null;
    }

    // Validar transiciones de estado válidas
    const transicionesValidas: Record<EstadoOrden, EstadoOrden[]> = {
      [EstadoOrden.PENDIENTE]: [EstadoOrden.APROBADA, EstadoOrden.CANCELADA],
      [EstadoOrden.APROBADA]: [EstadoOrden.COMPLETADA, EstadoOrden.CANCELADA],
      [EstadoOrden.COMPLETADA]: [], // No se puede cambiar desde completada
      [EstadoOrden.CANCELADA]: [] // No se puede cambiar desde cancelada
    };

    if (!transicionesValidas[orden.estado]?.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${orden.estado} a ${nuevoEstado}`
      );
    }

    // Si la orden se completa, actualizar el stock de los productos
    if (nuevoEstado === EstadoOrden.COMPLETADA) {
      for (const detalle of orden.detalles) {
        await this.productosService.updateStock(detalle.producto.id, detalle.cantidad);
      }
    }

    orden.estado = nuevoEstado;
    return await this.ordenesCompraRepository.save(orden);
  }

  async remove(id: number): Promise<boolean> {
    const orden = await this.findOne(id);
    if (!orden) {
      return false;
    }

    // Solo permitir eliminar órdenes pendientes o canceladas
    if (orden.estado === EstadoOrden.APROBADA || orden.estado === EstadoOrden.COMPLETADA) {
      throw new BadRequestException(
        `No se puede eliminar una orden en estado ${orden.estado}`
      );
    }

    await this.ordenesCompraRepository.remove(orden);
    return true;
  }

  async getEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    completadas: number;
    canceladas: number;
    valorTotal: number;
    valorPendiente: number;
    ordenesRecientes: OrdenCompra[];
  }> {
    const total = await this.ordenesCompraRepository.count();
    
    const estadisticasPorEstado = await this.ordenesCompraRepository
      .createQueryBuilder('orden')
      .select('orden.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('SUM(orden.total)', 'valor')
      .groupBy('orden.estado')
      .getRawMany();

    const stats = {
      total,
      pendientes: 0,
      aprobadas: 0,
      completadas: 0,
      canceladas: 0,
      valorTotal: 0,
      valorPendiente: 0,
    };

    estadisticasPorEstado.forEach(stat => {
      const cantidad = parseInt(stat.cantidad);
      const valor = parseFloat(stat.valor) || 0;
      
      switch (stat.estado) {
        case EstadoOrden.PENDIENTE:
          stats.pendientes = cantidad;
          stats.valorPendiente = valor;
          break;
        case EstadoOrden.APROBADA:
          stats.aprobadas = cantidad;
          break;
        case EstadoOrden.COMPLETADA:
          stats.completadas = cantidad;
          break;
        case EstadoOrden.CANCELADA:
          stats.canceladas = cantidad;
          break;
      }
      stats.valorTotal += valor;
    });

    // Obtener órdenes recientes (últimas 5)
    const ordenesRecientes = await this.ordenesCompraRepository.find({
      relations: ['proveedor'],
      order: { fecha_orden: 'DESC' },
      take: 5
    });

    return {
      ...stats,
      ordenesRecientes
    };
  }

  async getOrdenesPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<OrdenCompra[]> {
    return await this.ordenesCompraRepository.find({
      where: {
        fecha_orden: Between(fechaInicio, fechaFin)
      },
      relations: ['proveedor', 'detalles', 'detalles.producto'],
      order: { fecha_orden: 'DESC' }
    });
  }
}