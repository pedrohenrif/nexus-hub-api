import crypto from 'crypto';

const SECRET = process.env.ENCRYPTION_KEY || 'super-secret-key-nexus-hub-2024';

const key = crypto.createHash('sha256').update(String(SECRET)).digest('base64').substr(0, 32);
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error("Erro ao criptografar:", error);
    return text; 
  }
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text; 
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return text; 
  }
}