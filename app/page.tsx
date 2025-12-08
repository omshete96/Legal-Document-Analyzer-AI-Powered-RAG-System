'use client';

import React, { useState } from 'react';
import { UploadArea } from '@/components/UploadArea';
import { ChatInterface } from '@/components/ChatInterface';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Scale } from 'lucide-react';

export default function Home() {
  const [uploadData, setUploadData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Document Analyzer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!uploadData ? (
          <div className="max-w-2xl mx-auto mt-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Analyze Legal Documents with AI</h2>
              <p className="mt-4 text-lg text-gray-600">
                Upload your contracts, agreements, or legal briefs to get instant insights,
                risk analysis, and answers to your questions.
              </p>
            </div>
            <UploadArea onUploadComplete={setUploadData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
            <div className="flex flex-col space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-700">Document: {uploadData.filename}</h3>
              </div>
              <ChatInterface />
            </div>
            <div className="h-full">
              <AnalysisResults documentText={uploadData.full_text} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
