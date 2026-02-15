import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { BrandSymbol } from "./BrandSymbol";
import { Menu, X, ChevronDown } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";

export function SiteHeader() {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive(path)
        ? "text-[#335072] font-bold"
        : "text-[#335072]/70 hover:text-[#335072]"
    }`;


  return (
    <header className="sticky top-0 z-50 bg-[#F2E9E4]/95 backdrop-blur-md border-b border-[#D4BCB2]/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <BrandSymbol size={36} color="#335072" />
            <div className="flex flex-col">
              <span
                className="text-[#335072] text-lg tracking-[0.2em] leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                KARINA BONADIU
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass("/")}>
              {t.nav.home}
            </Link>
            <Link to="/about" className={navLinkClass("/about")}>
              {t.nav.about}
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                className={`text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1 ${
                  isActive("/services/individual") || isActive("/services/corporate")
                    ? "text-[#335072] font-bold"
                    : "text-[#335072]/70 hover:text-[#335072]"
                }`}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                {t.nav.services}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div
                className={`absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#D4BCB2]/30 py-2 min-w-[180px] transition-all duration-200 ${
                  servicesOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-1"
                }`}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  to="/services/individual"
                  className="block px-4 py-2 text-sm font-medium text-[#335072]/70 hover:text-[#335072] hover:bg-[#F2E9E4]/50 transition-colors"
                >
                  {t.nav.servicesIndividual}
                </Link>
                <Link
                  to="/services/corporate"
                  className="block px-4 py-2 text-sm font-medium text-[#335072]/70 hover:text-[#335072] hover:bg-[#F2E9E4]/50 transition-colors"
                >
                  {t.nav.servicesCorporate}
                </Link>
              </div>
            </div>

            <Link to="/contact" className={navLinkClass("/contact")}>
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right side: Language + CTA + Login */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[#335072]/60 hover:text-[#335072] transition-colors"
            >
              {t.nav.login}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#335072] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#2a4260] transition-colors tracking-wide"
            >
              {t.nav.talkToMe}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#335072] p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F2E9E4] border-t border-[#D4BCB2]/30 px-4 py-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block text-[#335072] text-base font-medium"
          >
            {t.nav.home}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-[#335072] text-base font-medium"
          >
            {t.nav.about}
          </Link>
          <Link
            to="/services/individual"
            onClick={() => setMobileOpen(false)}
            className="block text-[#335072] text-base font-medium"
          >
            {t.nav.servicesIndividual}
          </Link>
          <Link
            to="/services/corporate"
            onClick={() => setMobileOpen(false)}
            className="block text-[#335072] text-base font-medium"
          >
            {t.nav.servicesCorporate}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="block text-[#335072] text-base font-medium"
          >
            {t.nav.contact}
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#335072]/60"
            >
              {t.nav.login}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#335072] text-white text-sm font-medium px-5 py-2 rounded-full"
            >
              {t.nav.talkToMe}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
