// backend-nestjs/src/puc/puc.service.ts - TIPOS CORREGIDOS
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
  // 📋 MÉTODOS CRUD IMPLEMENTADOS
  // ===============================================

  async obtenerCuentas(filtros: FiltrosPucDto): Promise<ResponsePucDto[]> {
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

      // Ordenamiento
      query.orderBy('cuenta.codigo_completo', 'ASC');

      // Límite
      const limite = Math.min(Number(filtros.limite) || 50, 1000);
      query.limit(limite);

      const cuentas = await query.getMany();

      // Mapear a ResponsePucDto
      return cuentas.map(cuenta => this.mapearAResponseDto(cuenta));

    } catch (error) {
      this.logger.error('Error obteniendo cuentas:', error);
      throw new BadRequestException('Error obteniendo cuentas del PUC');
    }
  }

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

    // ✅ ELIMINACIÓN FÍSICA REAL
    this.logger.log(`🗑️ Eliminando físicamente cuenta: ${cuenta.codigo_completo} - ${cuenta.nombre}`);
    
    await this.cuentaPucRepository.delete(id);

    this.logger.log(`✅ Cuenta eliminada físicamente: ${cuenta.codigo_completo}`);

  } catch (error) {
    this.logger.error(`❌ Error eliminando cuenta ${id}:`, error);
    throw error;
  }
}

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

  // ===============================================
  // 📊 MÉTODOS DE REPORTES Y ESTADÍSTICAS
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

      return {
        total: parseInt(stats.total),
        por_tipo: {
          clases: parseInt(stats.clases),
          grupos: parseInt(stats.grupos),
          cuentas: parseInt(stats.cuentas_nivel3),
          subcuentas: parseInt(stats.subcuentas),
          detalles: parseInt(stats.detalles)
        },
        por_naturaleza: {
          debito: parseInt(stats.debito),
          credito: parseInt(stats.credito)
        },
        por_estado: {
          activas: parseInt(stats.activas),
          inactivas: parseInt(stats.inactivas)
        },
        acepta_movimientos: parseInt(stats.acepta_movimientos)
      };

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error);
      throw new BadRequestException('Error obteniendo estadísticas del PUC');
    }
  }

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

      return cuentasConHijos;

    } catch (error) {
      this.logger.error('Error obteniendo árbol:', error);
      throw new BadRequestException('Error obteniendo árbol del PUC');
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

  async reportePorClase(incluirSaldos: boolean): Promise<any> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');
      
      query.select([
        'cuenta.codigo_clase',
        'COUNT(*) as total_cuentas'
      ]);

      if (incluirSaldos) {
        query.addSelect([
          'SUM(cuenta.saldo_inicial) as saldo_inicial_total',
          'SUM(cuenta.saldo_final) as saldo_final_total'
        ]);
      }

      query.where('cuenta.activo = :activo', { activo: true });
      query.andWhere('cuenta.codigo_clase IS NOT NULL');
      query.groupBy('cuenta.codigo_clase');
      query.orderBy('cuenta.codigo_clase', 'ASC');

      const resultado = await query.getRawMany();

      return resultado.map(item => ({
        codigo_clase: item.codigo_clase,
        total_cuentas: parseInt(item.total_cuentas),
        ...(incluirSaldos && {
          saldo_inicial_total: parseFloat(item.saldo_inicial_total || '0'),
          saldo_final_total: parseFloat(item.saldo_final_total || '0')
        })
      }));

    } catch (error) {
      this.logger.error('Error generando reporte por clase:', error);
      throw new BadRequestException('Error generando reporte por clase');
    }
  }

  async reporteJerarquiaCompleta(formato: 'json' | 'tree'): Promise<any> {
    try {
      const todasLasCuentas = await this.cuentaPucRepository.find({
        where: { activo: true },
        order: { codigo_completo: 'ASC' }
      });

      if (formato === 'tree') {
        return this.construirArbolJerarquico(todasLasCuentas);
      }

      return todasLasCuentas.map(cuenta => this.mapearAResponseDto(cuenta));

    } catch (error) {
      this.logger.error('Error generando reporte de jerarquía completa:', error);
      throw new BadRequestException('Error generando reporte de jerarquía');
    }
  }

  // ===============================================
  // 🔧 MÉTODOS DE MANTENIMIENTO
  // ===============================================

  async recalcularJerarquia(): Promise<{
    success: boolean;
    message: string;
    cuentas_actualizadas: number;
    errores: string[];
  }> {
    try {
      const todasLasCuentas = await this.cuentaPucRepository.find({
        where: { activo: true }
      });

      let cuentasActualizadas = 0;
      const errores: string[] = [];

      for (const cuenta of todasLasCuentas) {
        try {
          const nivel = this.determinarNivel(cuenta.codigo_completo);
          const codigoPadre = this.calcularPadreSugerido(cuenta.codigo_completo);
          const naturaleza = this.determinarNaturaleza(cuenta.codigo_completo);
          const tipoCuenta = this.determinarTipoCuenta(cuenta.codigo_completo);

          await this.cuentaPucRepository.update(cuenta.id, {
            nivel,
            codigo_padre: codigoPadre,
            naturaleza,
            tipo_cuenta: tipoCuenta,
            acepta_movimientos: nivel === 5,
            fecha_modificacion: new Date()
          });

          cuentasActualizadas++;
        } catch (error) {
          errores.push(`Error actualizando cuenta ${cuenta.codigo_completo}: ${error.message}`);
        }
      }

      return {
        success: true,
        message: 'Jerarquía recalculada exitosamente',
        cuentas_actualizadas: cuentasActualizadas,
        errores
      };

    } catch (error) {
      this.logger.error('Error recalculando jerarquía:', error);
      throw new BadRequestException('Error recalculando jerarquía');
    }
  }

  async validarIntegridad(): Promise<{
    valido: boolean;
    total_cuentas: number;
    errores_encontrados: string[];
    advertencias: string[];
    recomendaciones: string[];
  }> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];
      const recomendaciones: string[] = [];

      const totalCuentas = await this.cuentaPucRepository.count({ where: { activo: true } });

      // 1. Verificar cuentas huérfanas
      const huerfanas = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .leftJoin('cuenta_puc', 'padre', 'padre.codigo_completo = cuenta.codigo_padre')
        .where('cuenta.codigo_padre IS NOT NULL')
        .andWhere('padre.id IS NULL')
        .andWhere('cuenta.activo = :activo', { activo: true })
        .getMany();

      if (huerfanas.length > 0) {
        errores.push(`${huerfanas.length} cuentas huérfanas encontradas`);
        recomendaciones.push('Ejecutar recálculo de jerarquía');
      }

      // 2. Verificar códigos duplicados
      const duplicados = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select('cuenta.codigo_completo, COUNT(*) as total')
        .where('cuenta.activo = :activo', { activo: true })
        .groupBy('cuenta.codigo_completo')
        .having('COUNT(*) > 1')
        .getRawMany();

      if (duplicados.length > 0) {
        errores.push(`${duplicados.length} códigos duplicados encontrados`);
        recomendaciones.push('Revisar y corregir códigos duplicados manualmente');
      }

      // 3. Verificar naturaleza incorrecta
      const todasLasCuentas = await this.cuentaPucRepository.find({ where: { activo: true } });
      const naturalezaIncorrecta = todasLasCuentas.filter(cuenta => {
        const naturalezaEsperada = this.determinarNaturaleza(cuenta.codigo_completo);
        return cuenta.naturaleza !== naturalezaEsperada;
      });

      if (naturalezaIncorrecta.length > 0) {
        advertencias.push(`${naturalezaIncorrecta.length} cuentas con naturaleza incorrecta`);
        recomendaciones.push('Ejecutar recálculo de jerarquía para corregir naturalezas');
      }

      return {
        valido: errores.length === 0,
        total_cuentas: totalCuentas,
        errores_encontrados: errores,
        advertencias,
        recomendaciones
      };

    } catch (error) {
      this.logger.error('Error validando integridad:', error);
      throw new BadRequestException('Error validando integridad del PUC');
    }
  }

  async validarCodigo(codigo: string): Promise<{
    valido: boolean;
    existe: boolean;
    nivel: number;
    padre_requerido?: string;
    padre_existe?: boolean;
    sugerencias?: string[];
  }> {
    try {
      const sugerencias: string[] = [];
      
      // Validar formato básico
      const esValido = /^\d+$/.test(codigo) && [1, 2, 4, 6, 8].includes(codigo.length);
      
      if (!esValido) {
        sugerencias.push('El código debe contener solo números y tener 1, 2, 4, 6 u 8 dígitos');
      }

      // Verificar si existe
      const existe = await this.cuentaPucRepository.count({
        where: { codigo_completo: codigo }
      }) > 0;

      if (existe) {
        sugerencias.push('El código ya existe en el sistema');
      }

      const nivel = this.determinarNivel(codigo);
      const padreRequerido = this.calcularPadreSugerido(codigo);
      
      let padreExiste = true;
      if (padreRequerido) {
        padreExiste = await this.cuentaPucRepository.count({
          where: { codigo_completo: padreRequerido, activo: true }
        }) > 0;

        if (!padreExiste) {
          sugerencias.push(`Se requiere crear primero la cuenta padre: ${padreRequerido}`);
        }
      }

      return {
        valido: esValido && !existe && padreExiste,
        existe,
        nivel,
        padre_requerido: padreRequerido || undefined, // Convertir null a undefined
        padre_existe: padreExiste,
        sugerencias
      };

    } catch (error) {
      this.logger.error('Error validando código:', error);
      throw new BadRequestException('Error validando código');
    }
  }

  // ===============================================
  // 📥📤 MÉTODOS DE EXCEL (DELEGADOS)
  // ===============================================

  async importarDesdeExcel(
    file: Express.Multer.File, 
    opciones: ImportPucExcelDto
  ): Promise<ResultadoImportacion> {
    this.logger.log(`Iniciando importación Excel: ${file.originalname}`);
    return await this.pucExcelService.importarDesdeExcel(file, opciones);
  }

  async validarArchivoExcel(
    file: Express.Multer.File, 
    nombreHoja: string = 'PUC'
  ): Promise<ValidacionExcel> {
    this.logger.log(`Validando archivo Excel: ${file.originalname}`);
    return await this.pucExcelService.validarArchivoExcel(file, nombreHoja);
  }

  async exportarAExcel(opciones: ExportPucExcelDto): Promise<Buffer> {
    this.logger.log('Exportando PUC a Excel');
    return await this.pucExcelService.exportarAExcel(opciones);
  }

  async generarTemplateExcel(conEjemplos: boolean = true): Promise<Buffer> {
    this.logger.log('Generando template Excel');
    return await this.pucExcelService.generarTemplateExcel(conEjemplos);
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
      codigo_padre: cuenta.codigo_padre || undefined, // Convertir null a undefined
      saldo_inicial: cuenta.saldo_inicial || 0,
      saldo_final: cuenta.saldo_final || 0,
      codigo_clase: cuenta.codigo_clase || undefined, // Convertir null a undefined
      codigo_grupo: cuenta.codigo_grupo || undefined, // Convertir null a undefined
      codigo_cuenta: cuenta.codigo_cuenta || undefined, // Convertir null a undefined
      codigo_subcuenta: cuenta.codigo_subcuenta || undefined, // Convertir null a undefined
      codigo_detalle: cuenta.codigo_detalle || undefined, // Convertir null a undefined
      activo: cuenta.activo,
      fecha_creacion: cuenta.fecha_creacion,
      fecha_modificacion: cuenta.fecha_modificacion,
      // Campos adicionales opcionales - convertir null a undefined
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

  private construirArbolJerarquico(cuentas: CuentaPuc[]): any[] {
    const mapa = new Map<string, any>();
    const raices: any[] = [];

    // Crear nodos
    for (const cuenta of cuentas) {
      const nodo = {
        ...this.mapearAResponseDto(cuenta),
        hijos: []
      };
      mapa.set(cuenta.codigo_completo, nodo);

      if (!cuenta.codigo_padre) {
        raices.push(nodo);
      }
    }

    // Construir jerarquía
    for (const cuenta of cuentas) {
      if (cuenta.codigo_padre && mapa.has(cuenta.codigo_padre)) {
        const padre = mapa.get(cuenta.codigo_padre);
        const hijo = mapa.get(cuenta.codigo_completo);
        if (padre && hijo) {
          padre.hijos.push(hijo);
        }
      }
    }

    return raices;
  }
}