import { NDAFormData } from '@/types/nda';

export function parseTemplate(template: string, data: NDAFormData): string {
  let parsed = template;

  // Replace all placeholders with actual values
  const replacements: Record<string, string> = {
    '{{PURPOSE}}': data.purpose || '[Purpose]',
    '{{EFFECTIVE_DATE}}': data.effectiveDate || '[Effective Date]',
    '{{MNDA_TERM}}': data.mndaTerm || '[MNDA Term]',
    '{{CONFIDENTIALITY_TERM}}': data.confidentialityTerm || '[Term of Confidentiality]',
    '{{GOVERNING_LAW}}': data.governingLaw || '[Governing Law]',
    '{{JURISDICTION}}': data.jurisdiction || '[Jurisdiction]',
  };

  Object.entries(replacements).forEach(([placeholder, value]) => {
    parsed = parsed.replace(new RegExp(placeholder, 'g'), value);
  });

  return parsed;
}

export function generateCoverPage(data: NDAFormData): string {
  return `# Cover Page

**Mutual Non-Disclosure Agreement**

**Effective Date:** ${data.effectiveDate || '[Not specified]'}

**Between:**

**Party 1:**
- Name: ${data.party1Name || '[Not specified]'}
- Email: ${data.party1Email || '[Not specified]'}

**Party 2:**
- Name: ${data.party2Name || '[Not specified]'}
- Email: ${data.party2Email || '[Not specified]'}

**Purpose:** ${data.purpose || '[Not specified]'}

**Terms:**
- MNDA Term: ${data.mndaTerm || '[Not specified]'}
- Term of Confidentiality: ${data.confidentialityTerm || '[Not specified]'}
- Governing Law: State of ${data.governingLaw || '[Not specified]'}
- Jurisdiction: ${data.jurisdiction || '[Not specified]'}

---

`;
}

export function isFormComplete(data: NDAFormData): boolean {
  return !!(
    data.party1Name &&
    data.party1Email &&
    data.party2Name &&
    data.party2Email &&
    data.purpose &&
    data.effectiveDate &&
    data.mndaTerm &&
    data.confidentialityTerm &&
    data.governingLaw &&
    data.jurisdiction
  );
}
