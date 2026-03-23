import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import * as pdfGenerator from '@/lib/pdfGenerator';

// Mock the PDF generator
jest.mock('@/lib/pdfGenerator', () => ({
  generatePDF: jest.fn().mockResolvedValue(undefined),
}));

describe('Home Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render header with branding', () => {
      render(<Home />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('Prelegal')).toBeInTheDocument();
      expect(screen.getByText('Mutual NDA Generator')).toBeInTheDocument();
    });

    it('should render form and preview sections', () => {
      render(<Home />);

      expect(screen.getByText('Agreement Details')).toBeInTheDocument();
      expect(screen.getByText('Document Preview')).toBeInTheDocument();
    });

    it('should render download button', () => {
      render(<Home />);

      expect(screen.getByRole('button', { name: /Download as PDF/i })).toBeInTheDocument();
    });

    it('should show empty preview state initially', () => {
      render(<Home />);

      expect(screen.getByText(/Fill in all required fields/i)).toBeInTheDocument();
    });

    it('should have disabled download button initially', () => {
      render(<Home />);

      const downloadButton = screen.getByRole('button', { name: /Download as PDF/i });
      expect(downloadButton).toBeDisabled();
    });

    it('should render footer with credits', () => {
      render(<Home />);

      expect(screen.getByText(/Powered by/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /CommonPaper/i })).toBeInTheDocument();
    });
  });

  describe('full user flow', () => {
    it('should update preview as user fills form', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Initially empty
      expect(screen.getByText(/Fill in all required fields/i)).toBeInTheDocument();

      // Fill in all fields
      await user.type(screen.getByLabelText(/Party 1 Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Party 1 Email/i), 'contact@acme.com');
      await user.type(screen.getByLabelText(/Party 2 Name/i), 'Tech Solutions Inc');
      await user.type(screen.getByLabelText(/Party 2 Email/i), 'legal@techsolutions.com');
      await user.type(screen.getByLabelText(/Purpose/i), 'business partnership');
      await user.type(screen.getByLabelText(/Effective Date/i), '2026-03-23');
      await user.selectOptions(screen.getByLabelText(/MNDA Term/i), '2 years from the Effective Date');
      await user.selectOptions(screen.getByLabelText(/Term of Confidentiality/i), '3 years from the date of disclosure');
      await user.selectOptions(screen.getByLabelText(/Governing Law/i), 'California');
      await user.type(screen.getByLabelText(/Jurisdiction/i), 'San Francisco County');

      // Preview should now show content
      await waitFor(() => {
        expect(screen.queryByText(/Fill in all required fields/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Cover Page/i)).toBeInTheDocument();
      });
    });

    it('should enable download button when form is complete', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const downloadButton = screen.getByRole('button', { name: /Download as PDF/i });
      expect(downloadButton).toBeDisabled();

      // Fill all required fields
      await user.type(screen.getByLabelText(/Party 1 Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Party 1 Email/i), 'contact@acme.com');
      await user.type(screen.getByLabelText(/Party 2 Name/i), 'Tech Solutions Inc');
      await user.type(screen.getByLabelText(/Party 2 Email/i), 'legal@techsolutions.com');
      await user.type(screen.getByLabelText(/Purpose/i), 'business partnership');
      await user.type(screen.getByLabelText(/Effective Date/i), '2026-03-23');
      await user.selectOptions(screen.getByLabelText(/MNDA Term/i), '2 years from the Effective Date');
      await user.selectOptions(screen.getByLabelText(/Term of Confidentiality/i), '3 years from the date of disclosure');
      await user.selectOptions(screen.getByLabelText(/Governing Law/i), 'California');
      await user.type(screen.getByLabelText(/Jurisdiction/i), 'San Francisco County');

      // Download button should now be enabled
      await waitFor(() => {
        expect(downloadButton).not.toBeDisabled();
      });
    });

    it('should show party names in preview', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByLabelText(/Party 1 Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Party 1 Email/i), 'contact@acme.com');
      await user.type(screen.getByLabelText(/Party 2 Name/i), 'Tech Solutions Inc');
      await user.type(screen.getByLabelText(/Party 2 Email/i), 'legal@techsolutions.com');
      await user.type(screen.getByLabelText(/Purpose/i), 'business partnership');
      await user.type(screen.getByLabelText(/Effective Date/i), '2026-03-23');
      await user.selectOptions(screen.getByLabelText(/MNDA Term/i), '2 years from the Effective Date');
      await user.selectOptions(screen.getByLabelText(/Term of Confidentiality/i), '3 years from the date of disclosure');
      await user.selectOptions(screen.getByLabelText(/Governing Law/i), 'California');
      await user.type(screen.getByLabelText(/Jurisdiction/i), 'San Francisco County');

      await waitFor(() => {
        expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
        expect(screen.getByText(/Tech Solutions Inc/i)).toBeInTheDocument();
      });
    });

    it('should generate PDF with complete form data', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Fill all fields
      await user.type(screen.getByLabelText(/Party 1 Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Party 1 Email/i), 'contact@acme.com');
      await user.type(screen.getByLabelText(/Party 2 Name/i), 'Tech Solutions Inc');
      await user.type(screen.getByLabelText(/Party 2 Email/i), 'legal@techsolutions.com');
      await user.type(screen.getByLabelText(/Purpose/i), 'business partnership');
      await user.type(screen.getByLabelText(/Effective Date/i), '2026-03-23');
      await user.selectOptions(screen.getByLabelText(/MNDA Term/i), '2 years from the Effective Date');
      await user.selectOptions(screen.getByLabelText(/Term of Confidentiality/i), '3 years from the date of disclosure');
      await user.selectOptions(screen.getByLabelText(/Governing Law/i), 'California');
      await user.type(screen.getByLabelText(/Jurisdiction/i), 'San Francisco County');

      // Click download
      const downloadButton = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(downloadButton);

      // Verify PDF generation was called
      await waitFor(() => {
        expect(pdfGenerator.generatePDF).toHaveBeenCalledWith(
          expect.stringContaining('Acme Corp'),
          expect.stringContaining('Mutual-NDA')
        );
      });
    });
  });

  describe('responsive layout', () => {
    it('should have grid layout for form and preview', () => {
      const { container } = render(<Home />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
    });

    it('should have sticky preview on large screens', () => {
      const { container } = render(<Home />);

      const previewContainer = container.querySelector('.lg\\:sticky');
      expect(previewContainer).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should have required attribute on form fields', () => {
      render(<Home />);

      expect(screen.getByLabelText(/Party 1 Name/i)).toBeRequired();
      expect(screen.getByLabelText(/Party 1 Email/i)).toBeRequired();
      expect(screen.getByLabelText(/Purpose/i)).toBeRequired();
    });

    it('should have email type for email fields', () => {
      render(<Home />);

      expect(screen.getByLabelText(/Party 1 Email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/Party 2 Email/i)).toHaveAttribute('type', 'email');
    });

    it('should have date type for date field', () => {
      render(<Home />);

      expect(screen.getByLabelText(/Effective Date/i)).toHaveAttribute('type', 'date');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Home />);

      const h1 = screen.getByRole('heading', { level: 1, name: /Prelegal/i });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have labels for all form inputs', () => {
      render(<Home />);

      expect(screen.getByLabelText(/Party 1 Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Party 1 Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Party 2 Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Party 2 Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Purpose/i)).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<Home />);

      expect(screen.getByRole('button', { name: /Download as PDF/i })).toBeInTheDocument();
    });

    it('should have external links with proper attributes', () => {
      render(<Home />);

      const commonPaperLink = screen.getByRole('link', { name: /CommonPaper/i });
      expect(commonPaperLink).toHaveAttribute('target', '_blank');
      expect(commonPaperLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('error scenarios', () => {
    it('should handle PDF generation failure gracefully', async () => {
      const user = userEvent.setup();
      (pdfGenerator.generatePDF as jest.Mock).mockRejectedValue(
        new Error('PDF generation failed')
      );

      render(<Home />);

      // Fill all fields
      await user.type(screen.getByLabelText(/Party 1 Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Party 1 Email/i), 'contact@acme.com');
      await user.type(screen.getByLabelText(/Party 2 Name/i), 'Tech Solutions Inc');
      await user.type(screen.getByLabelText(/Party 2 Email/i), 'legal@techsolutions.com');
      await user.type(screen.getByLabelText(/Purpose/i), 'business partnership');
      await user.type(screen.getByLabelText(/Effective Date/i), '2026-03-23');
      await user.selectOptions(screen.getByLabelText(/MNDA Term/i), '2 years from the Effective Date');
      await user.selectOptions(screen.getByLabelText(/Term of Confidentiality/i), '3 years from the date of disclosure');
      await user.selectOptions(screen.getByLabelText(/Governing Law/i), 'California');
      await user.type(screen.getByLabelText(/Jurisdiction/i), 'San Francisco County');

      // Click download
      const downloadButton = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(downloadButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
      });
    });
  });
});
