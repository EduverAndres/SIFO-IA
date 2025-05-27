import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  findAll(): Promise<Producto[]> {
    return this.productosRepository.find();
  }

  findOne(id: number): Promise<Producto | null> {
    return this.productosRepository.findOneBy({ id });
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    const product = await this.productosRepository.findOneBy({ id: productId });
    if (product) {
      product.stock_actual += quantity;
      await this.productosRepository.save(product);
    }
  }
}