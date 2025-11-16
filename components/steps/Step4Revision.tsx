import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormularioGastosFormData } from '../../lib/schemas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Step4Props {
  form: UseFormReturn<FormularioGastosFormData>;
  onPrevious: () => void;
  onGeneratePDF: () => void;
  isGenerating: boolean;
}

export function Step4Revision({ form, onPrevious, onGeneratePDF, isGenerating }: Step4Props) {
  const formData = form.getValues();

  const organizacionTexto =
    formData.organizacion === 'Otros' ? formData.organizacionOtra || 'Otros' : formData.organizacion;

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <div className="text-center mb-8 w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Revisión y Confirmación</h2>
          <p className="text-gray-500 text-sm">Verifique los datos antes de generar el PDF</p>
        </div>

        <div className="w-full space-y-6 max-w-2xl">
          {/* Resumen de datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Datos Personales */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="font-medium text-blue-900 text-sm sm:text-base">Datos del Solicitante</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Solicitante:</span>
                  <span className="font-medium text-right">{formData.nombreSolicitante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cobrador:</span>
                  <span className="font-medium text-right">{formData.nombreCobrador}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {formData.fecha &&
                      format(new Date(formData.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            {/* Propósito */}
            <div className="bg-green-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="font-medium text-green-900 text-sm sm:text-base">Propósito del Gasto</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Descripción:</span>
                  <p className="font-medium mt-1 text-sm sm:text-base">
                    "Fortalecer la fe de los miembros a través de {formData.descripcionComplemento}"
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organización:</span>
                  <span className="font-medium">{organizacionTexto}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monto - Span completo */}
          <div className="bg-purple-50 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-medium text-purple-900 text-sm sm:text-base">Monto Solicitado</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-800">
                {new Intl.NumberFormat('es-PE', {
                  style: 'currency',
                  currency: 'PEN',
                }).format(formData.montoTotal || 0)}
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-2">
            <p>• Verifique que todos los datos sean correctos</p>
            <p>• El PDF generado será el documento oficial</p>
            <p>• Puede volver atrás para hacer correcciones</p>
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="flex gap-4 justify-center mt-12 pb-6 sm:pb-8">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onGeneratePDF}
          disabled={isGenerating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Generar PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
