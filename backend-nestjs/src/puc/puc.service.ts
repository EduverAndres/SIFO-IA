// // backend-nestjs/src/puc/puc.service.ts
// import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Like, In } from 'typeorm';
// import { CuentaPuc, TipoCuenta, NaturalezaCuenta, EstadoCuenta } from './entities/cuenta-puc.entity';
// import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
// import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
// import { FiltrosPucDto } from './dto/filtros-puc.dto';
// import { ImportarPucDto } from './dto/importar-puc.dto';
// import { ResponsePucDto, CuentaPucTreeDto } from './dto/response-puc.dto';

// @Injectable()
// export class PucService {
//   constructor(
//     @InjectRepository(CuentaPuc)
//     private readonly cuentaPucRepository: Repository<CuentaPuc>,
//   ) {}

//   async crear(createCuentaPucDto: CreateCuentaPucDto): Promise<ResponsePucDto> {
//     try {
//       // Validar que no exista una cuenta con el mismo código
//       const cuentaExistente = await this.cuentaPucRepository.findOne({
//         where: { codigo: createCuentaPucDto.codigo }
//       });

//       if (cuentaExistente) {
//         throw new ConflictException(`Ya existe una cuenta con el código ${createCuentaPucDto.codigo}`);
//       }

//       // Validar la estructura jerárquica del código
//       this.validarEstructuraCodigo(createCuentaPucDto.codigo, createCuentaPucDto.tipo_cuenta);

//       // Si tiene código padre, validar que exista y sea válido
//       if (createCuentaPucDto.codigo_padre) {
//         await this.validarCodigoPadre(createCuentaPucDto.codigo, createCuentaPucDto.codigo_padre);
//       }

//       // Calcular el nivel basado en la longitud del código
//       const nivel = this.calcularNivel(createCuentaPucDto.codigo);

//       // Determinar naturaleza automáticamente si no se especifica (basado en la clase)
//       let naturaleza = createCuentaPucDto.naturaleza;
//       if (!naturaleza) {
//         naturaleza = this.determinarNaturalezaPorClase(createCuentaPucDto.codigo);
//       }

//       const nuevaCuenta = this.cuentaPucRepository.create({
//         ...createCuentaPucDto,
//         nivel,
//         naturaleza,
//       });

//       const cuentaGuardada = await this.cuentaPucRepository.save(nuevaCuenta);

//       return {
//         success: true,
//         message: 'Cuenta PUC creada exitosamente',
//         data: cuentaGuardada,
//       };
//     } catch (error) {
//       if (error instanceof ConflictException || error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new BadRequestException(`Error al crear la cuenta: ${error.message}`);
//     }
//   }

//   async listarTodos(filtros: FiltrosPucDto): Promise<ResponsePucDto> {
//     try {
//       const queryBuilder = this.cuentaPucRepository.createQueryBuilder('cuenta')
//         .leftJoinAndSelect('cuenta.cuenta_padre', 'padre')
//         .leftJoinAndSelect('cuenta.subcuentas', 'subcuentas');

//       // Aplicar filtros
//       if (filtros.busqueda) {
//         queryBuilder.andWhere(
//           '(cuenta.codigo ILIKE :busqueda OR cuenta.nombre ILIKE :busqueda)',
//           { busqueda: `%${filtros.busqueda}%` }
//         );
//       }

//       if (filtros.tipo_cuenta) {
//         queryBuilder.andWhere('cuenta.tipo_cuenta = :tipo_cuenta', { tipo_cuenta: filtros.tipo_cuenta });
//       }

//       if (filtros.naturaleza) {
//         queryBuilder.andWhere('cuenta.naturaleza = :naturaleza', { naturaleza: filtros.naturaleza });
//       }

//       if (filtros.estado) {
//         queryBuilder.andWhere('cuenta.estado = :estado', { estado: filtros.estado });
//       }

//       if (filtros.codigo_padre) {
//         queryBuilder.andWhere('cuenta.codigo_padre = :codigo_padre', { codigo_padre: filtros.codigo_padre });
//       }

//       if (filtros.nivel) {
//         queryBuilder.andWhere('cuenta.nivel = :nivel', { nivel: filtros.nivel });
//       }

//       if (filtros.solo_cuentas_movimiento) {
//         queryBuilder.andWhere('cuenta.acepta_movimientos = true');
//       }

//       // Ordenar por código
//       queryBuilder.orderBy('cuenta.codigo', 'ASC');

//       // Paginación
//       const total = await queryBuilder.getCount();
      
//       if (filtros.page && filtros.limit) {
//         queryBuilder
//           .skip((filtros.page - 1) * filtros.limit)
//           .take(filtros.limit);
//       }

//       const cuentas = await queryBuilder.getMany();

