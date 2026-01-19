import React, { useEffect } from 'react';
import { useTrackEventMutation } from '../services/api/analyticsApi';
import Hero from '../components/home/Hero';
import FeaturesBar from '../components/home/FeaturesBar';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoriesGrid from '../components/home/CategoriesGrid';
import StoryTeaser from '../components/home/StoryTeaser';

const HomePage: React.FC = () => {
  const [trackEvent] = useTrackEventMutation();

  useEffect(() => {
    trackEvent({ type: 'page_view' });
  }, [trackEvent]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Features Bar */}
      <div className="relative z-10 -mt-12 md:-mt-16 px-4">
        <FeaturesBar />
      </div>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* Story Teaser */}
      <StoryTeaser />
    </div>
  );
};

export default HomePage;
