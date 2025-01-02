const QRCode = require("qrcode");

async function generateQRCode(url) {
  try {
    const qrCodeDataUri = await QRCode.toDataURL(url);
    return qrCodeDataUri;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw error;
  }
}

module.exports = generateQRCode;

