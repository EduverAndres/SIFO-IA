// src/components/puc/ImportPucModal.jsx - ACTUALIZADO PARA EL BACKEND
import React, { useState } from 'react';
import {
  FaFileImport,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaFlag,
  FaBuilding,
  FaFileExcel,
  FaEye
} from 'react-icons/fa';
import Modal from '../Modal';
import Button from '../Button';
import { pucApi } from '../../api/pucApi';

const ImportPucModal = ({ show, onClose, onImport, loading }) => {
  // 🔥 DEBUG: Verificar props
  console.log('🎯 ImportPucModal renderizado:', { show, onClose, onImport, loading });
  
  const [importType, setImportType] = useState('excel'); // 'excel' o 'estandar'
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importOptions, setImportOptions] = useState({
    sobreescribir: false,
    validar_jerarquia: true,
    importar_saldos: true,
    importar_fiscal: true,
    hoja: 'PUC',
    fila_inicio: 3
  });

  const handleImportEstandar = async () => {
    try {
      const result = await pucApi.importarPucEstandar(importOptions);
      if (result.data.exito) {
        onImport && onImport(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error al importar PUC estándar:', error);
      alert('Error al importar PUC estándar: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      const fileExtension = selectedFile.name.toLowerCase();
      
      if (!allowedTypes.includes(selectedFile.type) && 
          !fileExtension.endsWith('.xlsx') && 
          !fileExtension.endsWith('.xls')) {
        alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        return;
      }
      
      setFile(selectedFile);
      setValidationResult(null);
    }
  };

  const handleValidateFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo para validar');
      return;
    }

    setIsValidating(true);
    try {
      const result = await pucApi.validarArchivoExcel(file, importOptions);
      setValidationResult(result.data);
    } catch (error) {
      console.error('Error validando archivo:', error);
      alert('Error al validar archivo: ' + error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo para importar');
      return;
    }

    try {
      const result = await pucApi.importarDesdeExcel(file, importOptions);
      
      if (result.data.exito) {
        onImport && onImport(result.data);
        onClose();
      } else {
        alert('Error durante la importación: ' + result.data.mensaje);
      }
    } catch (error) {
      console.error('Error importando archivo:', error);
      alert('Error al importar archivo: ' + error.message);
    }
  };

  const downloadTemplate = async () => {
    try {
      await pucApi.descargarTemplate(true);
    } catch (error) {
      console.error('Error descargando template:', error);
      alert('Error al descargar template: ' + error.message);
    }
  };

  const resetImport = () => {
    setFile(null);
    setValidationResult(null);
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
      show={show}
      onClose={onClose}
      title="Importar Plan Único de Cuentas"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Selector de tipo de importación */}
        <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setImportType('excel')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              importType === 'excel'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaFileExcel className="text-green-500" />
              <span>Importar desde Excel</span>
            </div>
          </button>
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
        </div>

        {/* Contenido según el tipo seleccionado */}
        {importType === 'excel' ? (
          <div className="space-y-6">
            {/* Importación desde Excel */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FaFileExcel className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importar desde archivo Excel
              </h3>
              <p className="text-gray-600 mb-6">
                Sube tu archivo Excel con el plan de cuentas. Usa nuestro template para mejor compatibilidad.
              </p>
            </div>

            {/* Descargar plantilla */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaDownload className="text-yellow-500 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Template recomendado</h4>
                    <p className="text-sm text-yellow-700">
                      Descarga la plantilla oficial con ejemplos y formato correcto
                    </p>
                  </div>
                </div>
                <Button
                  onClick={downloadTemplate}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
                  icon={FaDownload}
                  size="sm"
                >
                  Descargar Template
                </Button>
              </div>
            </div>

            {/* Selección de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar archivo Excel
              </label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <FaFileExcel className="mx-auto h-12 w-12 text-green-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Subir archivo Excel</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Solo archivos Excel (.xlsx, .xls) hasta 10MB
                  </p>
                </div>
              </div>
              
              {file && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="text-sm text-green-800">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={resetImport}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Opciones de importación */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Opciones de importación:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={importOptions.sobreescribir}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, sobreescribir: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      Sobreescribir existentes
                    </span>
                    <p className="text-xs text-gray-500">
                      Actualizar cuentas que ya existan
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={importOptions.validar_jerarquia}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      Validar jerarquía
                    </span>
                    <p className="text-xs text-gray-500">
                      Verificar estructura antes de importar
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={importOptions.importar_saldos}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, importar_saldos: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      Importar saldos
                    </span>
                    <p className="text-xs text-gray-500">
                      Incluir saldos iniciales y finales
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={importOptions.importar_fiscal}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, importar_fiscal: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      Importar info fiscal
                    </span>
                    <p className="text-xs text-gray-500">
                      F350, F300, exógena, etc.
                    </p>
                  </div>
                </label>
              </div>

              {/* Configuración avanzada */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Configuración avanzada:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre de la hoja
                    </label>
                    <input
                      type="text"
                      value={importOptions.hoja}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, hoja: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="PUC"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fila de inicio de datos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={importOptions.fila_inicio}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, fila_inicio: parseInt(e.target.value) || 3 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado de validación */}
            {validationResult && (
              <div className={`rounded-lg p-4 ${
                validationResult.es_valido 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {validationResult.es_valido ? (
                    <>
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <h4 className="text-sm font-medium text-green-800">
                        Archivo válido para importación
                      </h4>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <h4 className="text-sm font-medium text-red-800">
                        Errores encontrados en el archivo
                      </h4>
                    </>
                  )}
                </div>

                <div className="text-sm space-y-2">
                  <p className={validationResult.es_valido ? 'text-green-700' : 'text-red-700'}>
                    Total de filas: {validationResult.total_filas} | 
                    Válidas: {validationResult.filas_validas} | 
                    Errores: {validationResult.errores?.length || 0}
                  </p>

                  {validationResult.errores && validationResult.errores.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 font-medium mb-1">Errores encontrados:</p>
                      <div className="max-h-32 overflow-y-auto">
                        {validationResult.errores.slice(0, 5).map((error, index) => (
                          <p key={index} className="text-xs text-red-600">
                            Fila {error.fila}: {error.error}
                          </p>
                        ))}
                        {validationResult.errores.length > 5 && (
                          <p className="text-xs text-red-600 italic">
                            ... y {validationResult.errores.length - 5} errores más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {validationResult.advertencias && validationResult.advertencias.length > 0 && (
                    <div className="mt-2">
                      <p className="text-yellow-700 font-medium mb-1">Advertencias:</p>
                      <div className="max-h-20 overflow-y-auto">
                        {validationResult.advertencias.slice(0, 3).map((advertencia, index) => (
                          <p key={index} className="text-xs text-yellow-600">{advertencia}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                Cancelar
              </Button>

              {file && !validationResult && (
                <Button
                  onClick={handleValidateFile}
                  disabled={isValidating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  icon={isValidating ? null : FaEye}
                >
                  {isValidating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Validando...</span>
                    </div>
                  ) : (
                    'Validar Archivo'
                  )}
                </Button>
              )}

              {validationResult && (
                <>
                  <Button
                    onClick={handleValidateFile}
                    disabled={isValidating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    icon={FaEye}
                  >
                    Validar de nuevo
                  </Button>
                  
                  <Button
                    onClick={handleImportFile}
                    disabled={!validationResult.es_valido || loading}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    icon={loading ? null : FaFileImport}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Importando...</span>
                      </div>
                    ) : (
                      'Importar Datos'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Importación PUC estándar */}
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

            {/* Opciones de importación estándar */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Opciones de importación:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={importOptions.sobreescribir}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, sobreescribir: e.target.checked }))}
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
        )}
      </div>
    </Modal>
  );
};

export default ImportPucModal;