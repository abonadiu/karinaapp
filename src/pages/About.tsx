import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteLayout } from "@/components/site/SiteLayout";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/17864003817";

const About = () => {
  const { t } = useLanguage();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F2E9E4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#D4BCB2]/30 rounded-[2rem] rotate-2" />
                <img
                  src="/karina-about.jpg"
                  alt="Karina Bonadiu"
                  className="relative rounded-[1.5rem] w-full max-w-md object-cover shadow-lg"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <p
                className="text-[#B38F8F] tracking-[0.3em] text-sm font-medium uppercase mb-4"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                {t.about.subtitle}
              </p>
              <h1
                className="text-4xl md:text-5xl text-[#335072] mb-8"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                {t.about.title}
              </h1>
              <div className="space-y-5" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <p className="text-[#335072]/80 text-base leading-relaxed font-normal">
                  {t.about.intro}
                </p>
                <p className="text-[#335072]/80 text-base leading-relaxed font-normal">
                  {t.about.transition}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story continued */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <p className="text-[#335072]/80 text-base leading-relaxed font-normal">
              {t.about.dedication}
            </p>
            <p className="text-[#335072]/80 text-base leading-relaxed font-normal">
              {t.about.retreats}
            </p>
            <p className="text-[#335072]/80 text-base leading-relaxed font-normal">
              {t.about.today}
            </p>
            <blockquote className="border-l-2 border-[#B38F8F] pl-6 my-8">
              <p
                className="text-[#335072] italic text-lg leading-relaxed"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t.about.closing}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Education & Experience */}
      <section className="py-16 md:py-20 bg-[#F2E9E4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap className="w-7 h-7 text-[#B38F8F]" />
                <h2
                  className="text-2xl text-[#335072]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  {t.about.educationTitle}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#D4BCB2]/30">
                  <p className="text-[#335072] text-sm font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {t.about.education.mba}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#D4BCB2]/30">
                  <p className="text-[#335072] text-sm font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {t.about.education.iin}
                  </p>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Briefcase className="w-7 h-7 text-[#B38F8F]" />
                <h2
                  className="text-2xl text-[#335072]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  {t.about.experienceTitle}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#D4BCB2]/30">
                  <p className="text-[#335072] text-sm font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {t.about.experience.consultant}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#D4BCB2]/30">
                  <p className="text-[#335072] text-sm font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {t.about.experience.mentor}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#D4BCB2]/30">
                  <p className="text-[#335072] text-sm font-medium" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {t.about.experience.jpmorgan}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#335072]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <img
            src="/karina-contact.jpg"
            alt="Karina Bonadiu"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-2 border-[#D4BCB2]"
          />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#F2E9E4] text-[#335072] px-8 py-3 rounded-full hover:bg-white transition-colors text-sm font-medium tracking-wide"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            {t.home.cta}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;
