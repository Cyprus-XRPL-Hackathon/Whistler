## BURNER ACCOUNTS

**Involved parties.** Company, User.

**Working assumptions.** Ideal assumptions: do NOT limit whispers (e.g. daily limit), User anonimity.

**Description.** Throwaway Ripple wallet able to perform one transaction and be safely discarded.

A cryptographic solution allows us to implement identity management by removing identities altogether. We adopt burner accounts with the following lifecycle:

### 1. Generation
Generated by the Company with a [passphrase](https://xrpl.org/cryptographic-keys.html#passphrase) and an [initialising transaction](https://xrpl.org/accounts.html#creating-accounts). The transaction sends enough XRP to allow the operation with NFTs.

### 2. Inheritance
The passphrase is anonymously given to the User so that they can inherit the account from the company. 

**Examples.** Trivially, a list. A better way would be a company-side application with anonymous identity management.

### 3. Usage
The account can sell an NFT to the Company with enough info to allow our second-layer operations.

**Criticality.** Under our assumptions, we do not limit daily whispers. There is a possibility of a DOS attack. Could be solved with a soft limit (e.g. ~1000 accounts per day).

### 4. Burning
The account [can be deleted](https://xrpl.org/deleting-accounts.html) from the Ripple blockchain. No ties to the User. Our second layer also needs to destroy all data on the secret keys, as described below.

### Cryptography

Company has 
- company wallet asymmetric public key (C-PuK)
- company wallet asymmetric private key (C-PrK)

User (after inheritance) has
- user wallet asymmetric public key (U-PuK)
- user wallet asymmetric private key (U-PrK)

There are two Ripple transactions in the protocol. Their [memos](https://xrpl.org/transaction-common-fields.html#memos-field) can contain data. 
1. **Initialising transaction.** In the memo field, Company sends its part of the symmetric key exchange public data (C-KE). User can combine it with its own (U-KE) to obtain a shared symmetric secret key (C-SYM).
2. **NFT transaction.** In the NFT, User sends the IPFS encrypted document under the shared symmetric key (C-SYM). In the memo field, User sends its part of the symmetric key exchange public data (U-KE). Company can combine it with its own (C-KE) to obtain the shared symmetric secret key (C-SYM).

Account burning must destroy C-SYM, C-KE, U-KE.

**Threat model 1.** An attacker able to steal leaked asymmetric (wallet) Client keys of one party after the protocol is done. Wallet burning protects documents: the wallet is destroyed, transactions are deleted, the shared symmetric key (C-SIM) is destroyed.

**Threat model 2.** An attacker able to steal leaked the symmetric shared key after the protocol is done. He can only read one document (this one).

**Threat model 3.** An attacker able to steal both after the protocol is done. He can only read one document (this one) and the account is already burned.

**Future improvements.** 
- Ripple already signs transactions, but Users and Companies might wish for an additional layer of security.
- A stronger key exchange.
- Zero-knowledge proofs.
- A layer of identity management to prevent DOS attacks.
- Company could pre-compute offline some values for its part of the symmetric key exchange public data (C-KE) to improve performance.