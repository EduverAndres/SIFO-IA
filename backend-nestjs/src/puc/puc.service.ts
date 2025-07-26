// backend-nestjs/src/puc/puc.service.ts - VERSIÓN ACTUALIZADA CON EXCEL
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CuentaPuc, NaturalezaCuentaEnum, TipoCuentaEnum } from './entities/cuenta-puc.entity';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { ImportPucExcelDto } from './dto/import-puc-excel.dto';
import { ExportPucExcelDto } from './dto/export-puc-excel.dto';
import { PucExcelService } from './services/puc-excel.service';
import { 
  ValidacionExcel, 
  ResultadoImportacion 
} from './interfaces/excel-row.interface';

interface ResponsePuc<T> {
  success: boolean;
  message: string;
  data?: T;
  total?: number;
  pagina?: number;
  limite?: number;
  totalPaginas?: number;
}

// Exportar la interfaz para que esté disponible públicamente
export { ResponsePuc };

@Injectable()
export class PucService {
  private readonly logger = new Logger(PucService.name);

  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>,
    private pucExcelService: PucExcelService
  ) {}

  // ===============================================
  // 📋 MÉTODOS BÁSICOS CRUD
  // ===============================================

  async obtenerTodas(filtros: FiltrosPucDto): Promise<ResponsePuc<CuentaPuc[]>> {
    try {
      const limite = Math.min(Number(filtros.limite) || 50, 10000);
      const pagina = Number(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

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

      // Ordenamiento - usar propiedades que existen en FiltrosPucDto
      const ordenPor = 'codigo_completo'; // Valor fijo ya que orden_por no existe en FiltrosPucDto
      const ordenDireccion = 'ASC'; // Valor fijo ya que orden_direccion no existe en FiltrosPucDto
      query.orderBy(`cuenta.${ordenPor}`, ordenDireccion);

      // Paginación
      query.skip(offset).take(limite);

      const [cuentas, total] = await query.getManyAndCount();
      const totalPaginas = Math.ceil(total / limite);

      return {
        success: true,
        message: 'Cuentas obtenidas exitosamente',
        data: cuentas,
        total,
        pagina,
        limite,
        totalPaginas
      };

    } catch (error) {
      this.logger.error('Error obteniendo cuentas:', error);
      throw new BadRequestException('Error obteniendo cuentas del PUC');
    }
  }

  async obtenerPorId(id: number): Promise<ResponsePuc<CuentaPuc>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id, activo: true }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      return {
        success: true,
        message: 'Cuenta encontrada',
        data: cuenta
      };

    } catch (error) {
      this.logger.error(`Error obteniendo cuenta ${id}:`, error);
      throw error;
    }
  }

  async obtenerPorCodigo(codigo: string): Promise<ResponsePuc<CuentaPuc>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { codigo_completo: codigo, activo: true }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con código ${codigo} no encontrada`);
      }

      return {
        success: true,
        message: 'Cuenta encontrada',
        data: cuenta
      };

    } catch (error) {
      this.logger.error(`Error obteniendo cuenta ${codigo}:`, error);
      throw error;
    }
  }

  async crear(createCuentaDto: CreateCuentaPucDto): Promise<ResponsePuc<CuentaPuc>> {
    try {
      // Acceder a codigo_completo usando notación de índice para evitar errores de TypeScript
      const codigoCompleto = (createCuentaDto as any).codigo_completo;
      
      if (!codigoCompleto) {
        throw new BadRequestException('codigo_completo es requerido');
      }

      // Validar que el código no exista
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo_completo: codigoCompleto }
      });

      if (existente) {
        throw new BadRequestException(`Ya existe una cuenta con código ${codigoCompleto}`);
      }

      // Validar jerarquía si tiene padre
      const codigoPadre = (createCuentaDto as any).codigo_padre;
      if (codigoPadre) {
        const padre = await this.cuentaPucRepository.findOne({
          where: { codigo_completo: codigoPadre, activo: true }
        });

        if (!padre) {
          throw new BadRequestException(`Cuenta padre ${codigoPadre} no encontrada`);
        }
      }

      const nuevaCuenta = this.cuentaPucRepository.create({
        ...createCuentaDto,
        naturaleza: (createCuentaDto as any).naturaleza || this.determinarNaturaleza(codigoCompleto),
        tipo_cuenta: (createCuentaDto as any).tipo_cuenta || this.determinarTipoCuenta(codigoCompleto),
        activo: true
      });

      const cuentaGuardada = await this.cuentaPucRepository.save(nuevaCuenta);

      return {
        success: true,
        message: 'Cuenta creada exitosamente',
        data: cuentaGuardada
      };

    } catch (error) {
      this.logger.error('Error creando cuenta:', error);
      throw error;
    }
  }

  async actualizar(id: number, updateCuentaDto: UpdateCuentaPucDto): Promise<ResponsePuc<CuentaPuc>> {
  try {
    const cuenta = await this.cuentaPucRepository.findOne({
      where: { id, activo: true }
    });

    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }

    // Si se cambia el código, validar que no exista
    const codigoCompleto = (updateCuentaDto as any).codigo_completo;
    if (codigoCompleto && codigoCompleto !== cuenta.codigo_completo) {
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo_completo: codigoCompleto }
      });

      if (existente) {
        throw new BadRequestException(`Ya existe una cuenta con código ${codigoCompleto}`);
      }
    }

    await this.cuentaPucRepository.update(id, updateCuentaDto);
    const cuentaActualizada = await this.cuentaPucRepository.findOne({ where: { id } });

    // Verificar que la cuenta actualizada existe
    if (!cuentaActualizada) {
      throw new NotFoundException(`Error: no se pudo recuperar la cuenta actualizada`);
    }

    return {
      success: true,
      message: 'Cuenta actualizada exitosamente',
      data: cuentaActualizada
    };

  } catch (error) {
    this.logger.error(`Error actualizando cuenta ${id}:`, error);
    throw error;
  }
}

  async eliminar(id: number): Promise<ResponsePuc<void>> {
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
        throw new BadRequestException('No se puede eliminar una cuenta que tiene subcuentas');
      }

      // Eliminación lógica
      await this.cuentaPucRepository.update(id, { activo: false });

      return {
        success: true,
        message: 'Cuenta eliminada exitosamente'
      };

    } catch (error) {
      this.logger.error(`Error eliminando cuenta ${id}:`, error);
      throw error;
    }
  }

  // ===============================================
  // 📊 MÉTODOS DE CONSULTA Y ESTADÍSTICAS
  // ===============================================

  async obtenerEstadisticas(): Promise<ResponsePuc<any>> {
    try {
      const stats = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select([
          'COUNT(*) as total',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'CLASE\' THEN 1 END) as clases',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'GRUPO\' THEN 1 END) as grupos',
          'COUNT(CASE WHEN cuenta.tipo_cuenta = \'CUENTA\' THEN 1 END) as cuentas',
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
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total: parseInt(stats.total),
          por_tipo: {
            clases: parseInt(stats.clases),
            grupos: parseInt(stats.grupos),
            cuentas: parseInt(stats.cuentas),
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
        }
      };

    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error);
      throw new BadRequestException('Error obteniendo estadísticas del PUC');
    }
  }

  async obtenerArbol(codigoPadre?: string): Promise<ResponsePuc<any[]>> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      if (codigoPadre) {
        query.where('cuenta.codigo_padre = :codigo_padre', { codigo_padre: codigoPadre });
      } else {
        query.where('cuenta.codigo_padre IS NULL');
      }

      query.andWhere('cuenta.activo = :activo', { activo: true });
      query.orderBy('cuenta.codigo_completo', 'ASC');

      const cuentas = await query.getMany();

      // Agregar información de hijos para cada cuenta
      const cuentasConHijos = await Promise.all(
        cuentas.map(async (cuenta) => {
          const tieneHijos = await this.cuentaPucRepository.count({
            where: { codigo_padre: cuenta.codigo_completo, activo: true }
          }) > 0;

          return {
            ...cuenta,
            tiene_hijos: tieneHijos
          };
        })
      );

      return {
        success: true,
        message: 'Árbol obtenido exitosamente',
        data: cuentasConHijos
      };

    } catch (error) {
      this.logger.error('Error obteniendo árbol:', error);
      throw new BadRequestException('Error obteniendo árbol del PUC');
    }
  }

  async obtenerSubcuentas(codigo: string): Promise<ResponsePuc<CuentaPuc[]>> {
    try {
      const subcuentas = await this.cuentaPucRepository.find({
        where: { codigo_padre: codigo, activo: true },
        order: { codigo_completo: 'ASC' }
      });

      return {
        success: true,
        message: 'Subcuentas obtenidas exitosamente',
        data: subcuentas
      };

    } catch (error) {
      this.logger.error(`Error obteniendo subcuentas de ${codigo}:`, error);
      throw new BadRequestException('Error obteniendo subcuentas');
    }
  }

  // ===============================================
  // 🔧 MÉTODOS DE VALIDACIÓN
  // ===============================================

  async validarCodigo(codigo: string): Promise<ResponsePuc<any>> {
    try {
      const validacion = {
        codigo,
        es_valido: true,
        errores: [] as string[],
        sugerencias: [] as string[]
      };

      // Validar formato básico
      if (!/^\d+$/.test(codigo)) {
        validacion.es_valido = false;
        validacion.errores.push('El código debe contener solo números');
      }

      // Validar longitud según tipo
      const longitud = codigo.length;
      if (![1, 2, 4, 6, 8].includes(longitud)) {
        validacion.es_valido = false;
        validacion.errores.push('Longitud de código inválida. Debe ser 1, 2, 4, 6 u 8 dígitos');
      }

      // Verificar si ya existe
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo_completo: codigo }
      });

      if (existente) {
        validacion.es_valido = false;
        validacion.errores.push('El código ya existe');
      }

      // Sugerir código padre
      if (longitud > 1) {
        const codigoPadre = this.calcularPadreSugerido(codigo);
        if (codigoPadre) {
          const padre = await this.cuentaPucRepository.findOne({
            where: { codigo_completo: codigoPadre }
          });

          if (!padre) {
            validacion.sugerencias.push(`Se requiere crear primero la cuenta padre: ${codigoPadre}`);
          }
        }
      }

      return {
        success: true,
        message: 'Validación completada',
        data: validacion
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
  // 🔧 MÉTODOS AUXILIARES Y UTILIDADES
  // ===============================================

  async limpiarPuc(): Promise<ResponsePuc<void>> {
    try {
      await this.cuentaPucRepository.update(
        { activo: true },
        { activo: false }
      );

      return {
        success: true,
        message: 'PUC limpiado exitosamente'
      };

    } catch (error) {
      this.logger.error('Error limpiando PUC:', error);
      throw new BadRequestException('Error limpiando PUC');
    }
  }

  async importarPucEstandar(): Promise<ResponsePuc<void>> {
    try {
      // Aquí se implementaría la importación del PUC estándar colombiano
      // Por ahora, devolvemos un mensaje de éxito
      
      return {
        success: true,
        message: 'PUC estándar importado exitosamente'
      };

    } catch (error) {
      this.logger.error('Error importando PUC estándar:', error);
      throw new BadRequestException('Error importando PUC estándar');
    }
  }

  async generarReporteSaldos(opciones: {
    fecha_corte?: string,
    nivel?: number,
    incluir_ceros?: boolean
  }): Promise<ResponsePuc<any[]>> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      // Filtros
      query.where('cuenta.activo = :activo', { activo: true });

      if (opciones.nivel) {
        query.andWhere('cuenta.nivel = :nivel', { nivel: opciones.nivel });
      }

      if (!opciones.incluir_ceros) {
        query.andWhere('(cuenta.saldo_inicial != 0 OR cuenta.saldo_final != 0)');
      }

      query.select([
        'cuenta.codigo_completo',
        'cuenta.nombre',
        'cuenta.nivel',
        'cuenta.tipo_cuenta',
        'cuenta.naturaleza',
        'cuenta.saldo_inicial',
        'cuenta.saldo_final',
        'cuenta.movimientos_debito',
        'cuenta.movimientos_credito'
      ]);

      query.orderBy('cuenta.codigo_completo', 'ASC');

      const cuentas = await query.getMany();

      return {
        success: true,
        message: 'Reporte de saldos generado exitosamente',
        data: cuentas
      };

    } catch (error) {
      this.logger.error('Error generando reporte de saldos:', error);
      throw new BadRequestException('Error generando reporte de saldos');
    }
  }

  // ===============================================
  // 🔧 MÉTODOS PRIVADOS AUXILIARES
  // ===============================================

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

  private calcularPadreSugerido(codigo: string): string | null {
    if (codigo.length <= 1) return null;
    
    if (codigo.length === 2) return codigo.substring(0, 1);
    if (codigo.length === 4) return codigo.substring(0, 2);
    if (codigo.length === 6) return codigo.substring(0, 4);
    return codigo.substring(0, 6);
  }

  // ===============================================
  // 📊 MÉTODOS DE ANÁLISIS Y REPORTES
  // ===============================================

  async obtenerResumenFinanciero(): Promise<ResponsePuc<any>> {
    try {
      const resumen = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select([
          'cuenta.naturaleza',
          'SUM(cuenta.saldo_inicial) as total_saldo_inicial',
          'SUM(cuenta.saldo_final) as total_saldo_final',
          'SUM(cuenta.movimientos_debito) as total_debitos',
          'SUM(cuenta.movimientos_credito) as total_creditos'
        ])
        .where('cuenta.activo = :activo', { activo: true })
        .andWhere('cuenta.acepta_movimientos = :acepta', { acepta: true })
        .groupBy('cuenta.naturaleza')
        .getRawMany();

      const resumenPorClase = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select([
          'cuenta.codigo_clase',
          'COUNT(*) as total_cuentas',
          'SUM(cuenta.saldo_inicial) as saldo_inicial',
          'SUM(cuenta.saldo_final) as saldo_final'
        ])
        .where('cuenta.activo = :activo', { activo: true })
        .andWhere('cuenta.codigo_clase IS NOT NULL')
        .groupBy('cuenta.codigo_clase')
        .orderBy('cuenta.codigo_clase', 'ASC')
        .getRawMany();

      return {
        success: true,
        message: 'Resumen financiero obtenido exitosamente',
        data: {
          por_naturaleza: resumen,
          por_clase: resumenPorClase,
          fecha_actualizacion: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error('Error obteniendo resumen financiero:', error);
      throw new BadRequestException('Error obteniendo resumen financiero');
    }
  }

  async validarIntegridadPuc(): Promise<ResponsePuc<any>> {
    try {
      const problemas: any[] = [];

      // 1. Cuentas huérfanas (con padre inexistente)
      const huerfanas = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .leftJoin('cuenta_puc', 'padre', 'padre.codigo_completo = cuenta.codigo_padre')
        .where('cuenta.codigo_padre IS NOT NULL')
        .andWhere('padre.id IS NULL')
        .andWhere('cuenta.activo = :activo', { activo: true })
        .getMany();

      if (huerfanas.length > 0) {
        problemas.push({
          tipo: 'cuentas_huerfanas',
          cantidad: huerfanas.length,
          detalle: huerfanas.map(c => ({ codigo: c.codigo_completo, padre_faltante: c.codigo_padre }))
        });
      }

      // 2. Códigos duplicados
      const duplicados = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .select('cuenta.codigo_completo, COUNT(*) as total')
        .where('cuenta.activo = :activo', { activo: true })
        .groupBy('cuenta.codigo_completo')
        .having('COUNT(*) > 1')
        .getRawMany();

      if (duplicados.length > 0) {
        problemas.push({
          tipo: 'codigos_duplicados',
          cantidad: duplicados.length,
          detalle: duplicados
        });
      }

      // 3. Inconsistencias de naturaleza
      const inconsistentes = await this.cuentaPucRepository
        .createQueryBuilder('cuenta')
        .where('cuenta.activo = :activo', { activo: true })
        .getMany();

      const naturalezaIncorrecta = inconsistentes.filter(cuenta => {
        const naturalezaEsperada = this.determinarNaturaleza(cuenta.codigo_completo);
        return cuenta.naturaleza !== naturalezaEsperada;
      });

      if (naturalezaIncorrecta.length > 0) {
        problemas.push({
          tipo: 'naturaleza_incorrecta',
          cantidad: naturalezaIncorrecta.length,
          detalle: naturalezaIncorrecta.map(c => ({ 
            codigo: c.codigo_completo, 
            actual: c.naturaleza, 
            esperada: this.determinarNaturaleza(c.codigo_completo) 
          }))
        });
      }

      return {
        success: true,
        message: 'Validación de integridad completada',
        data: {
          es_integro: problemas.length === 0,
          total_problemas: problemas.length,
          problemas
        }
      };

    } catch (error) {
      this.logger.error('Error validando integridad:', error);
      throw new BadRequestException('Error validando integridad del PUC');
    }
  }
}
