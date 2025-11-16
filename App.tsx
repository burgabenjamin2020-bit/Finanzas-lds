import React, { useState, useEffect } from 'react';
import { View, ExpenseRequest, UserRole } from './types';
import Dashboard from './components/Dashboard';
import RequestExpenseForm from './components/RequestExpenseFormNew';
import SubmitReportForm from './components/SubmitReportForm';
import UploadActivityPhotos from './components/UploadActivityPhotos';
import Sidebar from './components/Sidebar';
import PendingReports from './components/PendingReports';
import SubmittedReports from './components/SubmittedReports';
import PhotoGallery from './components/PhotoGallery';
import AuditorView from './components/AuditorView';
import FormatsView from './components/FormatsView';
import MobileBottomNav from './components/MobileBottomNav';

const getInitialState = (): ExpenseRequest[] => {
  try {
    const savedRequests = localStorage.getItem('expenseRequests');
    if (savedRequests) {
      return JSON.parse(savedRequests);
    }
  } catch (e) {
    console.error("Could not parse expense requests from localStorage", e);
  }
  // Return some default data for first-time users
  return [
    {
      id: '1700000000001',
      amount: 150.75,
      reason: 'Materiales para actividad de Hombres Jóvenes',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      status: 'PENDIENTE',
      applicantName: 'Juan Pérez',
      payeeName: 'Tienda de Suministros El Sol',
      organization: 'Hombres Jóvenes',
      receiptImages: [],
    },
    {
      id: '1700000000002',
      amount: 85.20,
      reason: 'Refrigerios para clase de la Primaria',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
      status: 'PENDIENTE',
      applicantName: 'Maria García',
      payeeName: 'Supermercado La Canasta',
      organization: 'Primaria',
      receiptImages: [],
    },
     {
      id: '1600000000001',
      amount: 210.50,
      reason: 'Compra de manualidades para la Sociedad de Socorro',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
      status: 'COMPLETADO',
      applicantName: 'Ana Rodríguez',
      payeeName: 'Librería El Saber',
      organization: 'Sociedad de Socorro',
      receiptImages: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='],
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    },
  ];
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [expenseRequests, setExpenseRequests] = useState<ExpenseRequest[]>(getInitialState);
  const [selectedRequest, setSelectedRequest] = useState<ExpenseRequest | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentUserRole = UserRole.LEADER;
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('expenseRequests', JSON.stringify(expenseRequests));
  }, [expenseRequests]);
  
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);


  const handleRequestCreated = (request: Omit<ExpenseRequest, 'id' | 'status'>) => {
    const newRequest: ExpenseRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'PENDIENTE',
      receiptImages: [],
    };
    setExpenseRequests(prev => [...prev, newRequest]);
  };
  
  const handleSelectRequestToReport = (request: ExpenseRequest) => {
    setSelectedRequest(request);
    setCurrentView(View.SUBMIT_REPORT);
  }

  const handleReportSubmitted = (updatedRequest: Partial<ExpenseRequest> & { id: string }) => {
    setExpenseRequests(prev => 
      prev.map(req => 
        req.id === updatedRequest.id 
        ? { ...req, ...updatedRequest, status: 'COMPLETADO' } 
        : req
      )
    );
  };

  const handleDeleteRequest = (requestId: string) => {
    setExpenseRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const renderView = () => {
    switch (currentView) {
      case View.REQUEST_EXPENSE:
        return <RequestExpenseForm onRequestCreated={handleRequestCreated} setView={setCurrentView} />;
      case View.SUBMIT_REPORT:
        return <SubmitReportForm expenseRequest={selectedRequest} onReportSubmitted={handleReportSubmitted} setView={setCurrentView} />;
      case View.UPLOAD_PHOTOS:
        // This view is deprecated, its functionality is now inside SubmitReportForm
        return <UploadActivityPhotos />;
      case View.PENDING_REPORTS:
        return <PendingReports 
                  requests={expenseRequests} 
                  onSelectRequestToReport={handleSelectRequestToReport}
                  onDeleteRequest={handleDeleteRequest}
                />;
      case View.SUBMITTED_REPORTS:
        return <SubmittedReports requests={expenseRequests} />;
      case View.PHOTO_GALLERY:
        if (currentUserRole !== UserRole.LEADER) {
          return <Dashboard setView={setCurrentView} expenseRequests={expenseRequests} currentUserRole={currentUserRole} userName={userName} />;
        }
        return <PhotoGallery requests={expenseRequests} />;
      case View.AUDITOR:
        if (currentUserRole !== UserRole.LEADER) {
          return <Dashboard setView={setCurrentView} expenseRequests={expenseRequests} currentUserRole={currentUserRole} userName={userName} />;
        }
        return <AuditorView />;
      case View.FORMATS:
        return <FormatsView />;
      case View.DASHBOARD:
      default:
        return <Dashboard setView={setCurrentView} expenseRequests={expenseRequests} currentUserRole={currentUserRole} userName={userName} />;
    }
  };
  
  const isFullscreenView = currentView === View.REQUEST_EXPENSE || currentView === View.SUBMIT_REPORT;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background font-sans flex text-text-primary dark:text-dark-text-primary">
      <Sidebar 
        currentView={currentView}
        setView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUserRole={currentUserRole}
        userName={userName}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className={`flex-1 overflow-y-auto ${isFullscreenView ? 'flex flex-col' : 'p-4 sm:p-6 pb-20 md:pb-6'}`}>
          {renderView()}
        </main>
      </div>
      <MobileBottomNav currentView={currentView} setView={setCurrentView} theme={theme} setTheme={setTheme} currentUserRole={currentUserRole} />
    </div>
  );
};

export default App;