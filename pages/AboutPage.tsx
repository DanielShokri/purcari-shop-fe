import React from 'react';
import AboutHero from '../components/about/AboutHero';
import HistorySection from '../components/about/HistorySection';
import StatsSection from '../components/about/StatsSection';
import ValuesSection from '../components/about/ValuesSection';
import PurcariIsraelSection from '../components/about/PurcariIsraelSection';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <AboutHero />

      {/* History Section */}
      <HistorySection />

      {/* Stats Section */}
      <StatsSection />

      {/* Values Section */}
      <ValuesSection />

      {/* Purcari Israel Section */}
      <PurcariIsraelSection />
    </div>
  );
};

export default AboutPage;
