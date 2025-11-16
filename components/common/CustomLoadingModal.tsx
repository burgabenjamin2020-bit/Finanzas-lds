import React from 'react';

interface CustomLoadingModalProps {
  isVisible: boolean;
  title?: string;
  message?: string;
}

export const CustomLoadingModal: React.FC<CustomLoadingModalProps> = ({
  isVisible,
  title = "Generando PDF",
  message = "Por favor espere mientras procesamos su solicitud..."
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 flex-col">
      {/* Loader principal */}
      <div className="flex justify-center mb-8">
        <div className="relative w-16 h-16">
          <div className="absolute w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{
            left: '0px',
            animationDelay: '0ms',
            animationDuration: '1200ms'
          }}></div>
          <div className="absolute w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{
            right: '0px',
            animationDelay: '200ms',
            animationDuration: '1200ms'
          }}></div>
          <div className="absolute w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{
            left: '50%',
            bottom: '0px',
            transform: 'translateX(-50%)',
            animationDelay: '400ms',
            animationDuration: '1200ms'
          }}></div>
        </div>
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
        {title}
      </h3>
      
      <p className="text-gray-600 text-lg leading-relaxed text-center max-w-md">
        {message}
      </p>
      
      {/* Puntos adicionales */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default CustomLoadingModal;