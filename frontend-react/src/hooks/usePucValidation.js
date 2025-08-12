// hooks/usePucValidation.js
import { useMemo } from 'react';
import { 
  validarCodigoJerarquia, 
  determinarTipoPorCodigo, 
  determinarNivelPorCodigo, 
  determinarNaturalezaPorClase, 
  sugerirCodigoPadre,
  extraerCodigosJerarquia
} from '../utils/pucUtils';

export const usePucValidation = (formData) => {
  // Análisis jerárquico automático
  const analisisJerarquico = useMemo(() => {
    if (!formData.codigo_completo) return null;

    return {
      tipoSugerido: determinarTipoPorCodigo(formData.codigo_completo),
      nivel: determinarNivelPorCodigo(formData.codigo_completo),
      naturalezaSugerida: determinarNaturalezaPorClase(formData.codigo_completo),
      padreSugerido: sugerirCodigoPadre(formData.codigo_completo),
      codigosJerarquia: extraerCodigosJerarquia(formData.codigo_completo),
      longitud: formData.codigo_completo.length
    };
  }, [formData.codigo_completo]);

  // Validación en tiempo real
  const validacion = useMemo(() => {
    if (!formData.codigo_completo) return { valido: false, errores: [] };

    return validarCodigoJerarquia(
      formData.codigo_completo,
      formData.tipo_cuenta,
      formData.codigo_padre
    );
  }, [formData.codigo_completo, formData.tipo_cuenta, formData.codigo_padre]);

  // Datos enriquecidos para envío
  const datosEnriquecidos = useMemo(() => {
    if (!analisisJerarquico) return formData;

    return {
      ...formData,
      nivel: analisisJerarquico.nivel,
      naturaleza: formData.naturaleza || analisisJerarquico.naturalezaSugerida,
      ...analisisJerarquico.codigosJerarquia
    };
  }, [formData, analisisJerarquico]);

  // Sugerencias automáticas
  const aplicarSugerencias = () => {
    if (!analisisJerarquico) return formData;

    return {
      ...formData,
      tipo_cuenta: analisisJerarquico.tipoSugerido || formData.tipo_cuenta,
      naturaleza: analisisJerarquico.naturalezaSugerida || formData.naturaleza,
      codigo_padre: analisisJerarquico.padreSugerido || formData.codigo_padre
    };
  };

  return {
    analisisJerarquico,
    validacion,
    datosEnriquecidos,
    aplicarSugerencias
  };
};