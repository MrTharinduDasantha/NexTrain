import crypto from "crypto";

/**
 * 10-character PNR. Uses crypto.randomBytes -> base36 -> uppercase.
 * Caller checks DB uniqueness and retries on collision.
 */
export const generatePNR = () => {
  const bytes = crypto.randomBytes(6).readUIntBE(0, 6); // Up to 2^48
  const code = bytes.toString(36).toUpperCase().padStart(10, "0").slice(-10);

  return `NX${code.slice(-8)}`;
};
