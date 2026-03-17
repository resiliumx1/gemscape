import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Experiences from "@/components/Experiences";
import Manifesto from "@/components/Manifesto";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Experiences />
      <Manifesto />
      <Testimonials />
      {/* Scroll space */}
      <div className="section-pad" style={{ minHeight: "30vh" }}>
        <div className="text-center">
          <span className="eyebrow mx-auto justify-center">Coming Soon</span>
          <h2 className="font-display text-4xl mt-4">Footer on the way</h2>
        </div>
      </div>
    </>
  );
};

export default Index;