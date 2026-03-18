const PILLARS = [
  { title: "Locally Owned", desc: "Born and raised in Antigua — we know every corner of this island." },
  { title: "Fully Bespoke", desc: "No fixed packages. Only your preferences, your pace, your way." },
  { title: "End-to-End", desc: "From landing to departure, we coordinate every single detail." },
  { title: "Premium Partners", desc: "Access to Antigua's finest vendors, venues, and vessels." },
];

const WhyGemscape = () => {
  return (
    <section className="why-gemscape" id="why-gemscape">
      <div className="why-gemscape__inner">
        <div style={{ animation: 'fadeUp 0.8s ease forwards', animationDelay: '0.2s', opacity: 0 }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>Why Gemscape</span>
          <h2 className="why-gemscape__h2">
            Antigua is Our Home.<br />Your Experience is Our Craft.
          </h2>
          <p className="why-gemscape__body">
            We're not a booking engine. We're a small, proudly Antiguan team who knows every bay, every pilot, every road. When you travel with Gemscape, you're not getting a package — you're getting an insider.
          </p>
        </div>

        <div className="why-gemscape__pillars">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="pillar"
              style={{
                animation: 'fadeUp 0.8s ease forwards',
                animationDelay: `${0.35 + i * 0.15}s`,
              }}
            >
              <span className="pillar__mark">◆</span>
              <h3 className="pillar__title">{p.title}</h3>
              <p className="pillar__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGemscape;
