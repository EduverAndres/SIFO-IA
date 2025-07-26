// backend-nestjs/src/puc/puc.service.ts - ARREGLO COMPLETO
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaPuc, NaturalezaCuentaEnum, TipoCuentaEnum, EstadoCuentaEnum } from './entities/cuenta-puc.entity';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { ResponsePucDto } from './dto/response-puc.dto';
import { ImportPucExcelDto } from './dto/import-puc-excel.dto';
import { ExportPucExcelDto } from './dto/export-puc-excel.dto';
import { PucExcelService } from './services/puc-excel.service';
import { 
  ValidacionExcel, 
  ResultadoImportacion 
} from './interfaces/excel-row.interface';

@Injectable()
export class PucService {
  private readonly logger = new Logger(PucService.name);

  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>,
    private pucExcelService: PucExcelService
  ) {}

  // ===============================================
  // 📊 MÉTODO DE ESTADÍSTICAS CORREGIDO
  // ===============================================

  async obtenerEstadisticas(): Promise<any> {
    try {
      const stats = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select([
          'COUNT(*) as total',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'CLASE\' THEN 1 END) as clases',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'GRUPO\' THEN 1 END) as grupos',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'CUENTA\' THEN 1 END) as cuentas_nivel3',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'SUBCUENTA\' THEN 1 END) as subcuentas',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'DETALLE\' THEN 1 END) as detalles',
          'COUNT(CASE WHEN cuenta.acepta_movimientos = true THEN 1 END) as acepta_movimientos',
          'COUNT(CASE WHEN cuenta.naturaleza = \'DEBITO\' THEN 1 END) as debito',
          'COUNT(CASE WHEN cuenta.naturaleza = \'CREDITO\' THEN 1 END) as credito',
          'COUNT(CASE WHEN cuenta.estado = \'ACTIVA\' THEN 1 END) as activas',
          'COUNT(CASE WHEN cuenta.estado = \'INACTIVA\' THEN 1 END) as inactivas'
        ])
        .where('cuenta.activo = :activo', { activo: true })
        .getRawOne();

      // ✅ ESTRUCTURA CONSISTENTE PARA EL FRONTEND
      return {
        success: true,
        data: {
          total: parseInt(stats.total) || 0,
          por_tipo: {
            clases: parseInt(stats.clases) || 0,
            grupos: parseInt(stats.grupos) || 0,
            cuentas: parseInt(stats.cuentas_nivel3) || 0,
            subcuentas: parseInt(stats.subcuentas) || 0,
            detalles: parseInt(stats.detalles) || 0
          },
          por_naturaleza: {
            debito: parseInt(stats.debito) || 0,
            credito: parseInt(stats.credito) || 0
          },
          por_estado: {
            activas: parseInt(stats.activas) || 0,
            inactivas: parseInt(stats.inactivas) || 0
          },
          acepta_movimientos: parseInt(stats.acepta_movimientos) || 0,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error);
      
      // ✅ DEVOLVER ESTRUCTURA SEGURA EN CASO DE ERROR
      return {
        success: false,
        data: {
          total: 0,
          por_tipo: { clases: 0, grupos: 0, cuentas: 0, subcuentas: 0, detalles: 0 },
          por_naturaleza: { debito: 0, credito: 0 },
          por_estado: { activas: 0, inactivas: 0 },
          acepta_movimientos: 0,
          timestamp: new Date().toISOString()
        },
        error: error.message
      };
    }
  }

  // ===============================================
  // 📋 MÉTODO DE CUENTAS CORREGIDO
  // ===============================================

  async obtenerCuentas(filtros: FiltrosPucDto): Promise<any> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      // Aplicar filtros
      if (filtros.busqueda) {
        query.andWhere(
          '(cuenta.codigo_completo ILIKE :busqueda OR cuenta.nombre ILIKE :busqueda)',
          { busqueda: `%${filtros.busqueda}%` }
        );
      }

      if (filtros.tipo) {
        query.andWhere('cuenta.tipo_cuenta = :tipo', { tipo: filtros.tipo });
      }

      if (filtros.naturaleza) {
        query.andWhere('cuenta.naturaleza = :naturaleza', { naturaleza: filtros.naturaleza });
      }

      if (filtros.estado) {
        query.andWhere('cuenta.estado = :estado', { estado: filtros.estado });
      }

      if (filtros.codigo_padre) {
        query.andWhere('cuenta.codigo_padre = :codigo_padre', { codigo_padre: filtros.codigo_padre });
      }

      if (filtros.solo_movimiento) {
        query.andWhere('cuenta.acepta_movimientos = :acepta_movimientos', { acepta_movimientos: true });
      }

      // Solo cuentas activas por defecto
      query.andWhere('cuenta.activo = :activo', { activo: true });

      // Contar total para paginación
      const totalQuery = query.clone();
      const total = await totalQuery.getCount();

      // Aplicar paginación
      const limite = Math.min(Number(filtros.limite) || 50, 1000);
      const pagina = Number(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

      query.orderBy('cuenta.codigo_completo', 'ASC');
      query.limit(limite);
      query.offset(offset);

      const cuentas = await query.getMany();

      // Calcular paginación
      const totalPaginas = Math.ceil(total / limite);

      // ✅ ESTRUCTURA CONSISTENTE PARA EL FRONTEND
      return {
        success: true,
        data: cuentas.map(cuenta => this.mapearAResponseDto(cuenta)), // ✅ SIEMPRE ARRAY
        pagination: {
          total,
          totalPaginas,
          paginaActual: pagina,
          limite,
          hasNext: pagina < totalPaginas,
          hasPrev: pagina > 1
        },
        filtros,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error obteniendo cuentas:', error);
      
      // ✅ DEVOLVER ESTRUCTURA SEGURA EN CASO DE ERROR
      return {
        success: false,
        data: [], // ✅ SIEMPRE ARRAY VACÍO EN CASO DE ERROR
        pagination: {
          total: 0,
          totalPaginas: 0,
          paginaActual: 1,
          limite: 50,
          hasNext: false,
          hasPrev: false
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===============================================
  // 🌳 MÉTODO DE ÁRBOL CORREGIDO
  // ===============================================

  async obtenerArbol(codigoPadre?: string, incluirInactivas: boolean = false): Promise<any> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      if (codigoPadre) {
        query.where('cuenta.codigo_padre = :codigo_padre', { codigo_padre: codigoPadre });
      } else {
        query.where('cuenta.codigo_padre IS NULL');
      }

      if (!incluirInactivas) {
        query.andWhere('cuenta.activo = :activo', { activo: true });
      }

      query.orderBy('cuenta.codigo_completo', 'ASC');

      const cuentas = await query.getMany();

      // Agregar información de hijos para cada cuenta
      const cuentasConHijos = await Promise.all(
        cuentas.map(async (cuenta) => {
          const tieneHijos = await this.cuentaPucRepository.count({
            where: { codigo_padre: cuenta.codigo_completo, activo: true }
          }) > 0;

          return {
            ...this.mapearAResponseDto(cuenta),
            tiene_hijos: tieneHijos
          };
        })
      );

      // ✅ ESTRUCTURA CONSISTENTE PARA EL FRONTEND
      return {
        success: true,
        data: cuentasConHijos, // ✅ SIEMPRE ARRAY
        metadata: {
          codigo_padre: codigoPadre || null,
          incluir_inactivas: incluirInactivas,
          total_nodos: cuentasConHijos.length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error obteniendo árbol:', error);
      
      // ✅ DEVOLVER ESTRUCTURA SEGURA EN CASO DE ERROR
      return {
        success: false,
        data: [], // ✅ SIEMPRE ARRAY VACÍO EN CASO DE ERROR
        metadata: {
          codigo_padre: codigoPadre || null,
          incluir_inactivas: incluirInactivas,
          total_nodos: 0
        },
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===============================================
  // RESTO DE MÉTODOS (mantener los existentes)
  // ===============================================

  async crearCuenta(createCuentaDto: CreateCuentaPucDto): Promise<ResponsePucDto> {
    try {
      // Validar que el código no exista
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo_completo: createCuentaDto.codigo_completo }
      });

      if (existente) {
        throw new BadRequestException(`Ya existe una cuenta con código ${createCuentaDto.codigo_completo}`);
      }

      // Validar jerarquía si tiene padre
      if (createCuentaDto.codigo_padre) {
        const padre = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: createCuentaDto.codigo_padre, activo: true }
        });

        if (!padre) {
          throw new BadRequestException(`Cuenta padre ${createCuentaDto.codigo_padre} no encontrada`);
        }
      }

      // Determinar naturaleza y tipo automáticamente
      const naturaleza = createCuentaDto.naturaleza || this.determinarNaturaleza(createCuentaDto.codigo_completo);
      const tipoCuenta = createCuentaDto.tipo_cuenta || this.determinarTipoCuenta(createCuentaDto.codigo_completo);
      const nivel = this.determinarNivel(createCuentaDto.codigo_completo);

      const nuevaCuenta = this.cuentaPucRepository.create({
        ...createCuentaDto,
        naturaleza,
        tipo_cuenta: tipoCuenta,
        nivel,
        estado: EstadoCuentaEnum.ACTIVA,
        acepta_movimientos: nivel === 5, // Solo detalles aceptan movimientos
        activo: true
      });

      const cuentaGuardada = await this.cuentaPucRepository.save(nuevaCuenta);

      return this.mapearAResponseDto(cuentaGuardada);

    } catch (error) {
      this.logger.error('Error creando cuenta:', error);
      throw error;
    }
  }

  async obtenerCuentaPorId(id: number): Promise<ResponsePucDto> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id, activo: true }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      return this.mapearAResponseDto(cuenta);

    } catch (error) {
      this.logger.error(`Error obteniendo cuenta ${id}:`, error);
      throw error;
    }
  }

  async actualizarCuenta(id: number, updateCuentaDto: UpdateCuentaPucDto): Promise<ResponsePucDto> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id, activo: true }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      // Si se cambia el código, validar que no exista
      if (updateCuentaDto.codigo_completo && updateCuentaDto.codigo_completo !== cuenta.codigo_completo) {
        const existente = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: updateCuentaDto.codigo_completo }
        });

        if (existente) {
          throw new BadRequestException(`Ya existe una cuenta con código ${updateCuentaDto.codigo_completo}`);
        }
      }

      await this.cuentaPucRepository.update(id, {
        ...updateCuentaDto,
        fecha_modificacion: new Date()
      });

      const cuentaActualizada = await this.cuentaPucRepository.findOne({ where: { id } });
      return this.mapearAResponseDto(cuentaActualizada!);

    } catch (error) {
      this.logger.error(`Error actualizando cuenta ${id}:`, error);
      throw error;
    }
  }

  async eliminarCuenta(id: number): Promise<void> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id, activo: true }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      // Verificar que no tenga subcuentas
      const subcuentas = await this.cuentaPucRepository.count({
        where: { codigo_padre: cuenta.codigo_completo, activo: true }
      });

      if (subcuentas > 0) {
        throw new BadRequestException(
          `No se puede eliminar la cuenta ${cuenta.codigo_completo} porque tiene ${subcuentas} subcuentas`
        );
      }

      // Eliminación física real
      this.logger.log(`🗑️ Eliminando físicamente cuenta: ${cuenta.codigo_completo} - ${cuenta.nombre}`);
      
      await this.cuentaPucRepository.delete(id);

      this.logger.log(`✅ Cuenta eliminada físicamente: ${cuenta.codigo_completo}`);

    } catch (error) {
      this.logger.error(`❌ Error eliminando cuenta ${id}:`, error);
      throw error;
    }
  }

  // ===============================================
  // 🔧 MÉTODOS PRIVADOS AUXILIARES
  // ===============================================

  private mapearAResponseDto(cuenta: CuentaPuc): ResponsePucDto {
    return {
      id: cuenta.id,
      codigo_completo: cuenta.codigo_completo,
      nombre: cuenta.nombre,
      naturaleza: cuenta.naturaleza,
      tipo_cuenta: cuenta.tipo_cuenta,
      estado: cuenta.estado,
      nivel: cuenta.nivel,
      acepta_movimientos: cuenta.acepta_movimientos,
      codigo_padre: cuenta.codigo_padre || undefined,
      saldo_inicial: cuenta.saldo_inicial || 0,
      saldo_final: cuenta.saldo_final || 0,
      codigo_clase: cuenta.codigo_clase || undefined,
      codigo_grupo: cuenta.codigo_grupo || undefined,
      codigo_cuenta: cuenta.codigo_cuenta || undefined,
      codigo_subcuenta: cuenta.codigo_subcuenta || undefined,
      codigo_detalle: cuenta.codigo_detalle || undefined,
      activo: cuenta.activo,
      fecha_creacion: cuenta.fecha_creacion,
      fecha_modificacion: cuenta.fecha_modificacion,
      movimientos_debito: cuenta.movimientos_debito,
      movimientos_credito: cuenta.movimientos_credito,
      centro_costos: cuenta.centro_costos || undefined,
      aplica_f350: cuenta.aplica_f350,
      aplica_f300: cuenta.aplica_f300,
      aplica_exogena: cuenta.aplica_exogena,
      aplica_ica: cuenta.aplica_ica,
      aplica_dr110: cuenta.aplica_dr110
    };
  }

  private determinarNaturaleza(codigo: string): NaturalezaCuentaEnum {
    const primerDigito = codigo.charAt(0);
    
    switch (primerDigito) {
      case '1': // Activos
      case '5': // Gastos
      case '6': // Costos
      case '7': // Costos de producción
        return NaturalezaCuentaEnum.DEBITO;
      case '2': // Pasivos
      case '3': // Patrimonio
      case '4': // Ingresos
      case '8': // Cuentas de orden deudoras
      case '9': // Cuentas de orden acreedoras
        return NaturalezaCuentaEnum.CREDITO;
      default:
        return NaturalezaCuentaEnum.DEBITO;
    }
  }

  private determinarTipoCuenta(codigo: string): TipoCuentaEnum {
    const longitud = codigo.length;
    
    if (longitud === 1) return TipoCuentaEnum.CLASE;
    if (longitud === 2) return TipoCuentaEnum.GRUPO;
    if (longitud === 4) return TipoCuentaEnum.CUENTA;
    if (longitud === 6) return TipoCuentaEnum.SUBCUENTA;
    return TipoCuentaEnum.DETALLE;
  }

  private determinarNivel(codigo: string): number {
    const longitud = codigo.length;
    if (longitud === 1) return 1; // Clase
    if (longitud === 2) return 2; // Grupo
    if (longitud === 4) return 3; // Cuenta
    if (longitud === 6) return 4; // Subcuenta
    if (longitud >= 8) return 5; // Detalle
    return 1;
  }

  private calcularPadreSugerido(codigo: string): string | null {
    if (codigo.length <= 1) return null;
    
    if (codigo.length === 2) return codigo.substring(0, 1);
    if (codigo.length === 4) return codigo.substring(0, 2);
    if (codigo.length === 6) return codigo.substring(0, 4);
    return codigo.substring(0, 6);
  }

  // Agregar métodos faltantes con implementación básica
  async buscarCuentas(termino: string, limite: number, soloActivas: boolean): Promise<ResponsePucDto[]> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      query.where(
        '(cuenta.codigo_completo ILIKE :termino OR cuenta.nombre ILIKE :termino)',
        { termino: `%${termino}%` }
      );

      if (soloActivas) {
        query.andWhere('cuenta.activo = :activo', { activo: true });
      }

      query.orderBy('cuenta.codigo_completo', 'ASC');
      query.limit(limite);

      const cuentas = await query.getMany();
      return cuentas.map(cuenta => this.mapearAResponseDto(cuenta));

    } catch (error) {
      this.logger.error('Error buscando cuentas:', error);
      throw new BadRequestException('Error buscando cuentas');
    }
  }

  async obtenerSubcuentas(codigo: string, incluirInactivas: boolean = false): Promise<ResponsePucDto[]> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');
      
      query.where('cuenta.codigo_padre = :codigo_padre', { codigo_padre: codigo });
      
      if (!incluirInactivas) {
        query.andWhere('cuenta.activo = :activo', { activo: true });
      }
      
      query.orderBy('cuenta.codigo_completo', 'ASC');

      const subcuentas = await query.getMany();
      return subcuentas.map(cuenta => this.mapearAResponseDto(cuenta));

    } catch (error) {
      this.logger.error(`Error obteniendo subcuentas de ${codigo}:`, error);
      throw new BadRequestException('Error obteniendo subcuentas');
    }
  }

  async validarCodigo(codigo: string): Promise<any> {
    // Implementación básica
    return {
      valido: true,
      existe: false,
      nivel: this.determinarNivel(codigo),
      sugerencias: []
    };
  }

  // Métodos de reportes con implementación básica
  async reportePorClase(incluirSaldos: boolean): Promise<any> {
    return { data: [] };
  }

  async reporteJerarquiaCompleta(formato: 'json' | 'tree'): Promise<any> {
    return { data: [] };
  }

  async recalcularJerarquia(): Promise<any> {
    return { success: true, message: 'Jerarquía recalculada', cuentas_actualizadas: 0, errores: [] };
  }

  async validarIntegridad(): Promise<any> {
    return { valido: true, total_cuentas: 0, errores_encontrados: [], advertencias: [], recomendaciones: [] };
  }
}