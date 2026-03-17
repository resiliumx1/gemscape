import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <>
      <Navbar />
      {/* Temporary dark hero placeholder so navbar is visible */}
      <div
        className="min-h-screen flex items-center justify-center section-pad"
        style={{ background: "hsl(var(--gem-navy))" }}
      >
        <div className="text-center">
          <span className="eyebrow mx-auto justify-center mb-6" style={{ color: "hsl(var(--gem-gold))" }}>
            Antigua &amp; Barbuda
          </span>
          <h1
            className="font-display text-6xl md:text-8xl font-light tracking-tight mt-4"
            style={{ color: "hsl(var(--gem-white))" }}
          >
            Gemscape
          </h1>
          <p className="mt-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Travel &amp; Tours — Foundation ready. Sections coming soon.
          </p>
        </div>
      </div>
      {/* Extra scroll space to test nav scroll behavior */}
      <div className="section-pad" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <span className="eyebrow mx-auto justify-center">Scroll test</span>
          <h2 className="font-display text-4xl mt-4">The navbar changes on scroll</h2>
        </div>
      </div>
    </>
  );
};

export default Index;