//       return {
//         success: true,
//         message: 'Cuentas obtenidas exitosamente',
//         data: cuentas,
//         total,
//         page: filtros.page,
//         limit: filtros.limit,
//       };
//     } catch (error) {
//       throw new BadRequestException(`Error al obtener las cuentas: ${error.message}`);
//     }
//   }

//   async obtenerArbolCompleto(): Promise<ResponsePucDto> {
//     try {
//       // Obtener todas las cuentas ordenadas por código
//       const todasLasCuentas = await this.cuentaPucRepository.find({
//         order: { codigo: 'ASC' },
//         relations: ['subcuentas']
//       });

//       // Construir el árbol jerárquico
//       const arbol = this.construirArbol(todasLasCuentas);

//       return {
//         success: true,
//         message: 'Árbol de cuentas obtenido exitosamente',
//         data: arbol,
//       };
//     } catch (error) {
//       throw new BadRequestException(`Error al obtener el árbol de cuentas: ${error.message}`);
//     }
//   }

//   async obtenerPorId(id: number): Promise<CuentaPuc> {
//     const cuenta = await this.cuentaPucRepository.findOne({
//       where: { id },
//       relations: ['cuenta_padre', 'subcuentas'],
//     });

//     if (!cuenta) {
//       throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
//     }

//     return cuenta;
//   }

//   async obtenerPorCodigo(codigo: string): Promise<CuentaPuc> {
//     const cuenta = await this.cuentaPucRepository.findOne({
//       where: { codigo },
//       relations: ['cuenta_padre', 'subcuentas'],
//     });

//     if (!cuenta) {
//       throw new NotFoundException(`Cuenta con código ${codigo} no encontrada`);
//     }

//     return cuenta;
//   }

//   async actualizar(id: number, updateCuentaPucDto: UpdateCuentaPucDto): Promise<ResponsePucDto> {
//     try {
//       const cuenta = await this.obtenerPorId(id);

//       // Si se está cambiando el código, validar que no exista otro con el mismo código
//       if (updateCuentaPucDto.codigo && updateCuentaPucDto.codigo !== cuenta.codigo) {
//         const cuentaExistente = await this.cuentaPucRepository.findOne({
//           where: { codigo: updateCuentaPucDto.codigo }
//         });

//         if (cuentaExistente) {
//           throw new ConflictException(`Ya existe una cuenta con el código ${updateCuentaPucDto.codigo}`);
//         }
//       }

//       // Validar si la cuenta tiene movimientos antes de permitir ciertos cambios
//       // TODO: Implementar validación de movimientos contables cuando se implemente el módulo de contabilidad

//       Object.assign(cuenta, updateCuentaPucDto);
//       const cuentaActualizada = await this.cuentaPucRepository.save(cuenta);

