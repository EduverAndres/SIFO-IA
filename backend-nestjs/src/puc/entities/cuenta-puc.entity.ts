import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum NaturalezaCuenta {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO'
}

export enum TipoCuenta {
  CLASE = 'CLASE',
  GRUPO = 'GRUPO', 
  CUENTA = 'CUENTA',
  SUBCUENTA = 'SUBCUENTA',
  AUXILIAR = 'AUXILIAR'
}

export enum EstadoCuenta {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA'
}

@Entity('cuentas_puc')
export class CuentaPuc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 20, default: 'AUXILIAR' })
  tipo: string;

  @Column({ type: 'varchar', length: 20, default: 'DEBITO' })
  naturaleza: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVA' })
  estado: string;

  @Column({ type: 'int', default: 1 })
  nivel: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_padre: string;

  @Column({ type: 'boolean', default: true })
  permite_movimiento: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_tercero: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_centro_costo: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_documento: boolean;

  @Column({ type: 'boolean', default: false })
  maneja_base_retencion: boolean;

  @Column({ type: 'boolean', default: true })
  aplica_niif: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  codigo_niif: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => CuentaPuc, cuenta => cuenta.subcuentas, { nullable: true })
  @JoinColumn({ name: 'codigo_padre', referencedColumnName: 'codigo' })
  cuenta_padre: CuentaPuc;

  @OneToMany(() => CuentaPuc, cuenta => cuenta.cuenta_padre)
  subcuentas: CuentaPuc[];
}

// =====================================================
// 3. DTOs (src/puc/dto/)
// =====================================================

// src/puc/dto/create-cuenta-puc.dto.ts
import { IsString, IsOptional, IsBoolean, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCuentaPucDto {
  @ApiProperty({ description: 'Código único de la cuenta', example: '1105' })
  @IsString()
  @Length(1, 20)
  @Matches(/^\d+$/, { message: 'El código debe contener solo números' })
  codigo: string;

  @ApiProperty({ description: 'Nombre de la cuenta', example: 'CAJA' })
  @IsString()
  @Length(1, 255)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción de la cuenta' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Código de la cuenta padre' })
  @IsOptional()
  @IsString()
  codigo_padre?: string;

  @ApiPropertyOptional({ description: 'Permite movimientos contables' })
  @IsOptional()
  @IsBoolean()
  permite_movimiento?: boolean;

  @ApiPropertyOptional({ description: 'Requiere tercero' })
  @IsOptional()
  @IsBoolean()
  requiere_tercero?: boolean;

  @ApiPropertyOptional({ description: 'Requiere centro de costo' })
  @IsOptional()
  @IsBoolean()
  requiere_centro_costo?: boolean;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}