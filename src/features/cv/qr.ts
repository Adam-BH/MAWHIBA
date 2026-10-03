import "server-only";
import QRCode from "qrcode";
import { THEME } from "@/features/cv/pdf/theme";

const OPTIONS = { margin: 1, errorCorrectionLevel: "M" as const, color: { dark: THEME.colors.primary, light: THEME.colors.background } };

/** QR code pointing at the online, verifiable CV. */
export function qrSvg(url: string) {
  return QRCode.toString(url, { ...OPTIONS, type: "svg" });
}

export function qrPngDataUrl(url: string) {
  // 4-module quiet zone: the Moderne template puts the code on a dark sidebar.
  return QRCode.toDataURL(url, { ...OPTIONS, margin: 4, width: 300 });
}
