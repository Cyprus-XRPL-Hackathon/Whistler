(async () => {
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

  function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  function hex2buf(hexString) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, '');
    // ensure even number of characters
    if (hexString.length % 2 != 0) {
      console.log('WARNING: expecting an even number of characters in the hexString');
    }
    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
      console.log('WARNING: found non-hex characters', bad);
    }
    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi);
    // convert the octets to integers
    var integers = pairs.map(function(s) {
      return parseInt(s, 16);
    });
    var array = new Uint8Array(integers);
    return array.buffer;
  }

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
//     let keyPair = await subtle.generateKey({
//         name: "ECDH",
//         namedCurve: "P-384",
//       },
//       true,
//       ["deriveKey"],
//     );
    //     company.keyPair = keyPair;
    //     return buf2hex(await subtle.exportKey("raw", keyPair.publicKey));

    //   console.log(company.keyPair.privateKey);
//   let companyPrivateKey = await subtle.exportKey("pkcs8", company.keyPair.privateKey);
//   console.log(buf2hex(companyPrivateKey));


    let privateKeyExported = hex2buf("3081b6020100301006072a8648ce3d020106052b8104002204819e30819b02010104301c7303d450334df3f22b8d4c7c357bbbb2088a46127e45d82e631f35c9b478257a6ca2ba0351043a2cab9008fcd647bea16403620004ad04f6fa76bf8794a64ce1f21ace14a032ab0a154af562d59057b28287358e1f35e8e06dc26f21756e3611fd12128e04232e2e258d99b2bf9e963d8cf6bb8ad9a3d48f8c00b4ab103c16fbf20fce3df9d0da2983300bda3374f1b9de0ac208b9");
// 		let privateKey = await subtle.importKey("pkcs8", privateKeyExported, publicAlg, true, ["deriveKey"]);
//     let keyPair = await subtle.deriveKey(publicAlg, privateKey, publicAlg, true, ["deriveKey"]);
//     console.log(keyPair);
    return "04ad04f6fa76bf8794a64ce1f21ace14a032ab0a154af562d59057b28287358e1f35e8e06dc26f21756e3611fd12128e04232e2e258d99b2bf9e963d8cf6bb8ad9a3d48f8c00b4ab103c16fbf20fce3df9d0da2983300bda3374f1b9de0ac208b9";
  }

  async function encryptMessage(receivedPublicKeyRaw, message) {
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
    user.keyPair = keyPair;
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
    return [buf2hex(pubkey), hex2buf(buf2hex(iv) + buf2hex(ciphertext))];
  }

  async function decryptMessage(receivedPublicKeyRaw, encodedCiphertext) {
    let iv = encodedCiphertext.slice(0, 12);
    let ciphertext = encodedCiphertext.slice(12);
    // Recover self keys
    let privateKeyExported = hex2buf("3081b6020100301006072a8648ce3d020106052b8104002204819e30819b02010104301c7303d450334df3f22b8d4c7c357bbbb2088a46127e45d82e631f35c9b478257a6ca2ba0351043a2cab9008fcd647bea16403620004ad04f6fa76bf8794a64ce1f21ace14a032ab0a154af562d59057b28287358e1f35e8e06dc26f21756e3611fd12128e04232e2e258d99b2bf9e963d8cf6bb8ad9a3d48f8c00b4ab103c16fbf20fce3df9d0da2983300bda3374f1b9de0ac208b9");
    let publicKeyExported = hex2buf("04ad04f6fa76bf8794a64ce1f21ace14a032ab0a154af562d59057b28287358e1f35e8e06dc26f21756e3611fd12128e04232e2e258d99b2bf9e963d8cf6bb8ad9a3d48f8c00b4ab103c16fbf20fce3df9d0da2983300bda3374f1b9de0ac208b9");
		let privateKey = await subtle.importKey("pkcs8", privateKeyExported, publicAlg, true, ["deriveKey"]);
    let publicKey = await subtle.importKey("raw", publicKeyExported, publicAlg, true, ["deriveKey"]);
    
    let keyPair = {
      privateKey,
      publicKey,
    };
    company.keyPair = keyPair;
    console.log(keyPair);

    // Import key
    let receivedPublicKey = await subtle.importKey(
      "raw",
      hex2buf(receivedPublicKeyRaw),
      publicAlg,
      false,
      ["deriveKey"],
    );
    // Derive key
    let sharedSecret = await subtle.deriveKey({
        name: "ECDH",
        public: receivedPublicKey,
      },
      company.keyPair.privateKey,
      secretAlg,
      false,
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
  console.log(companyPubKey);
  
  let message = "Hello Cyprus, this can also be a long message, we use Authenticated Encryption!";
  let payload = await encryptMessage(companyPubKey, message);
  console.log(payload); // First is the public key to send, second is the raw bytes to save to IPFS
  let recoveredMessage = await decryptMessage(payload[0], payload[1]);
  console.log(recoveredMessage);
})();
