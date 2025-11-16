import React, { useState } from 'react';
import { AuditedExpenseItem } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { UploadIcon } from './icons/Icons';
import Spinner from './common/Spinner';

// Hacemos que TypeScript reconozca la biblioteca pdfjsLib del script global
declare const pdfjsLib: any;

const AuditorView: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [auditedItems, setAuditedItems] = useState<AuditedExpenseItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
            setAuditedItems([]);
            setError(null);
        }
    };
    
    const handleProcessPdf = async () => {
        if (!pdfFile) return;
        setIsProcessing(true);
        setError(null);
        setAuditedItems([]);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (!event.target?.result) {
                    setError("No se pudo leer el archivo.");
                    setIsProcessing(false);
                    return;
                }
                const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Group text items by line based on their y-coordinate to reconstruct the page layout
                    const lines: Record<string, {x: number, str: string}[]> = {};
                    textContent.items.forEach((item: any) => {
                        const yKey = item.transform[5].toFixed(2);
                        if (!lines[yKey]) lines[yKey] = [];
                        lines[yKey].push({ x: item.transform[4], str: item.str });
                    });

                    // Sort lines from top to bottom, and text within each line from left to right
                    const pageText = Object.keys(lines)
                        .sort((a, b) => parseFloat(b) - parseFloat(a)) // Higher y-coordinate is higher on the page
                        .map(y => lines[y]
                            .sort((a, b) => a.x - b.x)
                            .map(item => item.str)
                            .join(' ')
                        )
                        .join('\n');
                    
                    fullText += pageText + '\n';
                }

                // Expresión regular para encontrar líneas con descripción y monto
                // Ejemplo de patrón: "Texto de descripción... 150.00"
                const expenseRegex = /(.+?)\s+([\d,]+\.\d{2})\s*$/gm;
                const items: AuditedExpenseItem[] = [];
                let idCounter = 1;

                let match: RegExpExecArray | null;
                while ((match = expenseRegex.exec(fullText)) !== null) {
                    // Ignorar líneas que probablemente no son gastos (ej. solo números o totales)
                    const description = match[1].trim();
                    if (description.toLowerCase().includes('total') || description.toLowerCase().includes('subtotal')) continue;

                    const amount = parseFloat(match[2].replace(',', ''));
                    items.push({
                        id: (idCounter++).toString(),
                        description,
                        amount,
                        audited: false,
                        comments: ''
                    });
                }
                
                if (items.length === 0) {
                     setError("No se encontraron gastos con el formato esperado en el PDF.");
                }

                setAuditedItems(items);
                setIsProcessing(false);
            };
            reader.readAsArrayBuffer(pdfFile);

        } catch (err) {
            console.error("Error processing PDF:", err);
            setError("Ocurrió un error al procesar el PDF. Asegúrese de que el archivo no esté dañado.");
            setIsProcessing(false);
        }
    };

    const handleItemChange = (id: string, field: 'audited' | 'comments', value: string | boolean) => {
        setAuditedItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Herramienta de Auditoría</h1>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">1. Cargar Reporte de Gastos</h2>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-4">Sube el archivo PDF generado por el sistema de finanzas para auditar los presupuestos del semestre.</p>
                        <label htmlFor="pdf-upload" className="cursor-pointer w-full flex items-center justify-center border-2 border-dashed border-border dark:border-dark-border rounded-lg p-6 transition-colors hover:bg-background dark:hover:bg-dark-surface/50">
                            <UploadIcon className="w-8 h-8 text-text-secondary dark:text-dark-text-secondary mr-3"/>
                            <span className="text-text-secondary dark:text-dark-text-secondary">{pdfFile ? `Archivo: ${pdfFile.name}` : 'Haz clic para seleccionar un PDF'}</span>
                        </label>
                        <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div className="text-center">
                         <Button onClick={handleProcessPdf} disabled={!pdfFile || isProcessing} className="w-full max-w-xs py-3 text-base">
                            {isProcessing ? <><Spinner/> Procesando...</> : '2. Analizar y Auditar Gastos'}
                        </Button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </Card>

            {auditedItems.length > 0 && (
                 <Card className="mt-6">
                    <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">Lista de Gastos para Auditar</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border dark:divide-dark-border">
                            <thead className="bg-background dark:bg-dark-surface/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider w-12">Listo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Descripción</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider w-40">Monto (PEN)</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Comentarios</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface dark:bg-dark-surface divide-y divide-border dark:divide-dark-border">
                                {auditedItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="checkbox" className="h-5 w-5 rounded text-primary focus:ring-primary border-border dark:border-dark-border" checked={item.audited} onChange={(e) => handleItemChange(item.id, 'audited', e.target.checked)} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-primary dark:text-dark-text-primary break-words">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-dark-text-primary font-medium">{item.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="text" value={item.comments} onChange={(e) => handleItemChange(item.id, 'comments', e.target.value)} placeholder="Añadir nota..." className="w-full bg-surface dark:bg-dark-border border-border dark:border-dark-border/50 rounded-md py-1 px-2 text-sm text-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-primary"/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card>
            )}
        </div>
    );
};

export default AuditorView;