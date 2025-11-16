
import React from 'react';

// Hacemos que las props sean más flexibles para aceptar atributos estándar de div como onClick
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow-sm border border-border dark:border-dark-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
