import nacl from 'tweetnacl';
import {Xumm} from 'xumm'
import naclUtil from 'tweetnacl-util';
const crypto = window.crypto;
const subtle = window.crypto.subtle;
export const xumm = new Xumm('5383dd93-7b6e-4758-99d7-d253186f2b36') // Some API Key

// TODO: change it to TLS handshake
export const publicKey = naclUtil.decodeBase64('01zkh+BamzzaVz5e1kpZflE4t1Dt8Ws/m9aywpX0PDA=')
export const secretKey = naclUtil.decodeBase64('hwbaEia+hrWBMUGlIHKY5YIvKgNprwnTCSn4hHtpD/4=')
export const companyAddress = 'rEKypbmBzW1zBjDtGfbz18zKHjPsb7NLnY';

const publicAlg = {
    name: "ECDH",
    namedCurve: "P-384",
  };
  const secretAlg = {
    name: "AES-GCM",
    length: 256,
  };

export function generateKeyPairToBase64() {
    const keyPair = nacl.box.keyPair();

    // const publicKeyBase64 = Buffer.from(keyPair.publicKey).toString('base64');
    // const privateKeyBase64 = Buffer.from(keyPair.secretKey).toString('base64');
    const publicKeyBase64 = naclUtil.encodeBase64(keyPair.publicKey)
    const privateKeyBase64 = naclUtil.encodeBase64(keyPair.secretKey)
    console.log('Public Key (Base64):', publicKeyBase64);
    console.log('Private Key (Base64):', privateKeyBase64);
}

export function buf2hex(buffer: ArrayBuffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  };
  
  function hex2buf(hexString: string) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, "");
    // ensure even number of characters
    if (hexString.length % 2 != 0) {
      console.log(
        "WARNING: expecting an even number of characters in the hexString"
      );
    }
    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
      console.log("WARNING: found non-hex characters", bad);
    }
    // split the string into pairs of octets
    const pairs = hexString.match(/[\dA-F]{2}/gi);
    // convert the octets to integers
    var integers = pairs?.map(function (s) {
      return parseInt(s, 16);
    }) || [];
    var array = new Uint8Array(integers);
    return array.buffer;
  };
  
const hardcodedPublicKey = "04ad04f6fa76bf8794a64ce1f21ace14a032ab0a154af562d59057b28287358e1f35e8e06dc26f21756e3611fd12128e04232e2e258d99b2bf9e963d8cf6bb8ad9a3d48f8c00b4ab103c16fbf20fce3df9d0da2983300bda3374f1b9de0ac208b9"

export async function encryptMessage(receivedPublicKeyRaw: string | null, message: string) {
    receivedPublicKeyRaw = receivedPublicKeyRaw || hardcodedPublicKey
    // Import key
    let receivedPublicKey = await subtle.importKey(
      "raw",
      hex2buf(receivedPublicKeyRaw),
      publicAlg,
      false,
      ["deriveKey"],
    );
    // Generate key pair
    let keyPair = await subtle.generateKey(
      publicAlg,
      false,
      ["deriveKey"],
    );
    // Derive key
    let sharedSecret = await subtle.deriveKey({
        name: "ECDH",
        public: receivedPublicKey,
      },
      keyPair.privateKey,
      secretAlg,
      false, // extractable, maybe should be true?
      ["encrypt"],
    );
    // Encrypt message
    const iv = crypto.getRandomValues(new Uint8Array(12));
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
    return {
        pubkey: buf2hex(pubkey),
        payload:  buf2hex(iv) + buf2hex(ciphertext)
    };
  }
