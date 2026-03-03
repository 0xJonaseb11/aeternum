export interface DetectedType {
  mime: string;
  extension: string;
}

type Signature = {
  bytes: number[];
  offset?: number;
  mime: string;
  extension: string;
  when?: (buf: Uint8Array) => boolean;
};

const SIGNATURES: Signature[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: "image/png", extension: "png" },
  { bytes: [0xff, 0xd8, 0xff], mime: "image/jpeg", extension: "jpg" },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mime: "image/gif", extension: "gif" },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], mime: "image/gif", extension: "gif" },
  { bytes: [0x52, 0x49, 0x46, 0x46], mime: "image/webp", extension: "webp", when: isWebP }, // RIFF + WEBP at 8
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf", extension: "pdf" }, // %PDF

  { bytes: [0x52, 0x49, 0x46, 0x46], mime: "video/x-msvideo", extension: "avi", when: isAvi }, // RIFF + AVI at 8
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, mime: "video/mp4", extension: "mp4" }, // ftyp — MP4/MOV
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], mime: "video/webm", extension: "webm" }, // EBML — WebM/MKV
  { bytes: [0x4f, 0x67, 0x67, 0x53], mime: "video/ogg", extension: "ogv" }, // OggS — Ogg video

  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: "application/zip", extension: "zip" },
  { bytes: [0x50, 0x4b, 0x05, 0x06], mime: "application/zip", extension: "zip" },
  { bytes: [0x1f, 0x8b], mime: "application/gzip", extension: "gz" },
];

function isWebP(buf: Uint8Array): boolean {
  if (buf.length < 12) return false;
  return buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
}

function isAvi(buf: Uint8Array): boolean {
  if (buf.length < 12) return false;
  return buf[8] === 0x41 && buf[9] === 0x56 && buf[10] === 0x49 && buf[11] === 0x20;
}

export function detectMimeFromBuffer(buffer: ArrayBuffer): DetectedType {
  const buf = new Uint8Array(buffer);
  if (buf.length === 0) return { mime: "application/octet-stream", extension: "" };

  for (const sig of SIGNATURES) {
    const offset = sig.offset ?? 0;
    if (buf.length < offset + sig.bytes.length) continue;
    const match = sig.bytes.every((b, i) => buf[offset + i] === b);
    if (match && (!sig.when || sig.when(buf))) {
      return { mime: sig.mime, extension: sig.extension };
    }
  }

  return { mime: "application/octet-stream", extension: "" };
}
