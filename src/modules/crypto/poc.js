const crypto = window.crypto;
const subtle = window.crypto.subtle || window.crypto.webkitSubtle;
const publicAlg = {
  name: "ECDH",
  namedCurve: "P-384",
};
const secretAlg = {
  name: "AES-GCM",
  length: 256,
};

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
};

function hex2buf(hexString) {
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
  var pairs = hexString.match(/[\dA-F]{2}/gi);
  // convert the octets to integers
  var integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });
  var array = new Uint8Array(integers);
  return array.buffer;
};

if (!crypto) {
  console.warn("We have not crypto!");
  return;
}

var company = {
  keyPair: null,
};
var user = {
  keyPair: null,
};

async function setupKey() {
  // Generate key pair
  let keyPair = await subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    ["deriveKey"]
  );
  company.keyPair = keyPair;
  return buf2hex(await subtle.exportKey("raw", keyPair.publicKey));
}

async function encryptMessage(receivedPublicKeyRaw, message) {
  // Import key
  let receivedPublicKey = await subtle.importKey(
    "raw",
    hex2buf(receivedPublicKeyRaw),
    publicAlg,
    false,
    ["deriveKey"]
  );
  // Generate key pair
  let keyPair = await subtle.generateKey(publicAlg, false, ["deriveKey"]);
  user.keyPair = keyPair;
  // Derive key
  let sharedSecret = await subtle.deriveKey(
    {
      name: "ECDH",
      public: receivedPublicKey,
    },
    keyPair.privateKey,
    secretAlg,
    false, // extractable, maybe should be true?
    ["encrypt"]
  );
  // Encrypt message
  iv = crypto.getRandomValues(new Uint8Array(12));
  let encoder = new TextEncoder();
  let plaintext = encoder.encode(message);
  let ciphertext = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedSecret,
    plaintext
  );
  let pubkey = await subtle.exportKey("raw", keyPair.publicKey);
  return [buf2hex(pubkey), hex2buf(buf2hex(iv) + buf2hex(ciphertext))];
};

async function decryptMessage(
  receivedPublicKeyRaw,
  encodedCiphertext
) {
  let iv = encodedCiphertext.slice(0, 12);
  let ciphertext = encodedCiphertext.slice(12);
  // Import key
  let receivedPublicKey = await subtle.importKey(
    "raw",
    hex2buf(receivedPublicKeyRaw),
    publicAlg,
    false,
    ["deriveKey"]
  );
  // Derive key
  let sharedSecret = await subtle.deriveKey(
    {
      name: "ECDH",
      public: receivedPublicKey,
    },
    company.keyPair.privateKey,
    secretAlg,
    false,
    ["decrypt"]
  );
  // Decrypt message
  try {
    let plaintext = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedSecret,
      ciphertext
    );

    let decoder = new TextDecoder();
    let message = decoder.decode(plaintext);
    return message;
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  buf2hex,
  hex2buf,
  setupKey,
  encryptMessage,
  decryptMessage,
  publicAlg,
  secretAlg
};

// let companyPubKey = await setupKey();
// // console.log(hex2buf(companyPubKey));
// let message = "Hello Cyprus, this can also be a long message, we use Authenticated Encryption!";
// let payload = await encryptMessage(companyPubKey, message);
// // console.log(payload); // First is the public key to send, second is the raw bytes to save to IPFS
// let recoveredMessage = await decryptMessage(payload[0], payload[1]);
// console.log(recoveredMessage);
