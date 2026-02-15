import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BrandSymbol } from "@/components/site/BrandSymbol";
import { Brain, Heart, Compass, Users, TrendingUp, ArrowRight, Award, Globe, GraduationCap, Briefcase, Sparkles } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";

const Index = () => {
  const { t } = useLanguage();

  const pillars = [
    { icon: Brain, ...t.home.pillars.consciousness, color: "#335072" },
    { icon: Heart, ...t.home.pillars.coherence, color: "#B38F8F" },
    { icon: Compass, ...t.home.pillars.purpose, color: "#8695AC" },
    { icon: Users, ...t.home.pillars.compassion, color: "#335072" },
    { icon: TrendingUp, ...t.home.pillars.transformation, color: "#B38F8F" },
  ];

  const whyItems = [
    { icon: Briefcase, text: t.home.whyItems.jpmorgan },
    { icon: GraduationCap, text: t.home.whyItems.mba },
    { icon: Award, text: t.home.whyItems.health },
    { icon: Globe, text: t.home.whyItems.international },
    { icon: Sparkles, text: t.home.whyItems.approach },
  ];

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="order-2 md:order-1">
              <p
                className="text-[#B38F8F] tracking-[0.3em] text-sm uppercase mb-4"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {t.home.subtitle}
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-[3.4rem] text-[#335072] leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Karina Bonadiu
              </h1>
              <p className="text-[#335072]/80 text-lg leading-relaxed mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                {t.home.description}
              </p>
              <blockquote className="border-l-2 border-[#B38F8F] pl-4 mb-8">
                <p
                  className="text-[#335072] italic text-xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  "{t.home.quote}"
                </p>
              </blockquote>
              <div className="flex flex-col sm:flex-row gap-4">
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
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 border border-[#335072] text-[#335072] px-8 py-3 rounded-full hover:bg-[#335072]/5 transition-colors text-sm tracking-wide"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {t.home.learnMore}
                </Link>
              </div>
            </div>

            {/* Photo */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#D4BCB2]/30 rounded-[2rem] -rotate-3" />
                <img
                  src="/karina-hero.jpg"
                  alt="Karina Bonadiu"
                  className="relative rounded-[1.5rem] w-full max-w-md object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[#335072] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <BrandSymbol size={48} color="#D4BCB2" className="mx-auto mb-6" />
            <h2
              className="text-3xl md:text-4xl text-[#F2E9E4] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              {t.home.philosophyTitle}
            </h2>
            <p
              className="text-[#D4BCB2] text-lg leading-relaxed"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {t.home.philosophyText}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="text-center p-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#F2E9E4]/10 flex items-center justify-center mx-auto mb-3">
                  <pillar.icon className="w-6 h-6 text-[#D4BCB2]" />
                </div>
                <h3
                  className="text-[#F2E9E4] text-sm font-semibold mb-1"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {pillar.title}
                </h3>
                <p className="text-[#8695AC] text-xs" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Karina Section */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl md:text-4xl text-[#335072] text-center mb-14"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.home.whyTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whyItems.map((item, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4BCB2]/30 hover:shadow-md transition-shadow"
              >
                <item.icon className="w-8 h-8 text-[#B38F8F] mb-4" />
                <p
                  className="text-[#335072] text-sm leading-relaxed"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-[#8695AC] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p
            className="text-2xl md:text-3xl text-white italic leading-relaxed"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "Be the change you wish to see in the world."
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl text-[#335072] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
          >
            {t.home.ctaTitle}
          </h2>
          <p
            className="text-[#335072]/70 text-lg mb-10"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {t.home.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            <Link
              to="/services/individual"
              className="inline-flex items-center justify-center gap-2 border border-[#335072] text-[#335072] px-8 py-3 rounded-full hover:bg-[#335072]/5 transition-colors text-sm tracking-wide"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {t.nav.servicesIndividual}
            </Link>
            <Link
              to="/services/corporate"
              className="inline-flex items-center justify-center gap-2 border border-[#335072] text-[#335072] px-8 py-3 rounded-full hover:bg-[#335072]/5 transition-colors text-sm tracking-wide"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {t.nav.servicesCorporate}
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
