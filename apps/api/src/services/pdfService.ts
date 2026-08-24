import PDFDocument from 'pdfkit';

/**
 * PDF Ödeme Makbuzu / Fatura Oluşturma Servisi
 * Şık ve kurumsal A4 formatında PDF belgesi üretir.
 */
export function generatePaymentReceiptPDF(payment: any, tenant: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Renk Teması
    const primaryColor = '#BF9B30'; // Gold/Sarı
    const textGray = '#4B5563';

    // Başlık ve Logo
    doc.fillColor(primaryColor).fontSize(26).font('Helvetica-Bold').text('Kuafor.art', 50, 50);
    doc.fillColor(textGray).fontSize(10).font('Helvetica').text('Dijital Salon Yönetim Platformu', 50, 80);
    doc.text('Destek: info@kuafor.art | https://kuafor.art', 50, 95);

    // Belge Bilgileri (Sağ Üst)
    doc.fillColor('#1F2937').fontSize(18).font('Helvetica-Bold').text('ÖDEME MAKBUZU', 320, 50, { align: 'right' });
    doc.fillColor(textGray).fontSize(9).font('Helvetica').text(`Makbuz No: SUB-${payment.id.substring(0, 8).toUpperCase()}`, 320, 75, { align: 'right' });
    doc.text(`Tarih: ${new Date(payment.paidAt).toLocaleDateString('tr-TR')}`, 320, 90, { align: 'right' });

    // Yatay Çizgi
    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#E5E7EB').lineWidth(1).stroke();

    // Müşteri / Salon Bilgileri (Sol)
    doc.fillColor('#1F2937').fontSize(11).font('Helvetica-Bold').text('Müşteri (Salon) Bilgileri:', 50, 140);
    doc.fillColor(textGray).fontSize(10).font('Helvetica').text(`Salon Adı: ${tenant.name}`, 50, 160);
    doc.text(`Salon Slug: ${tenant.slug}`, 50, 175);
    doc.text(`E-posta: ${tenant.email || '-'}`, 50, 190);

    // Sağlayıcı Firma Bilgileri (Sağ)
    doc.fillColor('#1F2937').fontSize(11).font('Helvetica-Bold').text('Sağlayıcı Firma Bilgileri:', 320, 140);
    doc.fillColor(textGray).fontSize(10).font('Helvetica').text('Kuafor.art Teknolojileri A.Ş.', 320, 160);
    doc.text('Nişantaşı, Şişli / İstanbul', 320, 175);
    doc.text('Mersis No: 0123-4567-8901-0001', 320, 190);

    // Tablo Çizgileri ve Başlıkları
    doc.moveTo(50, 220).lineTo(545, 220).strokeColor(primaryColor).lineWidth(2).stroke();
    
    doc.fillColor('#1F2937').fontSize(10).font('Helvetica-Bold').text('Açıklama / Paket', 55, 230);
    doc.text('Ödeme Yöntemi', 280, 230);
    doc.text('KDV Oranı', 380, 230);
    doc.text('Tutar', 480, 230, { align: 'right' });

    doc.moveTo(50, 245).lineTo(545, 245).strokeColor('#E5E7EB').lineWidth(1).stroke();

    // Tablo İçeriği
    const originalAmount = payment.originalAmount || payment.amount;
    const isCouponApplied = !!payment.appliedCouponCode;
    
    doc.fillColor(textGray).fontSize(10).font('Helvetica').text(`${payment.planName} Paket Aboneliği`, 55, 260);
    doc.text(payment.cardLastFour ? `Kart (**** **** **** ${payment.cardLastFour})` : 'İyzico 3D Secure', 280, 260);
    doc.text('%20', 380, 260);
    doc.text(`${originalAmount.toFixed(2)} TL`, 480, 260, { align: 'right' });

    let currentY = 285;
    
    // Eğer Kupon İndirimi Varsa İndirim Satırı Ekle
    if (isCouponApplied) {
      const discount = originalAmount - payment.amount;
      doc.fillColor('#10B981').fontSize(9).font('Helvetica-Bold').text(`Kupon İndirimi (${payment.appliedCouponCode})`, 55, currentY);
      doc.text('-', 280, currentY);
      doc.text('-', 380, currentY);
      doc.text(`-${discount.toFixed(2)} TL`, 480, currentY, { align: 'right' });
      currentY += 20;
    }

    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#E5E7EB').lineWidth(1).stroke();

    // KDV ve Hesaplama Alt Toplamları
    const totalAmount = payment.amount;
    const vatAmount = totalAmount - (totalAmount / 1.20);
    const netAmount = totalAmount - vatAmount;

    currentY += 15;
    doc.fillColor(textGray).fontSize(10).font('Helvetica').text('Net Tutar:', 350, currentY, { align: 'right' });
    doc.text(`${netAmount.toFixed(2)} TL`, 480, currentY, { align: 'right' });

    currentY += 15;
    doc.text('KDV (%20):', 350, currentY, { align: 'right' });
    doc.text(`${vatAmount.toFixed(2)} TL`, 480, currentY, { align: 'right' });

    currentY += 20;
    doc.fillColor('#1F2937').fontSize(12).font('Helvetica-Bold').text('Toplam Ödenen:', 350, currentY, { align: 'right' });
    doc.text(`${totalAmount.toFixed(2)} TL`, 480, currentY, { align: 'right' });

    // Belge Bilgi Notu (Alt Kısım)
    doc.moveTo(50, 480).lineTo(545, 480).strokeColor('#E5E7EB').lineWidth(1).stroke();
    doc.fillColor(textGray).fontSize(8).font('Helvetica').text('Bu belge 213 sayılı Vergi Usul Kanunu uyarınca elektronik ortamda üretilmiş bir ödeme makbuzudur.', 50, 495, { align: 'center', width: 495 });
    doc.text('Sorularınız ve bilgi talepleri için destek ekibimizle iletişime geçebilirsiniz.', 50, 510, { align: 'center', width: 495 });

    // Kapat
    doc.end();
  });
}
