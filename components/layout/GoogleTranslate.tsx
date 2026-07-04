"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Globe } from "lucide-react";
import clsx from "clsx";

// Add global types for the Google Translate script
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

// Limited selection of popular languages for a cleaner UI
const LANGUAGES = [
  // Indian Subcontinent
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  // International Global
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh-CN', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'id', name: 'Bahasa Indonesia' }
];

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local storage / cookies to see if a language was already selected
    const checkLang = () => {
      const match = document.cookie.match(/(?<=googtrans=\/en\/)[a-zA-Z-]+/);
      if (match) setCurrentLang(match[0]);
    };
    checkLang();

    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    if (langCode === 'en') {
      // To properly revert to the original language, we must delete the translation cookies
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
      // Fallback for some subdomains
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=." + window.location.hostname + "; path=/;";
      
      window.location.reload();
      return;
    }

    // The native google translate dropdown is actually a select element buried inside
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    } else {
      // Fallback if script hasn't fully loaded the UI yet
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden Native Google Element (must not be display: none or it won't render) */}
      <div id="google_translate_element" className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"></div>
      
      {/* Our Custom Premium UI */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        title="Change Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:block uppercase">{currentLang}</span>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  currentLang === lang.code 
                    ? "bg-indigo-600/20 text-indigo-400 font-medium" 
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google Translate Init Script */}
      <Script id="google-translate-script" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function() {
            new window.google.translate.TranslateElement(
              { 
                pageLanguage: 'en',
                includedLanguages: 'en,hi,ta,te,bn,mr,es,pt,fr,de,ru,zh-CN,ja,ko,ar,id',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              },
              'google_translate_element'
            );
          }
        `}
      </Script>
      <Script 
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      
      {/* Hide the annoying top bar and popup that Google injects */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate, 
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
        iframe[name="goog_te_banner"] {
            display: none !important;
        }
        body > .skiptranslate {
            display: none !important;
        }
      `}</style>
    </div>
  );
}
