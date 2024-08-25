const fs = require("fs");
const path = require("path");
const mkcert = require("mkcert");

async function createCertificate() {
    try {
        // Create a Certificate Authority (CA)
        const ca = await mkcert.createCA({
            organization: "Yue",
            countryCode: "SG",
            state: "Singapore",
            locality: "Singapore",
            validityDays: 365,
        });

        // Check if CA creation was successful
        if (!ca || !ca.cert || !ca.key) {
            throw new Error("Failed to create Certificate Authority (CA)");
        }

        // Create a certificate for localhost
        const cert = await mkcert.createCert({
            domains: ["localhost"],
            validityDays: 365,
            ca: ca,
        });

        // Check if certificate creation was successful
        if (!cert || !cert.cert || !cert.key) {
            throw new Error("Failed to create certificate");
        }

        // Ensure the certs directory exists
        const certsDir = path.resolve(__dirname, "certs");
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir);
        }

        // Save the certificate and key to the certs directory
        fs.writeFileSync(path.join(certsDir, "localhost.pem"), cert.cert);
        fs.writeFileSync(path.join(certsDir, "localhost-key.pem"), cert.key);

        console.log("Certificates saved successfully!");
    } catch (error) {
        console.error("Error generating certificates:", error);
    }
}

createCertificate();
