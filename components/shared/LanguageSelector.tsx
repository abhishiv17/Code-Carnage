'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Globe, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Check cookie for current language
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match) {
      const parts = match[2].split('/');
      if (parts.length > 2) {
        setCurrentLang(parts[2]);
      }
    }
    
    // Initialize Google Translate invisibly
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: LANGUAGES.map(l => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    if (langCode === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
    }
    window.location.reload();
  };

  return (
    <>
      <div className="hidden" id="google_translate_element"></div>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-soft)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)] transition-all">
        <Globe size={14} className="text-accent-violet shrink-0" />
        <select
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent text-xs text-[var(--text-primary)] font-medium focus:outline-none cursor-pointer appearance-none pr-4"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
              {lang.label}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="text-[var(--text-muted)] absolute right-2 pointer-events-none" />
      </div>
    </>
  );
}
