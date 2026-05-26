import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GalleryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Phone, Mail, MapPin, CheckCircle, Star, Menu, X,
  ChevronDown, Droplets, Home, Building2, Palmtree, Wrench,
  ShieldCheck, Clock, Award, ThumbsUp, ArrowRight, Facebook,
  Instagram, MessageCircle
} from "lucide-react";
import { Link } from "wouter";

const PHONE = "871 218 7073";
const PHONE_LINK = "tel:+528712187073";
const EMAIL = "contacto@pergonia.mx";
const WHATSAPP = "https://wa.me/528712187073";
const LOCATION = "Torreón, Coahuila";

const services = [
  {
    icon: <Droplets className="w-10 h-10" />,
    title: "Albercas Residenciales",
    desc: "Diseño y construcción de albercas a la medida para hogares. Desde albercas clásicas hasta infinity pools con los mejores acabados.",
    img: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=500&q=80",
  },
  {
    icon: <Building2 className="w-10 h-10" />,
    title: "Albercas Comerciales",
    desc: "Proyectos de gran formato para hoteles, clubes deportivos, fraccionamientos y desarrollos turísticos en La Comarca Lagunera.",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&q=80",
  },
  {
    icon: <Palmtree className="w-10 h-10" />,
    title: "Áreas Sociales",
    desc: "Creamos espacios exteriores para vivir: pérgolas, asadores, quioscos, jardines y terrazas que elevan tu estilo de vida.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
  },
  {
    icon: <Wrench className="w-10 h-10" />,
    title: "Remodelación y Mantenimiento",
    desc: "Renovamos albercas existentes, impermeabilizamos, cambiamos sistemas de filtración y remodelamos áreas sociales completas.",
    img: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=500&q=80",
  },
];

const reasons = [
  { icon: <Award className="w-7 h-7" />, title: "Más de 15 Años de Experiencia", desc: "Trayectoria comprobada en proyectos residenciales y comerciales en Torreón y La Comarca Lagunera." },
  { icon: <ShieldCheck className="w-7 h-7" />, title: "Garantía en Obra", desc: "Todos nuestros proyectos cuentan con garantía en mano de obra y materiales para tu tranquilidad." },
  { icon: <Clock className="w-7 h-7" />, title: "Entrega a Tiempo", desc: "Cumplimos los plazos acordados. Tu proyecto se entrega en tiempo y forma, sin sorpresas." },
  { icon: <ThumbsUp className="w-7 h-7" />, title: "Materiales de Primera", desc: "Usamos solo materiales de alta calidad y proveedores certificados para garantizar durabilidad." },
];

const steps = [
  { num: "01", title: "Asesoría Gratuita", desc: "Visitamos tu espacio sin costo y analizamos las posibilidades de diseño." },
  { num: "02", title: "Diseño y Cotización", desc: "Elaboramos el diseño personalizado y una cotización clara y detallada." },
  { num: "03", title: "Construcción", desc: "Nuestro equipo experto ejecuta el proyecto con supervisión permanente." },
  { num: "04", title: "Entrega y Garantía", desc: "Entregamos tu proyecto terminado con garantía escrita incluida." },
];

const testimonials = [
  { name: "Carlos Ramírez", loc: "Torreón, Coah.", text: "Excelente trabajo en nuestra alberca familiar. El equipo fue muy profesional y el resultado superó nuestras expectativas. Totalmente recomendados.", stars: 5 },
  { name: "María González", loc: "Gómez Palacio, Dgo.", text: "Contratamos a Pergonia para nuestra área social con asador y quiosco. El diseño quedó increíble y la calidad de los materiales es de primera.", stars: 5 },
  { name: "Hotel Río Grande", loc: "Torreón, Coah.", text: "Construyeron la alberca principal de nuestro hotel. Proyecto de gran envergadura, entregado a tiempo y con acabados de lujo.", stars: 5 },
];

const galleryCategories = [
  { key: "todos", label: "Todos" },
  { key: "albercas", label: "Albercas" },
  { key: "areas_sociales", label: "Áreas Sociales" },
  { key: "jardines", label: "Jardines" },
  { key: "pergolas", label: "Pérgolas" },
];

