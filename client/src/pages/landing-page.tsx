import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GalleryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import pergoniaLogo from "@assets/pergonia_logo_transparent.png";

const PHONE = "871 218 7073";
const PHONE_LINK = "tel:+528712187073";
const EMAIL = "contacto@pergonia.mx";
const WHATSAPP = "https://wa.me/528712187073";

const services = [
  {
    num: "01",
    title: "Diseño de Albercas",
    desc: "Creamos oasis personalizados que se integran perfectamente con la arquitectura de tu hogar. Desde albercas clásicas hasta infinity pools con los mejores acabados.",
  },
  {
    num: "02",
    title: "Áreas Sociales",
    desc: "Transformamos tu patio en el lugar perfecto para convivir. Terrazas, palapas, áreas de asador y fire pits diseñados con los más altos estándares de calidad y lujo.",
  },
  {
    num: "03",
    title: "Paisajismo Integral",
    desc: "El toque final que da vida a tu proyecto. Selección experta de flora, diseño de iluminación exterior y elementos naturales que complementan la estructura principal.",
  },
];

const defaultGallery = [
  { id: 1, title: "Alberca Infinity", category: "albercas", imageUrl: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=900", description: "Proyecto residencial Torreón", isVisible: true },
  { id: 2, title: "Área Social con Palapa", category: "areas_sociales", imageUrl: "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600", description: "Desarrollo privado", isVisible: true },
  { id: 3, title: "Alberca Comercial", category: "albercas", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600", description: "Hotel Comarca Lagunera", isVisible: true },
  { id: 4, title: "Jardín Exterior", category: "jardines", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", description: "Casa residencial Torreón", isVisible: true },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const contactMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/contact", data).then((r) => r.json()),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      toast({ title: "¡Mensaje enviado!", description: "Nos pondremos en contacto contigo muy pronto." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar el mensaje. Intenta de nuevo.", variant: "destructive" });
    },
  });

  const displayGallery = galleryItems.length > 0 ? galleryItems : defaultGallery;
  const visibleGallery = displayGallery.filter((i) => i.isVisible !== false).slice(0, 4);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  useEffect(() => {
    document.title = "Pergonia | Diseño y Construcción de Albercas y Áreas Sociales — Torreón, Coahuila";
    const existing = document.querySelector('meta[name="description"]');
    const content = "Pergonia — Especialistas en diseño y construcción de albercas residenciales, albercas comerciales y áreas sociales en Torreón, Coahuila y La Comarca Lagunera. Más de 15 años de experiencia.";
    if (existing) {
      existing.setAttribute("content", content);
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#f5f0e8] text-gray-900"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Pergonia — Arquitectura Exterior",
            description: "Especialistas en diseño y construcción de albercas, áreas sociales y arquitectura exterior en Torreón, Coahuila.",
            telephone: "+52 871 218 7073",
            email: EMAIL,
            address: { "@type": "PostalAddress", addressLocality: "Torreón", addressRegion: "Coahuila", addressCountry: "MX" },
            url: "https://pergonia.mx",
            serviceArea: { "@type": "Place", name: "La Comarca Lagunera, México" },
          }),
        }}
      />

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(42, 54, 28, 0.97)" : "transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none",
          color: "#f5f0e8",
        }}
      >
        {/* Mobile navbar: logo centered (hidden when scrolled), hamburger right */}
        <div className="flex md:hidden items-center justify-center relative px-4 py-3">
          {!scrolled && (
            <button onClick={() => scrollTo("hero")} className="focus:outline-none">
              <img
                src={pergoniaLogo}
                alt="Pergonia Arquitectura Exterior"
                className="w-auto"
                style={{ filter: "brightness(0) invert(1)", height: "78px" }}
              />
            </button>
          )}
          <button
            className={`${scrolled ? "static" : "absolute right-4 top-4"} ml-auto`}
            style={{ color: "#f5f0e8" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Desktop navbar */}
        <div className="hidden md:flex justify-between items-center px-12 py-4">
          <button onClick={() => scrollTo("hero")} className="focus:outline-none">
            <img
              src={pergoniaLogo}
              alt="Pergonia Arquitectura Exterior"
              className="w-auto transition-all duration-300"
              style={{ filter: "brightness(0) invert(1)", height: "80px" }}
            />
          </button>
          <div className="flex gap-10 text-base uppercase tracking-widest font-bold text-[#f5f0e8]">
            {["servicios", "galeria", "nosotros", "contacto"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:text-[#c9a962] transition-colors duration-300"
              >
                {id === "galeria" ? "Galería" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollTo("contacto")}
            className="border border-[#c9a962] text-[#c9a962] px-5 py-2 text-base uppercase tracking-widest font-bold hover:bg-[#c9a962] hover:text-[#4a5e30] transition-colors duration-300"
          >
            Cotización
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#4a5e30] flex flex-col items-center justify-center gap-10">
          {["servicios", "galeria", "nosotros", "contacto"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[#f5f0e8] text-3xl font-serif tracking-wide hover:text-[#c9a962] transition-colors"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {id === "galeria" ? "Galería" : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-28 md:pt-0">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600"
            alt="Alberca de lujo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-[#f5f0e8] px-4 w-full">
          <h1
            className="text-[12vw] leading-[0.9] tracking-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pergonia
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto uppercase">
            Arquitectura Exterior
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          {[
            { num: "150+", label: "Proyectos Entregados" },
            { num: "15", label: "Años de Experiencia" },
            { num: "100%", label: "Satisfacción del Cliente" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-4">
              <h3
                className="text-6xl md:text-8xl lg:text-9xl text-[#c9a962] font-semibold tracking-tighter"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.num}
              </h3>
              <p className="text-sm uppercase tracking-widest text-[#4a5e30] font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="servicios" className="py-24 md:py-32 bg-white px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-5xl md:text-7xl text-[#4a5e30] mb-24 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nuestros Servicios
          </h2>
          <div className="space-y-32">
            {services.map((service) => (
              <div key={service.num} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-3 text-center lg:text-right">
                  <span
                    className="text-8xl md:text-[10rem] leading-none text-[#c9a962] font-bold"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {service.num}
                  </span>
                </div>
                <div className="lg:col-span-1 hidden lg:flex justify-center">
                  <div className="w-px h-32 bg-[#c9a962]/30"></div>
                </div>
                <div className="lg:col-span-8 bg-[#4a5e30] text-[#f5f0e8] p-12 md:p-16 rounded-sm shadow-xl">
                  <h3
                    className="text-4xl mb-6"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-lg font-light leading-relaxed opacity-90 max-w-2xl">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="galeria" className="py-24 md:py-32 px-4 md:px-8 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-5xl md:text-7xl text-[#4a5e30] mb-16 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Portafolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Main large image */}
            <div className="md:col-span-8 h-[60vh] md:h-[80vh] overflow-hidden group">
              {visibleGallery[0] && (
                <img
                  src={visibleGallery[0].imageUrl}
                  alt={visibleGallery[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            {/* Right stacked */}
            <div className="md:col-span-4 grid grid-rows-2 gap-4 h-[60vh] md:h-[80vh]">
              {visibleGallery[1] && (
                <div className="overflow-hidden group">
                  <img
                    src={visibleGallery[1].imageUrl}
                    alt={visibleGallery[1].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              {visibleGallery[2] && (
                <div className="overflow-hidden group">
                  <img
                    src={visibleGallery[2].imageUrl}
                    alt={visibleGallery[2].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
            </div>
            {/* Bottom wide */}
            {visibleGallery[3] && (
              <div className="md:col-span-12 h-[40vh] md:h-[60vh] overflow-hidden group">
                <img
                  src={visibleGallery[3].imageUrl}
                  alt={visibleGallery[3].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / NOSOTROS ── */}
      <section id="nosotros" className="py-32 px-4 md:px-8 bg-white border-y border-[#c9a962]/20">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-12 h-12 mx-auto text-[#c9a962] mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote
            className="text-3xl md:text-4xl lg:text-5xl leading-tight text-[#4a5e30] mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Pergonia no solo construyó una alberca, diseñaron el escenario donde mi familia creará recuerdos para toda la vida. Su atención al detalle y compromiso con la excelencia es incomparable."
          </blockquote>
          <cite className="block text-sm uppercase tracking-widest text-gray-500 font-semibold not-italic">
            — Familia Martínez, Torreón
          </cite>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contacto" className="py-32 px-4 md:px-8 bg-[#4a5e30] text-[#f5f0e8]">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-5xl md:text-7xl mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Comienza tu Proyecto
          </h2>
          <p className="font-light text-lg mb-16 opacity-80">
            Déjanos tus datos y un especialista en diseño exterior se pondrá en contacto contigo.
          </p>

          {submitted ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#c9a962] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>¡Mensaje enviado!</p>
              <p className="mt-3 opacity-70">Nos pondremos en contacto muy pronto.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 text-xs uppercase tracking-widest text-[#c9a962] hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form
              className="space-y-8 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                contactMutation.mutate(formData);
              }}
            >
              {[
                { id: "name", label: "Nombre Completo", type: "text", placeholder: "Ej. Juan Pérez", field: "name" as const },
                { id: "email", label: "Correo Electrónico", type: "email", placeholder: "juan@ejemplo.com", field: "email" as const },
                { id: "phone", label: "Teléfono", type: "tel", placeholder: "871 000 0000", field: "phone" as const },
              ].map(({ id, label, type, placeholder, field }) => (
                <div key={id} className="space-y-2">
                  <label htmlFor={id} className="block text-xs uppercase tracking-widest font-semibold opacity-70">
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full bg-transparent border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors placeholder:text-[#f5f0e8]/30"
                    placeholder={placeholder}
                    required={field !== "phone"}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label htmlFor="service" className="block text-xs uppercase tracking-widest font-semibold opacity-70">
                  Servicio de Interés
                </label>
                <select
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-[#4a5e30] border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors text-[#f5f0e8]"
                >
                  <option value="">Selecciona un servicio...</option>
                  <option value="alberca_residencial">Alberca Residencial</option>
                  <option value="alberca_comercial">Alberca Comercial</option>
                  <option value="area_social">Área Social</option>
                  <option value="paisajismo">Paisajismo</option>
                  <option value="remodelacion">Remodelación</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs uppercase tracking-widest font-semibold opacity-70">
                  Detalles del Proyecto
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent border-b border-[#c9a962]/40 py-3 text-lg focus:outline-none focus:border-[#c9a962] transition-colors placeholder:text-[#f5f0e8]/30 resize-none"
                  placeholder="Cuéntanos brevemente sobre la alberca o área social que imaginas..."
                />
              </div>

              <div className="pt-8 text-center">
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="inline-block px-12 py-4 border border-[#c9a962] text-[#c9a962] text-sm uppercase tracking-widest font-semibold hover:bg-[#c9a962] hover:text-[#4a5e30] transition-colors duration-300 disabled:opacity-50"
                >
                  {contactMutation.isPending ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </div>
            </form>
          )}

          {/* Contact info */}
          <div className="mt-20 pt-10 border-t border-[#c9a962]/20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm opacity-70">
            <a href={PHONE_LINK} className="hover:opacity-100 transition-opacity">
              <p className="text-xs uppercase tracking-widest mb-1 text-[#c9a962]">Teléfono</p>
              <p>{PHONE}</p>
            </a>
            <a href={`mailto:${EMAIL}`} className="hover:opacity-100 transition-opacity">
              <p className="text-xs uppercase tracking-widest mb-1 text-[#c9a962]">Correo</p>
              <p>{EMAIL}</p>
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
              <p className="text-xs uppercase tracking-widest mb-1 text-[#c9a962]">WhatsApp</p>
              <p>Escríbenos</p>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#2d3a1d] text-[#f5f0e8]/50 py-8 px-4 text-center text-xs uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Pergonia Arquitectura Exterior — Torreón, Coahuila.</p>
      </footer>
    </div>
  );
}
