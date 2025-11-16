import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExpenseRequest, ExpenseItem, View, SpiritualExperience } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon, TrashIcon, SparklesIcon, CheckCircleIcon, DocumentIcon, UploadIcon, XIcon } from './icons/Icons';
import ScanReceiptsView from './ScanReceiptsView';
import { optimizeImage } from '../utils/imageOptimizer';
import Spinner from './common/Spinner';


type ReportStep = 
  'welcome' | 
  'leader_name' |
  'expense_hub' | 
  'add_method' | 
  'add_manual_desc' | 
  'add_manual_amount' | 
  'add_manual_receipt_number' |
  'scanning' |
  'incident_check' | 
  'incident_details' |
  'experience_date' | 
  'experience_participants' | 
  'experience_location' | 
  'experience_context' | 
  'experience_learning' | 
  'experience_photos' |
  'signature' | 
  'submitted';

// --- SignaturePad Component ---
interface SignaturePadProps { onSave: (signature: string) => void; }
const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect(); canvas.width = width; canvas.height = height;
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#FCFCFC' : '#1A1A1A';
      ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number, y: number } | null => {
    if (!canvasRef.current) return null; const rect = canvasRef.current.getBoundingClientRect();
    const touch = event instanceof TouchEvent ? event.touches[0] : null; const mouseEvent = event as MouseEvent;
    return { x: (touch ? touch.clientX : mouseEvent.clientX) - rect.left, y: (touch ? touch.clientY : mouseEvent.clientY) - rect.top, };
  };
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(event.nativeEvent); if (!coords) return;
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(coords.x, coords.y); setIsDrawing(true); setHasSigned(true);
  };
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return; event.preventDefault(); const coords = getCoordinates(event.nativeEvent); if (!coords) return;
    const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.lineTo(coords.x, coords.y); ctx.stroke(); }
  };
  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.closePath(); } setIsDrawing(false);
  };
  const clearSignature = () => {
    const canvas = canvasRef.current; if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); setHasSigned(false); }
  };
  const saveSignature = () => {
    const canvas = canvasRef.current; if (canvas && hasSigned) {
      const tempCanvas = document.createElement('canvas'); tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d'); if (tempCtx) {
        tempCtx.fillStyle = '#FFFFFF'; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); tempCtx.drawImage(canvas, 0, 0);
        onSave(tempCanvas.toDataURL('image/png'));
      }
    }
  };
  return (
    <div className="w-full h-full flex flex-col items-center">
      <canvas ref={canvasRef} className="w-full h-full bg-slate-100 dark:bg-dark-border/50 border border-border dark:border-dark-border rounded-lg touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md">
        <Button variant="secondary" onClick={clearSignature} className="w-full">Limpiar</Button>
        <Button onClick={saveSignature} disabled={!hasSigned} className="w-full">Confirmar y Enviar</Button>
      </div>
    </div>
  );
};

// --- Helper Functions ---
const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)(); if (!audioContext) return;
    const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
    oscillator.connect(gainNode); gainNode.connect(audioContext.destination); oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.5);
};
const validateName = (name: string) => name.trim().split(/\s+/).length >= 2;

// --- Main Component ---
interface SubmitReportFormProps {
  expenseRequest: ExpenseRequest | null;
  onReportSubmitted: (updatedRequest: Partial<ExpenseRequest> & { id: string }) => void;
  setView: (view: View) => void;
}

