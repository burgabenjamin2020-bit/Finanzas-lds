import React from 'react';
import Card from './common/Card';
import { DocumentDownloadIcon } from './icons/Icons';
import Button from './common/Button';

const downloadableFormats = [
    {
        title: "Formato de Solicitud de Gastos",
        description: "Utilice este documento para solicitar fondos antes de una actividad. Debe ser firmado por el líder de la organización.",
        fileName: "formato_solicitud_gastos.pdf",
    },
    {
        title: "Formulario de Rendición de Cuentas",
        description: "Complete este formulario para justificar los gastos, adjuntando todas las boletas y facturas correspondientes.",
        fileName: "formulario_rendicion_cuentas.pdf",
    },
    {
        title: "Política de Gastos y Reembolsos",
        description: "Documento de referencia que detalla los gastos permitidos y el procedimiento de reembolso.",
        fileName: "politica_gastos_reembolsos.pdf",
    },
];

const FormatsView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Formatos para Descarga</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
                Aquí encontrará los documentos necesarios para el proceso de solicitud y rendición de gastos de forma manual.
            </p>
            <Card>
                <div className="space-y-4">
                    {downloadableFormats.map((format, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-background dark:bg-dark-surface border border-border dark:border-dark-border">
                            <div className="flex items-start">
                                <DocumentDownloadIcon className="w-8 h-8 text-primary flex-shrink-0 mr-4 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{format.title}</h3>
                                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{format.description}</p>
                                </div>
                            </div>
                            <a href={`/path/to/your/pdfs/${format.fileName}`} download className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                                <Button variant="secondary">Descargar PDF</Button>
                            </a>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default FormatsView;