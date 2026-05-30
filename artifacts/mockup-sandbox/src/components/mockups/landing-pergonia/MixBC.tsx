import React from 'react';

export function MixBC() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-gray-900 font-sans selection:bg-[#c9a962] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 md:px-12 py-6 text-[#f5f0e8]">
        <div className="font-serif text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Pergonia</div>
        <div className="hidden md:flex gap-10 font-sans text-xs uppercase tracking-widest font-semibold">
          <a href="#servicios" className="hover:text-[#c9a962] transition-colors duration-300">Servicios</a>
          <a href="#galeria" className="hover:text-[#c9a962] transition-colors duration-300">Galería</a>
          <a href="#nosotros" className="hover:text-[#c9a962] transition-colors duration-300">Nosotros</a>
          <a href="#contacto" className="hover:text-[#c9a962] transition-colors duration-300">Contacto</a>
        </div>
        <a href="#contacto" className="hidden md:block border border-[#c9a962] text-[#c9a962] px-5 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-[#c9a962] hover:text-[#4a5e30] transition-colors duration-300">
          Cotización
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600" 
            alt="Pool construction" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 text-center text-[#f5f0e8] px-4 w-full">
          <h1 className="font-serif text-[12vw] leading-[0.9] tracking-tight mb-6">
            Pergonia
          </h1>
          <p className="font-sans text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto uppercase">
            Arquitectura Exterior
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-4">
            <h3 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#c9a962] font-semibold tracking-tighter">
              150+
            </h3>
            <p className="font-sans text-sm uppercase tracking-widest text-[#4a5e30] font-semibold">Proyectos Entregados</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#c9a962] font-semibold tracking-tighter">
              12
            </h3>
            <p className="font-sans text-sm uppercase tracking-widest text-[#4a5e30] font-semibold">Años de Experiencia</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#c9a962] font-semibold tracking-tighter">
              100%
            </h3>
            <p className="font-sans text-sm uppercase tracking-widest text-[#4a5e30] font-semibold">Satisfacción del Cliente</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32 bg-white px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-5xl md:text-7xl text-[#4a5e30] mb-24 text-center">
            Nuestros Servicios
          </h2>
          <div className="space-y-32">
            {[
              {
                num: '01',
                title: 'Diseño de Albercas',
                desc: 'Creamos oasis personalizados que se integran perfectamente con la arquitectura de tu hogar. Cada diseño es único, pensado para maximizar la belleza y funcionalidad de tu espacio exterior.'
              },
              {
                num: '02',
                title: 'Áreas Sociales',
                desc: 'Transformamos tu patio en el lugar perfecto para convivir. Terrazas, palapas, áreas de asador y fire pits diseñados con los más altos estándares de calidad y lujo.'
              },
              {
                num: '03',
                title: 'Paisajismo Integral',
                desc: 'El toque final que da vida a tu proyecto. Selección experta de flora, diseño de iluminación exterior y elementos naturales que complementan la estructura principal.'
              }
            ].map((service) => (
              <div key={service.num} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-3 text-center lg:text-right">
                  <span className="font-serif text-8xl md:text-[10rem] leading-none text-[#c9a962] font-bold">
                    {service.num}
                  </span>
                </div>
                <div className="lg:col-span-1 hidden lg:block">
                  <div className="w-px h-full bg-[#c9a962]/30 mx-auto"></div>
                </div>
                <div className="lg:col-span-8 bg-[#4a5e30] text-[#f5f0e8] p-12 md:p-16 rounded-sm shadow-xl">
                  <h3 className="font-serif text-4xl mb-6">{service.title}</h3>
                  <p className="font-sans text-lg font-light leading-relaxed opacity-90 max-w-2xl">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-5xl md:text-7xl text-[#4a5e30] mb-16 text-center">
            Portafolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left large image - 8 cols */}
            <div className="md:col-span-8 h-[60vh] md:h-[80vh] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=900" 
                alt="Alberca moderna" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Right stacked images - 4 cols */}
            <div className="md:col-span-4 grid grid-cols-1 gap-4 h-[60vh] md:h-[80vh]">
              <div className="h-full overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600" 
                  alt="Área social" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="h-full overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600" 
                  alt="Detalle de diseño" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            {/* Bottom wide image - 12 cols */}
            <div className="md:col-span-12 h-[40vh] md:h-[60vh] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200" 
                alt="Proyecto completo" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-4 md:px-8 bg-white border-y border-[#c9a962]/20">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-12 h-12 mx-auto text-[#c9a962] mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-[#4a5e30] mb-12">
            "Pergonia no solo construyó una alberca, diseñaron el escenario donde mi familia creará recuerdos para toda la vida. Su atención al detalle y compromiso con la excelencia es incomparable."
          </blockquote>
          <cite className="block font-sans text-sm uppercase tracking-widest text-gray-500 font-semibold not-italic">
            — Familia Martínez, Torreón
          </cite>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-4 md:px-8 bg-[#4a5e30] text-[#f5f0e8]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-7xl mb-6">Comienza tu Proyecto</h2>
          <p className="font-sans font-light text-lg mb-16 opacity-80">
            Déjanos tus datos y un especialista en diseño exterior se pondrá en contacto contigo.
          </p>
          
          <form className="space-y-8 text-left" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="name" className="block font-sans text-xs uppercase tracking-widest font-semibold opacity-70">
                Nombre Completo
              </label>
              <input 
                type="text" 
                id="name" 
                className="w-full bg-transparent border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors placeholder:text-[#f5f0e8]/30"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block font-sans text-xs uppercase tracking-widest font-semibold opacity-70">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email" 
                className="w-full bg-transparent border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors placeholder:text-[#f5f0e8]/30"
                placeholder="juan@ejemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="block font-sans text-xs uppercase tracking-widest font-semibold opacity-70">
                Detalles del Proyecto
              </label>
              <textarea 
                id="message" 
                rows={4}
                className="w-full bg-transparent border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors placeholder:text-[#f5f0e8]/30 resize-none"
                placeholder="Cuéntanos brevemente sobre la alberca o área social que imaginas..."
              ></textarea>
            </div>
            
            <div className="pt-8 text-center">
              <button 
                type="submit"
                className="inline-block px-12 py-4 border border-[#c9a962] text-[#c9a962] font-sans text-sm uppercase tracking-widest font-semibold hover:bg-[#c9a962] hover:text-[#4a5e30] transition-colors duration-300"
              >
                Enviar Mensaje
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d3a1d] text-[#f5f0e8]/50 py-8 px-4 text-center font-sans text-xs uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Pergonia Arquitectura Exterior. Torreón, Coahuila.</p>
      </footer>
    </div>
  );
}
