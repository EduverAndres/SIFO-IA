// backend-nestjs/src/proveedores/proveedores.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) {}

  async findAll(): Promise<Proveedor[]> {
    return await this.proveedoresRepository.find({
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Proveedor | null> {
    return await this.proveedoresRepository.findOne({
      where: { id },
      relations: ['ordenesCompra']
    });
  }

  async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const proveedor = this.proveedoresRepository.create(createProveedorDto);
    return await this.proveedoresRepository.save(proveedor);
  }

  async update(id: number, updateProveedorDto: UpdateProveedorDto): Promise<Proveedor | null> {
    const proveedor = await this.findOne(id);
    if (!proveedor) {
      return null;
    }

    Object.assign(proveedor, updateProveedorDto);
    return await this.proveedoresRepository.save(proveedor);
  }

  async remove(id: number): Promise<boolean> {
    const proveedor = await this.findOne(id);
    if (!proveedor) {
      return false;
    }

    await this.proveedoresRepository.remove(proveedor);
    return true;
  }

  async findByEmail(correo_electronico: string): Promise<Proveedor | null> {
    return await this.proveedoresRepository.findOne({
      where: { correo_electronico }
    });
  }

  async count(): Promise<number> {
    return await this.proveedoresRepository.count();
  }
}