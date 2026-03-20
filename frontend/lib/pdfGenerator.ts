export async function generatePDF(content: string, filename: string = 'Mutual-NDA.pdf'): Promise<void> {
  try {
    // Dynamically import jsPDF only on client side
    const { default: jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let yPosition = margin;

    pdf.setFont('helvetica');

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const text = line.substring(2);
        const wrappedText = pdf.splitTextToSize(text, maxWidth);

        for (const wrappedLine of wrappedText) {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight + 2;
        }
        yPosition += 3;
      } else if (line.startsWith('## ')) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const text = line.substring(3);
        const wrappedText = pdf.splitTextToSize(text, maxWidth);

        for (const wrappedLine of wrappedText) {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight + 1;
        }
        yPosition += 2;
      } else if (line.startsWith('---')) {
        if (yPosition + 5 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      } else if (line.trim() === '') {
        yPosition += 3;
      } else {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const parts = [];
        let lastIndex = 0;
        const boldRegex = /\*\*(.+?)\*\*/g;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ text: line.substring(lastIndex, match.index), bold: false });
          }
          parts.push({ text: match[1], bold: true });
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          parts.push({ text: line.substring(lastIndex), bold: false });
        }

        if (parts.length === 0) {
          parts.push({ text: line, bold: false });
        }

        const wrappedParts = [];
        for (const part of parts) {
          pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
          const wrapped = pdf.splitTextToSize(part.text, maxWidth);
          for (const w of wrapped) {
            wrappedParts.push({ text: w, bold: part.bold });
          }
        }

        for (const part of wrappedParts) {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
          pdf.text(part.text, margin, yPosition);
          yPosition += lineHeight;
        }
      }
    }

    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