const SubmitReportForm: React.FC<SubmitReportFormProps> = ({ expenseRequest, onReportSubmitted, setView }) => {
  const [step, setStep] = useState<ReportStep>('welcome');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // State for the entire report
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [leaderName, setLeaderName] = useState('');
  const [incidentOccurred, setIncidentOccurred] = useState<boolean | null>(null);
  const [incidentDetails, setIncidentDetails] = useState('');
  const [experience, setExperience] = useState<Omit<SpiritualExperience, 'photos'>>({ date: new Date().toISOString().split('T')[0], participants: [], location: '', context: '', learning: '' });
  const [experiencePhotos, setExperiencePhotos] = useState<string[]>([]);
  
  // Temporary state for multi-step inputs
  const [manualDescription, setManualDescription] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReceiptNumber, setManualReceiptNumber] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [step]);
  
  const handleNext = (nextStep: ReportStep) => (e?: React.FormEvent) => {
    e?.preventDefault();
    setStep(nextStep);
  };

  const handleManualAdd = () => {
    if (manualDescription && manualAmount) {
      setItems([...items, { id: Date.now().toString(), description: manualDescription, amount: parseFloat(manualAmount), receiptImage: null, receiptNumber: manualReceiptNumber.trim() || undefined }]);
      setManualDescription('');
      setManualAmount('');
      setManualReceiptNumber('');
      setStep('expense_hub');
    }
  };
  
  const handleDeleteGroup = (groupId: string) => {
    setItems(prevItems => prevItems.filter(item => (item.receiptId || item.id) !== groupId));
  };

  const handleFinalSubmit = (signature: string) => {
    if (!expenseRequest) return;
    const uniqueReceiptImages = Array.from(new Set(items.map(item => item.receiptImage).filter(Boolean))) as string[];
    const updatedRequest: Partial<ExpenseRequest> & { id: string } = {
      id: expenseRequest.id,
      receiptImages: uniqueReceiptImages,
      signature,
      leaderName,
      incidentOccurred: incidentOccurred ?? false,
      incidentDetails: incidentOccurred ? incidentDetails : '',
      spiritualExperience: { ...experience, photos: experiencePhotos }
    };
    onReportSubmitted(updatedRequest);
    playSuccessSound();
    setStep('submitted');
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsLoadingPhotos(true);
      const files: File[] = Array.from(e.target.files);
      const optimizedPhotos: string[] = [];
      for (const file of files) {
        try {
          const dataUrl = await optimizeImage(file);
          optimizedPhotos.push(dataUrl);
        } catch (error) { console.error("Error optimizing image:", error); }
      }
      setExperiencePhotos(prev => [...prev, ...optimizedPhotos]);
      setIsLoadingPhotos(false);
    }
    e.target.value = '';
  };
  
  const removeExperiencePhoto = (index: number) => {
    setExperiencePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: ExpenseItem[] } = {};
    items.forEach(item => { const key = item.receiptId || item.id; if (!groups[key]) groups[key] = []; groups[key].push(item); });
    return Object.values(groups);
  }, [items]);

  if (!expenseRequest) {
    return (
      <div className="max-w-3xl mx-auto text-center p-4">
        <Card>
          <h2 className="text-xl font-bold text-amber-500 mb-4">No se ha seleccionado una solicitud</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Por favor, vaya a "Rendiciones Pendientes" y seleccione una para continuar.</p>
          <Button onClick={() => setView(View.PENDING_REPORTS)}>Volver a Pendientes</Button>
        </Card>
      </div>
    );
  }
  
  const commonInputClass = "w-full max-w-lg text-2xl sm:text-3xl font-semibold text-center bg-transparent border-b-2 border-border dark:border-dark-border focus:border-primary focus:outline-none py-2 transition-colors duration-300";
  const progressPercentage: Partial<Record<ReportStep, number>> = {
    'welcome': 0, 'leader_name': 5, 'expense_hub': 15, 'incident_check': 50, 'incident_details': 55,
    'experience_date': 65, 'experience_participants': 70, 'experience_location': 75, 'experience_context': 80,
    'experience_learning': 85, 'experience_photos': 90, 'signature': 95, 'submitted': 100,
    'add_method': 16, 'add_manual_desc': 20, 'add_manual_amount': 25, 'add_manual_receipt_number': 30, 'scanning': 20
  };

  const renderContent = () => {
    const currentProgress = progressPercentage[step] || 0;
    const isStepView = !['welcome', 'submitted', 'expense_hub', 'scanning'].includes(step);

    const handlePrev = () => {
        const prevStepMap: Partial<Record<ReportStep, ReportStep>> = {
            'leader_name': 'welcome',
            'expense_hub': 'leader_name',
            'incident_check': 'expense_hub',
            'incident_details': 'incident_check',
            'experience_date': 'incident_check',
            'experience_participants': 'experience_date',
            'experience_location': 'experience_participants',
            'experience_context': 'experience_location',
            'experience_learning': 'experience_context',
            'experience_photos': 'experience_learning',
            'signature': 'experience_photos',
            'add_method': 'expense_hub',
            'add_manual_desc': 'add_method',
            'add_manual_amount': 'add_manual_desc',
            'add_manual_receipt_number': 'add_manual_amount',
        };
        const prevStep = prevStepMap[step] || step;
        setStep(prevStep);
    };
    
    const getNextStep = () => {
        const stepMap: Partial<Record<ReportStep, ReportStep>> = {
            'leader_name': 'expense_hub',
            'incident_details': 'experience_date',
            'experience_date': 'experience_participants',
            'experience_participants': 'experience_location',
            'experience_location': 'experience_context',
            'experience_context': 'experience_learning',
            'experience_learning': 'experience_photos',
            'experience_photos': 'signature',
        };
        return stepMap[step] || step;
    };

    const renderStepContent = () => {
        switch (step) {
            case 'leader_name': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Cuál es el nombre completo del líder que autorizó?</h2>
                <input ref={inputRef as React.Ref<HTMLInputElement>} type="text" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="Escribe el nombre aquí..." required className={commonInputClass} />
                {leaderName && !validateName(leaderName) && <p className="text-red-500 text-sm mt-2">Por favor, ingresa nombre y apellido.</p>}
                <div className="mt-12"><Button type="submit" disabled={!validateName(leaderName)}>Siguiente</Button></div>
            </form>);
            
            case 'incident_check': return (<>
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Hubo alguna incidencia durante el proceso de compra?</h2>
                <div className="flex gap-4">
                    <Button onClick={() => { setIncidentOccurred(true); setStep('incident_details'); }} variant="secondary" className="px-10 py-3 text-lg">Sí</Button>
                    <Button onClick={() => { setIncidentOccurred(false); setStep('experience_date'); }} className="px-10 py-3 text-lg">No</Button>
                </div>
            </>);

            case 'incident_details': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Por favor, detalla la incidencia.</h2>
                <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} value={incidentDetails} onChange={e => setIncidentDetails(e.target.value)} placeholder="Describe lo que sucedió..." required className={`${commonInputClass} h-32 resize-none`} />
                <div className="mt-12"><Button type="submit" disabled={!incidentDetails.trim()}>Siguiente</Button></div>
            </form>);
            
            case 'experience_date': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Ahora, registraremos la experiencia. ¿Cuándo ocurrió?</h2>
                <input ref={inputRef as React.Ref<HTMLInputElement>} type="date" value={experience.date} onChange={e => setExperience(p => ({...p, date: e.target.value}))} required className={`${commonInputClass} cursor-pointer`} />
                <div className="mt-12"><Button type="submit" disabled={!experience.date}>Siguiente</Button></div>
            </form>);

            case 'experience_participants': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Quiénes participaron en esta experiencia?</h2>
                <div className="w-full max-w-lg">
                    <div className="flex gap-2">
                        <input type="text" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} placeholder="Nombre y Apellido" className="flex-grow bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <Button type="button" onClick={() => { if (newParticipant.trim()) { setExperience(p => ({...p, participants: [...p.participants, newParticipant.trim()]})); setNewParticipant(''); }}}>Añadir</Button>
                    </div>
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                        {experience.participants.map((p, i) => <div key={i} className="flex justify-between items-center bg-slate-100 dark:bg-dark-border/50 p-2 rounded-md"><span className="text-text-secondary dark:text-dark-text-primary">{p}</span><button type="button" onClick={() => setExperience(prev => ({...prev, participants: prev.participants.filter((_, idx) => idx !== i)}))}><XIcon className="w-5 h-5 text-slate-500 hover:text-red-500"/></button></div>)}
                    </div>
                </div>
                <div className="mt-12"><Button type="submit">Siguiente</Button></div>
            </form>);
            
            case 'experience_location': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Dónde sucedió esta experiencia?</h2>
                <input ref={inputRef as React.Ref<HTMLInputElement>} type="text" value={experience.location} onChange={e => setExperience(p => ({...p, location: e.target.value}))} placeholder="Ej: Capilla, parque, etc." required className={commonInputClass} />
                <div className="mt-12"><Button type="submit" disabled={!experience.location.trim()}>Siguiente</Button></div>
            </form>);
            
            case 'experience_context': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Qué estabas haciendo en ese momento?</h2>
                <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} value={experience.context} onChange={e => setExperience(p => ({...p, context: e.target.value}))} placeholder="Describe la actividad..." required className={`${commonInputClass} h-24 resize-none`} />
                <div className="mt-12"><Button type="submit" disabled={!experience.context.trim()}>Siguiente</Button></div>
            </form>);

            case 'experience_learning': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">En una frase, ¿qué aprendiste de esta experiencia?</h2>
                <input ref={inputRef as React.Ref<HTMLInputElement>} type="text" value={experience.learning} onChange={e => setExperience(p => ({...p, learning: e.target.value}))} placeholder="Tu aprendizaje aquí..." required className={commonInputClass} />
                <div className="mt-12"><Button type="submit" disabled={!experience.learning.trim()}>Siguiente</Button></div>
            </form>);
            
            case 'experience_photos': return (<form onSubmit={handleNext(getNextStep())} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Por último, sube fotos de la experiencia.</h2>
                <div className="w-full max-w-2xl">
                    <label htmlFor="exp-photo-upload" className={`cursor-pointer w-full flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-dark-border rounded-lg p-6 transition-colors ${isLoadingPhotos ? 'bg-slate-100 dark:bg-dark-border cursor-wait' : 'hover:bg-slate-100 dark:hover:bg-dark-border/50'}`}>
                        {isLoadingPhotos ? <Spinner /> : <><UploadIcon className="w-10 h-10 text-text-secondary dark:text-dark-text-secondary mb-2"/><span className="text-text-secondary dark:text-dark-text-secondary">Seleccionar fotos</span></>}
                    </label>
                    <input id="exp-photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoFileChange} disabled={isLoadingPhotos} />
                    {experiencePhotos.length > 0 && <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                        {experiencePhotos.map((photo, i) => <div key={i} className="relative group"><img src={photo} className="w-full h-24 object-cover rounded-lg"/><button onClick={() => removeExperiencePhoto(i)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100"><TrashIcon className="w-4 h-4"/></button></div>)}
                    </div>}
                </div>
                <div className="mt-12"><Button type="submit">Siguiente</Button></div>
            </form>);

            case 'add_method': return (<>
                <h2 className="text-2xl sm:text-3xl font-bold mb-10">¿Cómo quieres añadir el gasto?</h2>
                <div className="w-full max-w-md flex flex-col gap-4">
                    <Button onClick={handleNext('add_manual_desc')} variant="secondary" className="w-full text-base py-4 justify-start"><PlusIcon /> Añadir Manualmente</Button>
                    <Button onClick={handleNext('scanning')} className="w-full text-base py-4 justify-start"><SparklesIcon/> Escanear Boleta(s) con IA</Button>
                </div>
            </>);

            case 'add_manual_desc': return (<form onSubmit={handleNext('add_manual_amount')} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Describe el gasto.</h2>
                <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} value={manualDescription} onChange={e => setManualDescription(e.target.value)} placeholder="Ej: Compra de materiales..." required className={`${commonInputClass} h-24 resize-none`} />
                <div className="mt-12"><Button type="submit" disabled={!manualDescription.trim()}>Siguiente</Button></div>
            </form>);
            
            case 'add_manual_amount': return (<form onSubmit={handleNext('add_manual_receipt_number')} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">¿Cuál fue el monto?</h2>
                <div className="relative w-full max-w-lg">
                    <input ref={inputRef as React.Ref<HTMLInputElement>} type="text" inputMode="decimal" value={manualAmount} onChange={e => setManualAmount(e.target.value.replace(/[^0-9.]/, ''))} placeholder="0.00" required className={`${commonInputClass} pr-20`}/>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-text-secondary dark:text-dark-text-secondary">PEN</span>
                </div>
                <div className="mt-12"><Button type="submit" disabled={!manualAmount || parseFloat(manualAmount) <= 0}>Siguiente</Button></div>
            </form>);

            case 'add_manual_receipt_number': return (<form onSubmit={(e) => { e.preventDefault(); handleManualAdd(); }} className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">Opcional: ¿Cuál es el número de la boleta?</h2>
                <input 
                    ref={inputRef as React.Ref<HTMLInputElement>} 
                    type="text" 
                    value={manualReceiptNumber} 
                    onChange={e => setManualReceiptNumber(e.target.value)} 
                    placeholder="Ej: 001-001234" 
                    className={commonInputClass} />
                <div className="mt-12"><Button type="submit">Confirmar Gasto</Button></div>
            </form>);
            
            case 'signature': return (<>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Firma de Conformidad</h2>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">Firma en el recuadro para confirmar que los gastos son correctos.</p>
                <div className="w-full h-64"><SignaturePad onSave={handleFinalSubmit} /></div>
            </>);

            default: return null;
        }
    };
    
    if (isStepView) {
        return (
            <div className="w-full h-full flex flex-col p-4 sm:p-8">
                <div className="w-full max-w-2xl mx-auto"><div className="bg-border dark:bg-dark-border h-1.5 rounded-full"><div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }}></div></div></div>
                <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
                    <div className="w-full flex flex-col items-center animate-fade-in-up" key={step}>
                        {renderStepContent()}
                    </div>
                </div>
                <div className="h-14 w-full max-w-2xl mx-auto flex justify-start items-center">
                   <Button type="button" variant="dark-ghost" onClick={handlePrev} className="rounded-full px-6 py-2">Atrás</Button>
                </div>
            </div>
        );
    }
  
    // --- Render non-step views (welcome, hub, scanning, submitted) ---
    switch (step) {
        case 'welcome': return (
             <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">Rendir Gastos</h1>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-xl mb-8">Estás a punto de rendir cuentas para la solicitud: <strong className="text-primary">{expenseRequest.reason}</strong>.</p>
                 <Card className="max-w-md w-full text-left"><p className="flex justify-between"><span>Solicitante:</span> <span className="font-semibold">{expenseRequest.applicantName}</span></p><p className="flex justify-between mt-2"><span>Organización:</span> <span className="font-semibold">{expenseRequest.organization}</span></p><div className="border-t border-border dark:border-dark-border mt-4 pt-4"><p className="text-sm uppercase">Monto a Justificar</p><p className="text-3xl font-bold text-primary">{expenseRequest.amount.toFixed(2)} PEN</p></div></Card>
                <div className="mt-12"><Button onClick={handleNext('leader_name')} className="text-lg px-8 py-3 rounded-full">Comenzar Rendición</Button></div>
            </div>);
        
        case 'expense_hub': return (
            <div className="w-full h-full flex flex-col p-4 sm:p-8 max-w-5xl mx-auto">
                <div className="w-full max-w-2xl mx-auto mb-4"><div className="bg-border dark:bg-dark-border h-1.5 rounded-full"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${currentProgress}%` }}></div></div></div>
                <div className="flex-shrink-0"><h1 className="text-3xl font-bold mb-2">Desglose de Gastos</h1><p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6">Añade los gastos manualmente o escanéalos con IA. Cuando termines, presiona "Continuar".</p></div>
                
                <div className="flex-grow overflow-y-auto pr-2 min-h-[150px]">
                    {items.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <DocumentIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4"/>
                                <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">Aún no se han añadido gastos.</p>
                                <Button variant="secondary" onClick={handleNext('add_method')}><PlusIcon /> Añadir Primer Gasto</Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {groupedItems.map((group) => {
                                const isReceipt = !!group[0].receiptId;
                                const vendor = group[0].vendor || 'Gasto Manual';
                                const receiptNumber = group[0].receiptNumber;
                                const groupTotal = group.reduce((sum, item) => sum + item.amount, 0);

                                return (
                                    <Card key={group[0].receiptId || group[0].id} className="p-4 animate-fade-in-up">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{vendor}</p>
                                                {receiptNumber && <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boleta N°: {receiptNumber}</p>}
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                <p className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{groupTotal.toFixed(2)}</p>
                                                <button
                                                    onClick={() => handleDeleteGroup(group[0].receiptId || group[0].id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                    aria-label="Eliminar gasto"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        {isReceipt && (
                                            <div className="mt-3 pt-3 border-t border-border dark:border-dark-border/50 space-y-1">
                                                {group.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-text-secondary dark:text-dark-text-secondary truncate pr-4">{item.description}</span>
                                                        <span className="font-medium text-text-primary dark:text-dark-text-primary flex-shrink-0">{item.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center flex-shrink-0">
                    <Button variant="secondary" onClick={handleNext('add_method')}><PlusIcon /> Añadir Gasto</Button>
                    <Button className="w-full max-w-sm py-3 text-lg" onClick={handleNext('incident_check')} disabled={items.length === 0}>Continuar con la Rendición</Button>
                </div>
            </div>);

        case 'scanning': return (<ScanReceiptsView expenseRequest={expenseRequest} existingReceiptNumbers={new Set(items.map(item => item.receiptNumber).filter(Boolean))} onClose={handleNext('expense_hub')} onComplete={(newItems) => { setItems(prev => [...prev, ...newItems]); setStep('expense_hub'); }}/>);
        
        case 'submitted': return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-fade-in-up">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-3">¡Rendición Enviada!</h2><p className="max-w-md mb-8">Tu rendición para "{expenseRequest.reason}" ha sido enviada.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <Button onClick={() => setView(View.PENDING_REPORTS)} className="w-full py-3">Ver Pendientes</Button>
                    <Button onClick={() => setView(View.DASHBOARD)} variant="secondary" className="w-full py-3">Volver al Inicio</Button>
                </div>
            </div>);
        
        default: return null;
    }
  };

  return <>{renderContent()}</>;
};

export default SubmitReportForm;