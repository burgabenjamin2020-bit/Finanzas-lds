import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import Button from './common/Button';
import { XIcon } from './icons/Icons';

interface TourStep {
  selector?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onComplete: (name: string) => void;
}

const desktopSteps: TourStep[] = [
    {
      title: '¡Bienvenido/a!',
      content: 'Antes de empezar, ¿cómo te llamas?',
    },
    {
      selector: '[data-tour="sidebar"]',
      title: 'Barra de Navegación',
      content: 'Esta es tu barra de navegación. Desde aquí puedes acceder a todas las funciones principales de la aplicación.',
      position: 'right',
    },
    {
      selector: '[data-tour="quick-actions"]',
      title: 'Acciones Rápidas',
      content: "Estas son tus acciones rápidas. 'Solicitar Gastos' es para pedir dinero y 'Rendir Cuentas' es para justificarlo.",
      position: 'bottom',
    },
    {
      selector: '[data-tour="summary-strip"]',
      title: 'Resumen Financiero',
      content: 'Aquí verás un resumen rápido de tu estado financiero, como cuánto dinero tienes pendiente por rendir.',
      position: 'bottom',
    },
    {
      selector: '[data-tour="user-profile"]',
      title: 'Tu Perfil',
      content: 'Este es tu perfil. Verás tu nombre y rol aquí. ¡Se ve genial!',
      position: 'top',
    },
    {
      title: '¡Todo Listo, {userName}!',
      content: 'Ya puedes empezar a gestionar tus gastos. Si necesitas ayuda, busca el ícono de ayuda (?).',
    },
];

const mobileSteps: TourStep[] = [
    {
      title: '¡Bienvenido/a!',
      content: 'Antes de empezar, ¿cómo te llamas?',
    },
    {
      selector: '[data-tour="mobile-nav"]',
      title: 'Navegación Principal',
      content: 'Usa esta barra para moverte por las secciones más importantes de la aplicación.',
      position: 'top',
    },
     {
      selector: '[data-tour="mobile-nav-solicitar"]',
      title: 'Solicitar Fondos',
      content: 'Toca aquí para iniciar una nueva solicitud de dinero para tus actividades.',
      position: 'top',
    },
    {
      selector: '[data-tour="mobile-nav-pendientes"]',
      title: 'Rendir Cuentas',
      content: 'Cuando tengas que justificar un gasto, entra aquí para empezar el proceso.',
      position: 'top',
    },
    {
      selector: '[data-tour="mobile-nav-menu"]',
      title: 'Más Opciones',
      content: 'En "Menú" encontrarás otras opciones como la galería, formatos y tu historial de rendiciones.',
      position: 'top',
    },
    {
      title: '¡Todo Listo, {userName}!',
      content: 'Ya puedes empezar a gestionar tus gastos. ¡Es muy fácil!',
    },
];


