import React from 'react';

interface Translation {
  name: string;
  text: string;
  source: string;
  url: string;
  verified: boolean;
  lastChecked: string;
}

interface VerseComparisonProps {
  book: string;
  chapter: number;
  verse: number;
  translations: Translation[];
}

const VerseComparison: React.FC<VerseComparisonProps> = ({ book, chapter, verse, translations }) => {
  return (
    <div className="flex flex-col items-center w-full my-8">
      <h2 className="text-2xl font-bold mb-4">{book} {chapter}:{verse}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {translations.map((t, idx) => (
          <div key={idx} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <h3 className="font-bold text-center mb-2">{t.name}</h3>
            <p className="mb-4 text-center">{t.text}</p>
            <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2">View on {t.source}</a>
            <div className="flex items-center gap-2">
              {t.verified ? (
                <span className="inline-flex items-center text-green-600 text-sm font-semibold" title={`Verified against PDF on ${t.lastChecked}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-yellow-600 text-sm font-semibold" title="Not yet verified against PDF">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                  Not Verified
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">Last checked: {t.lastChecked || 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerseComparison; 