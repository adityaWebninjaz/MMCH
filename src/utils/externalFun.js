import CryptoJS from "crypto-js";
const secretKey = 'secret_key_for_all';



export const decryptPassword = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        
        if (decryptedPassword) {
            return decryptedPassword;
        } else {
            console.error("Empty decrypted password.");
            return null;
        }
    } catch (error) {
        console.error("Error decrypting password:", error);
        return null;
    }
};