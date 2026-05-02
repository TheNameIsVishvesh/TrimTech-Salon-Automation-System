const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, '..', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filePath = path.join(invoicesDir, `${data.invoiceNumber || 'Invoice'}.pdf`);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .text('African Hair Saloon', { align: 'center' })
        .moveDown(0.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('INVOICE', { align: 'center', characterSpacing: 2 })
        .moveDown(2);

      // Customer & Invoice Info
      doc.font('Helvetica-Bold').fontSize(12).text(`Invoice ID: ${data.invoiceNumber || 'N/A'}`);
      
      const formatTime = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        return new Date(0, 0, 0, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      };

      const dateStr = new Date(data.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      doc.font('Helvetica').fontSize(11).text(`Date & Time: ${dateStr} ${formatTime(data.time)}`);
      doc.moveDown(0.5);
      doc.text(`Customer Name: ${data.customerName || 'N/A'}`);
      doc.text(`Employee Name: ${data.employeeName || 'N/A'}`);
      doc.moveDown(2);

      // Amount Table
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(12);
      
      doc.text('Item Description', 50, tableTop);
      doc.text('Amount', 400, tableTop, { width: 90, align: 'right' });
      
      const hrY = tableTop + 15;
      doc.moveTo(50, hrY).lineTo(490, hrY).strokeColor('#aaaaaa').stroke();

      const row1Y = hrY + 10;
      doc.font('Helvetica').fontSize(11);
      doc.text(data.serviceName, 50, row1Y);
      doc.text(`Rs. ${data.amount}`, 400, row1Y, { width: 90, align: 'right' });

      let currentY = row1Y + 20;

      if (data.products && data.products.length > 0) {
        data.products.forEach(p => {
          doc.text(`${p.name} (x${p.quantity})`, 50, currentY);
          doc.text(`Rs. ${p.price * p.quantity}`, 400, currentY, { width: 90, align: 'right' });
          currentY += 20;
        });
      }

      if (data.gstAmount > 0) {
        doc.text('GST:', 50, currentY);
        doc.text(`Rs. ${data.gstAmount}`, 400, currentY, { width: 90, align: 'right' });
        currentY += 20;
      }

      doc.moveTo(50, currentY).lineTo(490, currentY).strokeColor('#aaaaaa').stroke();
      
      doc.font('Helvetica-Bold').fontSize(13);
      doc.text('Total Amount:', 250, currentY + 15, { align: 'right' });
      
      // Highlight Total Amount
      doc.rect(390, currentY + 10, 100, 20).fillColor('#f0f0f0').fill();
      doc.fillColor('black').text(`Rs. ${data.totalAmount}`, 400, currentY + 15, { width: 90, align: 'right' });

      // Footer
      const footerY = doc.page.height - 100;
      doc.font('Helvetica-Oblique').fontSize(12);
      doc.text('Thank you for visiting African Hair Saloon', 50, footerY, { align: 'center', width: doc.page.width - 100 });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
