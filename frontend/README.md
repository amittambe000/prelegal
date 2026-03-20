# Mutual NDA Generator - Frontend

A production-ready Next.js application for generating Mutual Non-Disclosure Agreements (NDAs) using CommonPaper templates.

## Features

- **Live Preview**: See your NDA update in real-time as you fill in the form
- **PDF Export**: Download professionally formatted PDF documents
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Production Ready**: Built with TypeScript, Tailwind CSS, and modern best practices
- **Form Validation**: Ensures all required fields are completed before generation

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Template**: CommonPaper Mutual NDA v1.0 (CC BY 4.0)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── NDAForm.tsx        # Form component for data input
│   ├── NDAPreview.tsx     # Live preview component
│   └── DownloadButton.tsx # PDF download functionality
├── lib/
│   ├── templateParser.ts  # Template parsing and placeholder replacement
│   └── pdfGenerator.ts    # PDF generation logic
├── data/
│   └── mutualNda.ts       # CommonPaper NDA template
└── types/
    └── nda.ts             # TypeScript interfaces
```

## Usage

1. **Fill in Party Information**: Enter names and emails for both parties
2. **Define Terms**: Specify purpose, dates, and legal jurisdiction
3. **Review Preview**: The document updates live as you type
4. **Download PDF**: Click the download button to save your completed NDA

## Form Fields

### Party Information
- Party 1 Name & Email
- Party 2 Name & Email

### Agreement Terms
- **Purpose**: What the NDA is for
- **Effective Date**: When the agreement starts
- **MNDA Term**: How long the agreement lasts (1-5 years)
- **Term of Confidentiality**: How long information remains confidential (2-7 years)

### Legal Terms
- **Governing Law**: Which state's laws apply
- **Jurisdiction**: Where disputes are resolved

## License

The application code is open source. The CommonPaper Mutual NDA template is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Legal Disclaimer

This application generates legal documents based on standard templates. While CommonPaper templates are widely used and legally sound, we strongly recommend having any generated documents reviewed by qualified legal counsel before use.

## Credits

- Template: [CommonPaper](https://commonpaper.com/)
- Framework: [Next.js](https://nextjs.org/)
- PDF Generation: [jsPDF](https://github.com/parallax/jsPDF)
