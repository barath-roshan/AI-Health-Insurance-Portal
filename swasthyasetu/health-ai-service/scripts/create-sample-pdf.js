const fs = require('fs');
const path = require('path');

/**
 * Minimal PDF generator to create a valid PDF binary file without external heavy dependencies.
 */
function createMinimalPDF(text, outputPath) {
  // Sanitize text for PDF literal string (escape parenthesis and backslashes)
  const lines = text.split('\n');
  let streamText = 'BT /F1 10 Tf 36 750 Td 14 TL ';
  
  lines.forEach((line) => {
    // Escape backslashes and parentheses
    const escapedLine = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    // If empty line, add extra line spacing
    if (!line.trim()) {
      streamText += 'T* ';
    } else {
      streamText += `(${escapedLine}) ' `;
    }
  });
  streamText += 'ET';

  const streamLength = Buffer.byteLength(streamText, 'utf-8');

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamText}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000315 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${370 + streamLength}
%%EOF`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pdfContent, 'utf-8');
  console.log(`[PDF BUILDER] Created valid PDF at "${outputPath}" (${fs.statSync(outputPath).size} bytes)`);
}

const sampleText = `CHIEF MINISTER COMPREHENSIVE HEALTH INSURANCE SCHEME CMCHIS GOVT OF TAMIL NADU

1 OVERVIEW AND OBJECTIVE
The Chief Minister Comprehensive Health Insurance Scheme CMCHIS is launched by the Government of Tamil Nadu to provide cashless health insurance coverage to low-income families. The scheme covers medical and surgical treatments in empaneled government and private hospitals across Tamil Nadu.

2 FINANCIAL COVERAGE AND BENEFITS
Financial assistance up to Rs 5,00,000 per family per year on a floatation basis.
Covers 1,086 procedures 8 follow-up treatments and 52 diagnostic procedures.
Includes pre-hospitalization costs up to 1 day prior and post-hospitalization medical expenses up to 5 days after discharge.
Cashless treatment at all empaneled public and private hospitals.

3 ELIGIBILITY CRITERIA
To be eligible for CMCHIS the applicant family must fulfill the following conditions:
Annual family income must be less than or equal to Rs 1,20,000 per annum as certified by the Village Administrative Officer VAO or Revenue Authority.
The applicant family must be a resident of Tamil Nadu holding an eligible Smart Family Ration Card Rice Card.
Sri Lankan Tamil refugees residing in registered camps in Tamil Nadu are eligible without income certificate limits.
Orphans and destitute children registered with recognized welfare homes are eligible.

4 REQUIRED DOCUMENTS FOR APPLICATION
Applicants must submit the following official documents:
1 Smart Family Ration Card Family Card.
2 Income Certificate issued by Revenue Department VAO showing annual income below Rs 1,20,000.
3 Aadhaar Card of all family members.
4 Passport-size photographs of the family head and members.
5 Self-declaration form signed by the head of the family.

5 APPLICATION AND ENROLLMENT PROCEDURE
Step 1: Obtain an Income Certificate from the local Village Administrative Officer VAO or e-Sevai Centre.
Step 2: Visit the District Collectorate CMCHIS Kiosk or nearest designated e-Sevai centre with original Smart Ration Card and Aadhaar cards.
Step 3: Verification of documents by the CMCHIS District Kiosk Officer.
Step 4: Biometric data collection fingerprints and photograph of all eligible family members.
Step 5: Issuance of CMCHIS Smart Card with unique Policy ID.

6 HOW TO AVAIL CASHLESS TREATMENT
Visit any empaneled hospital with the CMCHIS Smart Card and Aadhaar Card.
Approach the Chief Minister Insurance Scheme Liaison Officer at the hospital.
Pre-authorization request is submitted electronically to the Third Party Administrator TPA.
Upon approval treatment begins without any out-of-pocket payment by the patient.

7 HELPLINE AND CONTACT INFORMATION
Toll-Free Helpline Number: 1800 425 3993
Official Website: https://www.cmchistn.com
Department: Department of Health and Family Welfare Government of Tamil Nadu.`;

const outputPath = path.join(__dirname, '..', 'data', 'schemes', 'cmchis', 'guidelines.pdf');
createMinimalPDF(sampleText, outputPath);
