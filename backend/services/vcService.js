import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

class VCService {
    constructor() {
        this.vcData = null;
        this.signedVC = null;
        this.ipfsResult = null;
    }

    async createAndSignVC(userData, sbtImageCid) {
        try {
            // Create unsigned VC
            const unsignedVC = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://w3id.org/security/suites/ed25519-2020/v1"
                ],
                id: `urn:uuid:${crypto.randomUUID()}`,
                type: ["VerifiableCredential", "KYCVerifiedCredential"],
                issuer: userData.did,
                issuanceDate: new Date().toISOString(),
                expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                credentialSubject: {
                    id: userData.did,
                    applicant_id: userData.applicantId,
                    full_name: userData.name,
                    email: userData.email,
                    country: userData.country || "IND",
                    kycStatus: "completed",
                    kycLevel: "full-verification",
                    wallets: userData.wallets,
                    walletMetadata: userData.walletMetadata,
                    sbtImage: `ipfs://${sbtImageCid}`
                }
            };

            // Mock sign the VC (simulating DIDKit)
            this.signedVC = {
                ...unsignedVC,
                proof: {
                    type: "Ed25519Signature2020",
                    created: new Date().toISOString(),
                    verificationMethod: `${userData.did}#${userData.did.split(':')[2]}`,
                    proofPurpose: "assertionMethod",
                    jws: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(unsignedVC)).toString('base64url')}.${crypto.randomBytes(32).toString('base64url')}`
                }
            };

            console.log(`✅ VC created and signed`);
            return true;
        } catch (error) {
            console.error(`❌ VC creation failed:`, error.message);
            return false;
        }
    }

    async uploadToIPFS() {
        try {
            if (!this.signedVC) {
                throw new Error('No signed VC to upload');
            }

            console.log(`📦 Uploading VC to IPFS...`);

            const uploadData = {
                pinataContent: this.signedVC,
                pinataMetadata: {
                    name: `VC-${this.signedVC.credentialSubject.full_name}`,
                    description: `KYC Verified Credential for ${this.signedVC.credentialSubject.id}`,
                    keyvalues: {
                        type: "VC",
                        subject: this.signedVC.credentialSubject.id,
                        status: this.signedVC.credentialSubject.kycStatus
                    }
                },
                pinataOptions: {
                    cidVersion: 1,
                    wrapWithDirectory: false
                }
            };

            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                uploadData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.PINATA_JWT}`
                    }
                }
            );

            if (response.data && response.data.IpfsHash) {
                this.ipfsResult = {
                    cid: response.data.IpfsHash,
                    url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
                    size: response.data.PinSize
                };

                console.log(`✅ VC uploaded to IPFS: ${this.ipfsResult.cid}`);
                
                // Update .env
                this.updateEnvFile();
                
                return this.ipfsResult;
            } else {
                throw new Error('No IPFS hash returned');
            }

        } catch (error) {
            console.error(`❌ IPFS upload failed:`, error.message);
            return null;
        }
    }

    updateEnvFile() {
        try {
            let envContent = fs.readFileSync('.env', 'utf8');
            
            // Remove old VC entries
            envContent = envContent
                .split('\n')
                .filter(line => 
                    !line.startsWith('VC_IPFS_CID=') &&
                    !line.startsWith('VC_IPFS_URL=') &&
                    !line.startsWith('VC_UPLOADED_AT=')
                )
                .join('\n');

            // Add new VC entries
            const newVars = `
# VC IPFS (Auto-generated)
VC_IPFS_CID=${this.ipfsResult.cid}
VC_IPFS_URL=${this.ipfsResult.url}
VC_UPLOADED_AT=${new Date().toISOString()}
`;

            envContent += newVars;
            fs.writeFileSync('.env', envContent);
            
        } catch (error) {
            console.error('Failed to update .env:', error.message);
        }
    }

    async createVCForSBT(userData, sbtImageCid) {
        console.log(`🎯 Creating VC for ${userData.name}...`);
        
        // Create and sign VC
        const created = await this.createAndSignVC(userData, sbtImageCid);
        if (!created) return null;

        // Upload to IPFS
        const ipfsResult = await this.uploadToIPFS();
        if (!ipfsResult) return null;

        console.log(`✅ VC process complete: ${ipfsResult.cid}`);
        return {
            vcCid: ipfsResult.cid,
            vcUrl: ipfsResult.url,
            vcHash: crypto.createHash('sha256').update(JSON.stringify(this.signedVC)).digest('hex'),
            signedVC: this.signedVC
        };
    }
}

export default VCService; 