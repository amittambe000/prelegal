import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadButton from '../DownloadButton';
import { NDAFormData } from '@/types/nda';
import * as pdfGenerator from '@/lib/pdfGenerator';

// Mock the PDF generator
jest.mock('@/lib/pdfGenerator', () => ({
  generatePDF: jest.fn(),
}));

describe('DownloadButton', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (pdfGenerator.generatePDF as jest.Mock).mockResolvedValue(undefined);
  });

  describe('when form is incomplete', () => {
    it('should render disabled button', () => {
      render(<DownloadButton formData={incompleteFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      expect(button).toBeDisabled();
    });

    it('should show helper text', () => {
      render(<DownloadButton formData={incompleteFormData} />);

      expect(screen.getByText(/Complete all fields to download/i)).toBeInTheDocument();
    });

    it('should have disabled styling', () => {
      render(<DownloadButton formData={incompleteFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      expect(button).toHaveClass('bg-gray-400');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('should not call generatePDF when clicked', async () => {
      const user = userEvent.setup();
      render(<DownloadButton formData={incompleteFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      expect(pdfGenerator.generatePDF).not.toHaveBeenCalled();
    });
  });

  describe('when form is complete', () => {
    it('should render enabled button', () => {
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      expect(button).not.toBeDisabled();
    });

    it('should have enabled styling', () => {
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('from-blue-600');
    });

    it('should show download icon', () => {
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should call generatePDF when clicked', async () => {
      const user = userEvent.setup();
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(pdfGenerator.generatePDF).toHaveBeenCalledTimes(1);
      });
    });

    it('should generate PDF with correct filename', async () => {
      const user = userEvent.setup();
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(pdfGenerator.generatePDF).toHaveBeenCalledWith(
          expect.any(String),
          'Mutual-NDA-Acme-Corp-Tech-Solutions-Inc.pdf'
        );
      });
    });

    it('should show loading state during PDF generation', async () => {
      const user = userEvent.setup();
      let resolveGeneration: () => void;
      const generationPromise = new Promise<void>((resolve) => {
        resolveGeneration = resolve;
      });

      (pdfGenerator.generatePDF as jest.Mock).mockReturnValue(generationPromise);

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      // Should show loading state
      expect(screen.getByText(/Generating PDF.../i)).toBeInTheDocument();
      expect(button).toBeDisabled();

      // Resolve the promise
      resolveGeneration!();
      await waitFor(() => {
        expect(screen.queryByText(/Generating PDF.../i)).not.toBeInTheDocument();
      });
    });

    it('should show spinner during loading', async () => {
      const user = userEvent.setup();
      let resolveGeneration: () => void;
      const generationPromise = new Promise<void>((resolve) => {
        resolveGeneration = resolve;
      });

      (pdfGenerator.generatePDF as jest.Mock).mockReturnValue(generationPromise);

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      // Check for spinner (animated svg)
      const spinner = screen.getByText(/Generating PDF.../i).querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveGeneration!();
    });

    it('should re-enable button after successful generation', async () => {
      const user = userEvent.setup();
      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('error handling', () => {
    it('should show error message when PDF generation fails', async () => {
      const user = userEvent.setup();
      (pdfGenerator.generatePDF as jest.Mock).mockRejectedValue(
        new Error('PDF generation failed')
      );

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
      });
    });

    it('should show error icon with error message', async () => {
      const user = userEvent.setup();
      (pdfGenerator.generatePDF as jest.Mock).mockRejectedValue(
        new Error('PDF generation failed')
      );

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        const errorMessage = screen.getByText(/Failed to generate PDF/i);
        const svg = errorMessage.parentElement?.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should re-enable button after error', async () => {
      const user = userEvent.setup();
      (pdfGenerator.generatePDF as jest.Mock).mockRejectedValue(
        new Error('PDF generation failed')
      );

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should clear error when clicking again', async () => {
      const user = userEvent.setup();
      (pdfGenerator.generatePDF as jest.Mock)
        .mockRejectedValueOnce(new Error('PDF generation failed'))
        .mockResolvedValueOnce(undefined);

      render(<DownloadButton formData={completeFormData} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });

      // First click fails
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PDF/i)).toBeInTheDocument();
      });

      // Second click succeeds
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/Failed to generate PDF/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('filename generation', () => {
    it('should replace spaces with hyphens in filename', async () => {
      const user = userEvent.setup();
      const formDataWithSpaces = {
        ...completeFormData,
        party1Name: 'Acme Corporation Ltd',
        party2Name: 'Tech Solutions Group Inc',
      };

      render(<DownloadButton formData={formDataWithSpaces} />);

      const button = screen.getByRole('button', { name: /Download as PDF/i });
      await user.click(button);

      await waitFor(() => {
        expect(pdfGenerator.generatePDF).toHaveBeenCalledWith(
          expect.any(String),
          'Mutual-NDA-Acme-Corporation-Ltd-Tech-Solutions-Group-Inc.pdf'
        );
      });
    });
  });
});
