import nacl from 'tweetnacl';
import {Xumm} from 'xumm'
import naclUtil from 'tweetnacl-util';
import  {Buffer} from 'buffer';

export const xumm = new Xumm('6c73afb3-edc9-4bf7-8493-247406d789b7') // Some API Key

// TODO: change it to TLS handshake
export const publicKey = naclUtil.decodeBase64('01zkh+BamzzaVz5e1kpZflE4t1Dt8Ws/m9aywpX0PDA=')
export const secretKey = naclUtil.decodeBase64('hwbaEia+hrWBMUGlIHKY5YIvKgNprwnTCSn4hHtpD/4=')
export const companyAddress = 'rJidoujQfAnuL35bVNLYRCVyiySgmhaBaB';


function generateKeyPairToBase64() {
    const keyPair = nacl.box.keyPair();

    // const publicKeyBase64 = Buffer.from(keyPair.publicKey).toString('base64');
    // const privateKeyBase64 = Buffer.from(keyPair.secretKey).toString('base64');
    const publicKeyBase64 = naclUtil.encodeBase64(keyPair.publicKey)
    const privateKeyBase64 = naclUtil.encodeBase64(keyPair.secretKey)
    console.log('Public Key (Base64):', publicKeyBase64);
    console.log('Private Key (Base64):', privateKeyBase64);
}

