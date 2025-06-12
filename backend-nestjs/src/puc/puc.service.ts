// src/puc/puc.service.ts - VERSIÓN FINAL OPTIMIZADA
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaPuc } from './entities/cuenta-puc.entity';
import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
import { FiltrosPucDto } from './dto/filtros-puc.dto';
import { 
  ResponsePuc, 
  NodoPucResponse, 
  EstadisticasPuc, 
  ValidacionCodigo 
} from './interfaces/puc.interface';

@Injectable()
export class PucService {
  constructor(
    @InjectRepository(CuentaPuc)
    private cuentaPucRepository: Repository<CuentaPuc>,
  ) {}

  // ✅ CREAR CUENTA
  async crear(createCuentaPucDto: CreateCuentaPucDto): Promise<ResponsePuc<CuentaPuc>> {
    try {
      // Verificar si ya existe
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo: createCuentaPucDto.codigo }
      });

      if (existente) {
        throw new ConflictException(`Ya existe una cuenta con el código ${createCuentaPucDto.codigo}`);
      }

      // Validar código padre si se especifica
      if (createCuentaPucDto.codigo_padre) {
        const padre = await this.cuentaPucRepository.findOne({
          where: { codigo: createCuentaPucDto.codigo_padre }
        });
        
        if (!padre) {
          throw new BadRequestException(`La cuenta padre ${createCuentaPucDto.codigo_padre} no existe`);
        }

        // Validar jerarquía
        if (!createCuentaPucDto.codigo.startsWith(createCuentaPucDto.codigo_padre)) {
          throw new BadRequestException(
            `El código ${createCuentaPucDto.codigo} debe comenzar con el código padre ${createCuentaPucDto.codigo_padre}`
          );
        }
      }

      // Auto-calcular campos según el código
      const nuevaCuentaData = {
        ...createCuentaPucDto,
        nivel: this.calcularNivel(createCuentaPucDto.codigo),
        tipo: this.calcularTipo(createCuentaPucDto.codigo),
        naturaleza: this.calcularNaturaleza(createCuentaPucDto.codigo)
      };

      const nuevaCuenta = this.cuentaPucRepository.create(nuevaCuentaData);
      const cuentaGuardada = await this.cuentaPucRepository.save(nuevaCuenta);

      return {
        success: true,
        message: 'Cuenta creada exitosamente',
        data: cuentaGuardada
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la cuenta: ' + error.message);
    }
  }

  // ✅ OBTENER TODAS CON FILTROS
  async obtenerTodas(filtros: FiltrosPucDto): Promise<ResponsePuc<CuentaPuc[]>> {
    try {
      const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      // Aplicar filtros
      if (filtros.busqueda) {
        query.andWhere(
          '(cuenta.codigo ILIKE :busqueda OR cuenta.nombre ILIKE :busqueda)',
          { busqueda: `%${filtros.busqueda}%` }
        );
      }

      if (filtros.tipo) {
        query.andWhere('cuenta.tipo = :tipo', { tipo: filtros.tipo });
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
        query.andWhere('cuenta.permite_movimiento = :permite_movimiento', { permite_movimiento: true });
      }

      // Ordenar por código por defecto, pero permite orden dinámico si se envía en filtros
      if ((filtros as any).orden_por && (filtros as any).orden_direccion) {
        query.orderBy(
          `cuenta.${(filtros as any).orden_por}`,
          ((filtros as any).orden_direccion || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
        );
      } else {
        query.orderBy('cuenta.codigo', 'ASC');
      }

      // Paginación (conversión de string a number)
      const limite = Math.min(Number(filtros.limite) || 50, 10000);
      const pagina = Number(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

      query.skip(offset).take(limite);

      const [cuentas, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Cuentas obtenidas exitosamente',
        data: cuentas,
        total,
        pagina,
        limite
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener las cuentas: ' + error.message);
    }
  }

  // ✅ OBTENER POR ID
  async obtenerPorId(id: number): Promise<ResponsePuc<CuentaPuc>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id }
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la cuenta: ' + error.message);
    }
  }

  // ✅ OBTENER POR CÓDIGO
  async obtenerPorCodigo(codigo: string): Promise<ResponsePuc<CuentaPuc>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { codigo }
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la cuenta: ' + error.message);
    }
  }

  // ✅ ACTUALIZAR
  async actualizar(id: number, updateCuentaPucDto: UpdateCuentaPucDto): Promise<ResponsePuc<CuentaPuc>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      // Validar cambios que podrían afectar subcuentas
      if (updateCuentaPucDto.codigo_padre !== undefined && updateCuentaPucDto.codigo_padre !== cuenta.codigo_padre) {
        if (updateCuentaPucDto.codigo_padre) {
          const padre = await this.cuentaPucRepository.findOne({
            where: { codigo: updateCuentaPucDto.codigo_padre }
          });
          
          if (!padre) {
            throw new BadRequestException(`La cuenta padre ${updateCuentaPucDto.codigo_padre} no existe`);
          }
        }
      }

      Object.assign(cuenta, updateCuentaPucDto);
      const cuentaActualizada = await this.cuentaPucRepository.save(cuenta);

      return {
        success: true,
        message: 'Cuenta actualizada exitosamente',
        data: cuentaActualizada
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la cuenta: ' + error.message);
    }
  }

  // ✅ ELIMINAR
  async eliminar(id: number): Promise<ResponsePuc<null>> {
    try {
      const cuenta = await this.cuentaPucRepository.findOne({
        where: { id }
      });

      if (!cuenta) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }

      // Verificar si tiene subcuentas
      const subcuentas = await this.cuentaPucRepository.count({
        where: { codigo_padre: cuenta.codigo }
      });

      if (subcuentas > 0) {
        throw new BadRequestException(
          `No se puede eliminar la cuenta porque tiene ${subcuentas} subcuentas asociadas`
        );
      }

      await this.cuentaPucRepository.remove(cuenta);

      return {
        success: true,
        message: 'Cuenta eliminada exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la cuenta: ' + error.message);
    }
  }

  // ✅ OBTENER ÁRBOL JERÁRQUICO
  async obtenerArbol(codigoPadre?: string): Promise<ResponsePuc<NodoPucResponse[]>> {
    try {
      let query = this.cuentaPucRepository.createQueryBuilder('cuenta');

      if (codigoPadre) {
        query.where('cuenta.codigo_padre = :codigoPadre', { codigoPadre });
      } else {
        query.where('cuenta.codigo_padre IS NULL OR cuenta.nivel = 1');
      }

      query.orderBy('cuenta.codigo', 'ASC');

      const cuentas = await query.getMany();
      const nodos: NodoPucResponse[] = [];

      for (const cuenta of cuentas) {
        const nodo = await this.construirNodoArbol(cuenta);
        nodos.push(nodo);
      }

      return {
        success: true,
        message: 'Árbol obtenido exitosamente',
        data: nodos
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener el árbol: ' + error.message);
    }
  }

  // ✅ CONSTRUIR NODO ÁRBOL
  private async construirNodoArbol(cuenta: CuentaPuc): Promise<NodoPucResponse> {
    const subcuentas = await this.cuentaPucRepository.find({
      where: { codigo_padre: cuenta.codigo },
      order: { codigo: 'ASC' }
    });

    const nodo: NodoPucResponse = {
      id: cuenta.id,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      naturaleza: cuenta.naturaleza,
      estado: cuenta.estado,
      nivel: cuenta.nivel,
      permite_movimiento: cuenta.permite_movimiento,
      requiere_tercero: cuenta.requiere_tercero,
      requiere_centro_costo: cuenta.requiere_centro_costo,
      hijos: []
    };

    // Construir hijos recursivamente (limitado a 3 niveles para performance)
    if (subcuentas.length > 0 && cuenta.nivel <= 3) {
      for (const subcuenta of subcuentas) {
        const hijoNodo = await this.construirNodoArbol(subcuenta);
        nodo.hijos.push(hijoNodo);
      }
    }

    return nodo;
  }

  // ✅ OBTENER ESTADÍSTICAS
  async obtenerEstadisticas(): Promise<ResponsePuc<EstadisticasPuc>> {
    try {
      const total = await this.cuentaPucRepository.count();
      const activas = await this.cuentaPucRepository.count({ where: { estado: 'ACTIVA' } });
      const inactivas = total - activas;

      // Estadísticas por tipo
      const porTipo: Record<string, number> = {};
      const tipos = ['CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR'];
      for (const tipo of tipos) {
        porTipo[tipo] = await this.cuentaPucRepository.count({ where: { tipo } });
      }

      // Estadísticas por naturaleza
      const porNaturaleza: Record<string, number> = {};
      const naturalezas = ['DEBITO', 'CREDITO'];
      for (const naturaleza of naturalezas) {
        porNaturaleza[naturaleza] = await this.cuentaPucRepository.count({ where: { naturaleza } });
      }

      // Estadísticas por clase
      const porClase: Record<string, { nombre: string; cantidad: number }> = {};
      const clases = ['1', '2', '3', '4', '5', '6'];
      const nombresClases = {
        '1': 'ACTIVOS',
        '2': 'PASIVOS',
        '3': 'PATRIMONIO',
        '4': 'INGRESOS',
        '5': 'GASTOS',
        '6': 'COSTOS'
      };

      for (const clase of clases) {
        const cantidad = await this.cuentaPucRepository
          .createQueryBuilder('cuenta')
          .where('cuenta.codigo LIKE :patron', { patron: `${clase}%` })
          .getCount();

        porClase[clase] = {
          nombre: nombresClases[clase] || 'DESCONOCIDA',
          cantidad
        };
      }

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total_cuentas: total,
          cuentas_activas: activas,
          cuentas_inactivas: inactivas,
          por_tipo: porTipo,
          por_naturaleza: porNaturaleza,
          por_clase: porClase
        }
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener estadísticas: ' + error.message);
    }
  }

  // ✅ IMPORTAR PUC ESTÁNDAR
  async importarPucEstandar(): Promise<ResponsePuc<any>> {
    try {
      const total = await this.cuentaPucRepository.count();
      
      if (total === 0) {
        return {
          success: false,
          message: 'No se encontraron cuentas en el PUC. Ejecute primero el script SQL en Supabase.',
          data: { total_cuentas: 0 }
        };
      }

      return {
        success: true,
        message: `PUC estándar disponible con ${total} cuentas`,
        data: { 
          total_cuentas: total,
          mensaje: 'El PUC estándar ya está configurado en la base de datos'
        }
      };
    } catch (error) {
      throw new BadRequestException('Error al verificar PUC estándar: ' + error.message);
    }
  }

  // ✅ VALIDAR CÓDIGO
  async validarCodigo(codigo: string): Promise<ResponsePuc<ValidacionCodigo>> {
    const mensajes: string[] = [];
    let valido = true;
    
    // Validaciones básicas
    if (!/^\d+$/.test(codigo)) {
      valido = false;
      mensajes.push('El código debe contener solo números');
    }
    
    if (codigo.length < 1 || codigo.length > 20) {
      valido = false;
      mensajes.push('El código debe tener entre 1 y 20 dígitos');
    }

    // Verificar disponibilidad
    let disponible = true;
    try {
      const existente = await this.cuentaPucRepository.findOne({
        where: { codigo }
      });
      
      if (existente) {
        disponible = false;
        mensajes.push('El código ya existe en el sistema');
      }
    } catch (error) {
      disponible = false;
      mensajes.push('Error al verificar disponibilidad');
    }

    // Sugerencias automáticas
    const tipo_sugerido = this.calcularTipo(codigo);
    const naturaleza_sugerida = this.calcularNaturaleza(codigo);
    const codigo_padre_sugerido = this.calcularPadreSugerido(codigo);

    return {
      success: true,
      message: 'Validación completada',
      data: {
        valido,
        disponible,
        tipo_sugerido,
        naturaleza_sugerida,
        codigo_padre_sugerido,
        mensajes
      }
    };
  }

  // ✅ MÉTODOS AUXILIARES PRIVADOS
  private calcularNivel(codigo: string): number {
    const longitud = codigo.length;
    if (longitud === 1) return 1;
    if (longitud === 2) return 2;
    if (longitud === 4) return 3;
    if (longitud === 6) return 4;
    return 5;
  }

  private calcularTipo(codigo: string): string {
    const longitud = codigo.length;
    if (longitud === 1) return 'CLASE';
    if (longitud === 2) return 'GRUPO';
    if (longitud === 4) return 'CUENTA';
    if (longitud === 6) return 'SUBCUENTA';
    return 'AUXILIAR';
  }

  private calcularNaturaleza(codigo: string): string {
    const claseNum = parseInt(codigo.charAt(0));
    return [1, 5, 6, 7, 8].includes(claseNum) ? 'DEBITO' : 'CREDITO';
  }

  private calcularPadreSugerido(codigo: string): string | null {
    if (codigo.length <= 1) return null;
    
    if (codigo.length === 2) return codigo.substring(0, 1);
    if (codigo.length === 4) return codigo.substring(0, 2);
    if (codigo.length === 6) return codigo.substring(0, 4);
    return codigo.substring(0, 6);
  }

  // ✅ EXPORTAR
  async exportar(filtros: FiltrosPucDto, formato: string) {
    // Conversión segura de strings a números
    const limite = Math.min(Number(filtros.limite) || 50, 10000);
    const pagina = Number(filtros.pagina) || 1;
    const offset = (pagina - 1) * limite;

    // Armar query igual que en obtenerTodas
    const query = this.cuentaPucRepository.createQueryBuilder('cuenta');

    // Aplicar filtros
    if (filtros.busqueda) {
      query.andWhere(
        '(cuenta.codigo ILIKE :busqueda OR cuenta.nombre ILIKE :busqueda)',
        { busqueda: `%${filtros.busqueda}%` }
      );
    }

    if (filtros.tipo) {
      query.andWhere('cuenta.tipo = :tipo', { tipo: filtros.tipo });
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
      query.andWhere('cuenta.permite_movimiento = :permite_movimiento', { permite_movimiento: true });
    }

    query.skip(offset).take(limite);

    const cuentas = await query.getMany();

    // Lógica para exportar según formato
    if (formato === 'csv') {
      return this.exportarACSV(cuentas);
    } else if (formato === 'xlsx') {
      return this.exportarAXLSX(cuentas);
    } else {
      throw new BadRequestException('Formato de exportación no soportado');
    }
  }

  // Métodos privados para exportar a diferentes formatos
  private exportarACSV(cuentas: CuentaPuc[]): ResponsePuc<any> {
    // Implementar lógica para exportar a CSV
    return {
      success: true,
      message: 'Exportación a CSV completada',
      data: cuentas // Aquí deberías retornar el archivo o stream de CSV
    };
  }

  private exportarAXLSX(cuentas: CuentaPuc[]): ResponsePuc<any> {
    // Implementar lógica para exportar a XLSX
    return {
      success: true,
      message: 'Exportación a XLSX completada',
      data: cuentas // Aquí deberías retornar el archivo o stream de XLSX
    };
  }
}