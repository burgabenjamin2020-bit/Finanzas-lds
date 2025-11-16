
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-surface dark:bg-dark-surface shadow-md border-b border-border dark:border-dark-border">
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Gestor de Gastos Pro</h1>
      </div>
    </header>
  );
};

export default Header;