const defaultGallery = [
  { id: 1, title: "Alberca Infinity", category: "albercas", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", description: "Proyecto residencial Torreón" },
  { id: 2, title: "Área Social con Palapa", category: "areas_sociales", imageUrl: "https://images.unsplash.com/photo-1592595896551-12b371d546d3?w=600&q=80", description: "Desarrollo privado Gómez Palacio" },
  { id: 3, title: "Alberca Comercial", category: "albercas", imageUrl: "https://images.unsplash.com/photo-1543361373-d3834a782993?w=600&q=80", description: "Hotel Comarca Lagunera" },
  { id: 4, title: "Jardín con Fuente", category: "jardines", imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80", description: "Casa residencial Torreón" },
  { id: 5, title: "Pérgola Moderna", category: "pergolas", imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80", description: "Área social Lerdo, Dgo." },
  { id: 6, title: "Alberca Familiar", category: "albercas", imageUrl: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&q=80", description: "Proyecto residencial" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const contactMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/contact", data).then(r => r.json()),
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
  const filteredGallery = activeCategory === "todos"
    ? displayGallery.filter(i => i.isVisible !== false)
    : displayGallery.filter(i => i.category === activeCategory && i.isVisible !== false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  useEffect(() => {
    document.title = "Pergonia | Diseño y Construcción de Albercas y Áreas Sociales — Torreón, Coahuila";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Pergonia — Especialistas en diseño y construcción de albercas residenciales, albercas comerciales y áreas sociales en Torreón, Coahuila y La Comarca Lagunera. Más de 15 años de experiencia. Solicita tu asesoría gratuita.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Pergonia — Especialistas en diseño y construcción de albercas residenciales, albercas comerciales y áreas sociales en Torreón, Coahuila y La Comarca Lagunera. Más de 15 años de experiencia. Solicita tu asesoría gratuita.";
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-[#1a1a1a] font-sans">
      {/* Structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Pergonia — Arquitectura Exterior",
        "description": "Especialistas en diseño y construcción de albercas, áreas sociales y arquitectura exterior en Torreón, Coahuila y La Comarca Lagunera.",
        "telephone": "+52 871 218 7073",
        "address": { "@type": "PostalAddress", "addressLocality": "Torreón", "addressRegion": "Coahuila", "addressCountry": "MX" },
        "geo": { "@type": "GeoCoordinates", "latitude": "25.5428", "longitude": "-103.4068" },
        "url": "https://pergonia.mx",
        "priceRange": "$$",
        "openingHours": "Mo-Fr 08:00-18:00",
        "serviceArea": { "@type": "Place", "name": "La Comarca Lagunera, México" },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Servicios Pergonia",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Construcción de Albercas Residenciales" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Albercas Comerciales" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diseño de Áreas Sociales" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Remodelación de Albercas" } },
          ]
        }
      }) }} />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e8e0cc] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-primary rounded">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h8v2H5v4H3V3zm13 0h5v6h-2V5h-3V3zM3 15h2v4h6v2H3v-6zm16 4h-3v2h5v-6h-2v4z"/>
                  <rect x="7" y="7" width="10" height="10" rx="1" opacity=".4"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg text-primary tracking-wide">PERGONIA</span>
                <span className="hidden sm:block text-xs text-muted-foreground -mt-0.5">Arquitectura Exterior</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {[["inicio","Inicio"],["servicios","Servicios"],["galeria","Galería"],["nosotros","Nosotros"],["contacto","Contacto"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-[#1a1a1a]/70 hover:text-primary transition-colors">
                  {label}
                </button>
              ))}
              <Button onClick={() => scrollTo("contacto")} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                Cotización Gratis
              </Button>
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Admin</Button>
              </Link>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#e8e0cc] px-4 pb-4">
            {[["inicio","Inicio"],["servicios","Servicios"],["galeria","Galería"],["nosotros","Nosotros"],["contacto","Contacto"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left py-3 text-sm font-medium border-b border-[#e8e0cc] last:border-0">
                {label}
              </button>
            ))}
            <Button onClick={() => scrollTo("contacto")} className="w-full mt-3 bg-primary text-white">
              Cotización Gratis
            </Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3a4a28 0%, #4d6035 40%, #2c3a1e 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${Math.random()*200+50}px`, height: `${Math.random()*200+50}px`, top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, opacity: Math.random()*0.3 }} />
          ))}
        </div>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, #fff 40px, #fff 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #fff 40px, #fff 41px)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[#c9a962]/20 text-[#c9a962] border-[#c9a962]/30 px-4 py-1.5 text-sm font-medium">
              Torreón · La Comarca Lagunera
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Diseñamos{" "}
              <span className="text-[#c9a962]">albercas y espacios</span>{" "}
              que transforman tu vida
            </h1>
            <p className="text-lg sm:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl">
              Especialistas en construcción de albercas residenciales, comerciales y áreas sociales de lujo en Torreón, Coahuila y toda La Comarca Lagunera.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => scrollTo("contacto")}
                className="bg-[#c9a962] hover:bg-[#b89550] text-[#1a1a1a] font-semibold px-8 py-6 text-base">
                Asesoría Gratuita <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("galeria")}
                className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base bg-transparent">
                Ver Proyectos
              </Button>
            </div>

            <div className="mt-14 flex flex-wrap gap-8">
              {[["150+", "Proyectos realizados"], ["15+", "Años de experiencia"], ["100%", "Clientes satisfechos"]].map(([val, label]) => (
                <div key={label}>
                  <div className="text-3xl font-bold text-[#c9a962]">{val}</div>
                  <div className="text-sm text-white/60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => scrollTo("servicios")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce">
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="py-20 lg:py-28 bg-[#f8f4ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Nuestros Servicios</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
              Todo lo que necesitas para tu proyecto
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Desde el diseño inicial hasta la entrega final, cubrimos cada etapa con profesionalismo y calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="text-primary mb-3">{s.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-[#1a1a1a]">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="galeria" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Galería de Proyectos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">Nuestras Obras Realizadas</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada proyecto es único. Conoce algunos de nuestros trabajos en Torreón y La Comarca Lagunera.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {galleryCategories.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === key ? "bg-primary text-white" : "bg-[#f8f4ec] text-[#1a1a1a]/70 hover:bg-primary/10"
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGallery.slice(0, 6).map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <img src={item.imageUrl} alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <div className="text-white font-semibold">{item.title}</div>
                    {item.description && <div className="text-white/70 text-sm">{item.description}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => scrollTo("contacto")} className="border-primary text-primary hover:bg-primary hover:text-white px-8">
              Solicitar Cotización <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="nosotros" className="py-20 lg:py-28 bg-[#f8f4ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">¿Por qué elegirnos?</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6 leading-tight">
                La empresa líder en albercas de La Comarca Lagunera
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                En Pergonia combinamos diseño arquitectónico, ingeniería de calidad y atención personalizada para crear espacios acuáticos y sociales que superan expectativas. Somos la elección de familias y empresas en Torreón, Gómez Palacio y Lerdo.
              </p>
              <div className="space-y-4">
                {["Asesoría y diseño gratuito sin compromiso","Presupuesto detallado y transparente","Personal certificado y con experiencia","Garantía escrita en todos los proyectos","Materiales de importación de primera calidad","Seguimiento post-entrega incluido"].map(benefit => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-[#1a1a1a]/80">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 w-4 h-4" /> Chatea por WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {reasons.map(r => (
                <div key={r.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary mb-3 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">{r.icon}</div>
                  <h3 className="font-bold text-[#1a1a1a] mb-2 leading-snug">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 lg:py-28 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">Proceso</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Cómo trabajamos?</h2>
            <p className="text-white/70 max-w-xl mx-auto">Un proceso simple, claro y sin complicaciones del inicio al fin.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-white/20" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a962] text-[#1a1a1a] font-bold text-xl mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Testimonios</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Más de 150 familias y empresas en La Comarca Lagunera confían en Pergonia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-[#f8f4ec] rounded-2xl p-7 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c9a962] text-[#c9a962]" />
                  ))}
                </div>
                <p className="text-[#1a1a1a]/75 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <div className="font-bold text-[#1a1a1a]">{t.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {t.loc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="py-20 lg:py-28 bg-[#f8f4ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Contacto</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">Solicita tu asesoría gratuita</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Cuéntanos tu proyecto y te contactaremos en menos de 24 horas con una propuesta personalizada, sin costo y sin compromiso.
              </p>
              <div className="space-y-5">
                <a href={PHONE_LINK} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono / WhatsApp</div>
                    <div className="font-semibold text-[#1a1a1a]">{PHONE}</div>
                  </div>
                </a>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Correo Electrónico</div>
                    <div className="font-semibold text-[#1a1a1a]">{EMAIL}</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</div>
                    <div className="font-semibold text-[#1a1a1a]">{LOCATION}</div>
                    <div className="text-sm text-muted-foreground">Atendemos toda La Comarca Lagunera</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fbc59] text-white px-5 py-3 rounded-xl font-medium transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href="https://facebook.com/pergonia.arquitectura" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565d8] text-white px-5 py-3 rounded-xl font-medium transition-colors">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">¡Mensaje enviado!</h3>
                  <p className="text-muted-foreground">Nos pondremos en contacto contigo muy pronto.</p>
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-white" onClick={() => setSubmitted(false)}>
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); contactMutation.mutate(formData); }} className="space-y-5">
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Formulario de Contacto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-1.5">Nombre completo *</label>
                      <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                        placeholder="Tu nombre" required className="bg-[#f8f4ec] border-[#e8e0cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-1.5">Teléfono *</label>
                      <Input value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                        placeholder="871 xxx xxxx" required className="bg-[#f8f4ec] border-[#e8e0cc]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-1.5">Correo electrónico</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                      placeholder="tu@correo.com" className="bg-[#f8f4ec] border-[#e8e0cc]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-1.5">Servicio de interés</label>
                    <select value={formData.service} onChange={e => setFormData(p => ({...p, service: e.target.value}))}
                      className="w-full h-10 px-3 rounded-md border border-[#e8e0cc] bg-[#f8f4ec] text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Selecciona un servicio</option>
                      <option value="alberca_residencial">Alberca Residencial</option>
                      <option value="alberca_comercial">Alberca Comercial</option>
                      <option value="area_social">Área Social</option>
                      <option value="remodelacion">Remodelación de Alberca</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-1.5">Mensaje / Descripción del proyecto</label>
                    <Textarea value={formData.message} onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                      placeholder="Cuéntanos sobre tu proyecto..." rows={4} className="bg-[#f8f4ec] border-[#e8e0cc] resize-none" />
                  </div>
                  <Button type="submit" disabled={contactMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base font-semibold">
                    {contactMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Te respondemos en menos de 24 horas hábiles.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-wide">PERGONIA</span>
                  <span className="block text-xs text-white/50">Arquitectura Exterior</span>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-5">
                Especialistas en diseño y construcción de albercas y áreas sociales en Torreón y La Comarca Lagunera. Más de 15 años creando espacios extraordinarios.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com/pergonia.arquitectura" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/pergonia.arquitectura" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#25D366] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white/90">Servicios</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                {["Albercas Residenciales","Albercas Comerciales","Áreas Sociales","Pérgolas y Kioscos","Jardines y Riego","Remodelación"].map(s => (
                  <li key={s}><button onClick={() => scrollTo("servicios")} className="hover:text-white transition-colors">{s}</button></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white/90">Contacto</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <a href={PHONE_LINK} className="hover:text-white transition-colors">{PHONE}</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <a href={`mailto:${EMAIL}`} className="hover:text-white transition-colors">{EMAIL}</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Torreón, Coahuila<br />La Comarca Lagunera, México</span>
                </li>
              </ul>
              <div className="mt-5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Horario de atención</div>
                <div className="text-sm text-white/60">Lunes – Viernes: 8:00 – 18:00</div>
                <div className="text-sm text-white/60">Sábado: 9:00 – 14:00</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">© 2025 Pergonia Arquitectura Exterior. Torreón, Coahuila, México.</p>
            <p className="text-xs text-white/30">Diseño y construcción de albercas en La Comarca Lagunera</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1fbc59] text-white rounded-full shadow-lg flex items-center justify-center transition-colors hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp">
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
