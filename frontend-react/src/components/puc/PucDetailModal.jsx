// components/puc/PucDetailModal.jsx
import React from 'react';
import { 
  FaTree, 
  FaBalanceScale, 
  FaMoneyBillWave, 
  FaChartLine,
  FaEdit,
  FaArrowUp,
  FaArrowDown
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
      title={`Detalles Completos - ${selectedAccount.codigo_completo}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header con información principal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{obtenerIconoTipoCuenta(selectedAccount.tipo_cuenta)}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedAccount.codigo_completo}</h3>
                <p className="text-gray-600">{selectedAccount.descripcion || 'Sin descripción'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorNivel(selectedAccount.nivel)}`}>
                Nivel {selectedAccount.nivel} - {selectedAccount.tipo_cuenta}
              </span>
            </div>
          </div>
        </div>

        {/* Grid con información jerárquica */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Información jerárquica */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaTree className="mr-2 text-green-600" />
              Jerarquía PUC
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> #{selectedAccount.id}</div>
              <div><strong>Código Completo:</strong> <span className="font-mono">{selectedAccount.codigo_completo}</span></div>
              <div><strong>Longitud:</strong> {selectedAccount.codigo_completo?.length} dígitos</div>
              <div><strong>Nivel Calculado:</strong> {selectedAccount.nivel_calculado || selectedAccount.nivel}</div>
              <div><strong>Código Padre:</strong> <span className="font-mono">{selectedAccount.codigo_padre || 'N/A'}</span></div>
              
              {/* Mostrar jerarquía completa */}
              {selectedAccount.codigo_clase && (
                <div><strong>Clase:</strong> <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded font-mono text-xs">{selectedAccount.codigo_clase}</span></div>
              )}
              {selectedAccount.codigo_grupo && (
                <div><strong>Grupo:</strong> <span className="px-1 py-0.5 bg-orange-100 text-orange-700 rounded font-mono text-xs">{selectedAccount.codigo_grupo}</span></div>
              )}
              {selectedAccount.codigo_cuenta && (
                <div><strong>Cuenta:</strong> <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono text-xs">{selectedAccount.codigo_cuenta}</span></div>
              )}
              {selectedAccount.codigo_subcuenta && (
                <div><strong>Subcuenta:</strong> <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded font-mono text-xs">{selectedAccount.codigo_subcuenta}</span></div>
              )}
            </div>
          </div>

          {/* Clasificación */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaBalanceScale className="mr-2 text-blue-600" />
              Clasificación
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Naturaleza:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${obtenerColorNaturaleza(selectedAccount.naturaleza)}`}>
                  {selectedAccount.naturaleza}
                </span>
              </div>
              <div><strong>Estado:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedAccount.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAccount.estado}
                </span>
              </div>
              <div><strong>Acepta Movimientos:</strong> 
                <span className={`ml-1 ${selectedAccount.acepta_movimientos ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedAccount.acepta_movimientos ? '✓ Sí' : '✗ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Saldos */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              Saldos
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Saldo Inicial:</strong> 
                <span className="ml-1 font-mono">{formatearSaldo(selectedAccount.saldo_inicial)}</span>
              </div>
              <div><strong>Saldo Final:</strong> 
                <span className={`ml-1 font-mono ${
                  (selectedAccount.saldo_final || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatearSaldo(selectedAccount.saldo_final)}
                </span>
              </div>
            </div>
          </div>

          {/* Movimientos */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaChartLine className="mr-2 text-purple-600" />
              Movimientos
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <FaArrowDown className="text-red-500 mr-2" />
                <strong>Mov. Débitos:</strong> 
                <span className="ml-1 font-mono text-red-600">
                  {formatearMovimientos(selectedAccount.movimientos_debitos)}
                </span>
              </div>
              <div className="flex items-center">
                <FaArrowUp className="text-green-500 mr-2" />
                <strong>Mov. Créditos:</strong> 
                <span className="ml-1 font-mono text-green-600">
                  {formatearMovimientos(selectedAccount.movimientos_creditos)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <strong>Total Movimientos:</strong> 
                <span className="ml-1 font-mono text-gray-800">
                  {formatearMovimientos((selectedAccount.movimientos_debitos || 0) + (selectedAccount.movimientos_creditos || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional si existe */}
        {(selectedAccount.fecha_creacion || selectedAccount.fecha_actualizacion) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Información de Auditoría</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {selectedAccount.fecha_creacion && (
                <div>
                  <strong>Fecha de Creación:</strong>
                  <div className="text-gray-600">
                    {new Date(selectedAccount.fecha_creacion).toLocaleString('es-CO')}
                  </div>
                </div>
              )}
              {selectedAccount.fecha_actualizacion && (
                <div>
                  <strong>Última Actualización:</strong>
                  <div className="text-gray-600">
                    {new Date(selectedAccount.fecha_actualizacion).toLocaleString('es-CO')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            onClick={() => {
              onClose();
              onEditar(selectedAccount);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            icon={FaEdit}
          >
            Editar Cuenta
          </Button>
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PucDetailModal;