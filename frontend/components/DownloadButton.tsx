'use client';

import { NDAFormData } from '@/types/nda';
import { generatePDF } from '@/lib/pdfGenerator';
import { parseTemplate, generateCoverPage, isFormComplete } from '@/lib/templateParser';
import { mutualNdaTemplate } from '@/data/mutualNda';
import { useState } from 'react';

interface DownloadButtonProps {
  formData: NDAFormData;
}

export default function DownloadButton({ formData }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isComplete = isFormComplete(formData);

  const handleDownload = async () => {
    if (!isComplete) return;

    setIsGenerating(true);
    setError(null);

    try {
      const coverPage = generateCoverPage(formData);
      const parsedTemplate = parseTemplate(mutualNdaTemplate, formData);
      const fullDocument = coverPage + parsedTemplate;

      const filename = `Mutual-NDA-${formData.party1Name.replace(/\s+/g, '-')}-${formData.party2Name.replace(/\s+/g, '-')}.pdf`;

      await generatePDF(fullDocument, filename);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={!isComplete || isGenerating}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
          ${
            !isComplete || isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating PDF...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download as PDF
          </span>
        )}
      </button>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!isComplete && (
        <p className="text-sm text-gray-500 text-center">
          Complete all fields to download
        </p>
      )}
    </div>
  );
}
