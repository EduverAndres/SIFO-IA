// frontend-react/src/components/puc/ImportPucExcelModal.jsx
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
  FaCloudUploadAlt,
  FaShieldAlt
} from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { pucApi } from '../../api/pucApi';

const ImportPucExcelModal = ({ isOpen, onClose, onImport, loading }) => {
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importStep, setImportStep] = useState('upload'); // 'upload', 'validate', 'import'
  const [isDragOver, setIsDragOver] = useState(false);
  const [importOptions, setImportOptions] = useState({
    sobreescribir: false,
    validar_jerarquia: true,
    importar_saldos: true,
    importar_fiscal: true,
    hoja: 'PUC',
    fila_inicio: 3
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
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
      setImportStep('upload');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
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
      setImportStep('validate');
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
      setImportStep('import');
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
    setImportStep('upload');
  };

  const handleClose = () => {
    resetImport();
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      title="Importar Plan Único de Cuentas"
      maxWidth="4xl"
    >
      <div className="space-y-8">
        
        {/* Header con glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-blue-50/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-blue-400/5"></div>
          <div className="relative text-center">
            <div className="mx-auto w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30 mb-6">
              <FaFileExcel className="text-3xl text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              Importar desde Excel
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sube tu archivo Excel con el plan de cuentas. Te recomendamos usar nuestro template oficial para garantizar la compatibilidad.
            </p>
          </div>
        </div>

        {/* Template download card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaDownload className="text-amber-600 text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 text-lg">Template Oficial</h4>
                <p className="text-amber-700">
                  Descarga la plantilla con ejemplos y formato correcto
                </p>
              </div>
            </div>
            <Button
              onClick={downloadTemplate}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300/60 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              icon={FaDownload}
            >
              Descargar Template
            </Button>
          </div>
        </div>

        {/* Drag and drop zone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-4">
            Seleccionar archivo Excel
          </label>
          <div 
            className={`relative flex justify-center px-8 py-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50/80 scale-[1.02]' 
                : file 
                  ? 'border-emerald-300 bg-emerald-50/60' 
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/60'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDragOver ? 'bg-blue-100 scale-110' : file ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-slate-200'
              }`}>
                {isDragOver ? (
                  <FaCloudUploadAlt className="text-2xl text-blue-600" />
                ) : file ? (
                  <FaCheckCircle className="text-2xl text-emerald-600" />
                ) : (
                  <FaFileExcel className="text-2xl text-slate-500 group-hover:text-slate-600" />
                )}
              </div>
              
              <div className="text-lg text-slate-600 mb-2">
                {isDragOver ? (
                  'Suelta el archivo aquí'
                ) : file ? (
                  'Archivo seleccionado'
                ) : (
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">Haz clic para subir</span>
                    <span className="text-slate-500"> o arrastra y suelta</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-sm text-slate-500">
                Solo archivos Excel (.xlsx, .xls) hasta 10MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-6 p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FaFileExcel className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-emerald-800">{file.name}</div>
                    <div className="text-sm text-emerald-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetImport}
                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors duration-200"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Import options */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-800 flex items-center">
            <FaCogs className="mr-3 text-slate-600" />
            Opciones de importación
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'sobreescribir',
                title: 'Sobreescribir existentes',
                description: 'Actualizar cuentas que ya existan',
                icon: '🔄'
              },
              {
                key: 'validar_jerarquia',
                title: 'Validar jerarquía',
                description: 'Verificar estructura antes de importar',
                icon: '🔍'
              },
              {
                key: 'importar_saldos',
                title: 'Importar saldos',
                description: 'Incluir saldos iniciales y finales',
                icon: '💰'
              },
              {
                key: 'importar_fiscal',
                title: 'Importar info fiscal',
                description: 'F350, F300, exógena, etc.',
                icon: '📊'
              }
            ].map((option) => (
              <label 
                key={option.key}
                className="group cursor-pointer"
              >
                <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                  importOptions[option.key] 
                    ? 'border-blue-300 bg-blue-50/60 shadow-md shadow-blue-500/10' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={importOptions[option.key]}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium text-slate-800 group-hover:text-slate-900">
                          {option.title}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Advanced configuration */}
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-6">
            <h5 className="font-semibold text-slate-800 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-slate-600" />
              Configuración avanzada
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de la hoja
                </label>
                <input
                  type="text"
                  value={importOptions.hoja}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, hoja: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="PUC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fila de inicio de datos
                </label>
                <input
                  type="number"
                  min="1"
                  value={importOptions.fila_inicio}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, fila_inicio: parseInt(e.target.value) || 3 }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Validation results */}
        {validationResult && (
          <div className={`rounded-xl p-6 border ${
            validationResult.es_valido 
              ? 'bg-emerald-50/80 border-emerald-200/60' 
              : 'bg-red-50/80 border-red-200/60'
          }`}>
            <div className="flex items-center mb-4">
              {validationResult.es_valido ? (
                <>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <FaCheckCircle className="text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-emerald-800 text-lg">
                    Archivo válido para importación
                  </h4>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <FaExclamationTriangle className="text-red-600" />
                  </div>
                  <h4 className="font-semibold text-red-800 text-lg">
                    Errores encontrados en el archivo
                  </h4>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">{validationResult.total_filas}</div>
                <div className="text-sm text-slate-600">Total filas</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{validationResult.filas_validas}</div>
                <div className="text-sm text-slate-600">Válidas</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{validationResult.errores?.length || 0}</div>
                <div className="text-sm text-slate-600">Errores</div>
              </div>
            </div>

            {validationResult.errores && validationResult.errores.length > 0 && (
              <div className="bg-white/60 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-700 mb-2">Errores encontrados:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {validationResult.errores.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <span className="font-medium">Fila {error.fila}:</span> {error.error}
                    </div>
                  ))}
                  {validationResult.errores.length > 5 && (
                    <p className="text-sm text-red-600 italic text-center py-2">
                      ... y {validationResult.errores.length - 5} errores más
                    </p>
                  )}
                </div>
              </div>
            )}

            {validationResult.advertencias && validationResult.advertencias.length > 0 && (
              <div className="bg-white/60 rounded-lg p-4">
                <p className="font-medium text-amber-700 mb-2">Advertencias:</p>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {validationResult.advertencias.slice(0, 3).map((advertencia, index) => (
                    <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      {advertencia}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information panel */}
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-6">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <FaInfoCircle className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Información importante</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Usa el template oficial para evitar errores de formato
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Valida el archivo antes de importar para detectar problemas
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Las cuentas padre deben existir antes que las cuentas hijas
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  El código de cuenta debe ser único en el sistema
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200/60">
          <Button
            onClick={handleClose}
            className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            Cancelar
          </Button>

          {file && !validationResult && (
            <Button
              onClick={handleValidateFile}
              disabled={isValidating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <FaEye />
                  <span>Validar Archivo</span>
                </>
              )}
            </Button>
          )}

          {validationResult && (
            <>
              <Button
                onClick={handleValidateFile}
                disabled={isValidating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
              >
                <FaEye />
                <span>Validar de nuevo</span>
              </Button>
              
              <Button
                onClick={handleImportFile}
                disabled={!validationResult.es_valido || loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <FaFileImport />
                    <span>Importar Datos</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportPucExcelModal;