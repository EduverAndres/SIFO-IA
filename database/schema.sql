-- Creación de la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `ordenes_compra_db`;
USE `ordenes_compra_db`;

-- Tabla Proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(255) NOT NULL,
    `contacto` VARCHAR(255),
    `correo_electronico` VARCHAR(255) UNIQUE
);

-- Tabla Productos
CREATE TABLE IF NOT EXISTS `productos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT,
    `stock_actual` INT NOT NULL DEFAULT 0,
    `stock_minimo` INT NOT NULL DEFAULT 0,
    `stock_maximo` INT NOT NULL DEFAULT 0
);

-- Tabla OrdenesCompra
CREATE TABLE IF NOT EXISTS `ordenes_compra` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_proveedor` INT NOT NULL,
    `fecha_orden` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_entrega` DATETIME NOT NULL,
    `archivo_adjunto_url` VARCHAR(255), -- URL del archivo subido
    FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT
);

-- Tabla DetalleOrden
CREATE TABLE IF NOT EXISTS `detalles_orden` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_orden` INT NOT NULL,
    `id_producto` INT NOT NULL,
    `cantidad` INT NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`id_orden`) REFERENCES `ordenes_compra`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id`) ON DELETE RESTRICT
);

-- Datos de ejemplo (opcional)
INSERT INTO `proveedores` (`nombre`, `contacto`, `correo_electronico`) VALUES
('Proveedor A', 'Juan Pérez', 'juan.perez@proveedora.com'),
('Proveedor B', 'María Gómez', 'maria.gomez@proveedorb.com');

INSERT INTO `productos` (`nombre`, `descripcion`, `stock_actual`, `stock_minimo`, `stock_maximo`) VALUES
('Laptop Dell XPS', 'Portátil de alto rendimiento', 10, 2, 20),
('Monitor curvo 27"', 'Monitor para gaming y diseño', 5, 1, 15),
('Teclado mecánico', 'Teclado retroiluminado RGB', 20, 5, 50);

-- Script de migración para agregar campos faltantes a la base de datos
-- Ejecutar en MySQL/phpMyAdmin

USE `ordenes_compra_db`;

-- 1. Agregar campo 'estado' a la tabla ordenes_compra si no existe
ALTER TABLE `ordenes_compra` 
ADD COLUMN IF NOT EXISTS `estado` ENUM('Pendiente', 'Aprobada', 'Completada', 'Cancelada') 
DEFAULT 'Pendiente' AFTER `archivo_adjunto_url`;

-- 2. Agregar campo 'total' a la tabla ordenes_compra si no existe
ALTER TABLE `ordenes_compra` 
ADD COLUMN IF NOT EXISTS `total` DECIMAL(10, 2) DEFAULT 0.00 NOT NULL AFTER `estado`;

-- 3. Agregar campo 'observaciones' a la tabla ordenes_compra si no existe
ALTER TABLE `ordenes_compra` 
ADD COLUMN IF NOT EXISTS `observaciones` TEXT NULL AFTER `total`;

-- 4. Crear endpoints adicionales necesarios (estos van en el backend)
-- Los DTOs y endpoints están en los archivos anteriores

-- 5. Actualizar datos existentes para calcular totales
UPDATE `ordenes_compra` oc 
SET `total` = (
    SELECT COALESCE(SUM(do.cantidad * do.precio_unitario), 0)
    FROM `detalles_orden` do 
    WHERE do.id_orden = oc.id
) 
WHERE `total` = 0;

-- 6. Insertar datos de ejemplo adicionales si la tabla está vacía
INSERT IGNORE INTO `proveedores` (`id`, `nombre`, `contacto`, `correo_electronico`) VALUES
(3, 'Distribuidora Nacional S.A.S', 'Carlos Martínez', 'carlos.martinez@disnacional.com'),
(4, 'Suministros Bogotá Ltda', 'Ana Rodríguez', 'ana.rodriguez@suministrosbogota.com'),
(5, 'Tecnología y Equipos Colombia', 'Miguel Torres', 'miguel.torres@tecnoequipos.co');

INSERT IGNORE INTO `productos` (`id`, `nombre`, `descripcion`, `stock_actual`, `stock_minimo`, `stock_maximo`) VALUES
(3, 'Impresora Multifuncional HP', 'Impresora láser color con escáner', 8, 2, 25),
(4, 'Silla Ergonómica Oficina', 'Silla ajustable con soporte lumbar', 15, 5, 40),
(5, 'Escritorio Ejecutivo', 'Escritorio en madera con cajones', 6, 2, 20),
(6, 'Proyector Epson 4K', 'Proyector para presentaciones profesionales', 3, 1, 10),
(7, 'Tablet Samsung Galaxy Tab', 'Tablet 10 pulgadas para trabajo móvil', 12, 3, 30);

-- 7. Insertar órdenes de compra de ejemplo
INSERT IGNORE INTO `ordenes_compra` (`id`, `id_proveedor`, `fecha_orden`, `fecha_entrega`, `archivo_adjunto_url`, `estado`, `total`, `observaciones`) VALUES
(1, 1, '2025-01-28 10:30:00', '2025-02-15 00:00:00', NULL, 'Pendiente', 13850.00, 'Entrega urgente para nuevo proyecto'),
(2, 2, '2025-01-25 14:15:00', '2025-02-10 00:00:00', NULL, 'Aprobada', 2000.00, 'Equipos para la nueva sala de trabajo'),
(3, 1, '2025-01-20 09:45:00', '2025-02-05 00:00:00', NULL, 'Completada', 8500.00, 'Servidor principal para datacenter'),
(4, 2, '2025-01-15 16:20:00', '2025-01-30 00:00:00', NULL, 'Cancelada', 1325.00, 'Cancelada por cambio de proveedor');

-- 8. Insertar detalles de órdenes de ejemplo
INSERT IGNORE INTO `detalles_orden` (`id`, `id_orden`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 5, 2500.00),
(2, 1, 2, 3, 450.00),
(3, 2, 3, 2, 600.00),
(4, 2, 4, 5, 160.00),
(5, 3, 6, 1, 8500.00),
(6, 4, 7, 5, 265.00);

-- 9. Verificar la integridad de los datos
SELECT 
    oc.id,
    oc.estado,
    oc.total as total_orden,
    (SELECT SUM(do.cantidad * do.precio_unitario) 
     FROM detalles_orden do 
     WHERE do.id_orden = oc.id) as total_calculado
FROM ordenes_compra oc;

-- 10. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS `idx_ordenes_estado` ON `ordenes_compra` (`estado`);
CREATE INDEX IF NOT EXISTS `idx_ordenes_fecha_orden` ON `ordenes_compra` (`fecha_orden`);
CREATE INDEX IF NOT EXISTS `idx_ordenes_fecha_entrega` ON `ordenes_compra` (`fecha_entrega`);
CREATE INDEX IF NOT EXISTS `idx_ordenes_proveedor` ON `ordenes_compra` (`id_proveedor`);
CREATE INDEX IF NOT EXISTS `idx_detalles_orden` ON `detalles_orden` (`id_orden`);
CREATE INDEX IF NOT EXISTS `idx_detalles_producto` ON `detalles_orden` (`id_producto`);
CREATE INDEX IF NOT EXISTS `idx_productos_stock` ON `productos` (`stock_actual`, `stock_minimo`);
CREATE INDEX IF NOT EXISTS `idx_proveedores_nombre` ON `proveedores` (`nombre`);

-- 11. Crear vista para estadísticas rápidas
CREATE OR REPLACE VIEW `v_estadisticas_ordenes` AS
SELECT 
    COUNT(*) as total_ordenes,
    SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) as aprobadas,
    SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
    SUM(CASE WHEN estado = 'Cancelada' THEN 1 ELSE 0 END) as canceladas,
    SUM(total) as valor_total,
    SUM(CASE WHEN estado = 'Pendiente' THEN total ELSE 0 END) as valor_pendiente,
    AVG(total) as valor_promedio
FROM ordenes_compra;

-- 12. Crear vista para productos con stock bajo
CREATE OR REPLACE VIEW `v_productos_stock_bajo` AS
SELECT 
    p.*,
    (p.stock_actual - p.stock_minimo) as diferencia_stock,
    CASE 
        WHEN p.stock_actual = 0 THEN 'Sin Stock'
        WHEN p.stock_actual <= p.stock_minimo THEN 'Stock Bajo'
        WHEN p.stock_actual >= p.stock_maximo THEN 'Stock Alto'
        ELSE 'Stock Normal'
    END as estado_stock
FROM productos p
WHERE p.stock_actual <= p.stock_minimo;

-- 13. Crear función para calcular el total de una orden
DELIMITER //
CREATE FUNCTION IF NOT EXISTS `calcular_total_orden`(orden_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_calculado DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(cantidad * precio_unitario), 0) 
    INTO total_calculado
    FROM detalles_orden 
    WHERE id_orden = orden_id;
    
    RETURN total_calculado;
END //
DELIMITER ;

-- 14. Crear procedimiento para actualizar stock
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `actualizar_stock_producto`(
    IN producto_id INT,
    IN cantidad_cambio INT,
    IN motivo VARCHAR(255)
)
BEGIN
    DECLARE stock_actual_anterior INT;
    DECLARE stock_nuevo INT;
    
    -- Obtener stock actual
    SELECT stock_actual INTO stock_actual_anterior 
    FROM productos 
    WHERE id = producto_id;
    
    -- Calcular nuevo stock
    SET stock_nuevo = stock_actual_anterior + cantidad_cambio;
    
    -- Validar que el stock no sea negativo
    IF stock_nuevo < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El stock no puede ser negativo';
    END IF;
    
    -- Actualizar stock
    UPDATE productos 
    SET stock_actual = stock_nuevo 
    WHERE id = producto_id;
    
    -- Registrar el movimiento (opcional, requiere tabla de movimientos)
    -- INSERT INTO movimientos_stock (producto_id, cantidad_anterior, cantidad_cambio, cantidad_nueva, motivo, fecha)
    -- VALUES (producto_id, stock_actual_anterior, cantidad_cambio, stock_nuevo, motivo, NOW());
    
END //
DELIMITER ;

-- 15. Crear trigger para actualizar total automáticamente
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `actualizar_total_orden_insert`
    AFTER INSERT ON `detalles_orden`
    FOR EACH ROW
BEGIN
    UPDATE ordenes_compra 
    SET total = calcular_total_orden(NEW.id_orden)
    WHERE id = NEW.id_orden;
END //

CREATE TRIGGER IF NOT EXISTS `actualizar_total_orden_update`
    AFTER UPDATE ON `detalles_orden`
    FOR EACH ROW
BEGIN
    UPDATE ordenes_compra 
    SET total = calcular_total_orden(NEW.id_orden)
    WHERE id = NEW.id_orden;
END //

CREATE TRIGGER IF NOT EXISTS `actualizar_total_orden_delete`
    AFTER DELETE ON `detalles_orden`
    FOR EACH ROW
BEGIN
    UPDATE ordenes_compra 
    SET total = calcular_total_orden(OLD.id_orden)
    WHERE id = OLD.id_orden;
END //
DELIMITER ;

-- 16. Verificación final de la estructura
SHOW CREATE TABLE `ordenes_compra`;
SHOW CREATE TABLE `detalles_orden`;
SHOW CREATE TABLE `productos`;
SHOW CREATE TABLE `proveedores`;

-- 17. Consulta de verificación de datos
SELECT 'Resumen de la base de datos' as info;
SELECT COUNT(*) as total_proveedores FROM proveedores;
SELECT COUNT(*) as total_productos FROM productos;
SELECT COUNT(*) as total_ordenes FROM ordenes_compra;
SELECT COUNT(*) as total_detalles FROM detalles_orden;

-- 18. Verificar estadísticas
SELECT * FROM v_estadisticas_ordenes;

-- 19. Verificar productos con stock bajo
SELECT * FROM v_productos_stock_bajo;

-- Fin del script de migración