export interface NDAFormData {
  party1Name: string;
  party1Email: string;
  party2Name: string;
  party2Email: string;
  purpose: string;
  effectiveDate: string;
  mndaTerm: string;
  confidentialityTerm: string;
  governingLaw: string;
  jurisdiction: string;
}

export interface NDATemplate {
  content: string;
  placeholders: {
    [key: string]: keyof NDAFormData;
  };
}
