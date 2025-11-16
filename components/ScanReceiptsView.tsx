import React, { useState, useMemo, useCallback } from 'react';
import { ExpenseRequest, ExpenseItem, ReceiptData } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { extractReceiptData } from '../services/geminiService';
import { optimizeImage } from '../utils/imageOptimizer';
import { UploadIcon, TrashIcon, SparklesIcon, CheckCircleIcon, ExclamationIcon, XIcon } from './icons/Icons';

interface ScanReceiptsViewProps {
    expenseRequest: ExpenseRequest;
    existingReceiptNumbers: Set<string>;
    onClose: () => void;
    onComplete: (newItems: ExpenseItem[]) => void;
}

interface ScanSummary {
    newItems: ExpenseItem[];
    totalScanned: number;
    duplicatesFound: number;
    errors: number;
    errorMessages: string[];
}

const ScanningImage = ({ imageUrl }: { imageUrl: string }) => {
    const highlights = useMemo(() => {
        return Array.from({ length: 15 }).map(() => ({
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 80}%`,
            width: `${Math.random() * 15 + 5}%`,
            height: `${Math.random() * 4 + 1}%`,
            animationDelay: `${Math.random() * 2}s`,
        }));
    }, []);

    return (
        <div className="relative w-full aspect-square max-h-[60vh] overflow-hidden rounded-lg bg-slate-900/50 flex items-center justify-center">
            <img src={imageUrl} alt="Scanning receipt" className="max-w-full max-h-full object-contain" />
            <div className="absolute inset-0">
                <div className="scanner-line"></div>
                {highlights.map((style, i) => (
                    <div key={i} className="text-highlight" style={style}></div>
                ))}
            </div>
        </div>
    );
};


const ScanReceiptsView: React.FC<ScanReceiptsViewProps> = ({ expenseRequest, existingReceiptNumbers, onClose, onComplete }) => {
    const [view, setView] = useState<'upload' | 'scanning' | 'summary'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
    const [scanMessage, setScanMessage] = useState('');
    const [currentScanIndex, setCurrentScanIndex] = useState(0);

    const handleFileChange = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles);
        setFiles(prev => [...prev, ...newFiles]);
        const newPreviews = await Promise.all(newFiles.map(file => URL.createObjectURL(file)));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        const urlToRevoke = previews[index];
        URL.revokeObjectURL(urlToRevoke);
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleStartScan = async () => {
        if (files.length === 0) return;
        
        setView('scanning');
        setIsProcessing(true);

        const newItems: ExpenseItem[] = [];
        let duplicatesFound = 0;
        let errors = 0;
        const errorMessages: string[] = [];
        const processedInThisBatch = new Set<string>();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setCurrentScanIndex(i);
            setScanMessage(`Analizando: ${file.name}...`);
            
            try {
                const dataUrl = await optimizeImage(file);
                const base64String = dataUrl.split(',')[1];
                const allReceiptsInData: ReceiptData[] = await extractReceiptData(base64String);

                if (allReceiptsInData.length === 0) {
                    console.warn(`No receipts found in file ${file.name}.`);
                    errors++;
                    errorMessages.push(`No se encontraron boletas válidas en ${file.name}.`);
                    continue;
                }

                for (const data of allReceiptsInData) {
                    if (!data.isBoleta) {
                        console.warn(`An item in ${file.name} was not a valid receipt and was skipped.`);
                        continue;
                    }
                    if (existingReceiptNumbers.has(data.receiptNumber) || processedInThisBatch.has(data.receiptNumber)) {
                        duplicatesFound++;
                        continue;
                    }
                    processedInThisBatch.add(data.receiptNumber);

                    const receiptId = `receipt-${Date.now()}-${data.receiptNumber}`;
                    if (!data.lineItems || data.lineItems.length === 0) {
                        newItems.push({ id: `${receiptId}-total`, description: data.vendor || "Proveedor Desconocido", amount: data.total, receiptImage: dataUrl, receiptId, vendor: data.vendor, receiptNumber: data.receiptNumber });
                    } else {
                        data.lineItems.forEach((item, index) => newItems.push({ id: `${receiptId}-${index}`, description: item.description, amount: item.amount, receiptImage: dataUrl, receiptId, vendor: data.vendor, receiptNumber: data.receiptNumber }));
                    }
                }
            } catch (err: any) {
                console.error(`Error processing ${file.name}:`, err);
                errors++;
                errorMessages.push(`Error en ${file.name.substring(0, 20)}...: ${err.message || 'Error desconocido'}`);
            }
        }
        
        const totalScanned = newItems.reduce((sum, item) => sum + item.amount, 0);
        setScanSummary({ newItems, totalScanned, duplicatesFound, errors, errorMessages });
        setView('summary');
        setIsProcessing(false);
    };

    const handleConfirmScan = () => {
        if (scanSummary) {
            onComplete(scanSummary.newItems);
        }
    };
    
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }, []);

    const renderContent = () => {
        switch (view) {
            case 'scanning':
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Analizando Boletas</h2>
                        <p className="text-slate-300 mb-6 truncate">{scanMessage}</p>
                        {previews[currentScanIndex] && <ScanningImage imageUrl={previews[currentScanIndex]} />}
                        <p className="font-mono text-slate-200 mt-4">{currentScanIndex + 1} / {files.length}</p>
                    </div>
                );
            case 'summary':
                if (!scanSummary) return null;
                const { totalScanned, newItems, duplicatesFound, errors, errorMessages } = scanSummary;
                const difference = totalScanned - expenseRequest.amount;
                const hasNewItems = newItems.length > 0;
                 return (
                     <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col bg-surface dark:bg-dark-surface">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Resumen del Escaneo</h2>
                        
                        {hasNewItems && difference > 0 && <div className="flex items-center gap-3 bg-amber-500/10 p-3 rounded-lg"><ExclamationIcon className="w-8 h-8 text-amber-500 flex-shrink-0" /><div><h4 className="font-bold text-amber-600">Gasto por encima de lo solicitado</h4><p className="text-sm text-text-secondary dark:text-dark-text-secondary">Has gastado <span className="font-bold">{difference.toFixed(2)} PEN</span> más de lo pedido.</p></div></div>}
                        {hasNewItems && difference < 0 && <div className="flex items-center gap-3 bg-blue-500/10 p-3 rounded-lg"><ExclamationIcon className="w-8 h-8 text-blue-500 flex-shrink-0" /><div><h4 className="font-bold text-blue-600">Falta sustentar gastos</h4><p className="text-sm text-text-secondary dark:text-dark-text-secondary">Te faltan <span className="font-bold">{Math.abs(difference).toFixed(2)} PEN</span> para justificar el monto total.</p></div></div>}
                        {hasNewItems && difference.toFixed(2) === '0.00' && <div className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg"><CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" /><div><h4 className="font-bold text-green-600">¡Monto justificado!</h4><p className="text-sm text-text-secondary dark:text-dark-text-secondary">El total escaneado coincide con lo solicitado.</p></div></div>}

                        <div className="my-4 text-center">
                            <p className="text-text-secondary dark:text-dark-text-secondary">Total Escaneado</p>
                            <p className="text-5xl font-bold text-primary">{totalScanned.toFixed(2)} <span className="text-2xl">PEN</span></p>
                        </div>

                        <div className="flex-grow overflow-y-auto border-t border-b border-border dark:border-dark-border py-4 my-4 pr-2 space-y-2">
                            <h4 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">{hasNewItems ? "Desglose de nuevos gastos:" : "No se añadieron nuevos gastos."}</h4>
                            {newItems.map(item => <div key={item.id} className="flex justify-between text-sm"><span className="text-text-secondary dark:text-dark-text-secondary truncate pr-4">{item.description}</span> <span className="font-medium text-text-primary dark:text-dark-text-primary flex-shrink-0">{item.amount.toFixed(2)}</span></div>)}
                        </div>

                        <div className="text-xs text-text-secondary dark:text-dark-text-secondary space-y-1">
                            {duplicatesFound > 0 && <p>Se omitieron {duplicatesFound} boleta(s) por ser duplicadas.</p>}
                            {errors > 0 && <p className="font-semibold text-red-500">Ocurrieron {errors} error(es) durante el proceso.</p>}
                            {errorMessages.length > 0 && (
                                <div className="mt-2 p-2 bg-red-500/10 rounded-md text-red-700 dark:text-red-400 text-xs">
                                    <ul className="list-disc list-inside space-y-1">
                                        {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
                            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                            {hasNewItems ? (
                                <Button onClick={handleConfirmScan}>
                                    Confirmar y Añadir Gastos
                                </Button>
                            ) : (
                                <Button onClick={onClose}>Cerrar</Button>
                            )}
                        </div>
                    </Card>
                );
            case 'upload':
            default:
                return (
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface dark:bg-dark-surface">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Subir Boletas para Escanear</h2>
                        <div onDragOver={handleDragOver} onDrop={handleDrop} className="flex-grow mb-6">
                            <label htmlFor="receipt-upload-scanner" className="cursor-pointer w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border dark:border-dark-border rounded-lg p-8 transition-colors hover:bg-background dark:hover:bg-dark-surface/50">
                                <UploadIcon className="w-12 h-12 text-text-secondary dark:text-dark-text-secondary mb-2" />
                                <span className="text-text-secondary dark:text-dark-text-secondary">Haz clic para seleccionar o arrastra tus fotos aquí</span>
                                <span className="text-xs text-text-secondary/70 dark:text-dark-text-secondary/70">Puedes subir varias imágenes a la vez</span>
                            </label>
                            <input id="receipt-upload-scanner" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                        </div>

                        {previews.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Archivos Cargados ({previews.length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 overflow-y-auto max-h-48 pr-2">
                                    {previews.map((previewUrl, index) => (
                                        <div key={index} className="relative group">
                                            <img src={previewUrl} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                                            <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <Button onClick={handleStartScan} disabled={files.length === 0 || isProcessing} className="w-full mt-auto text-base py-3">
                            <SparklesIcon /> Analizar {files.length > 0 ? `${files.length} Gasto(s)` : 'Gastos'}
                        </Button>
                    </Card>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-40 p-4">
             <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50" aria-label="Cerrar escáner">
                <XIcon className="w-8 h-8" />
            </button>
            {renderContent()}
        </div>
    );
};

export default ScanReceiptsView;