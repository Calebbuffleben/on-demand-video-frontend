import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface CoverUploaderProps {
  onCoverSelect: (file: File) => void;
  currentCover?: string;
}

export default function CoverUploader({ onCoverSelect, currentCover }: CoverUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  console.log('[CoverUploader] Initial previewUrl state: ', previewUrl);

  useEffect(() => {
    console.log('[CoverUploader] useEffect triggered. currentCover:', currentCover);
    if (currentCover) {
      if (currentCover.startsWith('/')) {
        const newUrl = `${process.env.BACKEND_URL}${currentCover}`;
        setPreviewUrl(newUrl);
      } else {
        setPreviewUrl(currentCover);
      }
    } else {
      setPreviewUrl(undefined);
    }
  }, [currentCover]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onCoverSelect(file);
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [onCoverSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="space-y-4">
            <Image
              src={previewUrl}
              alt="Video cover preview"
              className="mx-auto max-h-48 rounded-lg shadow-sm"
              width={320}
              height={192}
              style={{ objectFit: 'contain', maxHeight: '12rem' }}
              onError={(e) => { 
                console.error('[CoverUploader] Error loading image:', previewUrl, e); 
              }}
            />
            <p className="text-sm text-gray-500">
              Clique ou arraste para substituir a imagem de capa
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Clique para enviar ou arraste e solte</p>
              <p>PNG, JPG, GIF até 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 