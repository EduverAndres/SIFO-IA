// // backend-nestjs/src/puc/puc.controller.ts
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   ParseIntPipe,
//   ValidationPipe,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import { PucService } from './puc.service';
// import { CreateCuentaPucDto } from './dto/create-cuenta-puc.dto';
// import { UpdateCuentaPucDto } from './dto/update-cuenta-puc.dto';
// import { FiltrosPucDto } from './dto/filtros-puc.dto';
// import { ImportarPucDto } from './dto/importar-puc.dto';
// import { ResponsePucDto } from './dto/response-puc.dto';

// @Controller('api/puc')
// export class PucController {
//   constructor(private readonly pucService: PucService) {}

//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   async crear(
//     @Body(ValidationPipe) createCuentaPucDto: CreateCuentaPucDto,
//   ): Promise<ResponsePucDto> {
//     return this.pucService.crear(createCuentaPucDto);
//   }

//   @Get()
//   async listarTodos(
//     @Query(ValidationPipe) filtros: FiltrosPucDto,
//   ): Promise<ResponsePucDto> {
//     return this.pucService.listarTodos(filtros);
//   }

//   @Get('arbol')
//   async obtenerArbolCompleto(): Promise<ResponsePucDto> {
//     return this.pucService.obtenerArbolCompleto();
//   }

//   @Get('estandar-colombia')
//   async obtenerPucEstandarColombia(): Promise<ResponsePucDto> {
//     return this.pucService.obtenerPucEstandarColombia();
//   }

//   @Get('codigo/:codigo')
//   async obtenerPorCodigo(@Param('codigo') codigo: string) {
//     return this.pucService.obtenerPorCodigo(codigo);
//   }

//   @Get(':id')
//   async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
//     return this.pucService.obtenerPorId(id);
//   }

//   @Patch(':id')
//   async actualizar(
//     @Param('id', ParseIntPipe) id: number,
//     @Body(ValidationPipe) updateCuentaPucDto: UpdateCuentaPucDto,
//   ): Promise<ResponsePucDto> {
//     return this.pucService.actualizar(id, updateCuentaPucDto);
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.OK)
//   async eliminar(@Param('id', ParseIntPipe) id: number): Promise<ResponsePucDto> {
//     return this.pucService.eliminar(id);
//   }

//   @Post('importar')
//   @HttpCode(HttpStatus.OK)
//   async importarPucEstandar(
//     @Body(ValidationPipe) importarPucDto: ImportarPucDto,
//   ): Promise<ResponsePucDto> {
//     return this.pucService.importarPucEstandar(importarPucDto);
//   }

//   @Post('importar/estandar-colombia')
//   @HttpCode(HttpStatus.OK)
//   async importarPucEstandarColombia(): Promise<ResponsePucDto> {
//     const pucEstandar = await this.pucService.obtenerPucEstandarColombia();
    
//     const importarDto: ImportarPucDto = {
//       cuentas: pucEstandar.data,
//       sobrescribir_existentes: false,
//       validar_jerarquia: true,
//     };

//     return this.pucService.importarPucEstandar(importarDto);
//   }
// }

// // backend-nestjs/src/puc/puc.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PucService } from './puc.service';
// import { PucController } from './puc.controller';
// import { CuentaPuc } from './entities/cuenta-puc.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([CuentaPuc])],
//   controllers: [PucController],
//   providers: [PucService],
//   exports: [PucService], // Para usar en otros módulos
// })
// export class PucModule {}