
// backend-nestjs/src/puc/dto/response-puc.dto.ts
import { TipoCuenta, NaturalezaCuenta, EstadoCuenta } from '../entities/cuenta-puc.entity';

export class ResponsePucDto {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  total?: number;
  page?: number;
  limit?: number;
}

export class CuentaPucTreeDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_cuenta: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  estado: EstadoCuenta;
  nivel: number;
  acepta_movimientos: boolean;
  requiere_tercero: boolean;
  requiere_centro_costo: boolean;
  es_cuenta_niif: boolean;
  codigo_niif?: string;
  subcuentas: CuentaPucTreeDto[];
  tiene_movimientos?: boolean;
}