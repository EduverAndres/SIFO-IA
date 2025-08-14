// src/puc/dto/filtros-puc.dto.ts
import { IsOptional, IsString, IsBoolean, IsNumberString, IsEnum, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Enums para validación
export enum TipoCuenta {
  CLASE = 'CLASE',
  GRUPO = 'GRUPO', 
  CUENTA = 'CUENTA',
  SUBCUENTA = 'SUBCUENTA',
  DETALLE = 'DETALLE'
}

export enum Naturaleza {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO'
}

export enum EstadoCuenta {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA'
}

export enum OrdenCampos {
  CODIGO = 'codigo_completo',
  DESCRIPCION = 'descripcion',
  NIVEL = 'nivel',
  TIPO = 'tipo_cuenta',
  SALDO_INICIAL = 'saldo_inicial',
  SALDO_FINAL = 'saldo_final',
  MOVIMIENTOS_DEBITO = 'movimientos_debito',
  MOVIMIENTOS_CREDITO = 'movimientos_credito',
  FECHA_CREACION = 'fecha_creacion',
  CODIGO_COMPLETO = "CODIGO_COMPLETO"
}

export enum TipoOrden {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class FiltrosPucDto {
  @ApiPropertyOptional({ 
    description: 'Búsqueda general en código y descripción',
    example: 'efectivo'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  busqueda?: string;

  @ApiPropertyOptional({ 
    description: 'Búsqueda específica por código - muestra la cuenta exacta + subcuentas',
    example: '1105'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().replace(/[^0-9]/g, ''))
  busqueda_especifica?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo de cuenta',
    enum: TipoCuenta
  })
  @IsOptional()
  @IsEnum(TipoCuenta)
  tipo?: TipoCuenta;

  @ApiPropertyOptional({ 
    description: 'Filtrar por naturaleza',
    enum: Naturaleza
  })
  @IsOptional()
  @IsEnum(Naturaleza)
  naturaleza?: Naturaleza;

  @ApiPropertyOptional({ 
    description: 'Filtrar por estado',
    enum: EstadoCuenta,
    default: EstadoCuenta.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoCuenta)
  estado?: EstadoCuenta = EstadoCuenta.ACTIVA;

  @ApiPropertyOptional({ 
    description: 'Código de la cuenta padre',
    example: '11'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  codigo_padre?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por clase específica (primer dígito)',
    example: '1'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  codigo_clase?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por nivel jerárquico',
    example: '3'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  nivel?: string;

  @ApiPropertyOptional({ 
    description: 'Solo cuentas que aceptan movimientos',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  solo_movimiento?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Solo cuentas con saldo mayor a cero',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  solo_con_saldo?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Solo cuentas con movimientos en el período',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  solo_con_movimientos?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Incluir cuentas inactivas',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  incluir_inactivas?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Número de página',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => value || '1')
  pagina?: string = '1';

  @ApiPropertyOptional({ 
    description: 'Elementos por página',
    example: 50,
    default: 50
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => value || '50')
  limite?: string = '50';

  @ApiPropertyOptional({ 
    description: 'Campo por el cual ordenar',
    enum: OrdenCampos,
    default: OrdenCampos.CODIGO
  })
  @IsOptional()
  @IsEnum(OrdenCampos)
  ordenar_por?: OrdenCampos = OrdenCampos.CODIGO;

  @ApiPropertyOptional({ 
    description: 'Tipo de ordenamiento',
    enum: TipoOrden,
    default: TipoOrden.ASC
  })
  @IsOptional()
  @IsEnum(TipoOrden)
  orden?: TipoOrden = TipoOrden.ASC;

  @ApiPropertyOptional({ 
    description: 'Rango de saldo mínimo',
    example: '0'
  })
  @IsOptional()
  @IsString()
  saldo_minimo?: string;

  @ApiPropertyOptional({ 
    description: 'Rango de saldo máximo',
    example: '1000000'
  })
  @IsOptional()
  @IsString()
  saldo_maximo?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de creación desde (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsString()
  fecha_desde?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha de creación hasta (YYYY-MM-DD)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsString()
  fecha_hasta?: string;

  // Métodos helper para validación y transformación
  get paginaNum(): number {
    return parseInt(this.pagina ?? '1') || 1;
  }

  get limiteNum(): number {
    const limite = parseInt(this.limite ?? '50') || 50;
    return Math.min(limite, 1000); // Límite máximo de seguridad
  }

  get offset(): number {
    return (this.paginaNum - 1) * this.limiteNum;
  }

  // Validar si es una búsqueda específica válida
  get esBusquedaEspecificaValida(): boolean {
    return !!(this.busqueda_especifica && this.busqueda_especifica.length > 0);
  }

  // Obtener la clase desde el código específico
  get claseDesdeEspecifica(): string | null {
    if (!this.esBusquedaEspecificaValida || !this.busqueda_especifica) return null;
    return this.busqueda_especifica.charAt(0);
  }

  // Limpiar filtros incompatibles
  limpiarFiltrosIncompatibles(): void {
    if (this.esBusquedaEspecificaValida) {
      // Si hay búsqueda específica, limpiar otros filtros que puedan interferir
      this.busqueda = undefined;
      this.codigo_clase = undefined;
      this.tipo = undefined;
      this.nivel = undefined;
      this.naturaleza = undefined;
      this.codigo_padre = undefined;
    }
  }

  // Validar rangos de saldo
  get rangoSaldoValido(): boolean {
    if (!this.saldo_minimo && !this.saldo_maximo) return true;
    
    const min = parseFloat(this.saldo_minimo || '0');
    const max = parseFloat(this.saldo_maximo || '999999999');
    
    return min <= max;
  }

  // Validar rango de fechas
  get rangoFechaValido(): boolean {
    if (!this.fecha_desde && !this.fecha_hasta) return true;
    
    if (this.fecha_desde && this.fecha_hasta) {
      return new Date(this.fecha_desde) <= new Date(this.fecha_hasta);
    }
    
    return true;
  }
}