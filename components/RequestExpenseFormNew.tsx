import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseRequest, View } from '../types';
import Button from './common/Button';
import { CheckCircleIcon } from './icons/Icons';
import { CustomLoadingModal } from './common/CustomLoadingModal';
import { PDFSuccessModal } from './common/PDFSuccessModal';
import { RequestSentModal } from './common/RequestSentModal';
import { Step1DatosPersonales } from './steps/Step1DatosPersonales';
import { Step2Proposito } from './steps/Step2Proposito';
import { Step3Monto } from './steps/Step3Monto';
import { Step4Revision } from './steps/Step4Revision';
import { formularioGastosSchema, FormularioGastosFormData } from '../lib/schemas';
import { useDraftStore } from '../lib/stores/draft-store';
import { fillPDFTemplate, downloadPDF } from '../lib/pdf-writer';

interface RequestExpenseFormProps {
  onRequestCreated: (request: Omit<ExpenseRequest, 'id' | 'status'>) => void;
  setView: (view: View) => void;
}

const playSuccessSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const RequestExpenseForm: React.FC<RequestExpenseFormProps> = ({ onRequestCreated, setView }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showRequestSentModal, setShowRequestSentModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState<{
    pdfBytes: Uint8Array;
    filename: string;
  } | null>(null);

  // Estado para tracking de sub-pasos
  const [currentSubStep, setCurrentSubStep] = useState(1);
  const [totalQuestions] = useState(8); // Total de preguntas individuales: 3 + 3 + 1 + 1
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const form = useForm<FormularioGastosFormData>({
    resolver: zodResolver(formularioGastosSchema),
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  // Cargar borrador al montar
  useEffect(() => {
    const draft = useDraftStore.loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      Object.entries(draft).forEach(([key, value]) => {
        form.setValue(key as keyof FormularioGastosFormData, value as any);
      });
    }
  }, [form]);

  // Auto-guardar cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentData = form.getValues();
      useDraftStore.saveDraft(currentData);
    }, 30000);

    return () => clearInterval(interval);
  }, [form]);

  // Actualizar número de pregunta para pasos simples (3 y 4)
  useEffect(() => {
    if (currentStep === 3) {
      handleQuestionChange(7); // Pregunta del monto
    } else if (currentStep === 4) {
      handleQuestionChange(8); // Pregunta de revisión
    }
  }, [currentStep]);

  const handleNext = () => {
    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });
    
    // Actualizar número de pregunta actual basado en el paso
    if (currentStep === 1) {
      setCurrentQuestionNumber(4); // Paso 2 empieza en pregunta 4
    } else if (currentStep === 2) {
      setCurrentQuestionNumber(7); // Paso 3 empieza en pregunta 7 (monto)
    } else if (currentStep === 3) {
      setCurrentQuestionNumber(8); // Paso 4 empieza en pregunta 8 (revisión)
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    // Auto-guardar cuando avanzan
    const currentData = form.getValues();
    useDraftStore.saveDraft(currentData);
  };

  // Función para actualizar el número de pregunta actual
  const handleQuestionChange = (questionNumber: number) => {
    setCurrentQuestionNumber(questionNumber);
  };

  const handlePrevious = () => {
    // Actualizar número de pregunta actual basado en el paso anterior
    if (currentStep === 2) {
      setCurrentQuestionNumber(1); // Volver al paso 1, pregunta 1
    } else if (currentStep === 3) {
      setCurrentQuestionNumber(4); // Volver al paso 2, pregunta 4
    } else if (currentStep === 4) {
      setCurrentQuestionNumber(7); // Volver al paso 3, pregunta 7
    }
    
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleDownloadPDF = () => {
    if (generatedPDF) {
      downloadPDF(generatedPDF.pdfBytes, generatedPDF.filename);
    }
  };

  const handleViewPDF = () => {
    if (generatedPDF) {
      const blob = new Blob([new Uint8Array(generatedPDF.pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setGeneratedPDF(null);
    // Resetear el formulario para nueva solicitud
    form.reset({
      fecha: format(new Date(), 'yyyy-MM-dd'),
    });
    setCurrentStep(1);
    setCurrentQuestionNumber(1);
  };

  const handleSendRequest = () => {
    setShowSuccessModal(false);
    setGeneratedPDF(null);
    setShowRequestSentModal(true);
  };

  const handleBackToSummary = () => {
    setShowSuccessModal(false);
    setGeneratedPDF(null);
    setCurrentStep(4);
  };

  const handleViewPendientes = () => {
    setShowRequestSentModal(false);
    setView(View.PENDING_REPORTS);
  };

  const handleBackToHome = () => {
    setShowRequestSentModal(false);
    setView(View.DASHBOARD);
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      playSuccessSound();

      // Simular delay mínimo de 2 segundos para mostrar la animación
      const startTime = Date.now();
      
      const data = form.getValues();
      
      // Generar PDF
      const pdfBytes = await fillPDFTemplate(data);

      // Crear nombre del archivo
      const filename = `Solicitud-Gastos-${data.nombreSolicitante.replace(
        /\s+/g,
        "-"
      )}-${format(new Date(), "dd-MM-yyyy")}.pdf`;

      // Asegurar que han pasado al menos 2 segundos
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Guardar PDF generado y mostrar modal de éxito
      setGeneratedPDF({ pdfBytes, filename });
      setShowSuccessModal(true);

      // Mapear los datos al formato de ExpenseRequest
      const newRequestData: Omit<ExpenseRequest, 'id' | 'status'> = {
        amount: data.montoTotal,
        reason: data.descripcionComplemento,
        date: data.fecha,
        applicantName: data.nombreSolicitante,
        payeeName: data.nombreCobrador,
        organization: data.organizacion === 'Otros' ? data.organizacionOtra || 'Otros' : data.organizacion,
      };

      onRequestCreated(newRequestData);
      useDraftStore.clearDraft();
    } catch (error) {
      console.error('Error generating request:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (submitted) {
    // Ya no mostrar esta página, ahora usamos el modal
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Custom Loading Modal */}
      <CustomLoadingModal
        isVisible={isGenerating}
        title="Generando PDF"
        message="Por favor espere mientras procesamos su solicitud..."
      />
      
      {/* Success Modal */}
      <PDFSuccessModal
        isVisible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onDownload={handleDownloadPDF}
        onView={handleViewPDF}
        onSendRequest={handleSendRequest}
        onBack={handleBackToSummary}
        fileName={generatedPDF?.filename || ""}
      />

      {/* Request Sent Modal */}
      <RequestSentModal
        isVisible={showRequestSentModal}
        onViewPendientes={handleViewPendientes}
        onBackToHome={handleBackToHome}
      />
      
      {/* Header */}
      <div className="flex-none px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
            Solicitar Gastos
          </h1>
          
          {/* Step Progress - Desktop */}
          <div className="hidden sm:flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-500 text-white'
                    : completedSteps.includes(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {completedSteps.includes(step) ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 ${
                    completedSteps.includes(step)
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Step Progress - Mobile (Minimalista) */}
          <div className="sm:hidden flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === currentStep
                        ? 'bg-blue-500'
                        : completedSteps.includes(step)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-3">
                {currentQuestionNumber} de {totalQuestions}
              </span>
            </div>
          </div>
          
          <div className="hidden sm:block text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Pregunta {currentQuestionNumber} de {totalQuestions}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full p-4 pb-6 sm:pb-4">
          <div className="max-w-4xl mx-auto h-full">
            <div className="h-full">
              {currentStep === 1 && (
                <Step1DatosPersonales 
                  form={form} 
                  onNext={handleNext}
                  onQuestionChange={handleQuestionChange}
                />
              )}
              {currentStep === 2 && (
                <Step2Proposito 
                  form={form} 
                  onNext={handleNext} 
                  onPrevious={handlePrevious}
                  onQuestionChange={handleQuestionChange}
                />
              )}
              {currentStep === 3 && (
                <Step3Monto form={form} onNext={handleNext} onPrevious={handlePrevious} />
              )}
              {currentStep === 4 && (
                <Step4Revision
                  form={form}
                  onPrevious={handlePrevious}
                  onGeneratePDF={handleGeneratePDF}
                  isGenerating={isGenerating}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation - Solo mostrar en desktop o para información adicional */}
      <div className="hidden sm:flex flex-none px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Guardado automático • Pregunta {currentQuestionNumber} de {totalQuestions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestExpenseForm;