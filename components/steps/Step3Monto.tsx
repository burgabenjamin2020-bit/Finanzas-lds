import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormularioGastosFormData } from '../../lib/schemas';

interface Step3Props {
  form: UseFormReturn<FormularioGastosFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3Monto({ form, onNext, onPrevious }: Step3Props) {
  const {
    register,
    formState: { errors },
    trigger,
    watch,
  } = form;

  const montoTotal = watch('montoTotal');

  const handleNext = async () => {
    const isValid = await trigger(['montoTotal']);

    const values = form.getValues();
    const hasValidAmount = values.montoTotal && values.montoTotal > 0;

    if (isValid && hasValidAmount) {
      onNext();
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="text-center mb-8 w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Monto Solicitado</h2>
          <p className="text-gray-500 text-sm">Especifique el monto total requerido</p>
        </div>

        <div className="w-full space-y-6 max-w-md">
          {/* Monto Total */}
          <div className="space-y-2">
            <label htmlFor="montoTotal" className="text-sm font-medium text-gray-700">
              Monto Total (S/) *
            </label>
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 h-24 w-full">
                <span className="text-3xl font-bold text-gray-600 pl-6 select-none">S/</span>
                <input
                  id="montoTotal"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="h-full text-5xl font-bold text-center border-0 bg-transparent focus:ring-0 focus:outline-none shadow-none pr-6 flex-1"
                  {...register('montoTotal', { valueAsNumber: true })}
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                />
              </div>
            </div>
            {errors.montoTotal && (
              <p className="text-sm text-red-500">{errors.montoTotal.message}</p>
            )}
          </div>

          {/* Información importante */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>• El monto debe ser exacto según la solicitud</p>
            <p>• Se requiere documentación de respaldo</p>
            <p>• Los fondos están sujetos a aprobación</p>
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
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
