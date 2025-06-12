// src/puc/interfaces/puc.interface.ts
export interface ResponsePuc<T = any> {
  success: boolean;
  message: string;
  data?: T;
  total?: number;
  pagina?: number;
  limite?: number;
}

export interface NodoPucResponse {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
  estado: string;
  nivel: number;
  permite_movimiento: boolean;
  requiere_tercero?: boolean;
  requiere_centro_costo?: boolean;
  hijos: NodoPucResponse[];
}

export interface EstadisticasPuc {
  total_cuentas: number;
  cuentas_activas: number;
  cuentas_inactivas: number;
  por_tipo: Record<string, number>;
  por_naturaleza: Record<string, number>;
  por_clase: Record<string, {
    nombre: string;
    cantidad: number;
  }>;
}

export interface ValidacionCodigo {
  valido: boolean;
  disponible: boolean;
  tipo_sugerido: string;
  naturaleza_sugerida: string;
  codigo_padre_sugerido: string | null;
  mensajes: string[];
}