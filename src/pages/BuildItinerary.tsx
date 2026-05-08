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
        <meta property="og:title" content="Build My Itinerary | Gemscape" />
        <meta property="og:description" content="Tell us the feeling you want from your trip — peaceful, romantic, adventurous, cultural, wellness-focused, or celebratory — and we'll shape the details." />
        <meta property="og:url" content="https://gemscapetours.com/build-itinerary" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://gemscapetours.com/images/hero-antigua-sunset.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Personalized Itinerary Planning",
          "provider": { "@type": "TravelAgency", "name": "Gemscape Travel & Tours", "url": "https://gemscapetours.com" },
          "areaServed": { "@type": "Country", "name": "Antigua and Barbuda" },
          "url": "https://gemscapetours.com/build-itinerary",
          "description": "Curated Caribbean itineraries shaped around your travel style — peaceful, romantic, adventurous, cultural, wellness-focused, or celebratory."
        })}</script>
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
