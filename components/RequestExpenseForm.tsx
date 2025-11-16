import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseRequest, View } from '../types';
import Button from './common/Button';
import { CheckCircleIcon } from './icons/Icons';
import { LoadingModal } from './common/LoadingModal';
import { PDFSuccessModal } from './common/PDFSuccessModal';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState<{
    pdfBytes: Uint8Array;
    filename: string;
  } | null>(null);

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

  const handleNext = () => {
    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    // Auto-guardar cuando avanzan
    const currentData = form.getValues();
    useDraftStore.saveDraft(currentData);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      playSuccessSound();

      const data = form.getValues();
      
      // Generar PDF
      const pdfBytes = await fillPDFTemplate(data);

      // Crear nombre del archivo
      const filename = `Solicitud-Gastos-${data.nombreSolicitante.replace(
        /\s+/g,
        "-"
      )}-${format(new Date(), "dd-MM-yyyy")}.pdf`;

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
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (generatedPDF) {
      downloadPDF(generatedPDF.pdfBytes, generatedPDF.filename);
    }
  };

  const handleViewPDF = () => {
    if (generatedPDF) {
      // Crear URL para visualizar el PDF
      const blob = new Blob([new Uint8Array(generatedPDF.pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const handleSharePDF = async () => {
    if (generatedPDF && navigator.share) {
      try {
        const file = new File([new Uint8Array(generatedPDF.pdfBytes)], generatedPDF.filename, {
          type: "application/pdf",
        });
        await navigator.share({
          title: "Solicitud de Gastos",
          text: "Compartiendo solicitud de gastos",
          files: [file],
        });
      } catch (error) {
        // Fallback si no se puede compartir
        handleDownloadPDF();
      }
    } else {
      // Fallback: descargar
      handleDownloadPDF();
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setGeneratedPDF(null);
    setIsGenerating(false);
    setSubmitted(true); // Mostrar la pantalla de éxito final
  };

  const handleBackToSummary = () => {
    setShowSuccessModal(false);
    setGeneratedPDF(null);
    setIsGenerating(false);
    // Volver al step 4 (resumen) sin reiniciar
    setCurrentStep(4);
  };

  if (submitted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-fade-in-up">
        <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-3">
          ¡Solicitud Enviada!
        </h2>
        <p className="text-text-secondary dark:text-dark-text-secondary max-w-md mb-8">
          Tu solicitud ha sido generada y enviada correctamente. Puedes revisar su estado en la sección de pendientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button onClick={() => setView(View.PENDING_REPORTS)} className="w-full py-3">
            Ver Pendientes
          </Button>
          <Button onClick={() => setView(View.DASHBOARD)} variant="secondary" className="w-full py-3">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Loading Modal */}
      <LoadingModal
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
        onShare={handleSharePDF}
        onBack={handleBackToSummary}
        fileName={generatedPDF?.filename || ""}
      />
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-4">
        <div className="bg-border dark:bg-dark-border h-1.5 rounded-full">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="text-center text-sm text-text-secondary dark:text-dark-text-secondary px-4 sm:px-8">
        Paso {currentStep} de 4
      </div>

      {/* Steps Content */}
      <div className="flex-1 overflow-auto">
        {currentStep === 1 && (
          <Step1DatosPersonales form={form} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <Step2Proposito form={form} onNext={handleNext} onPrevious={handlePrevious} />
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
  );
};

export default RequestExpenseForm;
