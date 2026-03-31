import { NextResponse } from "next/server";
import { db, certificates } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Download certificate as a simple HTML page (can be printed/saved as PDF)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Find certificate
        const [cert] = await db
            .select()
            .from(certificates)
            .where(
                and(
                    eq(certificates.certificateId, id),
                    eq(certificates.isRevoked, false)
                )
            )
            .limit(1);

        if (!cert) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${cert.certificateId}`;
        const verifyQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
        const issueDate = new Date(cert.issuedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        const safeUserName = escapeHtml(cert.userName);
        const safeCourseName = escapeHtml(cert.courseName);
        const safeCertificateId = escapeHtml(cert.certificateId);
        const safeIssueDate = escapeHtml(issueDate);
        const safeVerifyQrUrl = escapeHtml(verifyQrUrl);

        // Generate HTML certificate
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${safeUserName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --ink: #13161f;
      --muted: #576072;
      --paper: #f6f8fc;
      --card: #ffffff;
      --brand: #0f6fff;
      --brand-soft: #d9e8ff;
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background:
        radial-gradient(circle at 12% 18%, #d7e5ff 0%, transparent 44%),
        radial-gradient(circle at 88% 80%, #d7fff0 0%, transparent 42%),
        linear-gradient(135deg, #eff3f8 0%, #f7f9fc 55%, #edf2fb 100%);
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--ink);
    }

    .actions {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      box-shadow: 0 10px 22px rgba(16, 35, 74, 0.18);
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-print {
      background: #111827;
      color: #fff;
    }

    .btn-print:hover {
      background: #0b1220;
    }

    .btn-pdf {
      background: var(--brand);
      color: #fff;
    }

    .btn-pdf:hover {
      background: #005ae6;
    }

    .certificate {
      width: 100%;
      max-width: 980px;
      aspect-ratio: 1.414;
      background: linear-gradient(138deg, #ffffff 0%, #f7f9ff 42%, #eff4ff 100%);
      border-radius: 22px;
      border: 1px solid #dbe5fb;
      box-shadow: 0 36px 80px rgba(16, 35, 74, 0.16), 0 8px 20px rgba(16, 35, 74, 0.08);
      padding: 56px 62px;
      display: flex;
      flex-direction: column;
      text-align: center;
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      right: -180px;
      top: -170px;
      background: radial-gradient(circle, rgba(15, 111, 255, 0.16) 0%, rgba(15, 111, 255, 0) 70%);
      pointer-events: none;
      z-index: -1;
    }

    .certificate::after {
      content: '';
      position: absolute;
      width: 310px;
      height: 310px;
      border-radius: 50%;
      left: -140px;
      bottom: -140px;
      background: radial-gradient(circle, rgba(38, 206, 161, 0.14) 0%, rgba(38, 206, 161, 0) 70%);
      pointer-events: none;
      z-index: -1;
    }
    
    .logo {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 4px;
      color: var(--brand);
      margin-bottom: 22px;
      text-transform: uppercase;
    }
    
    .title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(36px, 5vw, 56px);
      color: #0d1528;
      line-height: 1.05;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    .subtitle {
      font-size: 13px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 34px;
      font-weight: 500;
    }
    
    .presented {
      font-size: 15px;
      color: #4d5669;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .name {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(34px, 4vw, 50px);
      color: #091224;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .name-rule {
      width: min(460px, 70%);
      height: 2px;
      margin: 0 auto 24px auto;
      background: linear-gradient(90deg, transparent 0%, #6ca6ff 20%, #6ca6ff 80%, transparent 100%);
    }
    
    .description {
      font-size: 16px;
      color: #3f4859;
      max-width: 660px;
      line-height: 1.6;
      margin: 0 auto 16px auto;
    }
    
    .course {
      font-size: clamp(22px, 3vw, 30px);
      font-weight: 700;
      color: #0d1e3f;
      margin-bottom: 28px;
    }
    
    .footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      padding-top: 24px;
      border-top: 1px solid #dce5f8;
    }
    
    .footer-item {
      text-align: left;
    }

    .footer-item.verify {
      text-align: center;
      margin-left: auto;
    }
    
    .footer-label {
      font-size: 10px;
      color: #768099;
      text-transform: uppercase;
      letter-spacing: 1.4px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    
    .footer-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a2437;
    }

    .verify-qr {
      width: 104px;
      height: 104px;
      border-radius: 10px;
      border: 1px solid #d6e1f8;
      background: #fff;
      padding: 6px;
      object-fit: cover;
      box-shadow: 0 8px 18px rgba(12, 37, 83, 0.08);
    }
    
    .cert-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      color: #6e7890;
      margin-top: 20px;
      text-align: right;
    }

    @media (max-width: 860px) {
      body {
        padding: 14px;
      }
      .actions {
        top: 12px;
        right: 12px;
      }
      .certificate {
        padding: 38px 28px;
      }
      .footer {
        flex-direction: column;
        align-items: center;
      }
      .footer-item {
        text-align: center;
      }
      .footer-item.verify {
        margin-left: 0;
      }
      .cert-id {
        text-align: center;
      }
    }
    
    @page {
      size: A4 landscape;
      margin: 0;
    }

    @media print {
      html, body {
        width: 297mm;
        height: 210mm;
        overflow: hidden;
      }
      body {
        background: none;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .actions {
        display: none;
      }
      .certificate {
        border-radius: 0;
        width: 297mm;
        height: 210mm;
        max-width: 297mm;
        aspect-ratio: auto;
        box-shadow: none;
        padding: 56px 62px;
      }
      .footer {
        position: absolute;
        left: 62px;
        right: 62px;
        bottom: 52px;
        margin-top: 0;
        padding-top: 24px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
      .footer-item {
        text-align: left;
      }
      .footer-item.verify {
        margin-left: auto;
        text-align: center;
      }
      .cert-id {
        position: absolute;
        right: 62px;
        bottom: 22px;
        margin-top: 0;
        text-align: right;
      }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
</head>
<body>
  <div class="actions">
    <button class="btn btn-print" type="button" onclick="window.print()">Print</button>
    <button class="btn btn-pdf" id="downloadPdfBtn" type="button" onclick="downloadPdf()">Download PDF</button>
  </div>
  <div class="certificate" id="certificate">
    <div class="logo">RAYAVRITI</div>
    <div class="title">Certificate of Achievement</div>
    <div class="subtitle">of Completion</div>
    
    <div class="presented">This is to certify that</div>
    <div class="name">${safeUserName}</div>
    <div class="name-rule"></div>
    
    <div class="description">
      has successfully completed the course requirements and demonstrated proficiency in
    </div>
    
    <div class="course">${safeCourseName}</div>
    
    <div class="footer">
      <div class="footer-item">
        <div class="footer-label">Issue Date</div>
        <div class="footer-value">${safeIssueDate}</div>
      </div>
      <div class="footer-item verify">
        <div class="footer-label">Scan to Verify</div>
        <img class="verify-qr" src="${safeVerifyQrUrl}" crossorigin="anonymous" alt="QR code to verify certificate ${safeCertificateId}" />
      </div>
    </div>
    
    <div class="cert-id">Certificate ID: ${safeCertificateId}</div>
  </div>
  <script>
    async function downloadPdf() {
      const button = document.getElementById("downloadPdfBtn");
      const certificate = document.getElementById("certificate");
      if (!button || !certificate) return;
      const previousText = button.textContent;
      button.disabled = true;
      button.textContent = "Preparing PDF...";

      try {
        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
          throw new Error("PDF libraries are unavailable");
        }

        const canvas = await window.html2canvas(certificate, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#f3f7ff"
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new window.jspdf.jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
          compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const renderWidth = canvas.width * ratio;
        const renderHeight = canvas.height * ratio;
        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;

        pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
        pdf.save("${safeCertificateId}.pdf");
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Unable to generate PDF in this browser. Please use Print and choose Save as PDF.");
      } finally {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  </script>
</body>
</html>
    `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "X-Content-Type-Options": "nosniff",
                "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'unsafe-inline' https://cdn.jsdelivr.net;",
                "Content-Disposition": `inline; filename="${cert.certificateId}.html"`,
            },
        });
    } catch (error) {
        console.error("Error downloading certificate:", error);
        return NextResponse.json(
            { error: "Failed to download certificate" },
            { status: 500 }
        );
    }
}
