import jsPDF from 'jspdf';
import { log } from '@/lib/logger';
import { sendEmail } from '@/lib/external/email';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;

  // Customer
  customerName: string;
  customerEmail: string;
  customerAddress?: string;

  // Company
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone?: string;

  // Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;

  // Totals
  subtotal: number;
  tax: number;
  discount: number;
  total: number;

  // Payment
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';

  // Notes
  notes?: string;
}

/**
 * Generate PDF invoice
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Company info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.companyName, 20, yPos);
  yPos += 5;
  doc.text(data.companyAddress, 20, yPos);
  yPos += 5;
  doc.text(data.companyEmail, 20, yPos);
  if (data.companyPhone) {
    yPos += 5;
    doc.text(data.companyPhone, 20, yPos);
  }

  // Invoice details (right side)
  yPos = 35;
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #${data.invoiceNumber}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(data.invoiceDate)}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Due: ${formatDate(data.dueDate)}`, pageWidth - 20, yPos, { align: 'right' });

  yPos += 15;

  // Bill to
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName, 20, yPos);
  yPos += 5;
  doc.text(data.customerEmail, 20, yPos);
  if (data.customerAddress) {
    yPos += 5;
    doc.text(data.customerAddress, 20, yPos);
  }

  yPos += 15;

  // Items table header
  const tableStartY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(20, yPos - 4, pageWidth - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 25, yPos);
  doc.text('Qty', pageWidth - 80, yPos, { align: 'right' });
  doc.text('Price', pageWidth - 55, yPos, { align: 'right' });
  doc.text('Amount', pageWidth - 25, yPos, { align: 'right' });

  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Items
  for (const item of data.items) {
    doc.text(item.description, 25, yPos);
    doc.text(item.quantity.toString(), pageWidth - 80, yPos, { align: 'right' });
    doc.text(formatCurrency(item.unitPrice), pageWidth - 55, yPos, { align: 'right' });
    doc.text(formatCurrency(item.amount), pageWidth - 25, yPos, { align: 'right' });
    yPos += 7;
  }

  yPos += 5;

  // Totals
  doc.line(pageWidth - 90, yPos, pageWidth - 20, yPos);
  yPos += 7;

  doc.text('Subtotal:', pageWidth - 80, yPos);
  doc.text(formatCurrency(data.subtotal), pageWidth - 25, yPos, { align: 'right' });
  yPos += 6;

  if (data.discount > 0) {
    doc.text('Discount:', pageWidth - 80, yPos);
    doc.text(`-${formatCurrency(data.discount)}`, pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;
  }

  if (data.tax > 0) {
    doc.text('Tax:', pageWidth - 80, yPos);
    doc.text(formatCurrency(data.tax), pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.line(pageWidth - 90, yPos, pageWidth - 20, yPos);
  yPos += 8;
  doc.text('TOTAL:', pageWidth - 80, yPos);
  doc.text(formatCurrency(data.total), pageWidth - 25, yPos, { align: 'right' });

  yPos += 15;

  // Payment info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, yPos);
  yPos += 6;

  const statusColor = data.paymentStatus === 'paid' ? [34, 197, 94] :
                      data.paymentStatus === 'pending' ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(...statusColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${data.paymentStatus.toUpperCase()}`, 20, yPos);
  doc.setTextColor(0, 0, 0);

  // Notes
  if (data.notes) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(data.notes, 20, yPos, { maxWidth: pageWidth - 40 });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  return doc;
}

/**
 * Send invoice via email
 */
export async function sendInvoiceEmail(
  invoiceData: InvoiceData,
  recipientEmail: string
): Promise<boolean> {
  try {
    // Generate PDF
    const pdf = generateInvoicePDF(invoiceData);
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    // Send email with attachment
    await sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.companyName}`,
      html: `
        <h2>Invoice ${invoiceData.invoiceNumber}</h2>
        <p>Dear ${invoiceData.customerName},</p>
        <p>Please find attached your invoice for ${formatCurrency(invoiceData.total)}.</p>
        <ul>
          <li>Invoice Date: ${formatDate(invoiceData.invoiceDate)}</li>
          <li>Due Date: ${formatDate(invoiceData.dueDate)}</li>
          <li>Payment Status: ${invoiceData.paymentStatus}</li>
        </ul>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>${invoiceData.companyName}</p>
      `,
      attachments: [
        {
          filename: `invoice_${invoiceData.invoiceNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          type: 'application/pdf',
        },
      ],
    });

    log.info('Invoice email sent', {
      invoiceNumber: invoiceData.invoiceNumber,
      recipient: recipientEmail,
    });

    return true;
  } catch (error) {
    log.error('Failed to send invoice email', error as Error, {
      invoiceNumber: invoiceData.invoiceNumber,
    });
    return false;
  }
}

/**
 * Helper: Format date
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Helper: Format currency
 */
function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

/**
 * Generate invoice for subscription payment
 */
export function generateSubscriptionInvoice(
  payment: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    planName: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
  }
): InvoiceData {
  const invoiceNumber = `INV-${Date.now()}-${payment.id.slice(-6).toUpperCase()}`;
  const invoiceDate = payment.paymentDate;
  const dueDate = payment.paymentDate; // Immediate for subscription

  return {
    invoiceNumber,
    invoiceDate,
    dueDate,

    customerName: payment.userName,
    customerEmail: payment.userEmail,

    companyName: 'RANKUP',
    companyAddress: 'Seoul, South Korea',
    companyEmail: 'billing@rankup.com',
    companyPhone: '+82-2-1234-5678',

    items: [
      {
        description: `${payment.planName} Subscription`,
        quantity: 1,
        unitPrice: payment.amount,
        amount: payment.amount,
      },
    ],

    subtotal: payment.amount,
    tax: 0, // No VAT for digital services in some regions
    discount: 0,
    total: payment.amount,

    paymentMethod: payment.paymentMethod,
    paymentStatus: 'paid',

    notes: 'This is an automated invoice for your subscription payment.',
  };
}
