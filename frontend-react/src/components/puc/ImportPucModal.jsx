// src/components/puc/ImportPucModal.jsx
import React, { useState } from 'react';
import {
  FaFileImport,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaUpload,
  FaFlag,
  FaBuilding,
} from 'react-icons/fa';
import Modal from '../Modal';
import Button from '../Button';

const ImportPucModal = ({ isOpen, onClose, onImport, loading }) => {
  const [importType, setImportType] = useState('estandar'); // 'estandar' o 'custom'
  const [file, setFile] = useState(null);
  const [importOptions, setImportOptions] = useState({
    sobrescribir_existentes: false,
    validar_jerarquia: true,
    solo_preview: false,
  });

  const handleImportEstandar = async () => {
    try {
      await onImport();
    } catch (error) {
      console.error('Error al importar PUC estándar:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        alert('Por favor selecciona un archivo válido (JSON, CSV, Excel)');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCustomImport = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo para importar');
      return;
    }

    // TODO: Implementar importación personalizada
    console.log('Importar archivo personalizado:', file, importOptions);
    alert('Función de importación personalizada en desarrollo');
  };

  const downloadTemplate = () => {
    // TODO: Implementar descarga de plantilla
    alert('Descarga de plantilla en desarrollo');
  };

  const pucEstandarInfo = [
    { clase: '1', nombre: 'ACTIVOS', descripcion: 'Recursos controlados por la empresa', naturaleza: 'DÉBITO' },
    { clase: '2', nombre: 'PASIVOS', descripcion: 'Obligaciones de la empresa', naturaleza: 'CRÉDITO' },
    { clase: '3', nombre: 'PATRIMONIO', descripcion: 'Capital y utilidades', naturaleza: 'CRÉDITO' },
    { clase: '4', nombre: 'INGRESOS', descripcion: 'Aumentos en los beneficios económicos', naturaleza: 'CRÉDITO' },
    { clase: '5', nombre: 'GASTOS', descripcion: 'Disminuciones en los beneficios económicos', naturaleza: 'DÉBITO' },
    { clase: '6', nombre: 'COSTOS', descripcion: 'Costos asociados con la producción', naturaleza: 'DÉBITO' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Plan Único de Cuentas"
      size="lg"
    >
      <div className="space-y-6">
        {/* Selector de tipo de importación */}
        <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setImportType('estandar')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              importType === 'estandar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaFlag className="text-yellow-500" />
              <span>PUC Estándar Colombia</span>
            </div>
          </button>
          <button
            onClick={() => setImportType('custom')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              importType === 'custom'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaUpload className="text-green-500" />
              <span>Importación Personalizada</span>
            </div>
          </button>
        </div>

        {/* Contenido según el tipo seleccionado */}
        {importType === 'estandar' ? (
          <div className="space-y-6">
            {/* Información del PUC estándar */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <FaBuilding className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Plan Único de Cuentas - Colombia
              </h3>
              <p className="text-gray-600 mb-6">
                Importa la estructura básica del PUC establecido por la normativa colombiana.
                Incluye las clases, grupos y cuentas principales según el Decreto 2650 de 1993.
              </p>
            </div>

            {/* Vista previa de las clases */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" />
                Clases que se importarán:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pucEstandarInfo.map((clase) => (
                  <div key={clase.clase} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <span className="font-mono text-lg font-bold text-gray-800 bg-gray-100 w-8 h-8 rounded flex items-center justify-center">
                      {clase.clase}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{clase.nombre}</p>
                      <p className="text-xs text-gray-500 truncate">{clase.descripcion}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      clase.naturaleza === 'DÉBITO' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {clase.naturaleza}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <FaInfoCircle className="text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Información importante:</h4>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Se importarán aproximadamente 25-30 cuentas básicas</li>
                    <li>No se sobrescribirán cuentas existentes con el mismo código</li>
                    <li>Incluye estructura jerárquica completa (Clase → Grupo → Cuenta)</li>
                    <li>Podrás personalizar las cuentas después de la importación</li>
                    <li>Es recomendable hacer esto en un PUC vacío o nuevo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Opciones de importación */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Opciones de importación:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.sobrescribir_existentes}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, sobrescribir_existentes: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Sobrescribir cuentas existentes
                    </span>
                    <p className="text-xs text-gray-500">
                      Actualizar cuentas que ya existan con el mismo código
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.validar_jerarquia}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Validar jerarquía
                    </span>
                    <p className="text-xs text-gray-500">
                      Verificar que la estructura jerárquica sea correcta antes de importar
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImportEstandar}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                icon={loading ? null : FaFileImport}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Importando...</span>
                  </div>
                ) : (
                  'Importar PUC Estándar'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Importación personalizada */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FaUpload className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importación Personalizada
              </h3>
              <p className="text-gray-600 mb-6">
                Importa tu propio plan de cuentas desde un archivo CSV, JSON o Excel.
              </p>
            </div>

            {/* Descargar plantilla */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaDownload className="text-yellow-500 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Plantilla recomendada</h4>
                    <p className="text-sm text-yellow-700">
                      Descarga la plantilla para asegurar el formato correcto
                    </p>
                  </div>
                </div>
                <Button
                  onClick={downloadTemplate}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
                  icon={FaDownload}
                  size="sm"
                >
                  Descargar
                </Button>
              </div>
            </div>

            {/* Selección de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar archivo
              </label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Subir un archivo</span>
                      <input
                        type="file"
                        accept=".csv,.json,.xls,.xlsx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV, JSON, Excel hasta 10MB
                  </p>
                </div>
              </div>
              {file && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-sm text-green-800">
                      Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Opciones de importación personalizada */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Opciones de importación:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.sobrescribir_existentes}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, sobrescribir_existentes: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Sobrescribir cuentas existentes
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.validar_jerarquia}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Validar jerarquía antes de importar
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.solo_preview}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, solo_preview: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Solo vista previa (no importar)
                  </span>
                </label>
              </div>
            </div>

            {/* Información sobre formato */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Formato esperado:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Columnas requeridas:</strong> codigo, nombre, tipo_cuenta, naturaleza</p>
                <p><strong>Columnas opcionales:</strong> descripcion, codigo_padre, estado, acepta_movimientos, etc.</p>
                <p><strong>Tipos de cuenta válidos:</strong> CLASE, GRUPO, CUENTA, SUBCUENTA, AUXILIAR</p>
                <p><strong>Naturalezas válidas:</strong> DEBITO, CREDITO</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCustomImport}
                disabled={!file || loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                icon={loading ? null : FaFileImport}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  importOptions.solo_preview ? 'Ver Vista Previa' : 'Importar Archivo'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportPucModal;