import { NextResponse } from "next/server";
import { db, certificates } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

        // Generate HTML certificate
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${cert.userName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10;
      border: 0;
      border-radius: 8px;
      background: #11110B;
      color: #D9FD3A;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    }

    .print-btn:hover {
      background: #1a1a14;
    }
    
    .certificate {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 1.414;
      background: linear-gradient(135deg, #11110B 0%, #1a1a14 100%);
      border: 3px solid #D9FD3A;
      border-radius: 12px;
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #fff;
      position: relative;
      overflow: hidden;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 1px solid rgba(217, 253, 58, 0.2);
      border-radius: 8px;
      pointer-events: none;
    }
    
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #D9FD3A;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #D9FD3A;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    
    .subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 40px;
    }
    
    .presented {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 10px;
    }
    
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 30px;
      border-bottom: 2px solid #D9FD3A;
      padding-bottom: 10px;
    }
    
    .description {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      max-width: 600px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .course {
      font-size: 24px;
      font-weight: 600;
      color: #D9FD3A;
      margin-bottom: 40px;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 600px;
      margin-top: auto;
    }
    
    .footer-item {
      text-align: center;
    }

    .footer-item.verify {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .footer-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    
    .footer-value {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }

    .verify-qr {
      width: 110px;
      height: 110px;
      border-radius: 8px;
      border: 1px solid rgba(217, 253, 58, 0.35);
      background: #fff;
      padding: 6px;
      object-fit: cover;
    }
    
    .cert-id {
      font-family: monospace;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 30px;
    }
    
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .print-btn {
        display: none;
      }
      .certificate {
        border-radius: 0;
        max-width: none;
        width: 100%;
        height: 100vh;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" type="button" onclick="window.print()">Print</button>
  <div class="certificate">
    <div class="logo">RAYAVRITI</div>
    <div class="title">Certificate</div>
    <div class="subtitle">of Completion</div>
    
    <div class="presented">This is to certify that</div>
    <div class="name">${cert.userName}</div>
    
    <div class="description">
      has successfully completed the course requirements and demonstrated proficiency in
    </div>
    
    <div class="course">${cert.courseName}</div>
    
    <div class="footer">
      <div class="footer-item">
        <div class="footer-label">Issue Date</div>
        <div class="footer-value">${issueDate}</div>
      </div>
      <div class="footer-item verify">
        <div class="footer-label">Scan to Verify</div>
        <img class="verify-qr" src="${verifyQrUrl}" alt="QR code to verify certificate ${cert.certificateId}" />
      </div>
    </div>
    
    <div class="cert-id">Certificate ID: ${cert.certificateId}</div>
  </div>
</body>
</html>
    `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
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
