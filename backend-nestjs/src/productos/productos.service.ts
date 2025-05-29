// backend-nestjs/src/productos/productos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return await this.productosRepository.find({
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Producto | null> {
    return await this.productosRepository.findOne({
      where: { id },
      relations: ['detallesOrden']
    });
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = this.productosRepository.create(createProductoDto);
    return await this.productosRepository.save(producto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto | null> {
    const producto = await this.findOne(id);
    if (!producto) {
      return null;
    }

    Object.assign(producto, updateProductoDto);
    return await this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<boolean> {
    const producto = await this.findOne(id);
    if (!producto) {
      return false;
    }

    await this.productosRepository.remove(producto);
    return true;
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    const product = await this.productosRepository.findOneBy({ id: productId });
    if (product) {
      product.stock_actual += quantity;
      await this.productosRepository.save(product);
    }
  }

  async getProductosConStockBajo(): Promise<Producto[]> {
    return await this.productosRepository
      .createQueryBuilder('producto')
      .where('producto.stock_actual <= producto.stock_minimo')
      .getMany();
  }

  async verificarStock(productId: number, cantidadSolicitada: number): Promise<{
    disponible: boolean;
    stockActual: number;
    stockMaximo: number;
    puedeAgregar: number;
  }> {
    const producto = await this.findOne(productId);
    if (!producto) {
      return {
        disponible: false,
        stockActual: 0,
        stockMaximo: 0,
        puedeAgregar: 0
      };
    }

    const stockDespuesDeAgregar = producto.stock_actual + cantidadSolicitada;
    const puedeAgregar = producto.stock_maximo - producto.stock_actual;
    
    return {
      disponible: stockDespuesDeAgregar <= producto.stock_maximo,
      stockActual: producto.stock_actual,
      stockMaximo: producto.stock_maximo,
      puedeAgregar: Math.max(0, puedeAgregar)
    };
  }

  async count(): Promise<number> {
    return await this.productosRepository.count();
  }

  async getEstadisticas(): Promise<{
    total: number;
    conStockBajo: number;
    sinStock: number;
    stockPromedio: number;
  }> {
    const total = await this.count();
    const conStockBajo = await this.productosRepository
      .createQueryBuilder('producto')
      .where('producto.stock_actual <= producto.stock_minimo')
      .getCount();
    
    const sinStock = await this.productosRepository
      .createQueryBuilder('producto')
      .where('producto.stock_actual = 0')
      .getCount();

    const result = await this.productosRepository
      .createQueryBuilder('producto')
      .select('AVG(producto.stock_actual)', 'promedio')
      .getRawOne();

    return {
      total,
      conStockBajo,
      sinStock,
      stockPromedio: parseFloat(result.promedio) || 0
    };
  }
}