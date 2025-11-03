import { Report, Feedback, MathFeedback } from '../types';

// Let TypeScript know about the global jspdf object from the CDN script
declare const jspdf: any;

/**
 * Generates and triggers a download for a PDF report of a session.
 * @param report - The report data to include in the PDF.
 */
export function generatePdfReport(report: Omit<Report, 'id' | 'date'> & { date?: string }) {
  const doc = new jspdf.jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addText = (text: string, size: number, style: 'bold' | 'normal', options: { color?: [number, number, number] } = {}) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    if(options.color) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
    }

    const splitText = doc.splitTextToSize(text, contentWidth);
    const textHeight = doc.getTextDimensions(splitText).h;

    if (y + textHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(splitText, margin, y);
    y += textHeight + 2; // Add a little padding
    doc.setTextColor(0, 0, 0); // Reset color
  };

  // --- Document Header ---
  addText('NCEA Ace Session Report', 20, 'bold');
  y += 5;
  addText(`Subject: ${report.subject}`, 12, 'normal');
  addText(`Topic: ${report.topicName}`, 12, 'normal');
  addText(`Date: ${new Date(report.date || Date.now()).toLocaleString()}`, 12, 'normal');
  y += 10;
  
  // --- Session Data ---
  report.sessionData.forEach((data, index) => {
    if (y > pageHeight - 60) { // Check for space before adding a new Q&A block
      doc.addPage();
      y = margin;
    }

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    addText(`Question ${index + 1}`, 14, 'bold');
    
    if (data.question.imageData) {
      try {
        const imgData = `data:image/png;base64,${data.question.imageData}`;
        const imgWidth = 80; // mm
        const imgHeight = 60; // mm, assuming 4:3 aspect ratio
        if (y + imgHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 5;
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    }

    addText(data.question.questionText, 12, 'normal');
    y += 4;
    
    addText('Your Answer:', 12, 'bold');
    addText(data.answer || '(No answer provided)', 12, 'normal');
    y += 4;

    addText('Feedback:', 12, 'bold');
    if ('wellDone' in data.feedback) { // English Feedback
      const feedback = data.feedback as Feedback;
      addText('What you did well:', 11, 'bold', { color: [0, 100, 0] });
      addText(feedback.wellDone, 11, 'normal');
      y += 2;
      addText('How to improve:', 11, 'bold', { color: [0, 0, 139] });
      addText(feedback.toImprove, 11, 'normal');
    } else { // Math Feedback
      const feedback = data.feedback as MathFeedback;
      const resultText = feedback.isCorrect ? 'Correct' : 'Incorrect';
      const resultColor: [number, number, number] = feedback.isCorrect ? [0, 100, 0] : [220, 20, 60];
      addText(resultText, 11, 'bold', { color: resultColor });
      y += 2;
      addText('Explanation:', 11, 'bold');
      addText(feedback.explanation, 11, 'normal');
    }
    y += 5;
  });

  const fileName = `NCEA-Ace-Report-${report.topicName.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
}
