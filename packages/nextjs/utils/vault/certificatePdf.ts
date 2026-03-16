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
  const margin = 22;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const accent = { r: 236, g: 72, b: 153 }; // Aeternum primary
  let y = margin;

  // Branded header band + logo
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pageWidth, 26, "F");

  const logoDataUrl = await loadLogoDataUrl(28);
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin, 6, 12, 12);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AETERNUM", margin + 16, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Zero-knowledge Evidence Vault", margin, 21);

  // Badge
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  const badgeText = "EVIDENCE CERTIFICATE";
  const badgeWidth = doc.getTextWidth(badgeText) + 6;
  doc.roundedRect(pageWidth - margin - badgeWidth, 10, badgeWidth, 8, 2, 2, "S");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(badgeText, pageWidth - margin - badgeWidth + 3, 15);

  // Reset for body
  doc.setTextColor(0, 0, 0);
  y = 32;

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Onchain Evidence Attestation", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const intro =
    "This certificate confirms that the evidence below has been immutably anchored and verified onchain via Aeternum.";
  const introLines = doc.splitTextToSize(intro, pageWidth - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 4;

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Evidence section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Evidence details", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("File hash", margin, y);
  doc.setFont("helvetica", "normal");
  const hashLines = doc.splitTextToSize(data.fileHash, pageWidth - margin * 2 - 35);
  doc.text(hashLines, margin + 32, y);
  y += hashLines.length * 5 + 3;

  doc.setFont("helvetica", "bold");
  doc.text("Owner", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.owner ?? "Not recorded", margin + 32, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Timestamp", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.timestamp * 1000).toUTCString(), margin + 32, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Storage (Arweave)", margin, y);
  doc.setFont("helvetica", "normal");
  const storageLines = doc.splitTextToSize(data.storageId, pageWidth - margin * 2 - 50);
  doc.text(storageLines, margin + 40, y);
  y += storageLines.length * 5 + 3;

  if (data.ipfsCid && data.ipfsCid.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("IPFS CID", margin, y);
    doc.setFont("helvetica", "normal");
    const cidLines = doc.splitTextToSize(data.ipfsCid, pageWidth - margin * 2 - 32);
    doc.text(cidLines, margin + 32, y);
    y += cidLines.length * 5 + 3;
  }

  y += 4;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // On-chain section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("On-chain record", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Network", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.chainName ?? "Base (network details not fully recorded)", margin + 32, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Transaction hash", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.transactionHash ?? "Not recorded in this certificate", margin + 32, y);
  y += 6;

  if (data.verificationUrl) {
    doc.setFont("helvetica", "bold");
    doc.text("Verification URL", margin, y);
    doc.setFont("helvetica", "normal");
    const urlLines = doc.splitTextToSize(data.verificationUrl, pageWidth - margin * 2 - 42);
    doc.text(urlLines, margin + 40, y);
    y += urlLines.length * 5 + 3;
  }

  // Right-side verification block (QR placeholder)
  const rightX = pageWidth / 2 + 10;
  const boxWidth = pageWidth - rightX - margin;
  const boxHeight = 40;
  const boxY = pageHeight - margin - boxHeight - 10;

  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(rightX, boxY, boxWidth, boxHeight, 3, 3, "S");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Scan to verify", rightX + 5, boxY + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  const verifyLines = doc.splitTextToSize(
    "This QR code links to the live verification record for this evidence on Aeternum.",
    boxWidth - 24,
  );
  doc.text(verifyLines, rightX + 5, boxY + 14);

  const qrTarget = data.transactionHash && data.chainName ? data.transactionHash : data.verificationUrl;
  const qrSize = 22;
  const qrX = rightX + boxWidth - qrSize - 6;
  const qrY = boxY + 6;
  if (qrTarget) {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrTarget, { margin: 0 });
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch {
      // fall through silently if QR generation fails
    }
  }

  // Footer / legal text
  const footerY = pageHeight - margin;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  const footer = [
    "This certificate is generated by Aeternum based on onchain data and decentralized storage references.",
    "Verification requires recomputing the evidence commitment and matching it against the recorded hash.",
    "This document is for attestation purposes only and does not constitute legal advice.",
  ];
  doc.text(footer, margin, footerY - 8);

  return doc.output("blob");
}
