'use client';

import { NDAFormData } from '@/types/nda';
import { ChangeEvent } from 'react';

interface NDAFormProps {
  formData: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

export default function NDAForm({ formData, onChange }: NDAFormProps) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Agreement Details
        </h2>
        <p className="text-sm text-gray-600">
          Fill in the information below to generate your Mutual NDA
        </p>
      </div>

      {/* Party 1 Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Party 1 Information
        </h3>

        <div>
          <label htmlFor="party1Name" className="block text-sm font-medium text-gray-700 mb-1">
            Party 1 Name *
          </label>
          <input
            type="text"
            id="party1Name"
            name="party1Name"
            value={formData.party1Name}
            onChange={handleChange}
            required
            placeholder="e.g., Acme Corporation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="party1Email" className="block text-sm font-medium text-gray-700 mb-1">
            Party 1 Email *
          </label>
          <input
            type="email"
            id="party1Email"
            name="party1Email"
            value={formData.party1Email}
            onChange={handleChange}
            required
            placeholder="e.g., contact@acme.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Party 2 Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Party 2 Information
        </h3>

        <div>
          <label htmlFor="party2Name" className="block text-sm font-medium text-gray-700 mb-1">
            Party 2 Name *
          </label>
          <input
            type="text"
            id="party2Name"
            name="party2Name"
            value={formData.party2Name}
            onChange={handleChange}
            required
            placeholder="e.g., Tech Solutions Inc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="party2Email" className="block text-sm font-medium text-gray-700 mb-1">
            Party 2 Email *
          </label>
          <input
            type="email"
            id="party2Email"
            name="party2Email"
            value={formData.party2Email}
            onChange={handleChange}
            required
            placeholder="e.g., legal@techsolutions.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Agreement Terms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Agreement Terms
        </h3>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Purpose *
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows={3}
            placeholder="e.g., discussing a potential business partnership"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Describe what this NDA is for
          </p>
        </div>

        <div>
          <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-1">
            Effective Date *
          </label>
          <input
            type="date"
            id="effectiveDate"
            name="effectiveDate"
            value={formData.effectiveDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="mndaTerm" className="block text-sm font-medium text-gray-700 mb-1">
            MNDA Term *
          </label>
          <select
            id="mndaTerm"
            name="mndaTerm"
            value={formData.mndaTerm}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select term...</option>
            <option value="1 year from the Effective Date">1 year</option>
            <option value="2 years from the Effective Date">2 years</option>
            <option value="3 years from the Effective Date">3 years</option>
            <option value="5 years from the Effective Date">5 years</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            How long the agreement lasts
          </p>
        </div>

        <div>
          <label htmlFor="confidentialityTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Term of Confidentiality *
          </label>
          <select
            id="confidentialityTerm"
            name="confidentialityTerm"
            value={formData.confidentialityTerm}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select term...</option>
            <option value="2 years from the date of disclosure">2 years</option>
            <option value="3 years from the date of disclosure">3 years</option>
            <option value="5 years from the date of disclosure">5 years</option>
            <option value="7 years from the date of disclosure">7 years</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            How long information must remain confidential
          </p>
        </div>
      </div>

      {/* Legal Terms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Legal Terms
        </h3>

        <div>
          <label htmlFor="governingLaw" className="block text-sm font-medium text-gray-700 mb-1">
            Governing Law (State) *
          </label>
          <select
            id="governingLaw"
            name="governingLaw"
            value={formData.governingLaw}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select state...</option>
            <option value="Delaware">Delaware</option>
            <option value="California">California</option>
            <option value="New York">New York</option>
            <option value="Texas">Texas</option>
            <option value="Florida">Florida</option>
            <option value="Illinois">Illinois</option>
            <option value="Washington">Washington</option>
            <option value="Massachusetts">Massachusetts</option>
          </select>
        </div>

        <div>
          <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction *
          </label>
          <input
            type="text"
            id="jurisdiction"
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={handleChange}
            required
            placeholder="e.g., San Francisco County, California"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <p className="mt-1 text-xs text-gray-500">
            Where legal disputes will be resolved
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500 italic">
          * All fields are required
        </p>
      </div>
    </div>
  );
}
