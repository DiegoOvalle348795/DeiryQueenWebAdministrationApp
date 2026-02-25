"use client";

import { Suspense, useState } from "react";
import ButtonSignin from "@/components/ButtonSignin";
import ButtonGradient from "@/components/ButtonGradient";
import ButtonCheckout from "@/components/ButtonCheckout";
import ButtonLead from "@/components/ButtonLead";
import ButtonPopover from "@/components/ButtonPopover";
import ButtonAccount from "@/components/ButtonAccount";
import ButtonSupport from "@/components/ButtonSupport";
import Hero from "@/components/Hero";
import FeaturesGrid from "@/components/FeaturesGrid";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FeaturesListicle from "@/components/FeaturesListicle";
import Testimonials1 from "@/components/Testimonials1";
import Testimonials3 from "@/components/Testimonials3";
import Testimonials11 from "@/components/Testimonials11";
import TestimonialsAvatars from "@/components/TestimonialsAvatars";
import Testimonial1Small from "@/components/Testimonial1Small";
import TestimonialRating from "@/components/TestimonialRating";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Pricing from "@/components/Pricing";
import Problem from "@/components/Problem";
import WithWithout from "@/components/WithWithout";
import Tabs from "@/components/Tabs";
import Modal from "@/components/Modal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BetterIcon from "@/components/BetterIcon";

// Component wrapper para manejar errores
const ComponentWrapper = ({ name, children }) => {
  return (
    <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-md mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
        {name}
      </h3>
      <div className="component-preview">
        {children}
      </div>
    </div>
  );
};

export default function PruebaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Galería de Componentes
          </h1>
          <p className="text-lg text-gray-600">
            Todos los componentes disponibles en @components
          </p>
        </header>

        <div className="space-y-8">
          {/* Botones */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Botones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentWrapper name="ButtonSignin">
                <ButtonSignin text="Login" />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonGradient">
                <ButtonGradient title="Gradient Button" />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonCheckout">
                <div className="text-sm text-gray-600 mb-2">
                  Requiere prop: priceId
                </div>
                <ButtonCheckout priceId="price_example" />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonLead">
                <ButtonLead />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonPopover">
                <ButtonPopover />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonAccount">
                <ButtonAccount />
              </ComponentWrapper>

              <ComponentWrapper name="ButtonSupport">
                <ButtonSupport />
              </ComponentWrapper>
            </div>
          </section>

          {/* Hero y Secciones Principales */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hero y Secciones</h2>
            <ComponentWrapper name="Hero">
              <Hero />
            </ComponentWrapper>

            <ComponentWrapper name="CTA">
              <CTA />
            </ComponentWrapper>

            <ComponentWrapper name="Problem">
              <Problem />
            </ComponentWrapper>

            <ComponentWrapper name="WithWithout">
              <WithWithout />
            </ComponentWrapper>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Features</h2>
            <ComponentWrapper name="FeaturesGrid">
              <FeaturesGrid />
            </ComponentWrapper>

            <ComponentWrapper name="FeaturesAccordion">
              <FeaturesAccordion />
            </ComponentWrapper>

            <ComponentWrapper name="FeaturesListicle">
              <FeaturesListicle />
            </ComponentWrapper>
          </section>

          {/* Testimonials */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Testimonials</h2>
            <ComponentWrapper name="Testimonials1">
              <Testimonials1 />
            </ComponentWrapper>

            <ComponentWrapper name="Testimonials3">
              <Testimonials3 />
            </ComponentWrapper>

            <ComponentWrapper name="Testimonials11">
              <Testimonials11 />
            </ComponentWrapper>

            <ComponentWrapper name="TestimonialsAvatars">
              <TestimonialsAvatars />
            </ComponentWrapper>

            <ComponentWrapper name="Testimonial1Small">
              <Testimonial1Small />
            </ComponentWrapper>

            <ComponentWrapper name="TestimonialRating">
              <TestimonialRating />
            </ComponentWrapper>
          </section>

          {/* Otros Componentes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Otros Componentes</h2>
            <ComponentWrapper name="FAQ">
              <FAQ />
            </ComponentWrapper>

            <ComponentWrapper name="Pricing">
              <Pricing />
            </ComponentWrapper>

            <ComponentWrapper name="Tabs">
              <Tabs />
            </ComponentWrapper>

            <ComponentWrapper name="Modal">
              <div className="mb-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Abrir Modal
                </button>
              </div>
              <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            </ComponentWrapper>

            <ComponentWrapper name="Header">
              <Suspense fallback={<div className="text-sm text-base-content/70">Cargando…</div>}>
                <Header />
              </Suspense>
            </ComponentWrapper>

            <ComponentWrapper name="Footer">
              <Footer />
            </ComponentWrapper>

            <ComponentWrapper name="BetterIcon">
              <BetterIcon />
            </ComponentWrapper>
          </section>
        </div>
      </div>
    </div>
  );
}
