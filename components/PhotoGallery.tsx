import React, { useState } from 'react';
import { ExpenseRequest } from '../types';
import Card from './common/Card';
import { FolderIcon } from './icons/Icons';

interface PhotoGalleryProps {
  requests: ExpenseRequest[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ requests }) => {
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);

  const requestsWithPhotos = requests.filter(
    (r) => (r.receiptImages?.length ?? 0) > 0 || (r.spiritualExperience?.photos?.length ?? 0) > 0
  );

  const toggleFolder = (requestId: string) => {
    setOpenRequestId(prevId => (prevId === requestId ? null : requestId));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Galería de Fotos</h1>
      {requestsWithPhotos.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary dark:text-dark-text-secondary">
            No hay fotos de rendiciones para mostrar todavía.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requestsWithPhotos.map((request) => {
            const isFolderOpen = openRequestId === request.id;
            const totalImages = (request.receiptImages?.length ?? 0) + (request.spiritualExperience?.photos?.length ?? 0);

            return (
              <Card key={request.id} className="overflow-hidden">
                <button
                  onClick={() => toggleFolder(request.id)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="flex items-center">
                    <FolderIcon className={`w-6 h-6 mr-3 ${isFolderOpen ? 'text-primary' : 'text-text-secondary'}`} />
                    <div>
                      <p className={`font-semibold ${isFolderOpen ? 'text-primary' : 'text-text-primary dark:text-dark-text-primary'}`}>{request.reason}</p>
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        {request.applicantName} - {totalImages} foto(s)
                      </p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-text-secondary dark:text-dark-text-secondary transform transition-transform ${isFolderOpen ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isFolderOpen && (
                  <div className="mt-4 pt-4 border-t border-border dark:border-dark-border">
                    {/* Activity Photos */}
                    {(request.spiritualExperience?.photos?.length ?? 0) > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">Fotos de Actividad</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {request.spiritualExperience?.photos?.map((photoUrl, index) => (
                            <a href={photoUrl} target="_blank" rel="noopener noreferrer" key={`activity-${index}`}>
                                <img src={photoUrl} alt={`Activity ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Receipt Images */}
                    {(request.receiptImages?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">Fotos de Boletas</h4>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           {request.receiptImages?.map((photoUrl, index) => (
                            <a href={photoUrl} target="_blank" rel="noopener noreferrer" key={`receipt-${index}`}>
                                <img src={photoUrl} alt={`Receipt ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;