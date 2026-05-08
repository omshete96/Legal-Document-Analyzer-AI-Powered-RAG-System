import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Sparkles, CloudUpload, FileSearch } from 'lucide-react';
import { uploadPDF } from '../lib/api';

interface UploadAreaProps {
    onUploadComplete: (data: any) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
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

    const simulateProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);
        return interval;
    };

    const handleFiles = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file only.');
            return;
        }
        setError(null);
        setIsUploading(true);
        setFileName(file.name);

        const progressInterval = simulateProgress();

        try {
            const data = await uploadPDF(file);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(() => {
                onUploadComplete(data);
            }, 300);
        } catch (err) {
            clearInterval(progressInterval);
            setError('Failed to upload PDF. Please try again.');
            console.error(err);
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 
                       ${isDragging
                    ? 'border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 scale-[1.02] shadow-glow-indigo'
                    : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/60'
                }
                       glass-card shadow-premium card-hover`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".pdf"
                className="hidden"
            />

            <div className="relative p-12 flex flex-col items-center justify-center space-y-6">
                {isUploading ? (
                    <div className="w-full max-w-sm space-y-6">
                        {/* Animated Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                                <div className="relative p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                    <FileSearch className="w-10 h-10 text-white animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* File Name */}
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{fileName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Processing and analyzing...</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full progress-bar rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                    Embedding with AI
                                </span>
                                <span className="font-medium">{Math.round(uploadProgress)}%</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Upload Icon */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="relative p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <CloudUpload className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3 text-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                Upload Your Legal Document
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                                Drag and drop your PDF here, or click the button below.
                                <br />
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Maximum file size: 10MB</span>
                            </p>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative px-8 py-4 text-base font-semibold text-white 
                                     bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 
                                     rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 
                                     focus:outline-none focus:ring-4 focus:ring-indigo-300/50 dark:focus:ring-indigo-500/30
                                     transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]
                                     shadow-lg hover:shadow-xl btn-glow"
                        >
                            <span className="flex items-center gap-3">
                                <FileText className="w-5 h-5" />
                                <span>Select PDF File</span>
                            </span>
                        </button>

                        {/* Supported Format */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800/60 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">PDF files supported</span>
                        </div>
                    </>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-5 py-3 rounded-xl border border-red-200 dark:border-red-800/50 animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};