import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormularioGastosFormData } from '../../lib/schemas';

interface Step1Props {
  form: UseFormReturn<FormularioGastosFormData>;
  onNext: () => void;
  onQuestionChange?: (questionNumber: number) => void;
}

export function Step1DatosPersonales({ form, onNext, onQuestionChange }: Step1Props) {
  const [subStep, setSubStep] = useState(1);
  const {
    register,
    formState: { errors },
    trigger,
    watch,
  } = form;

  const currentValues = watch();

  // Notificar cambio de pregunta cuando cambia el sub-step
  useEffect(() => {
    if (onQuestionChange) {
      onQuestionChange(subStep);
    }
  }, [subStep, onQuestionChange]);

  const handleSubNext = async () => {
    if (subStep === 1) {
      const isValid = await trigger('nombreSolicitante');
      const value = form.getValues('nombreSolicitante');
      if (isValid && value && value.trim() !== '') {
        setSubStep(2);
      }
    } else if (subStep === 2) {
      const isValid = await trigger('nombreCobrador');
      const value = form.getValues('nombreCobrador');
      if (isValid && value && value.trim() !== '') {
        setSubStep(3);
      }
    } else if (subStep === 3) {
      const isValid = await trigger('fecha');
      const value = form.getValues('fecha');
      if (isValid && value && value.trim() !== '') {
        onNext();
      }
    }
  };

  const handleSubPrevious = () => {
    if (subStep > 1) {
      setSubStep(subStep - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubNext();
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        
        {/* Sub-paso 1: Nombre del Solicitante */}
        {subStep === 1 && (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Para empezar, ¿cuál es tu nombre completo?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Escribe tu nombre aquí...
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombres y apellidos completos"
                autoFocus
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-green-500 outline-none transition bg-transparent"
                {...register('nombreSolicitante')}
              />
              {errors.nombreSolicitante && (
                <p className="text-sm text-red-500 mt-2">{errors.nombreSolicitante.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Sub-paso 2: Nombre del Cobrador */}
        {subStep === 2 && (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              ¿Quién será el cobrador?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Nombre de la persona que cobrará...
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombres y apellidos del cobrador"
                autoFocus
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-blue-500 outline-none transition bg-transparent"
                {...register('nombreCobrador')}
              />
              {errors.nombreCobrador && (
                <p className="text-sm text-red-500 mt-2">{errors.nombreCobrador.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Sub-paso 3: Fecha */}
        {subStep === 3 && (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              ¿Para qué fecha es esta solicitud?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Selecciona la fecha...
            </p>
            <div className="space-y-4">
              <input
                type="date"
                autoFocus
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-purple-500 outline-none transition bg-transparent"
                {...register('fecha')}
              />
              {errors.fecha && (
                <p className="text-sm text-red-500 mt-2">{errors.fecha.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="flex justify-center items-center gap-4 mt-12 pb-6 sm:pb-8">
        {subStep > 1 && (
          <button
            type="button"
            onClick={handleSubPrevious}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSubNext}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition shadow-lg"
        >
          {subStep === 3 ? 'Continuar' : 'Siguiente'}
        </button>
      </div>

      {/* Indicador de progreso */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition ${
                step <= subStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
