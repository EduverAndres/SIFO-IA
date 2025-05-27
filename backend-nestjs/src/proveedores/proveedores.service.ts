import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './proveedor.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) {}

  findAll(): Promise<Proveedor[]> {
    return this.proveedoresRepository.find();
  }

  findOne(id: number): Promise<Proveedor | null> {
    return this.proveedoresRepository.findOneBy({ id });
  }
}