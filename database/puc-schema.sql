-- database/puc-schema.sql
-- Migración para agregar el módulo PUC (Plan Único de Cuentas)

-- Crear enum types para PostgreSQL
DO $$ BEGIN
    CREATE TYPE tipo_cuenta_enum AS ENUM ('CLASE', 'GRUPO', 'CUENTA', 'SUBCUENTA', 'AUXILIAR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE naturaleza_cuenta_enum AS ENUM ('DEBITO', 'CREDITO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_cuenta_enum AS ENUM ('ACTIVA', 'INACTIVA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla cuentas_puc
CREATE TABLE IF NOT EXISTS cuentas_puc (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_cuenta tipo_cuenta_enum NOT NULL DEFAULT 'AUXILIAR',
    naturaleza naturaleza_cuenta_enum NOT NULL,
    estado estado_cuenta_enum NOT NULL DEFAULT 'ACTIVA',
    nivel INTEGER NOT NULL DEFAULT 1,
    codigo_padre VARCHAR(20),
    acepta_movimientos BOOLEAN NOT NULL DEFAULT true,
    requiere_tercero BOOLEAN NOT NULL DEFAULT false,
    requiere_centro_costo BOOLEAN NOT NULL DEFAULT false,
    dinamica TEXT,
    es_cuenta_niif BOOLEAN NOT NULL DEFAULT false,
    codigo_niif VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_codigo ON cuentas_puc(codigo);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_codigo_padre ON cuentas_puc(codigo_padre);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_estado ON cuentas_puc(estado);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_tipo_cuenta ON cuentas_puc(tipo_cuenta);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_naturaleza ON cuentas_puc(naturaleza);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_nivel ON cuentas_puc(nivel);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_acepta_movimientos ON cuentas_puc(acepta_movimientos);
CREATE INDEX IF NOT EXISTS idx_cuentas_puc_nombre ON cuentas_puc USING gin(to_tsvector('spanish', nombre));

-- Agregar foreign key constraint para la relación padre-hijo
ALTER TABLE cuentas_puc 
ADD CONSTRAINT fk_cuentas_puc_codigo_padre 
FOREIGN KEY (codigo_padre) 
REFERENCES cuentas_puc(codigo) 
ON DELETE CASCADE;

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cuentas_puc_updated_at 
    BEFORE UPDATE ON cuentas_puc 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar PUC básico estándar de Colombia
INSERT INTO cuentas_puc (codigo, nombre, descripcion, tipo_cuenta, naturaleza, nivel, codigo_padre, acepta_movimientos, dinamica) VALUES

-- CLASE 1 - ACTIVOS
('1', 'ACTIVO', 'Comprende todos los bienes y derechos apreciables en dinero de propiedad de la empresa.', 'CLASE', 'DEBITO', 1, NULL, false, 'Se debita por el aumento de activos y se acredita por la disminución de activos.'),

-- GRUPO 11 - DISPONIBLE
('11', 'DISPONIBLE', 'Comprende las cuentas que registran los recursos de liquidez inmediata, total o parcial.', 'GRUPO', 'DEBITO', 2, '1', false, 'Se debita por los ingresos de efectivo y equivalentes, se acredita por los egresos.'),

-- CUENTAS DEL DISPONIBLE
('1105', 'CAJA', 'Registra la existencia de dinero en efectivo disponible para atender los pagos menores.', 'CUENTA', 'DEBITO', 3, '11', false, 'Se debita por los ingresos de dinero en efectivo, se acredita por los pagos en efectivo.'),
('110505', 'CAJA GENERAL', 'Dinero en efectivo de la caja principal de la empresa.', 'SUBCUENTA', 'DEBITO', 4, '1105', true, 'Se debita por los ingresos de dinero en efectivo, se acredita por los pagos en efectivo.'),
('110510', 'CAJAS MENORES', 'Fondos fijos destinados para gastos menores y de urgencia.', 'SUBCUENTA', 'DEBITO', 4, '1105', true, 'Se debita por la constitución y reposición del fondo, se acredita por los gastos menores.'),

('1110', 'BANCOS', 'Registra el valor de los depósitos constituidos por la empresa en moneda nacional.', 'CUENTA', 'DEBITO', 3, '11', false, 'Se debita por los depósitos y notas crédito, se acredita por los retiros y notas débito.'),
('111005', 'MONEDA NACIONAL', 'Depósitos en cuentas corrientes y de ahorros en bancos nacionales.', 'SUBCUENTA', 'DEBITO', 4, '1110', true, 'Se debita por los depósitos, se acredita por los retiros y cargos bancarios.'),
('111010', 'MONEDA EXTRANJERA', 'Depósitos en moneda extranjera en bancos del país o del exterior.', 'SUBCUENTA', 'DEBITO', 4, '1110', true, 'Se debita por los depósitos en moneda extranjera, se acredita por los retiros.'),

-- CLASE 2 - PASIVOS
('2', 'PASIVO', 'Comprende las obligaciones contraídas por la empresa en desarrollo del giro ordinario de su actividad.', 'CLASE', 'CREDITO', 1, NULL, false, 'Se acredita por el surgimiento de obligaciones y se debita por el pago o cancelación.'),

-- GRUPO 21 - OBLIGACIONES FINANCIERAS
('21', 'OBLIGACIONES FINANCIERAS', 'Comprende el valor de las obligaciones contraídas por la empresa mediante la obtención de recursos provenientes de establecimientos de crédito.', 'GRUPO', 'CREDITO', 2, '2', false, 'Se acredita por los préstamos recibidos, se debita por los pagos realizados.'),

('2105', 'BANCOS NACIONALES', 'Obligaciones con bancos del país en moneda nacional.', 'CUENTA', 'CREDITO', 3, '21', false, 'Se acredita por los préstamos recibidos, se debita por los pagos del capital.'),
('210505', 'SOBREGIROS', 'Sobregiros bancarios autorizados o no autorizados.', 'SUBCUENTA', 'CREDITO', 4, '2105', true, 'Se acredita por el sobregiro utilizado, se debita por los abonos realizados.'),
('210510', 'PAGARÉS', 'Obligaciones documentadas mediante pagarés.', 'SUBCUENTA', 'CREDITO', 4, '2105', true, 'Se acredita por los préstamos documentados, se debita por los pagos.'),

-- GRUPO 22 - PROVEEDORES
('22', 'PROVEEDORES', 'Comprende el valor de las obligaciones a cargo de la empresa, por concepto de la adquisición de bienes y/o servicios.', 'GRUPO', 'CREDITO', 2, '2', false, 'Se acredita por las compras a crédito, se debita por los pagos a proveedores.'),

('2205', 'PROVEEDORES NACIONALES', 'Obligaciones con proveedores del país.', 'CUENTA', 'CREDITO', 3, '22', false, 'Se acredita por las compras a crédito, se debita por los pagos realizados.'),
('220505', 'COMPRAS DE MERCANCÍAS', 'Deudas por compras de mercancías para la venta.', 'SUBCUENTA', 'CREDITO', 4, '2205', true, 'Se acredita por las compras a crédito, se debita por los pagos.'),

-- CLASE 3 - PATRIMONIO
('3', 'PATRIMONIO', 'Comprende el valor residual de comparar el activo total menos el pasivo externo.', 'CLASE', 'CREDITO', 1, NULL, false, 'Se acredita por aumentos de patrimonio, se debita por disminuciones.'),

-- GRUPO 31 - CAPITAL SOCIAL
('31', 'CAPITAL SOCIAL', 'Comprende el valor total de los aportes suscritos por los socios o accionistas.', 'GRUPO', 'CREDITO', 2, '3', false, 'Se acredita por los aportes de capital, se debita por retiros o reducciones.'),

('3115', 'APORTES SOCIALES', 'Capital aportado por los socios en sociedades de responsabilidad limitada.', 'CUENTA', 'CREDITO', 3, '31', false, 'Se acredita por los aportes de los socios, se debita por retiros autorizados.'),
('311505', 'CUOTAS O PARTES DE INTERÉS SOCIAL', 'Valor nominal de las cuotas de participación social.', 'SUBCUENTA', 'CREDITO', 4, '3115', true, 'Se acredita por el valor de las cuotas suscritas y pagadas.'),

-- CLASE 4 - INGRESOS
('4', 'INGRESOS', 'Comprende los valores recibidos y/o causados como resultado de las actividades desarrolladas por la empresa.', 'CLASE', 'CREDITO', 1, NULL, false, 'Se acredita por los ingresos obtenidos, se debita para cerrar al final del período.'),

-- GRUPO 41 - OPERACIONALES
('41', 'OPERACIONALES', 'Comprende los valores recibidos y/o causados en desarrollo del objeto social principal de la empresa.', 'GRUPO', 'CREDITO', 2, '4', false, 'Se acredita por las ventas y servicios prestados del giro normal del negocio.'),

('4135', 'COMERCIO AL POR MAYOR Y AL POR MENOR', 'Ingresos por actividades comerciales de compra y venta.', 'CUENTA', 'CREDITO', 3, '41', false, 'Se acredita por las ventas de mercancías al por mayor y menor.'),
('413505', 'VENTA DE MERCANCÍAS', 'Ingresos por venta de mercancías.', 'SUBCUENTA', 'CREDITO', 4, '4135', true, 'Se acredita por el valor de las ventas de mercancías.'),

-- CLASE 5 - GASTOS
('5', 'GASTOS', 'Comprende los valores pagados y/o causados en desarrollo de la actividad empresarial.', 'CLASE', 'DEBITO', 1, NULL, false, 'Se debita por los gastos incurridos, se acredita para cerrar al final del período.'),

-- GRUPO 51 - OPERACIONALES DE ADMINISTRACIÓN
('51', 'OPERACIONALES DE ADMINISTRACIÓN', 'Comprende los gastos ocasionados en el desarrollo del objeto social principal del ente económico.', 'GRUPO', 'DEBITO', 2, '5', false, 'Se debita por los gastos administrativos del período.'),

('5105', 'GASTOS DE PERSONAL', 'Comprende los gastos laborales en que incurre la empresa.', 'CUENTA', 'DEBITO', 3, '51', false, 'Se debita por todos los gastos de personal administrativo.'),
('510506', 'SUELDOS', 'Remuneración fija del personal administrativo.', 'SUBCUENTA', 'DEBITO', 4, '5105', true, 'Se debita por los sueldos del personal administrativo.'),
('510515', 'HORAS EXTRAS', 'Valor de las horas extras trabajadas por el personal.', 'SUBCUENTA', 'DEBITO', 4, '5105', true, 'Se debita por el valor de las horas extras laboradas.'),

-- CLASE 6 - COSTO DE VENTAS
('6', 'COSTO DE VENTAS', 'Comprende la acumulación de los costos directos e indirectos necesarios en la elaboración de productos.', 'CLASE', 'DEBITO', 1, NULL, false, 'Se debita por los costos incurridos, se acredita para cerrar al final del período.'),

-- GRUPO 61 - COSTO DE VENTAS Y DE PRESTACIÓN DE SERVICIOS
('61', 'COSTO DE VENTAS Y DE PRESTACIÓN DE SERVICIOS', 'Comprende el costo de los artículos destinados a la venta.', 'GRUPO', 'DEBITO', 2, '6', false, 'Se debita por el costo de los productos vendidos.'),

('6135', 'COMERCIO AL POR MAYOR Y AL POR MENOR', 'Costo de mercancías vendidas en actividades comerciales.', 'CUENTA', 'DEBITO', 3, '61', false, 'Se debita por el costo de las mercancías vendidas.'),
('613505', 'COSTO DE MERCANCÍAS VENDIDAS', 'Costo directo de las mercancías vendidas.', 'SUBCUENTA', 'DEBITO', 4, '6135', true, 'Se debita por el costo de las mercancías vendidas.')

ON CONFLICT (codigo) DO NOTHING;

-- Crear función para obtener el árbol de cuentas
CREATE OR REPLACE FUNCTION obtener_arbol_puc(codigo_inicio VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    codigo VARCHAR,
    nombre VARCHAR,
    nivel INTEGER,
    ruta TEXT,
    tiene_hijos BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE arbol_cuentas AS (
        -- Caso base: cuentas raíz o a partir de un código específico
        SELECT 
            c.id,
            c.codigo,
            c.nombre,
            c.nivel,
            c.codigo::TEXT as ruta,
            EXISTS(SELECT 1 FROM cuentas_puc h WHERE h.codigo_padre = c.codigo) as tiene_hijos
        FROM cuentas_puc c
        WHERE (codigo_inicio IS NULL AND c.codigo_padre IS NULL) 
           OR (codigo_inicio IS NOT NULL AND c.codigo = codigo_inicio)
        
        UNION ALL
        
        -- Caso recursivo: obtener hijos
        SELECT 
            c.id,
            c.codigo,
            c.nombre,
            c.nivel,
            (ac.ruta || ' > ' || c.codigo)::TEXT as ruta,
            EXISTS(SELECT 1 FROM cuentas_puc h WHERE h.codigo_padre = c.codigo) as tiene_hijos
        FROM cuentas_puc c
        INNER JOIN arbol_cuentas ac ON c.codigo_padre = ac.codigo
    )
    SELECT * FROM arbol_cuentas ORDER BY codigo;
END;
$$ LANGUAGE plpgsql;

-- Crear función para validar jerarquía de códigos PUC
CREATE OR REPLACE FUNCTION validar_jerarquia_puc(nuevo_codigo VARCHAR, codigo_padre_param VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    longitud_codigo INTEGER;
    longitud_padre INTEGER;
BEGIN
    -- Si no hay código padre, debe ser una clase (1 dígito)
    IF codigo_padre_param IS NULL THEN
        RETURN length(nuevo_codigo) = 1;
    END IF;
    
    longitud_codigo := length(nuevo_codigo);
    longitud_padre := length(codigo_padre_param);
    
    -- Verificar que el código comience con el código padre
    IF NOT (nuevo_codigo LIKE codigo_padre_param || '%') THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar longitudes según la jerarquía PUC
    CASE longitud_padre
        WHEN 1 THEN -- Padre es clase, hijo debe ser grupo (2 dígitos)
            RETURN longitud_codigo = 2;
        WHEN 2 THEN -- Padre es grupo, hijo debe ser cuenta (4 dígitos)
            RETURN longitud_codigo = 4;
        WHEN 4 THEN -- Padre es cuenta, hijo debe ser subcuenta (6 dígitos)
            RETURN longitud_codigo = 6;
        WHEN 6 THEN -- Padre es subcuenta, hijo debe ser auxiliar (7+ dígitos)
            RETURN longitud_codigo >= 7;
        ELSE
            RETURN longitud_codigo > longitud_padre;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validar jerarquía antes de insertar/actualizar
CREATE OR REPLACE FUNCTION trigger_validar_jerarquia_puc()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar jerarquía si hay código padre
    IF NEW.codigo_padre IS NOT NULL THEN
        IF NOT validar_jerarquia_puc(NEW.codigo, NEW.codigo_padre) THEN
            RAISE EXCEPTION 'La jerarquía del código PUC % con padre % no es válida', NEW.codigo, NEW.codigo_padre;
        END IF;
        
        -- Verificar que el código padre exista
        IF NOT EXISTS(SELECT 1 FROM cuentas_puc WHERE codigo = NEW.codigo_padre) THEN
            RAISE EXCEPTION 'El código padre % no existe', NEW.codigo_padre;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validar_jerarquia_puc_trigger
    BEFORE INSERT OR UPDATE ON cuentas_puc
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validar_jerarquia_puc();

-- Verificar la integridad de los datos insertados
SELECT 'Verificación del PUC' as info;
SELECT COUNT(*) as total_cuentas FROM cuentas_puc;
SELECT tipo_cuenta, COUNT(*) as cantidad 
FROM cuentas_puc 
GROUP BY tipo_cuenta 
ORDER BY tipo_cuenta;

-- Mostrar estructura jerárquica básica
SELECT 
    REPEAT('  ', nivel - 1) || codigo || ' - ' || nombre as estructura_puc
FROM cuentas_puc 
WHERE nivel <= 3 
ORDER BY codigo;