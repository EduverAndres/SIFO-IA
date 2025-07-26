// frontend-react/src/components/puc/ExportPucModal.jsx - VERSION BÁSICA CON API REAL
import React, { useState } from 'react';
import { pucApi } from '../../api/pucApi'; // ✅ IMPORTAR LA API

// ✅ CONSOLE LOG PARA VERIFICAR QUE EL ARCHIVO SE CARGA
console.log('🔍 ExportPucModal.jsx - Archivo cargado correctamente');

const ExportPucModal = ({ visible, onCancel }) => {
  // ✅ CONSOLE LOGS PARA DEBUGGING
  console.log('🔍 ExportPucModal renderizado - Props recibidas:', { visible, onCancel });
  console.log('🔍 Tipo de visible:', typeof visible, 'Valor:', visible);
  
  const [loading, setLoading] = useState(false);
  const [opciones, setOpciones] = useState({
    incluir_saldos: true,
    incluir_movimientos: true,
    incluir_fiscal: false,
    filtro_estado: '',
    filtro_tipo: '',
    filtro_clase: '',
    solo_movimientos: false,
    incluir_inactivas: false
  });

  // ✅ CONSOLE LOG ADICIONAL PARA VERIFICAR CUANDO CAMBIA visible
  React.useEffect(() => {
    console.log('🔍 ExportPucModal - useEffect - visible cambió a:', visible);
  }, [visible]);

  // ✅ FUNCIÓN REAL DE EXPORTACIÓN USANDO LA API
  const handleExport = async () => {
    try {
      console.log('🚀 Iniciando exportación real con opciones:', opciones);
      setLoading(true);
      
      // ✅ LLAMAR AL ENDPOINT REAL
      const resultado = await pucApi.exportarAExcel(opciones);
      
      console.log('✅ Exportación completada:', resultado);
      
      // Mostrar mensaje de éxito (opcional)
      alert(`✅ Archivo exportado: ${resultado.fileName}`);
      
      // Cerrar modal
      onCancel();
      
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      
      // Mostrar error al usuario
      alert(`❌ Error exportando: ${error.message || 'Error desconocido'}`);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA CAMBIAR OPCIONES
  const handleOpcionChange = (campo, valor) => {
    console.log('🔍 Cambiando opción:', campo, 'a:', valor);
    setOpciones(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // ✅ CONSOLE LOG PARA VERIFICAR CUANDO NO SE RENDERIZA
  if (!visible) {
    console.log('🔍 ExportPucModal NO se renderiza porque visible es:', visible);
    return null;
  }

  console.log('🔍 ExportPucModal SE VA A RENDERIZAR - visible es true');

  // ✅ VERSION BÁSICA CON TODAS LAS OPCIONES DE EXPORTACIÓN
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>📊 Exportar Plan Único de Cuentas</h2>
        
        <p>Configura las opciones de exportación para generar el archivo Excel del PUC.</p>
        
        {/* ✅ OPCIONES DE CONTENIDO */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3>📋 Contenido a Exportar:</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={opciones.incluir_saldos}
                onChange={(e) => handleOpcionChange('incluir_saldos', e.target.checked)}
              />
              Incluir Saldos Actuales
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={opciones.incluir_movimientos}
                onChange={(e) => handleOpcionChange('incluir_movimientos', e.target.checked)}
              />
              Incluir Movimientos
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={opciones.incluir_fiscal}
                onChange={(e) => handleOpcionChange('incluir_fiscal', e.target.checked)}
              />
              Incluir Info Fiscal
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={opciones.solo_movimientos}
                onChange={(e) => handleOpcionChange('solo_movimientos', e.target.checked)}
              />
              Solo con Movimientos
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={opciones.incluir_inactivas}
                onChange={(e) => handleOpcionChange('incluir_inactivas', e.target.checked)}
              />
              Incluir Inactivas
            </label>
          </div>
        </div>

        {/* ✅ FILTROS */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3>🔍 Filtros:</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado:</label>
              <select 
                value={opciones.filtro_estado}
                onChange={(e) => handleOpcionChange('filtro_estado', e.target.value)}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">Todos</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="INACTIVA">Solo Inactivas</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo:</label>
              <select 
                value={opciones.filtro_tipo}
                onChange={(e) => handleOpcionChange('filtro_tipo', e.target.value)}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">Todos</option>
                <option value="CLASE">Clases</option>
                <option value="GRUPO">Grupos</option>
                <option value="CUENTA">Cuentas</option>
                <option value="SUBCUENTA">Subcuentas</option>
                <option value="DETALLE">Detalles</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Clase:</label>
              <select 
                value={opciones.filtro_clase}
                onChange={(e) => handleOpcionChange('filtro_clase', e.target.value)}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">Todas</option>
                <option value="1">1 - Activos</option>
                <option value="2">2 - Pasivos</option>
                <option value="3">3 - Patrimonio</option>
                <option value="4">4 - Ingresos</option>
                <option value="5">5 - Gastos</option>
                <option value="6">6 - Costos</option>
                <option value="7">7 - Costos de Producción</option>
                <option value="8">8 - Cuentas de Orden Deudoras</option>
                <option value="9">9 - Cuentas de Orden Acreedoras</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ INFORMACIÓN DEL FORMATO */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #90caf9', 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>📄 Información del Archivo:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1976d2' }}>
            <li>Formato: Excel (.xlsx)</li>
            <li>Estructura: Compatible con importación</li>
            <li>Descarga automática al completar</li>
            <li>Incluye todos los campos del PUC</li>
          </ul>
        </div>
        
        {/* ✅ BOTONES DE ACCIÓN */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleExport}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Exportando...' : '📊 Exportar PUC'}
          </button>
        </div>
        
        {/* ✅ DEBUG INFO */}
        <details style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 Debug Info (Click para expandir)</summary>
          <div style={{ marginTop: '10px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            <strong>Props:</strong> {JSON.stringify({ visible, onCancel: typeof onCancel }, null, 2)}
            <br /><br />
            <strong>Estado:</strong> {JSON.stringify({ loading }, null, 2)}
            <br /><br />
            <strong>Opciones:</strong> {JSON.stringify(opciones, null, 2)}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ExportPucModal;