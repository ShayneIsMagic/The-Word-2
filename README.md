This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## VerseComparison Component

This component displays a side-by-side comparison of multiple Bible translations for a given verse, with trusted links and verification badges. It uses the following data structure:

```
{
  book: string,
  chapter: number,
  verse: number,
  translations: [
    {
      name: string,
      text: string,
      source: string,
      url: string,
      verified: boolean,
      lastChecked: string
    },
    // ...more translations
  ]
}
```

### Sample Data

See `src/lib/sampleVerseData.ts` for an example.

### Verification Workflow

1. Extract the verse text from your on-file PDF (using OCR or text extraction).
2. Fetch the online text from the trusted link.
3. Compare the two texts (automated or manual).
4. If they match, set `verified: true` and update `lastChecked`.
5. If they differ, log the discrepancy and review.
6. The UI displays a "Verified" badge if the text is confirmed against the PDF.

### Trusted Sources

- SBLGNT: https://sblgnt.com/
- Bible Gateway: https://www.biblegateway.com/
- ebible.org: https://ebible.org/web/
- Blue Letter Bible: https://www.blueletterbible.org/
- StudyLight.org: https://www.studylight.org/commentary/
- Internet Archive: https://archive.org/

See the main documentation for more details on the verification process and data structure.
