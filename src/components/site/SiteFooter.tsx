import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { BrandSymbol } from "./BrandSymbol";

export function SiteFooter() {
  const { language, setLanguage, t } = useLanguage();

  const langBtn = (lang: Language) => (
    <button
      onClick={() => setLanguage(lang)}
      className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
        language === lang
          ? "bg-[#F2E9E4] text-[#335072]"
          : "text-[#8695AC] hover:text-[#F2E9E4]"
      }`}
    >
      {lang.toUpperCase()}
    </button>
  );

  return (
    <footer className="bg-[#335072] text-[#D4BCB2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BrandSymbol size={32} color="#D4BCB2" />
            <span
              className="text-[#F2E9E4] text-base tracking-[0.2em]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              KARINA BONADIU
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm font-medium text-[#8695AC]">
            &copy; {new Date().getFullYear()} Karina Bonadiu. {t.footer.rights}
          </p>

          {/* Language + Links */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              {langBtn("pt")}
              {langBtn("en")}
              {langBtn("es")}
            </div>
            <a
              href="#"
              className="text-sm font-medium text-[#8695AC] hover:text-[#F2E9E4] transition-colors"
            >
              {t.footer.privacy}
            </a>
            <a
              href="#"
              className="text-sm font-medium text-[#8695AC] hover:text-[#F2E9E4] transition-colors"
            >
              {t.footer.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
