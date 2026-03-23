'use client';

import { NDAFormData } from '@/types/nda';
import { parseTemplate, generateCoverPage, isFormComplete } from '@/lib/templateParser';
import { mutualNdaTemplate } from '@/data/mutualNda';
import { Fragment } from 'react';

interface NDAPreviewProps {
  formData: NDAFormData;
}

export default function NDAPreview({ formData }: NDAPreviewProps) {
  const isComplete = isFormComplete(formData);
  const coverPage = generateCoverPage(formData);
  const parsedTemplate = parseTemplate(mutualNdaTemplate, formData);
  const fullDocument = coverPage + parsedTemplate;

  // Safely render text with bold markers
  const renderTextWithBold = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4">
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-3">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith('---')) {
          return <hr key={index} className="my-6 border-t-2 border-gray-300" />;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }

        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-3">
            {renderTextWithBold(line)}
          </p>
        );
      });
  };

  if (!isComplete) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">
            Document Preview
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Fill in all required fields in the form to see your Mutual NDA preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 pb-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review your generated Mutual NDA
            </p>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        <div className="prose prose-sm max-w-none" id="nda-preview-content">
          {renderMarkdown(fullDocument)}
        </div>
      </div>
    </div>
  );
}
