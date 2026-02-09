/**
 * Test Page for Language Detection
 * 
 * Tests the language detection functionality using the existing repo solution
 */

'use client';

import { useState } from 'react';
import { detectLanguage, hasHebrew, hasGreek, extractHebrew, extractGreek } from '@/lib/language-detector';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function TestLanguageDetectionPage() {
  const [testText, setTestText] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTest = () => {
    if (!testText.trim()) return;
    
    const detection = detectLanguage(testText);
    setResult({
      detection,
      hasHebrew: hasHebrew(testText),
      hasGreek: hasGreek(testText),
      extractedHebrew: extractHebrew(testText),
      extractedGreek: extractGreek(testText),
    });
  };

  const sampleTexts = {
    hebrew: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    greek: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
    mixed: 'בְּרֵאשִׁית and Ἐν ἀρχῇ ἦν ὁ λόγος',
    english: 'In the beginning God created the heavens and the earth.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Language Detection Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the language detection functionality using the existing repo solution
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Based on: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">download_hebrew_bible.py</code> line 85
          </p>
        </div>

        {/* Test Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Test Language Detection
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter text to test:
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter Hebrew, Greek, or mixed text..."
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-lds-500 focus:ring-2 focus:ring-lds-200 dark:focus:ring-lds-800 transition-colors min-h-[100px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTestText(sampleTexts.hebrew)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium transition-colors"
              >
                Sample Hebrew
              </button>
              <button
                onClick={() => setTestText(sampleTexts.greek)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium transition-colors"
              >
                Sample Greek
              </button>
              <button
                onClick={() => setTestText(sampleTexts.mixed)}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium transition-colors"
              >
                Sample Mixed
              </button>
              <button
                onClick={() => setTestText(sampleTexts.english)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Sample English
              </button>
            </div>

            <button
              onClick={handleTest}
              className="w-full px-4 py-2 bg-lds-600 hover:bg-lds-700 text-white font-semibold rounded-lg transition-colors"
            >
              Detect Language
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Detection Results
            </h2>

            <div className="space-y-4">
              {/* Primary Detection */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Detected Language
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.detection.language === 'hebrew' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    result.detection.language === 'greek' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    result.detection.language === 'aramaic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {result.detection.language.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: <span className="font-semibold">{(result.detection.confidence * 100).toFixed(1)}%</span>
                </p>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Hebrew</div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {result.detection.hebrewCount}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Greek</div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {result.detection.greekCount}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Aramaic</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {result.detection.aramaicCount}
                  </div>
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {result.hasHebrew ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Has Hebrew: {result.hasHebrew ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {result.hasGreek ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Has Greek: {result.hasGreek ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Extracted Text */}
              {result.extractedHebrew && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Extracted Hebrew:
                  </h4>
                  <p className="text-lg font-hebrew text-right text-orange-900 dark:text-orange-100">
                    {result.extractedHebrew}
                  </p>
                </div>
              )}

              {result.extractedGreek && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    Extracted Greek:
                  </h4>
                  <p className="text-lg font-greek text-purple-900 dark:text-purple-100">
                    {result.extractedGreek}
                  </p>
                </div>
              )}

              {/* Matches */}
              {result.detection.matches.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Matches ({result.detection.matches.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.detection.matches.slice(0, 10).map((match: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm border border-gray-200 dark:border-gray-700"
                      >
                        {match}
                      </span>
                    ))}
                    {result.detection.matches.length > 10 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-sm">
                        +{result.detection.matches.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            About Language Detection
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This uses Unicode pattern matching from the existing repo solution in{' '}
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">download_hebrew_bible.py</code> line 85.
            No external libraries required - uses built-in Python <code>re</code> module and JavaScript regex.
          </p>
        </div>
      </div>
    </div>
  );
}



