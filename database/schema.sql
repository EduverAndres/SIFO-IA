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