const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [highlightStyle, setHighlightStyle] = useState({});
  const [popoverStyle, setPopoverStyle] = useState({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);
    setSteps(mobileCheck ? mobileSteps : desktopSteps);
  }, []);

  useLayoutEffect(() => {
    if (steps.length === 0) return;

    const currentStep = steps[stepIndex];
    const targetElement = currentStep.selector ? document.querySelector<HTMLElement>(currentStep.selector) : null;

    if (!targetElement) {
      setHighlightStyle({
        position: 'fixed', top: '50%', left: '50%',
        width: 0, height: 0,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none'
      });

      if (isMobile) {
        setPopoverStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '384px',
        });
      } else {
        setPopoverStyle({
          top: '50%', left: '50%', width: '384px',
          transform: 'translate(-50%, -50%)',
        });
      }
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const PADDING = 10;

    setHighlightStyle({
      position: 'absolute',
      top: `${rect.top - PADDING}px`, left: `${rect.left - PADDING}px`,
      width: `${rect.width + PADDING * 2}px`, height: `${rect.height + PADDING * 2}px`,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      borderRadius: '8px', pointerEvents: 'none', transition: 'all 0.3s ease-in-out',
    });
    
    requestAnimationFrame(() => {
        if (!popoverRef.current) return;
        const popoverRect = popoverRef.current.getBoundingClientRect();
        
        if (isMobile) {
            const popoverHeight = popoverRect.height;
            let popTop;

            if (rect.top > popoverHeight + PADDING * 2) {
                popTop = rect.top - popoverHeight - PADDING;
            } else {
                popTop = rect.bottom + PADDING;
            }

            if (popTop < PADDING) popTop = PADDING;
            if (popTop + popoverHeight > window.innerHeight - PADDING) {
                popTop = window.innerHeight - popoverHeight - PADDING;
            }

            setPopoverStyle({
                top: `${popTop}px`, left: '1rem', right: '1rem', width: 'auto', transform: 'none',
            });
        } else {
            let popTop = 0, popLeft = 0;
            const position = currentStep.position || 'bottom';
            if (position === 'bottom') {
                popTop = rect.bottom + PADDING; popLeft = rect.left + rect.width / 2 - popoverRect.width / 2;
            } else if (position === 'top') {
                popTop = rect.top - popoverRect.height - PADDING; popLeft = rect.left + rect.width / 2 - popoverRect.width / 2;
            } else if (position === 'right') {
                popTop = rect.top + rect.height / 2 - popoverRect.height / 2; popLeft = rect.right + PADDING;
            } else if (position === 'left') {
                popTop = rect.top + rect.height / 2 - popoverRect.height / 2; popLeft = rect.left - popoverRect.width - PADDING;
            }
            if (popLeft < PADDING) popLeft = PADDING;
            if (popTop < PADDING) popTop = PADDING;
            if (popLeft + popoverRect.width > window.innerWidth - PADDING) popLeft = window.innerWidth - popoverRect.width - PADDING;
            if (popTop + popoverRect.height > window.innerHeight - PADDING) popTop = window.innerHeight - popoverRect.height - PADDING;

            setPopoverStyle({ top: `${popTop}px`, left: `${popLeft}px`, width: '384px' });
        }
    });

  }, [stepIndex, steps, isMobile]);
  
  if (steps.length === 0) return null;

  const currentStep = steps[stepIndex];
  const isNameStep = stepIndex === 0;
  const isFinalStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };
  const handlePrev = () => {
    if (stepIndex > 1) setStepIndex(stepIndex - 1);
  };
  const handleComplete = () => onComplete(userName);
  const isNameValid = () => userName.trim().includes(' ') && userName.trim().length > 3;

  return (
    <div className="fixed inset-0 z-50">
      <div style={highlightStyle}></div>
      <div 
        ref={popoverRef}
        style={popoverStyle}
        className="fixed bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300 ease-in-out"
      >
        <button onClick={handleComplete} className="absolute top-3 right-3 p-1 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary">
            <XIcon className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-3 text-text-primary dark:text-dark-text-primary">{currentStep.title.replace('{userName}', userName.split(' ')[0] || '')}</h3>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-6">{currentStep.content.replace('{userName}', userName.split(' ')[0] || '')}</p>
        {isNameStep && (
          <input
            type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
            placeholder="Nombre y Apellido"
            className="w-full bg-slate-100 dark:bg-dark-border border border-border dark:border-dark-border/50 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            autoFocus
          />
        )}
        <div className="flex justify-between items-center">
            {!isNameStep && !isFinalStep && <span className="text-sm text-text-secondary">{stepIndex}/{steps.length - 2}</span>}
            <div className="flex gap-2 ml-auto">
                {stepIndex > 1 && <Button variant="secondary" onClick={handlePrev}>Anterior</Button>}
                {isNameStep ? (
                    <Button onClick={handleNext} disabled={!isNameValid()}>Siguiente</Button>
                ) : isFinalStep ? (
                    <Button onClick={handleComplete}>Finalizar Tour</Button>
                ) : (
                    <Button onClick={handleNext}>Siguiente</Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;