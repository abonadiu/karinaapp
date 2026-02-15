import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BrandSymbol } from "@/components/site/BrandSymbol";
import { Mic, Users, BookOpen, Rocket, ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";

const ServicesCorporate = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Mic,
      title: t.corporate.talks.title,
      description: t.corporate.talks.description,
    },
    {
      icon: Users,
      title: t.corporate.leadership.title,
      description: t.corporate.leadership.description,
    },
    {
      icon: BookOpen,
      title: t.corporate.training.title,
      description: t.corporate.training.description,
    },
    {
      icon: Rocket,
      title: t.corporate.talents.title,
      description: t.corporate.talents.description,
    },
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#335072]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BrandSymbol size={48} color="#D4BCB2" className="mx-auto mb-6" />
          <p
            className="text-[#D4BCB2] tracking-[0.3em] text-sm uppercase mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.corporate.subtitle}
          </p>
          <h1
            className="text-4xl md:text-5xl text-[#F2E9E4] mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.corporate.title}
          </h1>
          <p
            className="text-[#D4BCB2] text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.corporate.intro}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-[#D4BCB2]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#335072]/10 flex items-center justify-center mb-6 group-hover:bg-[#335072]/20 transition-colors">
                  <service.icon className="w-7 h-7 text-[#335072]" />
                </div>
                <h3
                  className="text-xl text-[#335072] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-[#335072]/70 text-sm leading-relaxed"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="py-16 md:py-20 bg-[#8695AC]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p
            className="text-2xl md:text-3xl text-white italic leading-relaxed mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "As someone who has lived the demands and intensity of the corporate world, I know how critical it is to integrate performance with presence, and strategy with soul."
          </p>
          <p
            className="text-[#F2E9E4] text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            — Karina Bonadiu
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#F2E9E4]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl text-[#335072] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.corporate.cta}
          </h2>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#335072] text-white px-8 py-3 rounded-full hover:bg-[#2a4260] transition-colors text-sm tracking-wide"
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

export default ServicesCorporate;
