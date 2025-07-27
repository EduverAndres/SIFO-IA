// ===============================================
// 🔧 ImportPucModal.jsx - MODAL DE IMPORTACIÓN CORREGIDO
// ===============================================

import React, { useState } from 'react';
import {
  FaFileImport,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaUpload,
  FaFileExcel,
  FaEye,
  FaCogs,
  FaSpinner
} from 'react-icons/fa';
import { pucApi } from '../../api/pucApi';

const ImportPucModal = ({ isOpen, onClose, onImportSuccess }) => {
  // ===============================================
  // 🎯 ESTADOS
  // ===============================================
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState('upload'); // 'upload', 'validate', 'import', 'complete'
  const [importResult, setImportResult] = useState(null);
  
  // Opciones de importación
  const [importOptions, setImportOptions] = useState({
    sobreescribir: false,
    validar_jerarquia: true,
    importar_saldos: true,
    importar_fiscal: false,
    hoja: 'PUC',
    fila_inicio: 3
  });

  // ===============================================
  // 🔧 FUNCIONES DE MANEJO DE ARCHIVOS
  // ===============================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('📁 Archivo seleccionado:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

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
      setImportStep('upload');
      setImportResult(null);
    }
  };

  // ===============================================
  // 🔍 FUNCIONES DE VALIDACIÓN
  // ===============================================

  const handleValidateFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo para validar');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      console.log('🔍 Iniciando validación de archivo...');
      
      // ✅ USAR EL MÉTODO CORREGIDO
      const result = await pucApi.validarArchivoExcel(file, importOptions);
      
      console.log('✅ Resultado de validación:', result);
      
      if (result.success) {
        setValidationResult(result.data);
        setImportStep('validate');
      } else {
        setValidationResult(result.data);
        setImportStep('validate');
      }
      
    } catch (error) {
      console.error('❌ Error validando archivo:', error);
      
      // Crear resultado de error para mostrar en UI
      setValidationResult({
        es_valido: false,
        errores: [error.message || 'Error desconocido al validar archivo'],
        advertencias: [],
        total_filas: 0
      });
      setImportStep('validate');
      
    } finally {
      setIsValidating(false);
    }
  };

  // ===============================================
  // 📥 FUNCIONES DE IMPORTACIÓN
  // ===============================================

  const handleImportFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo para importar');
      return;
    }

    // Verificar validación previa
    if (!validationResult || !validationResult.es_valido) {
      if (!window.confirm('El archivo no ha sido validado o tiene errores. ¿Deseas continuar con la importación?')) {
        return;
      }
    }

    setIsImporting(true);
    setImportStep('import');
    
    try {
      console.log('📥 Iniciando importación...');
      
      const result = await pucApi.importarDesdeExcel(file, importOptions);
      
      console.log('✅ Resultado de importación:', result);
      
      if (result.success || result.data?.exito) {
        setImportResult(result.data || result);
        setImportStep('complete');
        
        // Notificar al componente padre del éxito
        if (onImportSuccess) {
          onImportSuccess(result.data || result);
        }
        
        // Auto-cerrar modal después de 3 segundos
        setTimeout(() => {
          handleClose();
        }, 3000);
        
      } else {
        throw new Error(result.data?.mensaje || result.message || 'Error durante la importación');
      }
      
    } catch (error) {
      console.error('❌ Error importando archivo:', error);
      alert('Error al importar archivo: ' + error.message);
      setImportStep('validate'); // Volver al paso anterior
      
    } finally {
      setIsImporting(false);
    }
  };

  // ===============================================
  // 🎛️ FUNCIONES DE CONTROL
  // ===============================================

  const handleClose = () => {
    // Reset de todos los estados
    setFile(null);
    setValidationResult(null);
    setIsValidating(false);
    setIsImporting(false);
    setImportStep('upload');
    setImportResult(null);
    setImportOptions({
      sobreescribir: false,
      validar_jerarquia: true,
      importar_saldos: true,
      importar_fiscal: false,
      hoja: 'PUC',
      fila_inicio: 3
    });
    
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      await pucApi.descargarTemplate(true); // Con ejemplos
    } catch (error) {
      console.error('Error descargando template:', error);
      alert('Error al descargar template: ' + error.message);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setValidationResult(null);
    setImportStep('upload');
    setImportResult(null);
  };

  // ===============================================
  // 🎨 COMPONENTES DE UI
  // ===============================================

  // Paso 1: Subida de archivo
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Información general */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">Instrucciones de importación:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>El archivo debe estar en formato Excel (.xlsx o .xls)</li>
              <li>La hoja debe llamarse "PUC" o usar el nombre especificado</li>
              <li>Los datos deben comenzar en la fila especificada (por defecto fila 3)</li>
              <li>Se recomienda validar el archivo antes de importar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selector de archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <FaFileExcel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">
          Arrastra un archivo Excel aquí o haz clic para seleccionar
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          <FaUpload className="mr-2" />
          Seleccionar archivo
        </label>
        
        {file && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-center">
              <FaFileExcel className="text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {file.name}
              </span>
              <span className="text-xs text-green-600 ml-2">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Opciones de importación */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Opciones de importación:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Checkboxes principales */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.sobreescribir}
                onChange={(e) => setImportOptions(prev => ({ ...prev, sobreescribir: e.target.checked }))}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Sobreescribir cuentas existentes</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.validar_jerarquia}
                onChange={(e) => setImportOptions(prev => ({ ...prev, validar_jerarquia: e.target.checked }))}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Validar jerarquía de cuentas</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.importar_saldos}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importar_saldos: e.target.checked }))}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Importar saldos</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.importar_fiscal}
                onChange={(e) => setImportOptions(prev => ({ ...prev, importar_fiscal: e.target.checked }))}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Importar información fiscal</span>
            </label>
          </div>

          {/* Configuración avanzada */}
          <div className="space-y-3">
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

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FaDownload className="mr-2" />
          Descargar Template
        </button>
        
        <div className="space-x-2">
          <button
            onClick={handleValidateFile}
            disabled={!file || isValidating}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Validando...
              </>
            ) : (
              <>
                <FaEye className="mr-2" />
                Validar Archivo
              </>
            )}
          </button>
          
          <button
            onClick={handleImportFile}
            disabled={!file || isImporting}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Importando...
              </>
            ) : (
              <>
                <FaFileImport className="mr-2" />
                Importar Directamente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Paso 2: Resultado de validación
  const renderValidationStep = () => (
    <div className="space-y-6">
      {/* Resultado de validación */}
      <div className={`rounded-lg p-4 ${
        validationResult?.es_valido 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center mb-3">
          {validationResult?.es_valido ? (
            <>
              <FaCheckCircle className="text-green-500 mr-2" />
              <h4 className="text-sm font-medium text-green-800">
                ✅ Archivo válido para importación
              </h4>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <h4 className="text-sm font-medium text-red-800">
                ❌ Errores encontrados en el archivo
              </h4>
            </>
          )}
        </div>

        <div className="text-sm space-y-2">
          <p className={validationResult?.es_valido ? 'text-green-700' : 'text-red-700'}>
            Total de filas detectadas: <strong>{validationResult?.total_filas || 0}</strong>
          </p>

          {/* Errores */}
          {validationResult?.errores && validationResult.errores.length > 0 && (
            <div>
              <p className="font-medium text-red-800 mb-1">Errores:</p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                {validationResult.errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Advertencias */}
          {validationResult?.advertencias && validationResult.advertencias.length > 0 && (
            <div>
              <p className="font-medium text-yellow-800 mb-1">Advertencias:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                {validationResult.advertencias.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Información del archivo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Información del archivo:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Nombre:</strong> {file?.name}</p>
          <p><strong>Tamaño:</strong> {file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
          <p><strong>Hoja a procesar:</strong> {importOptions.hoja}</p>
          <p><strong>Fila de inicio:</strong> {importOptions.fila_inicio}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={handleStartOver}
          className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaTimes className="mr-2" />
          Cambiar Archivo
        </button>
        
        <div className="space-x-2">
          <button
            onClick={handleValidateFile}
            disabled={isValidating}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Validando...
              </>
            ) : (
              <>
                <FaEye className="mr-2" />
                Revalidar
              </>
            )}
          </button>
          
          <button
            onClick={handleImportFile}
            disabled={isImporting}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              validationResult?.es_valido
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isImporting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Importando...
              </>
            ) : (
              <>
                <FaFileImport className="mr-2" />
                {validationResult?.es_valido ? 'Proceder con Importación' : 'Importar con Errores'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Paso 3: Importación en progreso
  const renderImportStep = () => (
    <div className="space-y-6 text-center">
      <div className="py-8">
        <FaSpinner className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Importando archivo...
        </h3>
        <p className="text-gray-600">
          Por favor espera mientras procesamos el archivo Excel.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          ⏳ Este proceso puede tomar unos minutos dependiendo del tamaño del archivo.
        </p>
      </div>
    </div>
  );

  // Paso 4: Importación completada
  const renderCompleteStep = () => (
    <div className="space-y-6">
      {/* Resultado exitoso */}
      <div className="text-center py-6">
        <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          ¡Importación Completada!
        </h3>
        <p className="text-gray-600">
          El archivo se ha procesado exitosamente.
        </p>
      </div>

      {/* Resumen de resultados */}
      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-3">Resumen de importación:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700">
                <strong>Procesadas:</strong> {importResult.resumen?.total_procesadas || 0}
              </p>
              <p className="text-green-700">
                <strong>Insertadas:</strong> {importResult.resumen?.insertadas || 0}
              </p>
            </div>
            <div>
              <p className="text-green-700">
                <strong>Actualizadas:</strong> {importResult.resumen?.actualizadas || 0}
              </p>
              <p className="text-green-700">
                <strong>Errores:</strong> {importResult.resumen?.errores || 0}
              </p>
            </div>
          </div>

          {importResult.resumen?.errores > 0 && (
            <div className="mt-3 pt-3 border-t border-green-300">
              <p className="text-sm font-medium text-red-800 mb-1">Errores detectados:</p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {(importResult.errores || []).slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {(importResult.errores || []).length > 5 && (
                  <li>... y {(importResult.errores || []).length - 5} errores más</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mensaje de cierre automático */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-700">
          ℹ️ Esta ventana se cerrará automáticamente en unos segundos...
        </p>
      </div>

      {/* Botón para cerrar manualmente */}
      <div className="text-center">
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  // ===============================================
  // 🎨 RENDER PRINCIPAL
  // ===============================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaFileImport className="text-blue-600 text-xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Importar PUC desde Excel
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex space-x-4">
              <span className={`flex items-center ${
                importStep === 'upload' ? 'text-blue-600 font-medium' : 
                ['validate', 'import', 'complete'].includes(importStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 text-xs">1</span>
                Subir
              </span>
              <span className={`flex items-center ${
                importStep === 'validate' ? 'text-blue-600 font-medium' : 
                ['import', 'complete'].includes(importStep) ? 'text-green-600' : 'text-gray-400'
              }`}>
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 text-xs">2</span>
                Validar
              </span>
              <span className={`flex items-center ${
                importStep === 'import' ? 'text-blue-600 font-medium' : 
                importStep === 'complete' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 text-xs">3</span>
                Importar
              </span>
              <span className={`flex items-center ${
                importStep === 'complete' ? 'text-green-600 font-medium' : 'text-gray-400'
              }`}>
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 text-xs">4</span>
                Completar
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {importStep === 'upload' && renderUploadStep()}
          {importStep === 'validate' && renderValidationStep()}
          {importStep === 'import' && renderImportStep()}
          {importStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
};

export default ImportPucModal;