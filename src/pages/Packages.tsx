import { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, Crown, Star, Check, ArrowRight, Diamond, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { useWaveNav } from "@/components/WavePageTransition";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=85", label: "Turquoise Coves", span: "tall" },
  { src: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=85", label: "Luxury Resorts", span: "wide" },
  { src: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=85", label: "Island Nightlife", span: "normal" },
  { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85", label: "Sailing Adventures", span: "normal" },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85", label: "Hidden Beaches", span: "wide" },
  { src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=85", label: "Cultural Heritage", span: "tall" },
];

const PACKAGES = [
  {
    key: "explorer" as const,
    name: "Gemscape Explorer",
    price: 65,
    icon: Star,
    accent: "#2cb8a8",
    popular: false,
    description: "Perfect for independent travellers who want local insight without the full planning service.",
    features: ["Custom day-by-day itinerary", "Destination recommendations", "Suggested activities & timing", "Restaurant recommendations", "Delivered within 48 hours"],
    gradient: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)",
  },
  {
    key: "experience" as const,
    name: "Gemscape Experience",
    price: 95,
    icon: Sparkles,
    accent: "#C9A84C",
    popular: true,
    description: "Our signature package. We plan everything — where to go, where to eat, what to do, and when to do it.",
    features: ["Full curated itinerary", "Hotel recommendations", "Activity planning & booking", "Restaurant guidance & reservations", "Local travel tips & hidden gems", "WhatsApp support during trip"],
    gradient: "linear-gradient(135deg, #C9A84C 0%, #b8956a 100%)",
  },
  {
    key: "elite" as const,
    name: "Gemscape Elite Concierge",
    price: 195,
    icon: Crown,
    accent: "#b8956a",
    popular: false,
    description: "The white-glove experience. We orchestrate every moment, handle every booking, and stand by every step.",
    features: ["Full travel planning A–Z", "Flight guidance & monitoring", "Hotel booking assistance", "All excursions arranged & confirmed", "Airport transfers arranged", "Priority 24/7 travel support", "On-island emergency assistance"],
    gradient: "linear-gradient(135deg, #b8956a 0%, #8a6d4a 100%)",
  },
];

const EXPERIENCE_OPTIONS = [
  "Beach & Relaxation", "Island Tours", "Nightlife & Dining", "Water Sports",
  "Cultural Heritage", "Yacht & Sailing", "Hiking & Nature", "Photography Tours",
  "Romantic Getaway", "Family Adventure", "Wellness & Spa", "Local Food & Rum",
];

const STEPS = [
  { num: "01", title: "Choose Your Package", desc: "Pick the level of planning that suits your style" },
  { num: "02", title: "Tell Us Your Dates", desc: "Share your travel dates and preferences" },
  { num: "03", title: "We Plan, You Enjoy", desc: "Receive your curated itinerary and start dreaming" },
];

const Packages = () => {
  const { navigateTo } = useWaveNav();
  const { format } = useCurrency();
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedPackage, setSelectedPackage] = useState<"explorer" | "experience" | "elite" | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (eyebrowRef.current) tl.fromTo(eyebrowRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
      if (h1Ref.current) tl.fromTo(h1Ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.5);
      if (subRef.current) tl.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8);

      if (galleryRef.current) {
        gsap.fromTo(galleryRef.current.children, { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: galleryRef.current, start: "top 85%" } });
      }
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children, { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: cardsRef.current, start: "top 80%" } });
      }
      if (stepsRef.current) {
        gsap.fromTo(stepsRef.current.children, { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: stepsRef.current, start: "top 85%" } });
      }
    });
    return () => ctx.revert();
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowConfirmation(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelectPackage = (key: "explorer" | "experience" | "elite") => {
    setSelectedPackage(key);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !selectedPackage || selectedInterests.length === 0) {
      toast.error("Please fill in your name, email, select a package, and at least one experience interest.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("package_bookings" as any).insert({
        package_type: selectedPackage,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        travel_dates: travelDates.trim() || null,
        party_size: partySize,
        experience_interests: selectedInterests,
        special_requests: specialRequests.trim() || null,
      }).select("booking_ref").single();
      if (error) throw error;
      setBookingRef((data as any)?.booking_ref || "PKG-XXXX");
      setShowConfirmation(true);
      // Reset form
      setFullName(""); setEmail(""); setPhone(""); setTravelDates("");
      setPartySize(2); setSelectedInterests([]); setSpecialRequests(""); setSelectedPackage(null);
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pkgLabel = (key: string) => key === "explorer" ? "Explorer ($65)" : key === "experience" ? "Experience ($95)" : "Elite ($195+)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pkg-page-bg)" }}>
      <Helmet>
        <title>Signature Packages | Gemscape Travel & Tours</title>
        <meta name="description" content="Choose your level of planning — from custom itineraries to full white-glove concierge. Let Gemscape handle your perfect Antigua escape." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="packages-hero">
        <div className="packages-hero__bg" />
        <div className="packages-hero__content">
          <span className="eyebrow eyebrow--aqua" ref={eyebrowRef} style={{ opacity: 0 }}>Signature Packages</span>
          <h1 ref={h1Ref} style={{ opacity: 0 }} className="packages-hero__h1">
            Let Us Plan Your<br /><em>Perfect Escape.</em>
          </h1>
          <p ref={subRef} style={{ opacity: 0 }} className="packages-hero__sub">
            Unparalleled Luxury, Unforgettable Escapes — from a curated itinerary to full white-glove concierge.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ background: "var(--pkg-page-bg)", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="eyebrow eyebrow--aqua" style={{ display: "block", marginBottom: 12 }}>Exotic Destinations</span>
          <h2 className="packages-hero__h1" style={{ fontSize: "clamp(28px, 4.5vw, 44px)", marginTop: 0, color: "var(--pkg-card-text)" }}>
            Discover What <em>Awaits.</em>
          </h2>
        </div>
        <div ref={galleryRef} className="pkg-gallery">
          {GALLERY_IMAGES.map((img) => (
            <div key={img.label} className={`pkg-gallery__item pkg-gallery__item--${img.span}`}>
              <img src={img.src} alt={img.label} loading="lazy" />
              <div className="pkg-gallery__overlay">
                <span>{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Package Cards */}
      <section style={{ background: "var(--pkg-page-bg)", padding: "40px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="eyebrow eyebrow--aqua" style={{ display: "block", marginBottom: 12 }}>Choose Your Level</span>
          <h2 className="packages-hero__h1" style={{ fontSize: "clamp(28px, 4.5vw, 44px)", marginTop: 0, color: "var(--pkg-card-text)" }}>
            Select Your <em>Package.</em>
          </h2>
        </div>
        <div ref={cardsRef} className="packages-grid">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPackage === pkg.key;
            return (
              <div key={pkg.name} className={`pkg-card ${pkg.popular ? "pkg-card--popular" : ""} ${isSelected ? "pkg-card--selected" : ""}`}>
                <div className="pkg-card__gold-line" />
                {pkg.popular && (
                  <div className="pkg-card__badge">Most Popular</div>
                )}
                <Icon size={28} style={{ color: pkg.accent, marginBottom: 16 }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: "var(--pkg-card-text)", margin: "0 0 12px" }}>
                  {pkg.name}
                </h3>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 300, color: "var(--pkg-card-price)", lineHeight: 1 }}>
                    {format(pkg.price)}
                  </span>
                  {pkg.key === "elite" && <span style={{ fontSize: 20, color: "var(--pkg-card-text-muted)", fontFamily: "'Cormorant Garamond', serif" }}>+</span>}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7, color: "var(--pkg-card-text-muted)", marginBottom: 28 }}>
                  {pkg.description}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {pkg.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Check size={16} style={{ color: pkg.accent, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--pkg-card-text-muted)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSelectPackage(pkg.key)}
                  className="pkg-card__cta"
                  style={{ marginTop: 32, background: pkg.gradient }}
                >
                  Select Package <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Form */}
      <section ref={formRef} style={{ background: "var(--pkg-page-bg)", padding: "40px 24px 100px" }}>
        <div className="pkg-form">
          <h2 className="pkg-form__heading">Craft Your Perfect Escape</h2>
          <form onSubmit={handleSubmit} className="pkg-form__grid">
            <div className="pkg-form__field">
              <label className="pkg-form__label">Full Name *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="pkg-form__input" required />
            </div>
            <div className="pkg-form__field">
              <label className="pkg-form__label">Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="pkg-form__input" required />
            </div>
            <div className="pkg-form__field">
              <label className="pkg-form__label">Phone (optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="pkg-form__input" />
            </div>
            <div className="pkg-form__field">
              <label className="pkg-form__label">Travel Window</label>
              <input type="text" value={travelDates} onChange={e => setTravelDates(e.target.value)} placeholder="e.g. Dec 20 – Jan 3" className="pkg-form__input" />
            </div>
            <div className="pkg-form__field">
              <label className="pkg-form__label">Party Size</label>
              <input type="number" min={1} max={20} value={partySize} onChange={e => setPartySize(Number(e.target.value))} className="pkg-form__input" />
            </div>
            <div className="pkg-form__field">
              <label className="pkg-form__label">Selected Package</label>
              <div className="pkg-form__badge-wrap">
                {selectedPackage ? (
                  <span className="pkg-form__badge" style={{ background: PACKAGES.find(p => p.key === selectedPackage)?.gradient }}>
                    {pkgLabel(selectedPackage)}
                  </span>
                ) : (
                  <span style={{ color: "var(--pkg-form-placeholder)", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Select a package above ↑</span>
                )}
              </div>
            </div>
            <div className="pkg-form__field pkg-form__field--full">
              <label className="pkg-form__label">Experience Interests *</label>
              <div className="pkg-form__pills">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => toggleInterest(opt)}
                    className={`pkg-form__pill ${selectedInterests.includes(opt) ? "pkg-form__pill--active" : ""}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="pkg-form__field pkg-form__field--full">
              <label className="pkg-form__label">Special Requests or Interests</label>
              <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Tell us about your dream trip..." className="pkg-form__input pkg-form__textarea" rows={4} />
            </div>
            <div className="pkg-form__field pkg-form__field--full">
              <button type="submit" disabled={isSubmitting} className="pkg-form__submit">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: "var(--pkg-page-bg)", padding: "80px 24px 100px" }}>
        <h2 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, color: "var(--pkg-card-text)", marginBottom: 60 }}>
          How It Works
        </h2>
        <div ref={stepsRef} style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", maxWidth: 900, margin: "0 auto" }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{ textAlign: "center", maxWidth: 240, flex: "1 1 200px" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#C9A84C", display: "block", marginBottom: 12 }}>{step.num}</span>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: "var(--pkg-card-text)", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--pkg-card-text-muted)", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: "var(--pkg-page-bg)", padding: "60px 24px 120px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 300, color: "var(--pkg-card-text)", marginBottom: 12 }}>
          Not sure which package is right?
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "var(--pkg-card-text-muted)", marginBottom: 32 }}>
          Contact us and we'll help you decide.
        </p>
        <button onClick={() => navigateTo("/contact")} className="pkg-card__cta" style={{ background: "linear-gradient(135deg, #1a8a9e 0%, #2cb8a8 100%)", display: "inline-flex" }}>
          Get in Touch
        </button>
      </section>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="pkg-modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="pkg-modal" onClick={e => e.stopPropagation()}>
            <Diamond size={40} style={{ color: "#C9A84C", marginBottom: 20 }} />
            <h2 className="pkg-modal__heading">Your Journey Begins</h2>
            <p className="pkg-modal__text">
              Thank you for choosing Gemscape. Our elite concierge team is already curating your bespoke itinerary and will reach out to you within 24 hours.
            </p>
            <p className="pkg-modal__ref">Reference: {bookingRef}</p>
            <button onClick={() => { setShowConfirmation(false); navigateTo("/"); }} className="pkg-modal__btn">
              Return to Home
            </button>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppFab />
    </div>
  );
};

export default Packages;
