import React, { useState } from 'react';
import { View, UserRole } from '../types';
import { HomeIcon, DocumentIcon, ClipboardListIcon, MenuIcon, XIcon, MoonIcon, SunIcon, FolderIcon, ClipboardCheckIcon, DocumentDownloadIcon } from './icons/Icons';

interface MobileBottomNavProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentUserRole: UserRole;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'text-primary dark:text-primary-light';
  const inactiveClasses = 'text-text-secondary dark:text-dark-text-secondary';
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};


const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, setView, theme, setTheme, currentUserRole }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { label: 'Inicio', view: View.DASHBOARD, icon: <HomeIcon className="w-6 h-6" /> },
    { label: 'Solicitar', view: View.REQUEST_EXPENSE, icon: <DocumentIcon className="w-6 h-6" /> },
    { label: 'Pendientes', view: View.PENDING_REPORTS, icon: <ClipboardListIcon className="w-6 h-6" /> },
  ];

  const allMoreMenuItems = [
    { label: 'Formatos', view: View.FORMATS, icon: <DocumentDownloadIcon className="w-6 h-6 text-text-secondary" /> },
    { label: 'Rendiciones Enviadas', view: View.SUBMITTED_REPORTS, icon: <ClipboardCheckIcon className="w-6 h-6 text-text-secondary" /> },
    { label: 'Galería', view: View.PHOTO_GALLERY, icon: <FolderIcon className="w-6 h-6 text-text-secondary" /> },
    { label: 'Auditor', view: View.AUDITOR, icon: <ClipboardCheckIcon className="w-6 h-6 text-text-secondary" /> },
  ];

  const moreMenuItems = currentUserRole === UserRole.LEADER
    ? allMoreMenuItems
    : allMoreMenuItems.filter(item => item.view !== View.AUDITOR && item.view !== View.PHOTO_GALLERY);
  
  const handleMoreItemClick = (view: View) => {
    setView(view);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm border-t border-border dark:border-dark-border shadow-t-lg z-20 flex items-center justify-around px-2">
        {navItems.map(item => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            isActive={currentView === item.view}
            onClick={() => setView(item.view)}
          />
        ))}
         <button onClick={() => setIsMoreMenuOpen(true)} className="flex flex-col items-center justify-center flex-1 text-text-secondary dark:text-dark-text-secondary">
          <MenuIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Menú</span>
        </button>
      </nav>
      
      {/* More Menu Bottom Sheet */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30" aria-modal="true">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMoreMenuOpen(false)}></div>
          
          {/* Content */}
          <div className={`absolute bottom-0 left-0 right-0 bg-surface dark:bg-dark-surface rounded-t-2xl transition-transform duration-300 ease-out flex flex-col max-h-[85vh] ${isMoreMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-between items-center p-4 border-b border-border dark:border-dark-border flex-shrink-0">
              <h3 className="font-bold text-lg">Más Opciones</h3>
              <button onClick={() => setIsMoreMenuOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-dark-border">
                <XIcon className="w-6 h-6 text-text-secondary"/>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-2">
                {moreMenuItems.map(item => (
                  <button key={item.label} onClick={() => handleMoreItemClick(item.view)} className="flex items-center p-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-dark-border w-full">
                    {item.icon}
                    <span className="ml-4 font-medium text-text-primary dark:text-dark-text-primary">{item.label}</span>
                  </button>
                ))}
                <button onClick={toggleTheme} className="flex items-center p-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-dark-border w-full">
                  {theme === 'light' ? <MoonIcon className="w-6 h-6 text-text-secondary"/> : <SunIcon className="w-6 h-6 text-yellow-400"/>}
                  <span className="ml-4 font-medium text-text-primary dark:text-dark-text-primary">{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;