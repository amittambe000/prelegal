import { render, screen } from '@testing-library/react';
import NDAPreview from '../NDAPreview';
import { NDAFormData } from '@/types/nda';

describe('NDAPreview', () => {
  const completeFormData: NDAFormData = {
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

  const incompleteFormData: NDAFormData = {
    party1Name: 'Acme Corp',
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

  describe('when form is incomplete', () => {
    it('should show empty state message', () => {
      render(<NDAPreview formData={incompleteFormData} />);

      expect(screen.getByText('Document Preview')).toBeInTheDocument();
      expect(
        screen.getByText(/Fill in all required fields/i)
      ).toBeInTheDocument();
    });

    it('should show document icon in empty state', () => {
      render(<NDAPreview formData={incompleteFormData} />);

      const svg = screen.getByText(/Document Preview/i).parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not show document content when incomplete', () => {
      render(<NDAPreview formData={incompleteFormData} />);

      expect(screen.queryByRole('heading', { name: /Cover Page/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/Mutual Non-Disclosure Agreement/i)).not.toBeInTheDocument();
    });
  });

  describe('when form is complete', () => {
    it('should show document preview header', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText('Document Preview')).toBeInTheDocument();
      expect(screen.getByText(/Review your generated Mutual NDA/i)).toBeInTheDocument();
    });

    it('should show complete status indicator', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should render cover page with party information', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByRole('heading', { name: /Cover Page/i })).toBeInTheDocument();
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
      expect(screen.getByText(/contact@acme.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Tech Solutions Inc/i)).toBeInTheDocument();
      expect(screen.getByText(/legal@techsolutions.com/i)).toBeInTheDocument();
    });

    it('should render effective date', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText(/2026-03-23/i)).toBeInTheDocument();
    });

    it('should render purpose', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText(/discussing a potential business partnership/i)).toBeInTheDocument();
    });

    it('should render agreement terms', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText(/2 years from the Effective Date/i)).toBeInTheDocument();
      expect(screen.getByText(/3 years from the date of disclosure/i)).toBeInTheDocument();
    });

    it('should render legal terms', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByText(/California/i)).toBeInTheDocument();
      expect(screen.getByText(/San Francisco County, California/i)).toBeInTheDocument();
    });

    it('should render standard terms sections', () => {
      render(<NDAPreview formData={completeFormData} />);

      expect(screen.getByRole('heading', { name: /Standard Terms/i })).toBeInTheDocument();
    });

    it('should replace placeholders in template', () => {
      render(<NDAPreview formData={completeFormData} />);

      // Should not contain any placeholder markers
      const preview = screen.getByText(/Document Preview/i).parentElement;
      expect(preview?.textContent).not.toContain('{{PURPOSE}}');
      expect(preview?.textContent).not.toContain('{{EFFECTIVE_DATE}}');
      expect(preview?.textContent).not.toContain('{{GOVERNING_LAW}}');
    });

    it('should render bold text correctly', () => {
      render(<NDAPreview formData={completeFormData} />);

      // Look for strong tags that should be rendered from **text**
      const strongElements = screen.getAllByText(/Introduction|Confidential Information|Purpose/i, {
        selector: 'strong',
      });
      expect(strongElements.length).toBeGreaterThan(0);
    });

    it('should have scrollable content area', () => {
      render(<NDAPreview formData={completeFormData} />);

      const previewContainer = screen.getByText(/Review your generated Mutual NDA/i)
        .closest('.bg-white');
      expect(previewContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('markdown rendering', () => {
    it('should render headers with appropriate sizes', () => {
      render(<NDAPreview formData={completeFormData} />);

      // H1 should have specific class
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBeGreaterThan(0);
      expect(h1Elements[0]).toHaveClass('text-3xl');

      // H2 should have specific class
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
      expect(h2Elements[0]).toHaveClass('text-2xl');
    });

    it('should render horizontal rules', () => {
      render(<NDAPreview formData={completeFormData} />);

      const hrs = screen.getByText(/Review your generated Mutual NDA/i)
        .closest('.bg-white')
        ?.querySelectorAll('hr');
      expect(hrs?.length).toBeGreaterThan(0);
    });
  });

  describe('special characters and edge cases', () => {
    it('should handle special characters in form data', () => {
      const specialCharFormData = {
        ...completeFormData,
        purpose: 'R&D collaboration (Technology & Innovation)',
        party1Name: "O'Brien & Associates",
      };

      render(<NDAPreview formData={specialCharFormData} />);

      expect(screen.getByText(/R&D collaboration \(Technology & Innovation\)/i)).toBeInTheDocument();
      expect(screen.getByText(/O'Brien & Associates/i)).toBeInTheDocument();
    });

    it('should handle very long text in purpose field', () => {
      const longTextFormData = {
        ...completeFormData,
        purpose: 'A'.repeat(500),
      };

      render(<NDAPreview formData={longTextFormData} />);

      const preview = screen.getByText(/Review your generated Mutual NDA/i).parentElement;
      expect(preview?.textContent).toContain('A'.repeat(500));
    });
  });
});
