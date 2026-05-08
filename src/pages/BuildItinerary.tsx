import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import ItineraryBuilder from "@/components/ItineraryBuilder";

const BuildItinerary = () => {
  return (
    <>
      <Helmet>
        <title>Build My Itinerary | Gemscape — Curated Caribbean Experiences</title>
        <meta name="description" content="Share your travel vision and let Gemscape curate a personalized Caribbean itinerary — coordination, transportation, excursions, and island support, thoughtfully handled." />
        <link rel="canonical" href="https://gemscapetours.com/build-itinerary" />
      </Helmet>
      <Navbar />
      <div style={{ background: "#05181e", paddingTop: 80 }}>
        <ItineraryBuilder />
      </div>
      <Footer />
      <WhatsAppFab />
    </>
  );
};

export default BuildItinerary;
