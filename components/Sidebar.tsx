import React from 'react';
import { View, UserRole } from '../types';
import { HomeIcon, DocumentIcon, ClipboardListIcon, SunIcon, MoonIcon, FolderIcon, ClipboardCheckIcon, DocumentDownloadIcon, BanknotesIcon, ChevronDoubleLeftIcon } from './icons/Icons';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  currentUserRole: UserRole;
  userName: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive: boolean;
  isSidebarOpen: boolean;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, title, onClick, isActive, isSidebarOpen, disabled = false }) => {
  const baseClasses = 'flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 text-left relative rounded-lg';
  const activeClasses = 'bg-primary/10 text-primary font-semibold';
  const inactiveClasses = 'text-text-secondary hover:bg-slate-100 dark:hover:bg-dark-border/50 hover:text-text-primary';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''} ${!isSidebarOpen && 'justify-center'}`}
      title={!isSidebarOpen ? title : ''}
    >
      {isActive && isSidebarOpen && <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full"></div>}
      {icon}
      {isSidebarOpen && <span className="ml-3 truncate">{title}</span>}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, theme, setTheme, isSidebarOpen, setIsSidebarOpen, currentUserRole, userName }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <aside className={`hidden md:flex md:flex-col bg-surface dark:bg-dark-surface border-r border-border dark:border-dark-border flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}`}>
      <div className={`flex items-center h-16 px-4 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
        {isSidebarOpen ? (
          <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary truncate">Gestor de Gastos</h1>
        ) : (
          <BanknotesIcon className="w-8 h-8 text-primary"/>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem
          icon={<HomeIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
          title="Panel Principal"
          onClick={() => setView(View.DASHBOARD)}
          isActive={currentView === View.DASHBOARD}
          isSidebarOpen={isSidebarOpen}
        />
        <NavItem
          icon={<DocumentIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"}/>}
          title="Solicitar Gastos"
          onClick={() => setView(View.REQUEST_EXPENSE)}
          isActive={currentView === View.REQUEST_EXPENSE}
          isSidebarOpen={isSidebarOpen}
        />
        <NavItem
          icon={<ClipboardListIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
          title="Rendiciones Pendientes"
          onClick={() => setView(View.PENDING_REPORTS)}
          isActive={currentView === View.PENDING_REPORTS}
          isSidebarOpen={isSidebarOpen}
        />
        <NavItem
          icon={<ClipboardCheckIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
          title="Rendiciones Enviadas"
          onClick={() => setView(View.SUBMITTED_REPORTS)}
          isActive={currentView === View.SUBMITTED_REPORTS}
          isSidebarOpen={isSidebarOpen}
        />
         <NavItem
          icon={<DocumentDownloadIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
          title="Formatos"
          onClick={() => setView(View.FORMATS)}
          isActive={currentView === View.FORMATS}
          isSidebarOpen={isSidebarOpen}
        />

        {currentUserRole === UserRole.LEADER && (
          <div className="pt-2 mt-2 border-t border-border dark:border-dark-border/50">
            {isSidebarOpen && <p className="px-4 pt-2 text-xs font-semibold text-text-secondary/70 uppercase tracking-wider">Admin</p>}
            <NavItem
              icon={<FolderIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
              title="Galería"
              onClick={() => setView(View.PHOTO_GALLERY)}
              isActive={currentView === View.PHOTO_GALLERY}
              isSidebarOpen={isSidebarOpen}
            />
            <NavItem
              icon={<ClipboardCheckIcon className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />}
              title="Auditor"
              onClick={() => setView(View.AUDITOR)}
              isActive={currentView === View.AUDITOR}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        )}
      </nav>
      <div className="mt-auto">
        <div className="p-4">
          <div className={`flex items-center ${isSidebarOpen ? 'p-2 rounded-lg bg-slate-50 dark:bg-dark-border/20' : 'justify-center'}`}>
            <div className="flex-shrink-0">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                   <span className="font-bold text-lg text-primary">{getInitials(userName)}</span>
               </div>
            </div>
            {isSidebarOpen && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">{userName}</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Líder</p>
              </div>
            )}
          </div>
        </div>
        <div className="px-4 py-4 border-t border-border dark:border-dark-border">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center p-2 rounded-md text-text-secondary hover:bg-slate-100 dark:hover:bg-dark-border/50 ${!isSidebarOpen && 'justify-center'}`}
            aria-label="Toggle theme"
            title={!isSidebarOpen ? (theme === 'light' ? 'Modo Oscuro' : 'Modo Claro') : ''}
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5 text-text-secondary"/> : <SunIcon className="w-5 h-5 text-yellow-400"/>}
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>}
          </button>
          <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`w-full flex items-center p-2 mt-2 rounded-md text-text-secondary hover:bg-slate-100 dark:hover:bg-dark-border/50 ${!isSidebarOpen && 'justify-center'}`}
              aria-label="Toggle sidebar"
              title={!isSidebarOpen ? 'Expandir barra lateral' : ''}
          >
              <ChevronDoubleLeftIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`}/>
              {isSidebarOpen && <span className="ml-3 text-sm font-medium">Contraer</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;