import React from 'react';
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export function BoldAsimetrico() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#4a5e30] font-sans selection:bg-[#c9a962] selection:text-[#f5f0e8] overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#4a5e30] text-[#f5f0e8] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-display uppercase tracking-widest">PERGONIA</div>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <a href="#proyectos" className="hover:text-[#c9a962] transition-colors">PROYECTOS</a>
          <a href="#servicios" className="hover:text-[#c9a962] transition-colors">SERVICIOS</a>
          <a href="#nosotros" className="hover:text-[#c9a962] transition-colors">NOSOTROS</a>
        </div>
        <button className="bg-[#c9a962] text-[#f5f0e8] px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#4a5e30] transition-colors">
          Contacto
        </button>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 min-h-[85vh] flex flex-col justify-between">
        <div className="relative z-10 w-full max-w-[1400px] mx-auto">
          <h1 className="font-display text-[15vw] leading-[0.85] text-[#4a5e30] uppercase m-0 p-0 whitespace-nowrap overflow-visible">
            ARQUITECTURA<br/>
            <span className="text-[#c9a962]">EXTERIOR</span>
          </h1>
          <p className="font-body text-lg md:text-xl max-w-md mt-8 font-medium text-[#4a5e30]/80">
            Diseño y construcción de albercas y áreas sociales de alto nivel en Torreón, Coahuila.
          </p>
        </div>
        
        {/* Inset Image */}
        <div className="absolute bottom-10 right-6 md:right-12 w-3/4 md:w-[45%] lg:w-[35%] h-[40vh] md:h-[50vh] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900" 
            alt="Pool design" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#4a5e30]/10 mix-blend-multiply"></div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 md:px-12 bg-[#4a5e30] text-[#f5f0e8]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6">
          {[
            { num: "150+", label: "PROYECTOS ENTREGADOS" },
            { num: "12", label: "AÑOS DE EXPERIENCIA" },
            { num: "100%", label: "CLIENTES SATISFECHOS" },
            { num: "360°", label: "DISEÑO INTEGRAL" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-display text-6xl md:text-8xl lg:text-9xl text-[#c9a962] leading-none mb-2">{stat.num}</span>
              <span className="font-body text-xs md:text-sm font-bold tracking-[0.2em] text-[#f5f0e8]/80">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-6xl md:text-8xl mb-16 text-[#4a5e30]">EXPERTISE</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1 */}
            <div className="bg-[#4a5e30] text-[#f5f0e8] p-10 md:p-16 flex flex-col justify-between min-h-[400px] group hover:bg-[#3a4a25] transition-colors">
              <h3 className="font-display text-5xl md:text-7xl uppercase mb-8">Albercas<br/>Premium</h3>
              <div className="flex justify-between items-end">
                <p className="font-body text-lg max-w-sm opacity-90">Diseño arquitectónico y construcción de piscinas con acabados de lujo y tecnología de punta.</p>
                <ArrowRight className="w-12 h-12 text-[#c9a962] transform group-hover:translate-x-4 transition-transform" />
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="bg-[#c9a962] text-[#4a5e30] p-10 md:p-16 flex flex-col justify-between min-h-[400px] group hover:bg-[#b89851] transition-colors">
              <h3 className="font-display text-5xl md:text-7xl uppercase mb-8">Áreas<br/>Sociales</h3>
              <div className="flex justify-between items-end">
                <p className="font-body text-lg max-w-sm font-medium">Terrazas, palapas, asadores y paisajismo integral para transformar tu patio en un oasis.</p>
                <ArrowRight className="w-12 h-12 text-[#4a5e30] transform group-hover:translate-x-4 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Gallery */}
      <section id="proyectos" className="py-12 md:py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Large Left */}
            <div className="lg:col-span-8 h-[50vh] md:h-[70vh] relative group overflow-hidden">
              <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=900" alt="Proyecto 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <span className="text-white font-display text-3xl uppercase tracking-widest border border-white px-8 py-4">Ver Proyecto</span>
              </div>
            </div>
            {/* Stacked Right */}
            <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8 h-[50vh] md:h-[70vh]">
              <div className="flex-1 relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600" alt="Proyecto 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex-1 relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600" alt="Proyecto 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
          </div>
          {/* Full width bottom */}
          <div className="w-full h-[40vh] md:h-[50vh] relative group overflow-hidden">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200" alt="Proyecto 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-[#4a5e30] text-[#f5f0e8] py-32 px-6 md:px-12 mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="font-display text-7xl md:text-9xl uppercase leading-[0.8] mb-12">HABLEMOS<br/><span className="text-[#c9a962]">AHORA</span></h2>
            
            <div className="space-y-8 font-body mt-16">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-[#c9a962] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl uppercase tracking-wider mb-2">Estudio</h4>
                  <p className="text-lg opacity-80">Av. Morelos 1234, Centro<br/>Torreón, Coahuila 27000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-8 h-8 text-[#c9a962] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl uppercase tracking-wider mb-2">Teléfono</h4>
                  <p className="text-lg opacity-80">+52 (871) 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-[#c9a962] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl uppercase tracking-wider mb-2">Email</h4>
                  <p className="text-lg opacity-80">hola@pergonia.mx</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#f5f0e8] p-10 md:p-16 text-[#4a5e30]">
            <h3 className="font-display text-4xl mb-8 uppercase">Cotiza tu proyecto</h3>
            <form className="space-y-6 font-body">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Nombre completo</label>
                <input type="text" className="w-full bg-transparent border-b-2 border-[#4a5e30] py-3 focus:outline-none focus:border-[#c9a962] transition-colors" placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Teléfono / WhatsApp</label>
                <input type="tel" className="w-full bg-transparent border-b-2 border-[#4a5e30] py-3 focus:outline-none focus:border-[#c9a962] transition-colors" placeholder="Tu número de contacto" />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Tipo de proyecto</label>
                <select className="w-full bg-transparent border-b-2 border-[#4a5e30] py-3 focus:outline-none focus:border-[#c9a962] transition-colors">
                  <option>Alberca residencial</option>
                  <option>Área social / Palapa</option>
                  <option>Remodelación exterior</option>
                  <option>Proyecto comercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Detalles</label>
                <textarea rows={4} className="w-full bg-transparent border-b-2 border-[#4a5e30] py-3 focus:outline-none focus:border-[#c9a962] transition-colors resize-none" placeholder="Cuéntanos brevemente sobre tu idea..."></textarea>
              </div>
              <button type="button" className="w-full bg-[#4a5e30] text-[#f5f0e8] py-5 font-bold uppercase tracking-widest text-lg hover:bg-[#c9a962] transition-colors mt-4">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3a4a25] text-[#f5f0e8] py-12 px-6 md:px-12 font-body border-t border-white/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-3xl uppercase tracking-widest">PERGONIA</div>
          <p className="text-sm opacity-60">© {new Date().getFullYear()} Pergonia. Arquitectura Exterior. Torreón, Coah.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#c9a962] transition-colors"><Instagram className="w-6 h-6" /></a>
            <a href="#" className="hover:text-[#c9a962] transition-colors"><Facebook className="w-6 h-6" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
