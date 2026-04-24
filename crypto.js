let key;

/**
 * Update: Menghasilkan kunci yang sama berdasarkan password.
 * Ini memungkinkan 2 orang berkomunikasi asal tahu password yang sama.
 */
async function deriveKeyFromPassword(password) {
  const enc = new TextEncoder();
  
  // 1. Ubah password string menjadi buffer
  const passwordBuffer = enc.encode(password);

  // 2. Gunakan PBKDF2 untuk mengimpor password sebagai material kunci
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  /**
   * 'Salt' (garam) harus sama di kedua pengguna. 
   * Ini memastikan kunci yang dihasilkan konsisten.
   */
  const salt = enc.encode("waing-secure-salt-2026"); 

  // 3. Ubah password menjadi kunci AES-GCM 256-bit
  key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Standar keamanan tinggi
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  console.log("Kunci Aman Berhasil Dibuat!");
}

async function encryptMessage(text) {
  if (!key) throw new Error("Kunci belum di-set! Masukkan password dulu.");
  
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };
}

async function decryptMessage(encrypted) {
  if (!key) throw new Error("Kunci belum di-set!");
  
  const dec = new TextDecoder();

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(encrypted.iv) },
      key,
      new Uint8Array(encrypted.data)
    );
    return dec.decode(decrypted);
  } catch (e) {
    return "⚠️ Gagal mendekripsi: Password salah atau data rusak.";
  }
}

// Catatan: Jangan panggil generateKey() secara otomatis lagi.
// Fungsi deriveKeyFromPassword(pass) akan dipanggil dari app.js saat user input password.
