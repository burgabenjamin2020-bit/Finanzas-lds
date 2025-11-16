import React from 'react';
import Button from './Button';

interface ConfirmDeleteModalProps {
  isVisible: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isVisible,
  itemName,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¿Eliminar solicitud?
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Estás a punto de eliminar la solicitud:
          </p>
          
          <p className="text-gray-900 font-medium mt-2 p-3 bg-gray-50 rounded-lg text-sm">
            "{itemName}"
          </p>
          
          <p className="text-red-600 text-sm mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onCancel} 
            variant="secondary" 
            className="flex-1 py-3"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 py-3 bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;