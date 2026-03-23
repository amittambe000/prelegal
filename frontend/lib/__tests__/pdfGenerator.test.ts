import { generatePDF } from '../pdfGenerator';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          getHeight: jest.fn().mockReturnValue(297),
        },
        pages: [null, {}, {}], // First element is null, then 2 pages
      },
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      setLineWidth: jest.fn(),
      splitTextToSize: jest.fn((text) => [text]),
      text: jest.fn(),
      line: jest.fn(),
      addPage: jest.fn(),
      setPage: jest.fn(),
      save: jest.fn(),
    })),
  };
});

describe('pdfGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDF', () => {
    it('should generate PDF without throwing errors', async () => {
      const content = '# Test Document\n\nThis is a test.';
      await expect(generatePDF(content, 'test.pdf')).resolves.not.toThrow();
    });

    it('should use default filename when not provided', async () => {
      const jsPDF = require('jspdf').default;
      const content = 'Test content';

      await generatePDF(content);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.save).toHaveBeenCalledWith('Mutual-NDA.pdf');
    });

    it('should use provided filename', async () => {
      const jsPDF = require('jspdf').default;
      const content = 'Test content';
      const filename = 'custom-nda.pdf';

      await generatePDF(content, filename);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.save).toHaveBeenCalledWith(filename);
    });

    it('should handle markdown headers', async () => {
      const jsPDF = require('jspdf').default;
      const content = '# Main Header\n## Sub Header\nRegular text';

      await generatePDF(content);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.setFontSize).toHaveBeenCalledWith(18); // H1
      expect(mockInstance.setFontSize).toHaveBeenCalledWith(14); // H2
      expect(mockInstance.setFontSize).toHaveBeenCalledWith(10); // Normal
    });

    it('should handle horizontal rules', async () => {
      const jsPDF = require('jspdf').default;
      const content = 'Text\n---\nMore text';

      await generatePDF(content);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.setLineWidth).toHaveBeenCalledWith(0.5);
      expect(mockInstance.line).toHaveBeenCalled();
    });

    it('should handle empty lines', async () => {
      const content = 'Line 1\n\nLine 2';
      await expect(generatePDF(content)).resolves.not.toThrow();
    });

    it('should throw error with helpful message on failure', async () => {
      const jsPDF = require('jspdf').default;
      jsPDF.mockImplementationOnce(() => {
        throw new Error('PDF generation failed');
      });

      await expect(generatePDF('content')).rejects.toThrow(
        'Failed to generate PDF. Please try again.'
      );
    });

    it('should handle long content spanning multiple pages', async () => {
      const jsPDF = require('jspdf').default;
      const longContent = Array(100).fill('Line of text').join('\n');

      await generatePDF(longContent);

      const mockInstance = jsPDF.mock.results[0].value;
      // Should call addPage for pagination
      expect(mockInstance.addPage).toHaveBeenCalled();
    });

    it('should handle bold text markers', async () => {
      const jsPDF = require('jspdf').default;
      const content = 'This is **bold text** and this is normal.';

      await generatePDF(content);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockInstance.setFont).toHaveBeenCalledWith('helvetica', 'normal');
    });

    it('should add page numbers to all pages', async () => {
      const jsPDF = require('jspdf').default;
      const content = '# Document\n\nContent';

      await generatePDF(content);

      const mockInstance = jsPDF.mock.results[0].value;
      expect(mockInstance.setPage).toHaveBeenCalled();
      expect(mockInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Page'),
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ align: 'center' })
      );
    });
  });
});
