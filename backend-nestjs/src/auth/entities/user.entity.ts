// backend-nestjs/src/auth/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios') // El nombre de la tabla en tu base de datos MySQL será 'usuarios'
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false }) // Importante: no selecciona la contraseña por defecto en las consultas
  password: string;

  @Column({ default: 'usuario', length: 20 }) // Rol por defecto para nuevos usuarios
  rol: string; // 'admin', 'usuario', 'manager', etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;
}