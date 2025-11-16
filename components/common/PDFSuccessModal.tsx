import React from 'react';
import Button from './Button';
import { CheckCircleIcon } from '../icons/Icons';

interface PDFSuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDownload: () => void;
  onView: () => void;
  onSendRequest: () => void;
  onBack: () => void;
  fileName: string;
}

export const PDFSuccessModal: React.FC<PDFSuccessModalProps> = ({
  isVisible,
  onClose,
  onDownload,
  onView,
  onSendRequest,
  onBack,
  fileName
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¡PDF Generado!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tu solicitud de gastos ha sido generada exitosamente.
          </p>
          {fileName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 break-all">
              {fileName}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Button onClick={onDownload} className="w-full py-3">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </Button>
          
          <Button onClick={onView} variant="secondary" className="w-full py-3">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver PDF
          </Button>
          
          <Button onClick={onSendRequest} className="w-full py-3">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Enviar Solicitud
          </Button>
          
          <div className="flex gap-2 pt-2">
            <Button onClick={onBack} variant="outline" className="flex-1 py-2">
              ← Volver
            </Button>
            
            <Button onClick={onClose} variant="outline" className="flex-1 py-2">
              Nueva Solicitud
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};