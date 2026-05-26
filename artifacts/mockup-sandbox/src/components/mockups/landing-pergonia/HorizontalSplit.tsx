import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function HorizontalSplit() {
  return (
    <div className="min-h-screen w-full font-sans bg-[#f5f0e8] text-[#2d2d2d] overflow-x-hidden selection:bg-[#c9a962] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-[#f5f0e8]/90 backdrop-blur-md border-b border-[#4a5e30]/10 transition-all duration-300">
        <div className="text-2xl font-bold tracking-widest text-[#4a5e30] uppercase">PERGONIA</div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium text-[#4a5e30]">
          <a href="#servicios" className="hover:text-[#c9a962] transition-colors">Servicios</a>
          <a href="#proyectos" className="hover:text-[#c9a962] transition-colors">Proyectos</a>
          <a href="#nosotros" className="hover:text-[#c9a962] transition-colors">Nosotros</a>
        </div>
        <Button className="rounded-none bg-[#4a5e30] hover:bg-[#c9a962] text-[#f5f0e8] uppercase tracking-wider text-xs px-6 py-5">
          Contacto
        </Button>
      </nav>

      {/* Hero 50/50 Split */}
      <section className="min-h-[100dvh] pt-24 md:pt-0 flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 order-2 md:order-1 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[#f5f0e8] -z-10"></div>
          <div className="z-10 max-w-xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#4a5e30] leading-[1.1] mb-6">
              Arquitectura Exterior de Nivel Superior.
            </h1>
            <p className="text-lg md:text-xl text-[#4a5e30]/80 mb-10 leading-relaxed font-light">
              Diseño y construcción de albercas y áreas sociales excepcionales en Torreón, Coahuila. Creamos espacios que transforman la forma en que vives tu hogar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="rounded-none bg-[#4a5e30] hover:bg-[#3a4926] text-white uppercase tracking-widest text-sm px-8 py-6 h-auto">
                Inicia tu proyecto
              </Button>
              <Button variant="outline" className="rounded-none border-[#4a5e30] text-[#4a5e30] hover:bg-[#4a5e30] hover:text-white uppercase tracking-widest text-sm px-8 py-6 h-auto">
                Ver Portafolio
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[50vh] md:min-h-screen order-1 md:order-2 relative">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80" 
            alt="Alberca de lujo por Pergonia" 
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-[#4a5e30] text-[#f5f0e8] py-16 px-8 border-t-4 border-[#c9a962]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-[#c9a962]/30">
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-serif text-[#c9a962] mb-2">15+</span>
            <span className="uppercase tracking-widest text-xs font-light">Años de Experiencia</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-serif text-[#c9a962] mb-2">120</span>
            <span className="uppercase tracking-widest text-xs font-light">Proyectos Entregados</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-serif text-[#c9a962] mb-2">100%</span>
            <span className="uppercase tracking-widest text-xs font-light">Satisfacción</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-serif text-[#c9a962] mb-2">5</span>
            <span className="uppercase tracking-widest text-xs font-light">Premios de Diseño</span>
          </div>
        </div>
      </section>

      {/* Services Alternating Rows */}
      <section id="servicios" className="py-24 bg-[#f5f0e8]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-20 px-8">
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#c9a962] font-semibold mb-4">Nuestra Especialidad</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-[#4a5e30]">Servicios de Diseño & Construcción</h3>
          </div>

          {/* Row 1: Text Left, Image Right */}
          <div className="flex flex-col md:flex-row min-h-[60vh]">
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white">
              <h4 className="text-3xl font-serif text-[#4a5e30] mb-6">Diseño de Albercas Personalizadas</h4>
              <p className="text-[#4a5e30]/70 leading-relaxed font-light mb-8 text-lg">
                Creamos oasis acuáticos que se integran perfectamente con la arquitectura de tu hogar. Desde albercas infinitas hasta diseños geométricos modernos, cada proyecto es único y pensado para tu estilo de vida.
              </p>
              <div>
                <a href="#" className="inline-flex items-center text-[#c9a962] uppercase tracking-widest text-sm font-medium hover:text-[#4a5e30] transition-colors group">
                  Conocer más 
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
            <div className="flex-1">
              <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80" alt="Diseño de alberca" className="w-full h-full object-cover min-h-[400px] md:min-h-full" />
            </div>
          </div>

          {/* Row 2: Image Left, Text Right */}
          <div className="flex flex-col md:flex-row min-h-[60vh]">
            <div className="flex-1 order-2 md:order-1">
              <img src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80" alt="Áreas sociales" className="w-full h-full object-cover min-h-[400px] md:min-h-full" />
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-[#ece5d8] order-1 md:order-2">
              <h4 className="text-3xl font-serif text-[#4a5e30] mb-6">Áreas Sociales y Terrazas</h4>
              <p className="text-[#4a5e30]/70 leading-relaxed font-light mb-8 text-lg">
                Transformamos tu patio en el centro de entretenimiento definitivo. Cocinas exteriores, fire pits, pérgolas y zonas lounge diseñadas para recibir a tus invitados con lujo y confort en el clima de La Laguna.
              </p>
              <div>
                <a href="#" className="inline-flex items-center text-[#c9a962] uppercase tracking-widest text-sm font-medium hover:text-[#4a5e30] transition-colors group">
                  Conocer más 
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery 3-Col Masonry-ish */}
      <section id="proyectos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] text-[#c9a962] font-semibold mb-4">Portafolio</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-[#4a5e30]">Proyectos Destacados</h3>
            </div>
            <Button variant="outline" className="rounded-none border-[#4a5e30] text-[#4a5e30] hover:bg-[#4a5e30] hover:text-white uppercase tracking-widest text-sm">
              Ver Todos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-6">
              <div className="group relative overflow-hidden h-[400px]">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" alt="Residencia" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <div>
                    <p className="text-[#c9a962] uppercase tracking-widest text-xs mb-2">Residencial</p>
                    <p className="text-white font-serif text-xl">Casa Las Villas</p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden h-[300px]">
                <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80" alt="Terraza" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <div>
                    <p className="text-[#c9a962] uppercase tracking-widest text-xs mb-2">Exterior</p>
                    <p className="text-white font-serif text-xl">Terraza Los Viñedos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 md:pt-12">
              <div className="group relative overflow-hidden h-[300px]">
                <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80" alt="Alberca Moderna" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <div>
                    <p className="text-[#c9a962] uppercase tracking-widest text-xs mb-2">Alberca</p>
                    <p className="text-white font-serif text-xl">Residencia El Campestre</p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden h-[400px]">
                <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80" alt="Vista alberca" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <div>
                    <p className="text-[#c9a962] uppercase tracking-widest text-xs mb-2">Social</p>
                    <p className="text-white font-serif text-xl">Hacienda El Rosario</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="group relative overflow-hidden h-[400px]">
                <img src="https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80" alt="Área social noche" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                  <div>
                    <p className="text-[#c9a962] uppercase tracking-widest text-xs mb-2">Comercial</p>
                    <p className="text-white font-serif text-xl">Club Altozano</p>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden h-[300px] bg-[#4a5e30] flex flex-col justify-center items-center text-center p-8">
                <h4 className="font-serif text-2xl text-[#f5f0e8] mb-4">¿Tienes un proyecto en mente?</h4>
                <p className="text-[#f5f0e8]/80 font-light mb-6">Déjanos hacerlo realidad.</p>
                <Button className="rounded-none bg-[#c9a962] hover:bg-[#b09252] text-white uppercase tracking-widest text-xs">
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-[#4a5e30] text-[#f5f0e8] relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <svg className="w-12 h-12 mx-auto text-[#c9a962] mb-8" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p className="text-2xl md:text-4xl font-serif leading-relaxed mb-8">
            "El equipo de Pergonia no solo construyó nuestra alberca, diseñaron un estilo de vida completo para nuestra familia. La atención al detalle y la calidad de los materiales superaron nuestras expectativas."
          </p>
          <p className="uppercase tracking-widest text-sm text-[#c9a962] font-medium">— Familia Garza, Torreón</p>
        </div>
      </section>

      {/* Contact Split */}
      <section className="flex flex-col md:flex-row min-h-[80vh]">
        <div className="flex-1 bg-[#ece5d8] px-8 md:px-16 lg:px-24 py-20 flex flex-col justify-center">
          <h2 className="text-sm uppercase tracking-[0.3em] text-[#c9a962] font-semibold mb-4">Contacto</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-[#4a5e30] mb-8">Comienza tu<br/>transformación.</h3>
          <p className="text-[#4a5e30]/80 mb-12 font-light text-lg">
            Estamos listos para escuchar sobre tu proyecto. Visítanos en nuestra oficina en Torreón o envíanos un mensaje.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-[#c9a962] flex items-center justify-center text-[#c9a962] flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <p className="font-serif text-[#4a5e30] text-xl">Llámanos</p>
                <p className="text-[#4a5e30]/70 font-light">+52 (871) 123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-[#c9a962] flex items-center justify-center text-[#c9a962] flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <p className="font-serif text-[#4a5e30] text-xl">Email</p>
                <p className="text-[#4a5e30]/70 font-light">proyectos@pergonia.mx</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-[#c9a962] flex items-center justify-center text-[#c9a962] flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <p className="font-serif text-[#4a5e30] text-xl">Oficina</p>
                <p className="text-[#4a5e30]/70 font-light">Blvd. Independencia 1234<br/>Residencial El Fresno<br/>Torreón, Coah.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-white px-8 md:px-16 lg:px-24 py-20 flex flex-col justify-center border-l border-[#4a5e30]/10">
          <form className="space-y-6 max-w-md w-full">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#4a5e30] font-medium">Nombre</label>
                <Input className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 border-[#4a5e30]/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#c9a962] text-[#4a5e30]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#4a5e30] font-medium">Apellido</label>
                <Input className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 border-[#4a5e30]/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#c9a962] text-[#4a5e30]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#4a5e30] font-medium">Email</label>
              <Input type="email" className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 border-[#4a5e30]/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#c9a962] text-[#4a5e30]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#4a5e30] font-medium">Teléfono</label>
              <Input type="tel" className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 border-[#4a5e30]/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#c9a962] text-[#4a5e30]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#4a5e30] font-medium">Detalles del Proyecto</label>
              <Textarea className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 border-[#4a5e30]/20 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#c9a962] text-[#4a5e30] resize-none min-h-[100px]" />
            </div>
            <Button className="w-full rounded-none bg-[#4a5e30] hover:bg-[#c9a962] text-white uppercase tracking-widest py-6 mt-4">
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2312] text-[#f5f0e8]/60 py-16 px-8 text-center border-t-4 border-[#c9a962]">
        <div className="text-3xl font-bold tracking-widest text-[#f5f0e8] uppercase mb-8 opacity-90">PERGONIA</div>
        <div className="flex justify-center gap-8 mb-12 uppercase tracking-widest text-xs">
          <a href="#" className="hover:text-[#c9a962] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#c9a962] transition-colors">Facebook</a>
          <a href="#" className="hover:text-[#c9a962] transition-colors">Houzz</a>
        </div>
        <p className="text-xs font-light tracking-wider">
          &copy; {new Date().getFullYear()} Pergonia Arquitectura Exterior. Torreón, Coahuila.<br/>Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
