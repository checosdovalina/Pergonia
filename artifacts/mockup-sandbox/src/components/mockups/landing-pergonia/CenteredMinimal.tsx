import React from 'react';

export function CenteredMinimal() {
  return (
    <div className="min-h-screen font-serif flex flex-col items-center w-full" style={{ backgroundColor: '#f5f0e8', color: '#4a5e30', scrollBehavior: 'smooth' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Transparent Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-12 py-8 text-white font-sans text-sm tracking-widest uppercase mix-blend-difference">
        <div className="font-serif text-2xl tracking-normal normal-case">Pergonia</div>
        <div className="hidden md:flex gap-12">
          <a href="#servicios" className="hover:text-[#c9a962] transition-colors duration-300">Servicios</a>
          <a href="#galeria" className="hover:text-[#c9a962] transition-colors duration-300">Galería</a>
          <a href="#contacto" className="hover:text-[#c9a962] transition-colors duration-300">Contacto</a>
        </div>
      </nav>

      {/* Full-bleed Hero */}
      <section className="relative w-full h-screen flex flex-col justify-center items-center text-center text-white">
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80" 
            alt="Piscina de lujo" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="z-10 px-6 max-w-4xl flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight">
            Arquitectura <br/><span className="italic">Exterior</span>
          </h1>
          <p className="text-lg md:text-xl font-sans font-light mb-12 max-w-xl mx-auto opacity-90">
            Diseño y construcción de piscinas y áreas sociales de lujo en Torreón.
          </p>
          <a 
            href="#contacto"
            className="px-10 py-4 border border-white text-white font-sans text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500"
          >
            Iniciar Proyecto
          </a>
        </div>
      </section>

      {/* Services - Vertical Numbered List */}
      <section id="servicios" className="w-full py-40 flex flex-col items-center px-6">
        <div className="max-w-3xl w-full flex flex-col gap-32">
          
          <div className="flex flex-col items-center text-center">
            <span className="text-8xl font-serif text-[#c9a962] opacity-30 mb-8">01</span>
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Diseño de Piscinas</h3>
            <p className="font-sans font-light opacity-80 max-w-md">
              Creamos espejos de agua que se integran perfectamente con la arquitectura de su hogar, priorizando estética y funcionalidad.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-8xl font-serif text-[#c9a962] opacity-30 mb-8">02</span>
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Áreas Sociales</h3>
            <p className="font-sans font-light opacity-80 max-w-md">
              Palapas, asadores y terrazas diseñadas para el clima de La Laguna, extendiendo sus espacios de convivencia al exterior.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-8xl font-serif text-[#c9a962] opacity-30 mb-8">03</span>
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Paisajismo</h3>
            <p className="font-sans font-light opacity-80 max-w-md">
              Selección meticulosa de flora y materiales para crear ecosistemas privados que requieren bajo mantenimiento.
            </p>
          </div>

        </div>
      </section>

      {/* Gallery - 3 Images Row */}
      <section id="galeria" className="w-full py-20 px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[3/4] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80" 
              alt="Outdoor living"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="aspect-[3/4] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80" 
              alt="Social area"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="aspect-[3/4] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" 
              alt="Luxury home exterior"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Single Testimonial */}
      <section className="w-full py-40 px-6 flex flex-col items-center justify-center text-center" style={{ backgroundColor: '#4a5e30', color: '#f5f0e8' }}>
        <div className="max-w-4xl">
          <span className="text-6xl text-[#c9a962] font-serif leading-none">"</span>
          <h2 className="text-3xl md:text-5xl font-serif mt-6 mb-12 leading-snug">
            Pergonia transformó nuestro patio trasero en un resort privado. Su atención al detalle y comprensión del clima local fueron excepcionales.
          </h2>
          <p className="font-sans tracking-widest text-sm uppercase text-[#c9a962]">
            Familia Garza — Torreón
          </p>
        </div>
      </section>

      {/* Minimal Contact */}
      <section id="contacto" className="w-full py-40 flex flex-col items-center px-6">
        <div className="max-w-xl w-full flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Comience su Proyecto</h2>
          <p className="font-sans font-light opacity-80 mb-16 max-w-md">
            Permítanos crear el espacio exterior que siempre ha soñado.
          </p>

          <form className="w-full flex flex-col gap-10 font-sans">
            <input 
              type="text" 
              placeholder="Nombre Completo" 
              className="w-full bg-transparent border-b border-[#4a5e30]/30 py-4 text-center focus:outline-none focus:border-[#4a5e30] transition-colors placeholder:text-[#4a5e30]/50"
            />
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              className="w-full bg-transparent border-b border-[#4a5e30]/30 py-4 text-center focus:outline-none focus:border-[#4a5e30] transition-colors placeholder:text-[#4a5e30]/50"
            />
            <textarea 
              placeholder="Cuéntenos sobre su espacio" 
              rows={3}
              className="w-full bg-transparent border-b border-[#4a5e30]/30 py-4 text-center focus:outline-none focus:border-[#4a5e30] transition-colors resize-none placeholder:text-[#4a5e30]/50"
            ></textarea>
            
            <button 
              type="button"
              className="mt-8 px-12 py-5 bg-[#4a5e30] text-[#f5f0e8] text-sm tracking-widest uppercase hover:bg-[#384824] transition-colors"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 flex flex-col items-center text-center border-t border-[#4a5e30]/10 font-sans text-xs tracking-widest uppercase opacity-60 gap-4">
        <div>© 2025 Pergonia. Torreón, Coah.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#c9a962] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#c9a962] transition-colors">Facebook</a>
        </div>
      </footer>

    </div>
  );
}
