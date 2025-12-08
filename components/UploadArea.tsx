import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadPDF } from '../lib/api';

interface UploadAreaProps {
    onUploadComplete: (data: any) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        setError(null);
        setIsUploading(true);
        try {
            const data = await uploadPDF(file);
            onUploadComplete(data);
        } catch (err) {
            setError('Failed to upload PDF. Please try again.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".pdf"
                className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
                {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                ) : (
                    <>
                        <div className="p-4 bg-blue-100 rounded-full">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500">PDF files only</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Select File
                        </button>
                    </>
                )}
                {error && (
                    <div className="flex items-center text-red-600 space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
