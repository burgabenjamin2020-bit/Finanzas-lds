import React from 'react';
import { View, ExpenseRequest, UserRole } from '../types';
import Card from './common/Card';
import { DocumentIcon, ClipboardListIcon, DocumentDownloadIcon, FolderIcon, BanknotesIcon, CalendarIcon, ExclamationCircleIcon, ClipboardCheckIcon } from './icons/Icons';

interface DashboardProps {
  setView: (view: View) => void;
  expenseRequests: ExpenseRequest[];
  currentUserRole: UserRole;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, expenseRequests, currentUserRole, userName }) => {
  const pendingRequests = expenseRequests.filter(r => r.status === 'PENDIENTE');
  const pendingCount = pendingRequests.length;

  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalReportedThisMonth = expenseRequests
    .filter(r => r.status === 'COMPLETADO' && new Date(r.date) >= startOfMonth)
    .reduce((sum, req) => sum + req.amount, 0);

  const getDueDate = (dateString: string): Date => {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + 14);
    return date;
  };
  
  const mostUrgentReport = pendingRequests
    .map(r => ({ ...r, dueDate: getDueDate(r.date) }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 1)[0];


  const allActions = [
    {
      title: "Solicitar Gastos",
      description: "Inicia un nuevo proceso para solicitar fondos.",
      icon: <DocumentIcon />,
      view: View.REQUEST_EXPENSE,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      title: "Rendir Cuentas",
      description: "Revisa y rinde tus solicitudes pendientes.",
      icon: <ClipboardListIcon />,
      view: View.PENDING_REPORTS,
      notificationCount: pendingCount,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Formatos",
      description: "Accede a los documentos PDF necesarios.",
      icon: <DocumentDownloadIcon />,
      view: View.FORMATS,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Galería",
      description: "Explora todas las fotos de actividades.",
      icon: <FolderIcon />,
      view: View.PHOTO_GALLERY,
      color: "text-primary",
      bg: "bg-primary/10",
    }
  ];

  const actions = currentUserRole === UserRole.LEADER 
    ? allActions
    : allActions.filter(action => action.view !== View.PHOTO_GALLERY);

  const isOverdue = (dueDate: Date) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(dueDate);
      due.setHours(0,0,0,0);
      return due < today;
  }
  
  const timeDiff = (date1: Date, date2: Date) => Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Bienvenido, {userName.split(' ')[0]}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">Este es tu resumen financiero y accesos directos.</p>
      
      {/* Summary Strip */}
      <Card className="p-0 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border dark:divide-dark-border">
          <div className="p-4 flex items-center justify-center sm:justify-start">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 mr-4">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary uppercase font-semibold">Pendiente</p>
              <p className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
                {totalPendingAmount.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center sm:justify-start">
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500 mr-4">
              <ClipboardCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary uppercase font-semibold">Rendido (Mes)</p>
              <p className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
                {totalReportedThisMonth.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setView(View.PENDING_REPORTS)}
            className="p-4 flex items-center w-full text-left hover:bg-slate-50 dark:hover:bg-dark-border/20 transition-colors rounded-r-lg"
          >
            {mostUrgentReport ? (
              <>
                <div className={`p-2.5 rounded-lg mr-4 ${isOverdue(mostUrgentReport.dueDate) ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  {isOverdue(mostUrgentReport.dueDate) ? <ExclamationCircleIcon className="w-6 h-6" /> : <CalendarIcon className="w-6 h-6" />}
                </div>
                <div className="truncate">
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary uppercase font-semibold truncate">Próximo Vencimiento</p>
                  <p className={`text-sm font-bold truncate ${isOverdue(mostUrgentReport.dueDate) ? 'text-red-600' : 'text-text-primary dark:text-dark-text-primary'}`}>
                    {isOverdue(mostUrgentReport.dueDate) ? `Vencido hace ${timeDiff(new Date(), mostUrgentReport.dueDate)}d` : `Vence en ${timeDiff(mostUrgentReport.dueDate, new Date())}d`}
                  </p>
                </div>
              </>
            ) : (
                <div className="w-full text-center sm:text-left">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">No hay rendiciones urgentes.</p>
                </div>
            )}
          </button>
        </div>
      </Card>

      <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map(action => (
          <ActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            color={action.color}
            bg={action.bg}
            notificationCount={action.notificationCount}
            onClick={() => setView(action.view)}
          />
        ))}
      </div>
    </div>
  );
};

interface ActionCardProps {
    icon: React.ReactElement;
    title: string;
    description: string;
    onClick: () => void;
    notificationCount?: number;
    color: string;
    bg: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick, notificationCount = 0, color, bg }) => (
    <Card 
      onClick={onClick}
      className={`relative flex flex-row items-center p-4 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary md:flex-col md:items-start md:p-4`}
    >
      {notificationCount > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center md:h-6 md:w-6">
          {notificationCount}
        </div>
      )}
      <div className={`mr-4 w-12 h-12 md:mr-0 md:mb-4 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
        {React.cloneElement(icon, { className: "w-7 h-7 md:w-8 md:h-8" })}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-text-secondary dark:text-dark-text-secondary text-sm">{description}</p>
      </div>
    </Card>
);

export default Dashboard;