//       return {
//         success: true,
//         message: 'Cuenta actualizada exitosamente',
//         data: cuentaActualizada,
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException || error instanceof ConflictException) {
//         throw error;
//       }
//       throw new BadRequestException(`Error al actualizar la cuenta: ${error.message}`);
//     }
//   }

//   async eliminar(id: number): Promise<ResponsePucDto> {
//     try {
//       const cuenta = await this.obtenerPorId(id);

//       // Verificar si tiene subcuentas
//       if (cuenta.subcuentas && cuenta.subcuentas.length > 0) {
//         throw new ConflictException('No se puede eliminar una cuenta que tiene subcuentas asociadas');
//       }

//       // TODO: Verificar si tiene movimientos contables cuando se implemente el módulo de contabilidad

//       await this.cuentaPucRepository.remove(cuenta);

//       return {
//         success: true,
//         message: 'Cuenta eliminada exitosamente',
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException || error instanceof ConflictException) {
//         throw error;
//       }
//       throw new BadRequestException(`Error al eliminar la cuenta: ${error.message}`);
//     }
//   }

//   async importarPucEstandar(importarPucDto: ImportarPucDto): Promise<ResponsePucDto> {
//     try {
//       const errores: string[] = [];
//       const cuentasCreadas: CuentaPuc[] = [];

//       for (const cuentaDto of importarPucDto.cuentas) {
//         try {
//           // Verificar si la cuenta ya existe
//           const cuentaExistente = await this.cuentaPucRepository.findOne({
//             where: { codigo: cuentaDto.codigo }
//           });

//           if (cuentaExistente && !importarPucDto.sobrescribir_existentes) {
//             errores.push(`Cuenta ${cuentaDto.codigo} ya existe y no se sobrescribió`);
//             continue;
//           }

//           if (cuentaExistente && importarPucDto.sobrescribir_existentes) {
//             // Actualizar la cuenta existente
//             Object.assign(cuentaExistente, cuentaDto);
//             const cuentaActualizada = await this.cuentaPucRepository.save(cuentaExistente);
//             cuentasCreadas.push(cuentaActualizada);
//           } else {
//             // Crear nueva cuenta
//             const nivel = this.calcularNivel(cuentaDto.codigo);
//             const naturaleza = cuentaDto.naturaleza || this.determinarNaturalezaPorClase(cuentaDto.codigo);
            
//             const nuevaCuenta = this.cuentaPucRepository.create({
//               ...cuentaDto,
//               nivel,
//               naturaleza,
//             });

//             const cuentaGuardada = await this.cuentaPucRepository.save(nuevaCuenta);
//             cuentasCreadas.push(cuentaGuardada);
//           }
//         } catch (error) {
//           errores.push(`Error al procesar cuenta ${cuentaDto.codigo}: ${error.message}`);
//         }
//       }

//       return {
//         success: errores.length === 0,
//         message: `Importación completada. ${cuentasCreadas.length} cuentas procesadas exitosamente.`,
//         data: cuentasCreadas,
//         errors: errores.length > 0 ? errores : undefined,
//       };
//     } catch (error) {
//       throw new BadRequestException(`Error en la importación: ${error.message}`);
//     }
//   }

//   async obtenerPucEstandarColombia(): Promise<ResponsePucDto> {
//     // PUC básico estándar de Colombia (estructura principal)
//     const pucEstandar = [
//       // CLASE 1 - ACTIVOS
//       { codigo: '1', nombre: 'ACTIVO', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.DEBITO },
//       { codigo: '11', nombre: 'DISPONIBLE', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '1' },
//       { codigo: '1105', nombre: 'CAJA', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '11' },
//       { codigo: '110505', nombre: 'CAJA GENERAL', tipo_cuenta: TipoCuenta.SUBCUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '1105' },
//       { codigo: '1110', nombre: 'BANCOS', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '11' },
//       { codigo: '111005', nombre: 'MONEDA NACIONAL', tipo_cuenta: TipoCuenta.SUBCUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '1110' },
      
//       // CLASE 2 - PASIVOS
//       { codigo: '2', nombre: 'PASIVO', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.CREDITO },
//       { codigo: '21', nombre: 'OBLIGACIONES FINANCIERAS', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '2' },
//       { codigo: '2105', nombre: 'BANCOS NACIONALES', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '21' },
      
//       // CLASE 3 - PATRIMONIO
//       { codigo: '3', nombre: 'PATRIMONIO', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.CREDITO },
//       { codigo: '31', nombre: 'CAPITAL SOCIAL', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '3' },
//       { codigo: '3115', nombre: 'APORTES SOCIALES', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '31' },
      
//       // CLASE 4 - INGRESOS
//       { codigo: '4', nombre: 'INGRESOS', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.CREDITO },
//       { codigo: '41', nombre: 'OPERACIONALES', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '4' },
//       { codigo: '4135', nombre: 'COMERCIO AL POR MAYOR Y AL POR MENOR', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.CREDITO, codigo_padre: '41' },
      
//       // CLASE 5 - GASTOS
//       { codigo: '5', nombre: 'GASTOS', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.DEBITO },
//       { codigo: '51', nombre: 'OPERACIONALES DE ADMINISTRACIÓN', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '5' },
//       { codigo: '5105', nombre: 'GASTOS DE PERSONAL', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '51' },
      
//       // CLASE 6 - COSTO DE VENTAS
//       { codigo: '6', nombre: 'COSTO DE VENTAS', tipo_cuenta: TipoCuenta.CLASE, naturaleza: NaturalezaCuenta.DEBITO },
//       { codigo: '61', nombre: 'COSTO DE VENTAS Y DE PRESTACIÓN DE SERVICIOS', tipo_cuenta: TipoCuenta.GRUPO, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '6' },
//       { codigo: '6135', nombre: 'COMERCIO AL POR MAYOR Y AL POR MENOR', tipo_cuenta: TipoCuenta.CUENTA, naturaleza: NaturalezaCuenta.DEBITO, codigo_padre: '61' },
//     ];

//     return {
//       success: true,
//       message: 'PUC estándar de Colombia obtenido exitosamente',
//       data: pucEstandar,
//     };
//   }

//   // Métodos privados de utilidad

//   private validarEstructuraCodigo(codigo: string, tipoCuenta: TipoCuenta): void {
//     const longitud = codigo.length;

//     switch (tipoCuenta) {
//       case TipoCuenta.CLASE:
//         if (longitud !== 1) {
//           throw new BadRequestException('Las clases deben tener exactamente 1 dígito');
//         }
//         break;
//       case TipoCuenta.GRUPO:
//         if (longitud !== 2) {
//           throw new BadRequestException('Los grupos deben tener exactamente 2 dígitos');
//         }
//         break;
//       case TipoCuenta.CUENTA:
//         if (longitud !== 4) {
//           throw new BadRequestException('Las cuentas deben tener exactamente 4 dígitos');
//         }
//         break;
//       case TipoCuenta.SUBCUENTA:
//         if (longitud !== 6) {
//           throw new BadRequestException('Las subcuentas deben tener exactamente 6 dígitos');
//         }
//         break;
//       case TipoCuenta.AUXILIAR:
//         if (longitud < 7) {
//           throw new BadRequestException('Las auxiliares deben tener al menos 7 dígitos');
//         }
//         break;
//     }
//   }

//   private async validarCodigoPadre(codigo: string, codigoPadre: string): Promise<void> {
//     // Verificar que el código padre exista
//     const cuentaPadre = await this.cuentaPucRepository.findOne({
//       where: { codigo: codigoPadre }
//     });

//     if (!cuentaPadre) {
//       throw new BadRequestException(`El código padre ${codigoPadre} no existe`);
//     }

//     // Verificar que la relación jerárquica sea correcta
//     if (!codigo.startsWith(codigoPadre)) {
//       throw new BadRequestException('El código debe comenzar con el código padre para mantener la jerarquía');
//     }

//     // Verificar que el nivel sea correcto (hijo debe ser exactamente un nivel más)
//     const nivelPadre = this.calcularNivel(codigoPadre);
//     const nivelHijo = this.calcularNivel(codigo);
    
//     if (nivelHijo !== nivelPadre + 1) {
//       throw new BadRequestException('El nivel jerárquico no es correcto');
//     }
//   }

//   private calcularNivel(codigo: string): number {
//     const longitud = codigo.length;
    
//     if (longitud === 1) return 1; // Clase
//     if (longitud === 2) return 2; // Grupo
//     if (longitud === 4) return 3; // Cuenta
//     if (longitud === 6) return 4; // Subcuenta
//     return 5; // Auxiliar (7 o más dígitos)
//   }

//   private determinarNaturalezaPorClase(codigo: string): NaturalezaCuenta {
//     const clase = codigo.charAt(0);
    
//     switch (clase) {
//       case '1': // Activos
//       case '5': // Gastos
//       case '6': // Costos
//       case '7': // Costos de producción
//         return NaturalezaCuenta.DEBITO;
//       case '2': // Pasivos
//       case '3': // Patrimonio
//       case '4': // Ingresos
//       case '8': // Cuentas de orden deudoras
//       case '9': // Cuentas de orden acreedoras
//         return NaturalezaCuenta.CREDITO;
//       default:
//         return NaturalezaCuenta.DEBITO;
//     }
//   }

//   private construirArbol(cuentas: CuentaPuc[]): CuentaPucTreeDto[] {
//     const mapa = new Map<string, CuentaPucTreeDto>();
//     const raices: CuentaPucTreeDto[] = [];

//     // Crear mapa de todas las cuentas
//     cuentas.forEach(cuenta => {
//       const cuentaDto: CuentaPucTreeDto = {
//         id: cuenta.id,
//         codigo: cuenta.codigo,
//         nombre: cuenta.nombre,
//         descripcion: cuenta.descripcion,
//         tipo_cuenta: cuenta.tipo_cuenta,
//         naturaleza: cuenta.naturaleza,
//         estado: cuenta.estado,
//         nivel: cuenta.nivel,
//         acepta_movimientos: cuenta.acepta_movimientos,
//         requiere_tercero: cuenta.requiere_tercero,
//         requiere_centro_costo: cuenta.requiere_centro_costo,
//         es_cuenta_niif: cuenta.es_cuenta_niif,
//         codigo_niif: cuenta.codigo_niif,
//         subcuentas: [],
//       };
//       mapa.set(cuenta.codigo, cuentaDto);
//     });

//     // Construir el árbol
//     cuentas.forEach(cuenta => {
//       const cuentaDto = mapa.get(cuenta.codigo);
      
//       if (cuenta.codigo_padre) {
//         const padre = mapa.get(cuenta.codigo_padre);
//         if (padre) {
//           padre.subcuentas.push(cuentaDto);
//         }
//       } else {
//         raices.push(cuentaDto);
//       }
//     });

//     // Ordenar subcuentas recursivamente
//     const ordenarSubcuentas = (cuentas: CuentaPucTreeDto[]) => {
//       cuentas.sort((a, b) => a.codigo.localeCompare(b.codigo));
//       cuentas.forEach(cuenta => {
//         if (cuenta.subcuentas.length > 0) {
//           ordenarSubcuentas(cuenta.subcuentas);
//         }
//       });
//     };

//     ordenarSubcuentas(raices);
//     return raices;
//   }
// }