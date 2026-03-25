import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface CertificateData {
  fileHash: string;
  timestamp: number;
  storageId: string;
  ipfsCid?: string;
  owner?: string;
  chainName?: string;
  transactionHash?: string;
  verificationUrl?: string;
}

async function loadLogoDataUrl(size = 32): Promise<string | null> {
  if (typeof document === "undefined") return null;
  try {
    const img = new Image();
    img.src = "/logo.svg";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function createCertificatePdf(data: CertificateData): Promise<Blob> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = { r: 15, g: 23, b: 42 }; // Deep Slate
  const accentColor = { r: 236, g: 72, b: 153 }; // Pink-500
  let y = margin;

  // Background Header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, pageWidth, 35, "F");

  // AETERNUM Logo/Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AETERNUM", margin, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PERMANENT EVIDENCE VAULT", margin, 26);

  // Certificate Type Badge
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  const badgeWidth = 45;
  doc.rect(pageWidth - margin - badgeWidth, 12, badgeWidth, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ATTESTATION", pageWidth - margin - badgeWidth + 5, 18);
  doc.setFont("helvetica", "normal");
  doc.text("CERTIFICATE", pageWidth - margin - badgeWidth + 5, 21);

  y = 50;

  // Main Title
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Certificate of On-chain Evidence", margin, y);
  y += 10;

  // Intro text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const intro = "This document serves as formal attestation that the digital evidence described below has been cryptographically secured and anchored to the blockchain. This record is permanent, immutable, and verifiable through zero-knowledge protocols.";
  const introLines = doc.splitTextToSize(intro, pageWidth - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 10;

  // Evidence Data Table
  const drawRow = (label: string, value: string, currentY: number, hasBorder = true) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(label.toUpperCase(), margin, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const splitValue = doc.splitTextToSize(value, pageWidth - margin * 2 - 45);
    doc.text(splitValue, margin + 45, currentY);
    
    const rowHeight = splitValue.length * 5 + 3;
    if (hasBorder) {
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + rowHeight - 2, pageWidth - margin, currentY + rowHeight - 2);
    }
    return rowHeight;
  };

  y += drawRow("Evidence ID", data.fileHash, y);
  y += 5;
  y += drawRow("Custodian", data.owner || "Anonymous", y);
  y += 5;
  y += drawRow("Anchor Date", new Date(data.timestamp * 1000).toUTCString(), y);
  y += 5;
  y += drawRow("Network", data.chainName || "Base L2 Mainnet", y);
  y += 5;
  y += drawRow("Storage ID", data.storageId, y);
  y += 10;

  // Technical Specs Section
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 45, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - margin * 2, 45, "S");

  let ty = y + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Technical Verification Data", margin + 8, ty);
  ty += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Blockchain Tx:", margin + 8, ty);
  doc.setTextColor(15, 23, 42);
  doc.text(data.transactionHash || "PENDING_CONFIRMATION", margin + 35, ty);
  ty += 5;

  doc.setTextColor(100, 116, 139);
  doc.text("Hash Algorithm:", margin + 8, ty);
  doc.setTextColor(15, 23, 42);
  doc.text("SHA-256 (Primary) / Poseidon (ZK Commitment)", margin + 35, ty);
  ty += 5;

  doc.setTextColor(100, 116, 139);
  doc.text("ZK Security:", margin + 8, ty);
  doc.setTextColor(15, 23, 42);
  doc.text("Groth16 zk-SNARK Verification Protocol", margin + 35, ty);
  ty += 10;

  // Verification Box
  const vBoxX = margin;
  const vBoxY = pageHeight - margin - 45;
  const vBoxWidth = 110;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text("Verification Instructions", vBoxX, vBoxY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const vText = "To verify the authenticity of this evidence, visit the Aeternum Public Registry and use the Hash or Transaction ID provided. You can also scan the QR code to view the live on-chain status.";
  const vLines = doc.splitTextToSize(vText, vBoxWidth);
  doc.text(vLines, vBoxX, vBoxY + 6);

  // QR Code
  const qrSize = 35;
  const qrX = pageWidth - margin - qrSize;
  const qrY = pageHeight - margin - qrSize - 5;
  const qrTarget = data.verificationUrl || `https://aeternum.app/evidence/${data.fileHash}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrTarget, { margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.warn("QR Generation failed", e);
  }

  // Footer
  const footerY = pageHeight - margin;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Aeternum © 2026. This certificate is a cryptographic attestation of data existence and is not a substitute for legal advice. Permanent storage powered by Arweave.", margin, footerY);

  return doc.output("blob");
}
