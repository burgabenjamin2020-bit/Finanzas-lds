import React from 'react';
import { ExpenseRequest } from '../types';
import Card from './common/Card';
import { CheckCircleIcon } from './icons/Icons';

interface SubmittedReportsProps {
  requests: ExpenseRequest[];
}

const formatDate = (dateString: string) => {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SubmittedReports: React.FC<SubmittedReportsProps> = ({ requests }) => {
  const completedRequests = requests.filter(r => r.status === 'COMPLETADO');

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Historial de Rendiciones Enviadas</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Aquí puedes ver todas las rendiciones que han sido completadas y enviadas.</p>
      
      {completedRequests.length === 0 ? (
        <Card>
          <div className="text-center py-8">
             <CheckCircleIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4"/>
             <p className="text-text-secondary dark:text-dark-text-secondary">Aún no has completado ninguna rendición.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedRequests.map(request => (
            <Card key={request.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex-1">
                <p className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{request.reason}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                  <p className="text-text-secondary dark:text-dark-text-secondary">Solicitante: <span className="font-medium text-text-primary dark:text-dark-text-primary">{request.applicantName}</span></p>
                  <p className="text-text-secondary dark:text-dark-text-secondary">Organización: <span className="font-medium text-text-primary dark:text-dark-text-primary">{request.organization}</span></p>
                </div>
                <div className="mt-2 border-t border-border dark:border-dark-border pt-2">
                  <p className="text-text-secondary dark:text-dark-text-secondary">Monto Solicitado: <span className="font-semibold text-primary">{request.amount.toFixed(2)} PEN</span></p>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Fecha de Solicitud: {formatDate(request.date)}</p>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">Completado</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmittedReports;
