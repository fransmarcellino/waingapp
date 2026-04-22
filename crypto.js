let key;

async function generateKey() {
  key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

async function encryptMessage(text) {
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
  const dec = new TextDecoder();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(encrypted.iv) },
    key,
    new Uint8Array(encrypted.data)
  );

  return dec.decode(decrypted);
}

generateKey();
