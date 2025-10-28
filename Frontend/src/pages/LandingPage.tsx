import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Camera, ShoppingCart, Utensils, Video } from 'lucide-react';
import Navbar from '../components/navbar';
import { useAuthContext } from '../authContext';

const features = [
  {
    icon: Brain,
    title: 'AI Meal Planning',
    description: 'Get personalized meal plans powered by AI',
  },
  {
    icon: Camera,
    title: 'Nutrition Analysis',
    description: 'Scan food & get instant nutritional breakdown',
  },
  {
    icon: ShoppingCart,
    title: 'Smart Grocery Lists',
    description: 'Auto-generate shopping lists from meal plans',
  },
  {
    icon: Utensils,
    title: 'Recipe Finder',
    description: 'Discover recipes based on your ingredients',
  },
  {
    icon: Video,
    title: 'Expert Consultation',
    description: 'Connect with nutritionists via video call',
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personal AI Nutrition Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your health journey with personalized nutrition guidance powered by artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    navigate('/register');
                  }
                }}              >
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => {
              if (user) {
                navigate('/dashboard');
              } else {
                navigate('/register');
              }
            }}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-emerald-700 transition-colors"
          >
            Start Your Journey
          </button>

        </div>
      </main>
    </div>
  );
}

export default LandingPage;