import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormularioGastosFormData, Organizacion } from '../../lib/schemas';

interface Step2Props {
  form: UseFormReturn<FormularioGastosFormData>;
  onNext: () => void;
  onPrevious: () => void;
  onQuestionChange?: (questionNumber: number) => void;
}

export function Step2Proposito({ form, onNext, onPrevious, onQuestionChange }: Step2Props) {
  const {
    register,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = form;

  const [showOtrosInput, setShowOtrosInput] = useState(false);
  const [currentSubStep, setCurrentSubStep] = useState(0); // 0: descripción, 1: organización, 2: otros (si aplica)
  const organizacion = watch('organizacion');

  useEffect(() => {
    setShowOtrosInput(organizacion === 'Otros');
  }, [organizacion]);

  // Notificar cambio de pregunta cuando cambia el sub-step
  useEffect(() => {
    if (onQuestionChange) {
      // Step 2 empieza en pregunta 4, entonces: 4 + currentSubStep
      onQuestionChange(4 + currentSubStep);
    }
  }, [currentSubStep, onQuestionChange]);

  const handleNext = async () => {
    if (currentSubStep === 0) {
      // Validar descripción
      const isValid = await trigger(['descripcionComplemento']);
      const descripcion = form.getValues('descripcionComplemento');
      
      if (isValid && descripcion && descripcion.trim() !== '') {
        setCurrentSubStep(1);
      }
    } else if (currentSubStep === 1) {
      // Validar organización
      const isValid = await trigger(['organizacion']);
      const org = form.getValues('organizacion');
      
      if (isValid && org && org.trim() !== '') {
        if (org === 'Otros') {
          setCurrentSubStep(2);
        } else {
          onNext();
        }
      }
    } else if (currentSubStep === 2) {
      // Validar organización "Otros"
      const isValid = await trigger(['organizacionOtra']);
      const orgOtra = form.getValues('organizacionOtra');
      
      if (isValid && orgOtra && orgOtra.trim() !== '') {
        onNext();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else {
      onPrevious();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const organizacionOptions: Organizacion[] = [
    'Sociedad de Socorro',
    'Cuórum de Elderes',
    'Jas',
    'Primaria',
    'Administración',
    'Otros',
  ];

  const renderCurrentStep = () => {
    switch (currentSubStep) {
      case 0:
        return (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              ¿Cuál es el propósito de este gasto?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Complete la frase...
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg mb-4">
                "Fortalecer la fe de los miembros a través de..."
              </div>
              <textarea
                id="descripcionComplemento"
                placeholder="Ej: actividades espirituales, servicio comunitario, talleres educativos..."
                rows={4}
                autoFocus
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-green-500 outline-none transition bg-transparent resize-none"
                {...register('descripcionComplemento')}
              />
              {errors.descripcionComplemento && (
                <p className="text-sm text-red-500 mt-2">{errors.descripcionComplemento.message}</p>
              )}
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              ¿Qué organización es responsable?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Selecciona la organización...
            </p>
            <div className="space-y-4">
              <select
                id="organizacion"
                autoFocus
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-blue-500 outline-none transition bg-transparent"
                {...register('organizacion')}
              >
                <option value="">Seleccione una organización</option>
                {organizacionOptions.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
              {errors.organizacion && (
                <p className="text-sm text-red-500 mt-2">{errors.organizacion.message}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center w-full max-w-md animate-fade-in-up">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Especifica la organización
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Escribe el nombre de la organización...
            </p>
            <div className="space-y-4">
              <input
                id="organizacionOtra"
                type="text"
                placeholder="Nombre de la organización"
                autoFocus
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-lg text-center border-b-2 border-gray-200 focus:border-purple-500 outline-none transition bg-transparent"
                {...register('organizacionOtra')}
              />
              {errors.organizacionOtra && (
                <p className="text-sm text-red-500 mt-2">{errors.organizacionOtra.message}</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {renderCurrentStep()}
      </div>

      {/* Footer con botones */}
      <div className="flex gap-4 justify-center mt-12 pb-6 sm:pb-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
        >
          {(currentSubStep === 1 && organizacion !== 'Otros') || currentSubStep === 2 ? 'Siguiente' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
