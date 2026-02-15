import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BrandSymbol } from "@/components/site/BrandSymbol";
import { MessageCircle, Mail, MapPin, Instagram, Linkedin } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";
const INSTAGRAM_URL = "https://www.instagram.com/karinabonadiu/";
const LINKEDIN_URL = "https://www.linkedin.com/in/karina-christov%C3%A3o-bonadiu-6431a41a1/";
const EMAIL = "karina@karinabonadiu.com";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BrandSymbol size={48} color="#335072" className="mx-auto mb-6" />
          <h1
            className="text-4xl md:text-5xl text-[#335072] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.contact.title}
          </h1>
          <p
            className="text-[#B38F8F] tracking-[0.3em] text-sm uppercase mb-8"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.contact.subtitle}
          </p>
          <p
            className="text-[#335072]/80 text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.contact.text}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#335072] rounded-2xl p-8 text-center hover:bg-[#2a4260] transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-[#F2E9E4]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#F2E9E4]/30 transition-colors">
                <MessageCircle className="w-8 h-8 text-[#F2E9E4]" />
              </div>
              <h3
                className="text-xl text-[#F2E9E4] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                WhatsApp
              </h3>
              <p
                className="text-[#D4BCB2] text-sm"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {t.contact.whatsapp}
              </p>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="bg-[#F2E9E4] rounded-2xl p-8 text-center hover:bg-[#D4BCB2]/40 transition-colors group border border-[#D4BCB2]/30"
            >
              <div className="w-16 h-16 rounded-full bg-[#335072]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#335072]/20 transition-colors">
                <Mail className="w-8 h-8 text-[#335072]" />
              </div>
              <h3
                className="text-xl text-[#335072] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Email
              </h3>
              <p
                className="text-[#335072]/70 text-sm"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {t.contact.email}
              </p>
            </a>
          </div>

          {/* Location */}
          <div className="mt-8 bg-[#F2E9E4] rounded-2xl p-6 flex items-center justify-center gap-3 border border-[#D4BCB2]/30">
            <MapPin className="w-5 h-5 text-[#B38F8F]" />
            <p
              className="text-[#335072]/80 text-sm"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {t.contact.location}
            </p>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 md:py-20 bg-[#F2E9E4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl text-[#335072] mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.contact.followMe}
          </h2>
          <div className="flex items-center justify-center gap-6">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white border border-[#D4BCB2]/30 flex items-center justify-center hover:bg-[#335072] hover:text-white text-[#335072] transition-all duration-300 group"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white border border-[#D4BCB2]/30 flex items-center justify-center hover:bg-[#335072] hover:text-white text-[#335072] transition-all duration-300 group"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Photo + CTA */}
      <section className="py-16 bg-[#335072]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <img
            src="/karina-hero.jpg"
            alt="Karina Bonadiu"
            className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-3 border-[#D4BCB2]"
          />
          <p
            className="text-[#F2E9E4] text-xl italic mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "{t.home.quote}"
          </p>
          <p
            className="text-[#D4BCB2] text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            — Karina Bonadiu
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
