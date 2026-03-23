'use client';

import { useState } from 'react';
import { NDAFormData } from '@/types/nda';
import NDAForm from '@/components/NDAForm';
import NDAPreview from '@/components/NDAPreview';
import DownloadButton from '@/components/DownloadButton';
import ChatInterface from '@/components/ChatInterface';
import ModeToggle from '@/components/ModeToggle';

export default function Home() {
  const [mode, setMode] = useState<'chat' | 'form'>('chat');
  const [formData, setFormData] = useState<NDAFormData>({
    party1Name: '',
    party1Email: '',
    party2Name: '',
    party2Email: '',
    purpose: '',
    effectiveDate: '',
    mndaTerm: '',
    confidentialityTerm: '',
    governingLaw: '',
    jurisdiction: '',
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Prelegal</h1>
              <p className="text-blue-100 mt-1">Mutual NDA Generator</p>
            </div>
            <div className="flex items-center space-x-6">
              <ModeToggle mode={mode} onChange={setMode} />
              <div className="text-right">
                <p className="text-sm text-blue-100">Production Ready</p>
                <p className="text-xs text-blue-200">Powered by CommonPaper</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Chat or Form */}
          <div className="space-y-6">
            {mode === 'chat' ? (
              <ChatInterface formData={formData} onChange={setFormData} />
            ) : (
              <NDAForm formData={formData} onChange={setFormData} />
            )}
            <div className="sticky bottom-4">
              <DownloadButton formData={formData} />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <NDAPreview formData={formData} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Powered by{' '}
              <a
                href="https://commonpaper.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                CommonPaper
              </a>{' '}
              templates
            </p>
            <p className="text-xs text-gray-500 italic max-w-2xl mx-auto">
              This application generates legal documents based on CommonPaper's standard templates.
              While these templates are widely used and legally sound, we recommend having any
              generated documents reviewed by qualified legal counsel before use.
            </p>
            <p className="text-xs text-gray-400">
              CommonPaper Mutual Non-Disclosure Agreement Version 1.0 • Licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY 4.0
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
