import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

const Index = () => {
  return (
    <>
      <Navbar />
      <Hero />
      {/* Scroll space to test parallax and nav transition */}
      <div className="section-pad" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <span className="eyebrow mx-auto justify-center">Coming Soon</span>
          <h2 className="font-display text-4xl mt-4">More sections on the way</h2>
        </div>
      </div>
    </>
  );
};

export default Index;