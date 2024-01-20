/** Proof of Concept for key exchange in Whistler project
 * Author: 1dotd4
 *
 * This is a Proof of Concept of our key exchange in transactions.
 * This works on browsers. Documentation will follow somewhere else.
 */
(async () => {
  const crypto = window.crypto;
  const subtle = window.crypto.subtle || window.crypto.webkitSubtle;

  if (!crypto) {
    console.warn("We have not crypto!");
    return;
  }

  var company = {
    keyPair: null
  };
  var user = {
    keyPair: null
  };

  async function setupKey() {
    // Generate key pair
    let keyPair = await subtle.generateKey({
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      ["deriveKey"],
    );
    company.keyPair = keyPair;
    return subtle.exportKey("raw", keyPair.publicKey);
  }

  async function encryptMessage(receivedPublicKeyRaw, message) {
    // Import key
    let receivedPublicKey = await subtle.importKey(
      "raw",
      receivedPublicKeyRaw, {
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      ["deriveKey"],
    );
    // Generate key pair
    let keyPair = await subtle.generateKey({
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      ["deriveKey"],
    );
    user.keyPair = keyPair;
    // Derive key
    let sharedSecret = await subtle.deriveKey({
        name: "ECDH",
        public: receivedPublicKey,
      },
      keyPair.privateKey, {
        name: "AES-GCM",
        length: 256,
      },
      false, // extractable, maybe should be true?
      ["encrypt"],
    );
    // Encrypt message
    iv = crypto.getRandomValues(new Uint8Array(12));
    let encoder = new TextEncoder();
    let plaintext = encoder.encode(message);
    let ciphertext = await subtle.encrypt({
        name: "AES-GCM",
        iv: iv,
      },
      sharedSecret,
      plaintext,
    );
    let pubkey = await subtle.exportKey("raw", keyPair.publicKey);
    return [pubkey, iv, ciphertext];
  }

  async function decryptMessage(payload) {
    [receivedPublicKeyRaw, iv, ciphertext] = payload;
    // Import key
    let receivedPublicKey = await subtle.importKey(
      "raw",
      receivedPublicKeyRaw, {
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      ["deriveKey"],
    );
    // Derive key
    let sharedSecret = await subtle.deriveKey({
        name: "ECDH",
        public: receivedPublicKey,
      },
      company.keyPair.privateKey, {
        name: "AES-GCM",
        length: 256,
      },
      false, // extractable, maybe should be true?
      ["decrypt"],
    );
    // Decrypt message
    try {
      let plaintext = await subtle.decrypt({
          name: "AES-GCM",
          iv: iv,
        },
        sharedSecret,
        ciphertext,
      );
      let decoder = new TextDecoder();
      let message = decoder.decode(plaintext);
      return message;
    } catch (e) {
      console.error(e);
    }
  }

  let companyPubKey = await setupKey();
  let message = "Hello Cyprus, this can also be a long message, we use Authenticated Encryption!";
  let payload = await encryptMessage(companyPubKey, message);
  console.log(payload);
  let recoveredMessage = await decryptMessage(payload);
  console.log(recoveredMessage);
})();
