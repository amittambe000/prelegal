import { parseTemplate, generateCoverPage, isFormComplete } from '../templateParser';
import { NDAFormData } from '@/types/nda';

describe('templateParser', () => {
  const mockFormData: NDAFormData = {
    party1Name: 'Acme Corp',
    party1Email: 'contact@acme.com',
    party2Name: 'Tech Solutions Inc',
    party2Email: 'legal@techsolutions.com',
    purpose: 'discussing a potential business partnership',
    effectiveDate: '2026-03-23',
    mndaTerm: '2 years from the Effective Date',
    confidentialityTerm: '3 years from the date of disclosure',
    governingLaw: 'California',
    jurisdiction: 'San Francisco County, California',
  };

  describe('parseTemplate', () => {
    it('should replace all placeholders with form data', () => {
      const template = 'Purpose: {{PURPOSE}}, Date: {{EFFECTIVE_DATE}}, Law: {{GOVERNING_LAW}}';
      const result = parseTemplate(template, mockFormData);

      expect(result).toContain('discussing a potential business partnership');
      expect(result).toContain('2026-03-23');
      expect(result).toContain('California');
      expect(result).not.toContain('{{PURPOSE}}');
      expect(result).not.toContain('{{EFFECTIVE_DATE}}');
      expect(result).not.toContain('{{GOVERNING_LAW}}');
    });

    it('should handle empty form fields with default values', () => {
      const emptyFormData: NDAFormData = {
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
      };

      const template = 'Purpose: {{PURPOSE}}';
      const result = parseTemplate(template, emptyFormData);

      expect(result).toContain('[Purpose]');
    });

    it('should replace multiple occurrences of the same placeholder', () => {
      const template = '{{PURPOSE}} ... {{PURPOSE}} ... {{PURPOSE}}';
      const result = parseTemplate(template, mockFormData);

      const occurrences = (result.match(/discussing a potential business partnership/g) || []).length;
      expect(occurrences).toBe(3);
    });

    it('should handle special characters in form data', () => {
      const specialFormData = {
        ...mockFormData,
        purpose: 'Test & Development (R&D)',
      };

      const template = 'Purpose: {{PURPOSE}}';
      const result = parseTemplate(template, specialFormData);

      expect(result).toContain('Test & Development (R&D)');
    });
  });

  describe('generateCoverPage', () => {
    it('should generate a properly formatted cover page', () => {
      const coverPage = generateCoverPage(mockFormData);

      expect(coverPage).toContain('# Cover Page');
      expect(coverPage).toContain('Mutual Non-Disclosure Agreement');
      expect(coverPage).toContain('Acme Corp');
      expect(coverPage).toContain('contact@acme.com');
      expect(coverPage).toContain('Tech Solutions Inc');
      expect(coverPage).toContain('legal@techsolutions.com');
      expect(coverPage).toContain('2026-03-23');
      expect(coverPage).toContain('discussing a potential business partnership');
    });

    it('should handle empty fields gracefully', () => {
      const emptyFormData: NDAFormData = {
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
      };

      const coverPage = generateCoverPage(emptyFormData);

      expect(coverPage).toContain('[Not specified]');
    });

    it('should include all required sections', () => {
      const coverPage = generateCoverPage(mockFormData);

      expect(coverPage).toContain('**Effective Date:**');
      expect(coverPage).toContain('**Between:**');
      expect(coverPage).toContain('**Party 1:**');
      expect(coverPage).toContain('**Party 2:**');
      expect(coverPage).toContain('**Purpose:**');
      expect(coverPage).toContain('**Terms:**');
    });
  });

  describe('isFormComplete', () => {
    it('should return true when all fields are filled', () => {
      expect(isFormComplete(mockFormData)).toBe(true);
    });

    it('should return false when party1Name is empty', () => {
      const incompleteData = { ...mockFormData, party1Name: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when party1Email is empty', () => {
      const incompleteData = { ...mockFormData, party1Email: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when party2Name is empty', () => {
      const incompleteData = { ...mockFormData, party2Name: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when party2Email is empty', () => {
      const incompleteData = { ...mockFormData, party2Email: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when purpose is empty', () => {
      const incompleteData = { ...mockFormData, purpose: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when effectiveDate is empty', () => {
      const incompleteData = { ...mockFormData, effectiveDate: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when mndaTerm is empty', () => {
      const incompleteData = { ...mockFormData, mndaTerm: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when confidentialityTerm is empty', () => {
      const incompleteData = { ...mockFormData, confidentialityTerm: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when governingLaw is empty', () => {
      const incompleteData = { ...mockFormData, governingLaw: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when jurisdiction is empty', () => {
      const incompleteData = { ...mockFormData, jurisdiction: '' };
      expect(isFormComplete(incompleteData)).toBe(false);
    });

    it('should return false when multiple fields are empty', () => {
      const incompleteData = {
        ...mockFormData,
        party1Name: '',
        purpose: '',
        effectiveDate: '',
      };
      expect(isFormComplete(incompleteData)).toBe(false);
    });
  });
});
