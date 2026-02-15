import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BrandSymbol } from "@/components/site/BrandSymbol";
import { Sparkles, TreePine, Check, ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";

const ServicesIndividual = () => {
  const { t } = useLanguage();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BrandSymbol size={48} color="#B38F8F" className="mx-auto mb-6" />
          <p
            className="text-[#B38F8F] tracking-[0.3em] text-sm uppercase mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.individual.subtitle}
          </p>
          <h1
            className="text-4xl md:text-5xl text-[#335072] mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.individual.title}
          </h1>
          <p
            className="text-[#335072]/80 text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.individual.intro}
          </p>
        </div>
      </section>

      {/* Mentoring */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#335072]/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-[#335072]" />
              </div>
              <h2
                className="text-3xl text-[#335072] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                {t.individual.mentoring.title}
              </h2>
              <p
                className="text-[#335072]/80 text-base leading-relaxed mb-6"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {t.individual.mentoring.description}
              </p>
              <ul className="space-y-3">
                {t.individual.mentoring.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#B38F8F] mt-0.5 flex-shrink-0" />
                    <span
                      className="text-[#335072]/80 text-sm"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#F2E9E4] rounded-[2rem] p-8 flex items-center justify-center min-h-[300px]">
              <img
                src="/karina-contact.jpg"
                alt="Karina Bonadiu - Mentoria"
                className="rounded-2xl w-full max-w-sm object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Retreats */}
      <section className="py-16 md:py-20 bg-[#F2E9E4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-[#335072] rounded-[2rem] p-8 flex items-center justify-center min-h-[300px]">
              <BrandSymbol size={120} color="#D4BCB2" />
            </div>
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 rounded-2xl bg-[#335072]/10 flex items-center justify-center mb-6">
                <TreePine className="w-8 h-8 text-[#335072]" />
              </div>
              <h2
                className="text-3xl text-[#335072] mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                {t.individual.retreats.title}
              </h2>
              <p
                className="text-[#335072]/80 text-base leading-relaxed mb-6"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {t.individual.retreats.description}
              </p>
              <ul className="space-y-3">
                {t.individual.retreats.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#B38F8F] mt-0.5 flex-shrink-0" />
                    <span
                      className="text-[#335072]/80 text-sm"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#335072]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl text-[#F2E9E4] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.individual.cta}
          </h2>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#F2E9E4] text-[#335072] px-8 py-3 rounded-full hover:bg-white transition-colors text-sm tracking-wide"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.home.cta}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ServicesIndividual;
