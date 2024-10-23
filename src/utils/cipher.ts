import crypto from "node:crypto"
import { CIPHER_ALGORITHM, CIPHER_PASSWORD } from "../constant"

const IV_LENGTH = 16; // For AES, the IV length is 16 bytes

export const encrypt = (payload: string) => {
    // Generate a random Initialization Vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive the encryption key from the password
    const key = crypto.scryptSync(CIPHER_PASSWORD, 'salt', 16); // 32 bytes for AES-128

    // Create the cipher using the algorithm, key, and iv
    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);

    // Combine encryption source
    const source = payload

    // Cipher the source
    let encrypted = cipher.update(source, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Return the base64 encoded ciphered token with the IV prepended
    const result = iv.toString('hex') + ':' + encrypted;

    return Buffer.from(result).toString('base64');
}

export const decrypt = <T>(token: string): T => {
    // The ciphered token is a base64 encoded string, decode it
    const decodedBuffer = Buffer.from(token, 'base64').toString('utf-8');

    // Extract the IV and the encrypted data
    const [ivHex, encryptedData] = decodedBuffer.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    // Derive the encryption key from the password
    const key = crypto.scryptSync(CIPHER_PASSWORD, 'salt', 16); // 32 bytes for AES-128

    // Create decipher instance using the algorithm, key, and iv
    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return JSON.parse(decrypted);
};

