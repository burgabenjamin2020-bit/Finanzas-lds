import React, { useState } from 'react';
import { ExpenseRequest } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { ConfirmDeleteModal } from './common/ConfirmDeleteModal';

interface PendingReportsProps {
  requests: ExpenseRequest[];
  onSelectRequestToReport: (request: ExpenseRequest) => void;
  onDeleteRequest?: (requestId: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getDueDate = (dateString: string) => {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + 14);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const PendingReports: React.FC<PendingReportsProps> = ({ requests, onSelectRequestToReport, onDeleteRequest }) => {
  const pendingRequests = requests.filter(r => r.status === 'PENDIENTE');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; request: ExpenseRequest | null }>({
    show: false,
    request: null
  });

  const handleDeleteClick = (request: ExpenseRequest) => {
    setDeleteModal({ show: true, request });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.request) {
      onDeleteRequest?.(deleteModal.request.id);
      setDeleteModal({ show: false, request: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, request: null });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Panel de Administrador: Rendiciones Pendientes</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Revisa y gestiona las solicitudes pendientes de todos los usuarios.</p>
      
      {pendingRequests.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary dark:text-dark-text-secondary">Actualmente no hay solicitudes pendientes de ningún usuario.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(request => (
            <Card key={request.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{request.reason}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                  <p className="text-text-secondary dark:text-dark-text-secondary">Solicitante: <span className="font-medium text-text-primary dark:text-dark-text-primary">{request.applicantName}</span></p>
                  <p className="text-text-secondary dark:text-dark-text-secondary">Organización: <span className="font-medium text-text-primary dark:text-dark-text-primary">{request.organization}</span></p>
                </div>
                <div className="mt-2 border-t border-border dark:border-dark-border pt-2">
                  <p className="text-text-secondary dark:text-dark-text-secondary">Monto: <span className="font-semibold text-primary">{request.amount.toFixed(2)} PEN</span></p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Fecha de Solicitud: {formatDate(request.date)}</p>
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">Fecha Límite: {getDueDate(request.date)}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
                <Button onClick={() => onSelectRequestToReport(request)} className="w-full sm:w-auto">
                    Rendir Gasto
                </Button>
                <Button 
                  onClick={() => handleDeleteClick(request)} 
                  variant="secondary" 
                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isVisible={deleteModal.show}
        itemName={deleteModal.request?.reason || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default PendingReports;