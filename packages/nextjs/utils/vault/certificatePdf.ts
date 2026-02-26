import { jsPDF } from "jspdf";

export interface CertificateData {
  fileHash: string;
  timestamp: number;
  storageId: string;
  ipfsCid?: string;
}

export function createCertificatePdf(data: CertificateData): Blob {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AETERNUM", margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Evidence Certificate", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 18;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("File Hash", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.fileHash, margin + 45, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Timestamp", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.timestamp * 1000).toUTCString(), margin + 45, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Storage ID", margin, y);
  doc.setFont("helvetica", "normal");
  const storageLines = doc.splitTextToSize(data.storageId, pageWidth - margin - margin - 45);
  doc.text(storageLines, margin + 45, y);
  y += storageLines.length * 5 + 4;

  if (data.ipfsCid && data.ipfsCid.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("IPFS CID", margin, y);
    doc.setFont("helvetica", "normal");
    const cidLines = doc.splitTextToSize(data.ipfsCid, pageWidth - margin - margin - 45);
    doc.text(cidLines, margin + 45, y);
    y += cidLines.length * 5 + 8;
  }

  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This certificate attests that the above proof is verified on-chain.", margin, y);
  doc.text("Status: Verified", margin, y + 5);
  doc.setTextColor(0, 0, 0);

  return doc.output("blob");
}
