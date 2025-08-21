// components/puc/PucDetailModal.jsx
import React from 'react';
import { 
  FaTree, 
  FaBalanceScale, 
  FaMoneyBillWave, 
  FaChartLine,
  FaEdit,
  FaArrowUp,
  FaArrowDown,
  FaTimes
} from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { 
  formatearSaldo, 
  formatearMovimientos, 
  obtenerColorNivel, 
  obtenerColorNaturaleza 
} from '../../utils/formatters';
import { obtenerIconoTipoCuenta } from '../../utils/pucUtils';

const PucDetailModal = ({ show, onClose, selectedAccount, onEditar }) => {
  if (!selectedAccount) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`${selectedAccount.codigo_completo}`}
      maxWidth="5xl"
    >
      <div className="relative space-y-8">
        
        {/* Header minimalista con glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <span className="text-2xl">{obtenerIconoTipoCuenta(selectedAccount.tipo_cuenta)}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedAccount.codigo_completo}</h3>
                <p className="text-slate-600 mt-1 max-w-md">{selectedAccount.descripcion || 'Sin descripción'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 backdrop-blur-sm border border-white/30 ${obtenerColorNivel(selectedAccount.nivel)}`}>
                <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                Nivel {selectedAccount.nivel} - {selectedAccount.tipo_cuenta}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de tarjetas minimalistas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Jerarquía PUC */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-3">
                  <FaTree className="text-emerald-600 text-lg" />
                </div>
                <h4 className="font-semibold text-slate-800 text-lg">Jerarquía PUC</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">ID</span>
                  <span className="font-medium text-slate-800">#{selectedAccount.id}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Código Completo</span>
                  <span className="font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                    {selectedAccount.codigo_completo}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Longitud</span>
                  <span className="font-medium text-slate-800">{selectedAccount.codigo_completo?.length} dígitos</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Nivel Calculado</span>
                  <span className="font-medium text-slate-800">{selectedAccount.nivel_calculado || selectedAccount.nivel}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Código Padre</span>
                  <span className="font-mono font-medium text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                    {selectedAccount.codigo_padre || 'N/A'}
                  </span>
                </div>

                {/* Códigos jerárquicos con colores */}
                <div className="pt-4 space-y-2">
                  {selectedAccount.codigo_clase && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Clase:</span>
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-mono border border-red-200">
                        {selectedAccount.codigo_clase}
                      </span>
                    </div>
                  )}
                  {selectedAccount.codigo_grupo && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Grupo:</span>
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-mono border border-orange-200">
                        {selectedAccount.codigo_grupo}
                      </span>
                    </div>
                  )}
                  {selectedAccount.codigo_cuenta && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Cuenta:</span>
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-mono border border-yellow-200">
                        {selectedAccount.codigo_cuenta}
                      </span>
                    </div>
                  )}
                  {selectedAccount.codigo_subcuenta && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Subcuenta:</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-mono border border-emerald-200">
                        {selectedAccount.codigo_subcuenta}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Clasificación */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <FaBalanceScale className="text-blue-600 text-lg" />
                </div>
                <h4 className="font-semibold text-slate-800 text-lg">Clasificación</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Naturaleza</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${obtenerColorNaturaleza(selectedAccount.naturaleza)}`}>
                    {selectedAccount.naturaleza}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Estado</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAccount.estado === 'ACTIVA' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {selectedAccount.estado}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Acepta Movimientos</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedAccount.acepta_movimientos ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      selectedAccount.acepta_movimientos ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {selectedAccount.acepta_movimientos ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saldos */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-3">
                  <FaMoneyBillWave className="text-emerald-600 text-lg" />
                </div>
                <h4 className="font-semibold text-slate-800 text-lg">Saldos</h4>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50/80 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Saldo Inicial</div>
                  <div className="text-2xl font-bold text-slate-800 font-mono">
                    {formatearSaldo(selectedAccount.saldo_inicial)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-50/80 to-emerald-50/80 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Saldo Final</div>
                  <div className={`text-2xl font-bold font-mono ${
                    (selectedAccount.saldo_final || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatearSaldo(selectedAccount.saldo_final)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movimientos */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                  <FaChartLine className="text-purple-600 text-lg" />
                </div>
                <h4 className="font-semibold text-slate-800 text-lg">Movimientos</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-red-50/60 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaArrowDown className="text-red-500 mr-3" />
                    <span className="text-sm text-slate-600">Mov. Débitos</span>
                  </div>
                  <span className="font-mono font-medium text-red-600">
                    {formatearMovimientos(selectedAccount.movimientos_debitos)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between bg-emerald-50/60 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaArrowUp className="text-emerald-500 mr-3" />
                    <span className="text-sm text-slate-600">Mov. Créditos</span>
                  </div>
                  <span className="font-mono font-medium text-emerald-600">
                    {formatearMovimientos(selectedAccount.movimientos_creditos)}
                  </span>
                </div>
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Total Movimientos</span>
                    <span className="font-mono font-bold text-slate-800 text-lg">
                      {formatearMovimientos((selectedAccount.movimientos_debitos || 0) + (selectedAccount.movimientos_creditos || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de auditoría (si existe) */}
        {(selectedAccount.fecha_creacion || selectedAccount.fecha_actualizacion) && (
          <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-200/40 rounded-xl p-6">
            <h4 className="font-semibold text-slate-800 mb-4 text-lg">Información de Auditoría</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedAccount.fecha_creacion && (
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Fecha de Creación</div>
                  <div className="text-slate-700 font-medium">
                    {new Date(selectedAccount.fecha_creacion).toLocaleString('es-CO')}
                  </div>
                </div>
              )}
              {selectedAccount.fecha_actualizacion && (
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">Última Actualización</div>
                  <div className="text-slate-700 font-medium">
                    {new Date(selectedAccount.fecha_actualizacion).toLocaleString('es-CO')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción minimalistas */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200/60">
          <Button
            onClick={() => {
              onClose();
              onEditar(selectedAccount);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
          >
            <FaEdit className="text-sm" />
            <span>Editar Cuenta</span>
          </Button>
          <Button
            onClick={onClose}
            className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/25"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PucDetailModal;