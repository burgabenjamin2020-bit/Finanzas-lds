import React from 'react';
import Button from './Button';
import { CheckCircleIcon } from '../icons/Icons';

interface RequestSentModalProps {
  isVisible: boolean;
  onViewPendientes: () => void;
  onBackToHome: () => void;
}

export const RequestSentModal: React.FC<RequestSentModalProps> = ({
  isVisible,
  onViewPendientes,
  onBackToHome
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-xl text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ¡Solicitud Enviada!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Tu solicitud ha sido generada y enviada correctamente.
            Puedes revisar su estado en la sección de pendientes.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={onViewPendientes} className="w-full py-3 text-lg">
            Ver Pendientes
          </Button>
          
          <Button onClick={onBackToHome} variant="secondary" className="w-full py-3 text-lg">
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestSentModal;