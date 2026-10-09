import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { savePredictionToFirebase } from './firebase';

export default function App() {
  const [step, setStep] = useState(0); // 0 = Hero/Home Page, 1-7 = Quiz Steps, 8 = Result
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Sri Lanka high-quality natural scenery background images
  const heroBackgrounds = [
    {
      url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=2000',
      location: 'Ella Tea Plantation',
      temp: '22°C'
    },
    {
      url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=2000',
      location: 'Mirissa South Coast',
      temp: '29°C'
    },
    {
      url: 'https://images.unsplash.com/photo-1578564499878-9e1e9ff1a0f8?auto=format&fit=crop&q=80&w=2000',
      location: 'Sigiriya Rock Fortress',
      temp: '27°C'
    },
    {
      url: 'https://images.unsplash.com/photo-1588598198321-9735151905a7?auto=format&fit=crop&q=80&w=2000',
      location: 'Nuwara Eliya Hills',
      temp: '18°C'
    }
  ];

  // Automatic slideshow timer
  useEffect(() => {
    if (step === 0) {
      const interval = setInterval(() => {
        setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroBackgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // ML Model Features
  const [answers, setAnswers] = useState({
    SmartTech: 3.0,
    ClimateSeason: 4.0,
    Economics: 3.0,
    CultureWellness: 3.0,
    SocialMedia: 3.0,
    Transport: 4.0,
    Political_Safety: 4.0
  });

  const questions = [
    {
      id: 'SmartTech',
      title: 'How important is smart technology?',
      subtitle: 'AI planning, real-time updates, and personalized suggestions',
      options: [
        { label: 'Essential', sub: 'I rely on smart tech for planning', value: 5.0, icon: '🧠' },
        { label: 'Helpful', sub: 'Nice to have for convenience', value: 3.0, icon: '📶' },
        { label: 'Optional', sub: 'I prefer traditional planning', value: 1.0, icon: '⚡' }
      ]
    },
    {
      id: 'ClimateSeason',
      title: 'What environment appeals to you?',
      subtitle: 'Wildlife, coastal areas, weather, and temperature preferences',
      options: [
        { label: 'Coastal Paradise', sub: 'Beaches, warm weather, ocean views', value: 5.0, icon: '🌴' },
        { label: 'Nature & Wildlife', sub: 'Mountains, forests, wildlife parks', value: 3.0, icon: '⛰️' },
        { label: 'Flexible', sub: 'I enjoy all types of environments', value: 1.0, icon: '☔' }
      ]
    },
    {
      id: 'Economics',
      title: 'What is your preferred budget range?',
      subtitle: 'Comfort, luxury level, and activity choices',
      options: [
        { label: 'Budget-Friendly', sub: 'Economical stays & activities', value: 1.0, icon: '💲' },
        { label: 'Moderate', sub: 'Balance of comfort & value', value: 3.0, icon: '📈' },
        { label: 'Premium', sub: 'Luxury experiences', value: 5.0, icon: '💎' }
      ]
    },
    {
      id: 'CultureWellness',
      title: 'How important is culture & wellness?',
      subtitle: 'Heritage, Ayurveda, temples, and tranquil retreats',
      options: [
        { label: 'High Focus', sub: 'Deep cultural immersion & wellness', value: 5.0, icon: '🛕' },
        { label: 'Moderate', sub: 'Balanced cultural sightseeing', value: 3.0, icon: '🌿' },
        { label: 'Low Focus', sub: 'Casual interest only', value: 1.0, icon: '🗺️' }
      ]
    },
    {
      id: 'SocialMedia',
      title: 'Influenced by social media trends?',
      subtitle: 'Instagrammable spots, viral cafes, and trending spots',
      options: [
        { label: 'Very Much', sub: 'Must visit trending spots', value: 5.0, icon: '📸' },
        { label: 'Somewhat', sub: 'Open to popular recommendations', value: 3.0, icon: '📱' },
        { label: 'Not at all', sub: 'Prefer off-the-beaten-path', value: 1.0, icon: '🧭' }
      ]
    },
    {
      id: 'Transport',
      title: 'Preferred mode of transport comfort?',
      subtitle: 'Private cars, scenic trains, or local buses',
      options: [
        { label: 'Private Chauffeur', sub: 'Maximum comfort & privacy', value: 5.0, icon: '🚗' },
        { label: 'Scenic Trains', sub: 'Balanced comfort & experience', value: 3.0, icon: '🚂' },
        { label: 'Public Transport', sub: 'Adventurous & budget', value: 1.0, icon: '🚌' }
      ]
    },
    {
      id: 'Political_Safety',
      title: 'Safety and stability priorities?',
      subtitle: 'Travel advisories, peace of mind, and security',
      options: [
        { label: 'Top Priority', sub: 'Only highly stable conditions', value: 5.0, icon: '🛡️' },
        { label: 'Moderate Concern', sub: 'Standard travel precautions', value: 3.0, icon: '⚖️' },
        { label: 'Flexible Traveler', sub: 'Adaptable to situations', value: 1.0, icon: '🎒' }
      ]
    }
  ];

  const handleSelectOption = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      handlePredict();
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Live Vercel Backend URL
      const res = await axios.post('https://ceylonplanx-new-backend.vercel.app/api/predict', answers);
      setResult(res.data.recommendation);
      setStep(8);

      // Save prediction to Firebase
      if (res.data.recommendation && res.data.recommendation.title) {
        await savePredictionToFirebase(answers, res.data.recommendation.title);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend server. Please verify your Vercel backend URL.");
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[step - 1];

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#0F2C23] font-sans flex flex-col justify-between">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-5 max-w-7xl mx-auto w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-950/5">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setStep(0)}>
          <div className="w-9 h-9 rounded-full bg-[#0F2C23] flex items-center justify-center text-white font-bold text-sm shadow-md">
            🌴
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0F2C23]">CeylonPlanX</span>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#059669] transition">Discover</a>
          <a href="#" className="hover:text-[#059669] transition">Recommendations</a>
          <a href="#" className="hover:text-[#059669] transition">My itinerary</a>
        </div>

        <button 
          onClick={() => setStep(1)} 
          className="bg-[#0F2C23] text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-medium hover:bg-[#1E4D3B] transition shadow-sm"
        >
          Plan my trip →
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        
        {/* Step 0: Global-Level Eco-Friendly Hero Section */}
        {step === 0 && (
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-6 w-full">
            <div 
              className="relative rounded-3xl overflow-hidden min-h-[550px] md:min-h-[620px] bg-cover bg-center flex flex-col justify-between p-8 md:p-14 text-white shadow-2xl transition-all duration-1000 ease-in-out"
              style={{ 
                backgroundImage: `linear-gradient(to right, rgba(15, 44, 35, 0.88), rgba(15, 44, 35, 0.35)), url('${heroBackgrounds[currentBgIndex].url}')` 
              }}
            >
              {/* Header Badge */}
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold tracking-widest uppercase border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  INTELLIGENT ISLAND TRAVEL
                </span>

                <h1 className="text-4xl md:text-6xl font-serif font-medium mt-6 leading-tight max-w-3xl">
                  Discover your perfect <br />
                  <span className="italic font-normal text-emerald-200">Sri Lanka travel season.</span>
                </h1>

                <p className="mt-5 text-emerald-100/90 max-w-xl text-sm md:text-base leading-relaxed font-light">
                  Tell us what moves you. We'll match your preferences with real seasonal patterns to craft a smarter way around the island.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <button 
                    onClick={() => setStep(1)} 
                    className="bg-[#1E7B85] hover:bg-[#155a62] text-white px-7 py-3.5 rounded-2xl text-sm font-medium transition shadow-lg flex items-center gap-2"
                  >
                    Plan my trip →
                  </button>
                  <button 
                    onClick={() => setStep(1)} 
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-3.5 rounded-2xl text-sm font-medium transition"
                  >
                    See how it works ↓
                  </button>
                </div>
              </div>

              {/* Live Location & Temperature Widget */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-8 border-t border-white/15">
                <div className="flex gap-2">
                  {heroBackgrounds.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBgIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === currentBgIndex ? 'w-8 bg-emerald-300' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 px-5 rounded-2xl flex items-center space-x-3 shadow-lg">
                  <span className="text-2xl">☀️</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{heroBackgrounds[currentBgIndex].temp}</span>
                      <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-400/30">
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/80 font-light">
                      {heroBackgrounds[currentBgIndex].location} · Ideal now
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Steps 1 to 7: Interactive Quiz Cards */}
        {step >= 1 && step <= 7 && currentQ && (
          <div className="max-w-md w-full mx-auto px-4 py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-1.5 text-[#059669] font-bold">
                <span>🌴</span>
                <span className="text-sm tracking-tight">CeylonPlanX</span>
              </div>
              <p className="text-xs font-semibold text-gray-400">Step {step} of 7</p>

              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-[#0F2C23] h-full transition-all duration-300" 
                  style={{ width: `${(step / 7) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#002B49] leading-snug">
                {currentQ.title}
              </h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {currentQ.subtitle}
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.value;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, opt.value)}
                    className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col items-center text-center space-y-2 ${
                      isSelected
                        ? 'border-[#002B49] bg-[#F3F7FA] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#002B49] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {opt.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#002B49] text-base">{opt.label}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 8: Result Section */}
        {step === 8 && result && (
          <div className="max-w-md w-full mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 text-center space-y-5">
              <span className="inline-block bg-emerald-100 text-[#059669] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                Optimal Season Found
              </span>
              <h2 className="text-2xl font-bold text-[#002B49]">{result.title}</h2>
              <p className="text-xs font-medium text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block">
                {result.subtitle} · {result.weather}
              </p>
              <p className="text-gray-600 text-xs leading-relaxed">{result.description}</p>

              <button
                onClick={() => setStep(0)}
                className="w-full bg-[#002B49] text-white py-3 rounded-2xl text-xs font-medium shadow-md hover:bg-opacity-95 transition mt-4"
              >
                Start Over 🔄
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Navigation Buttons (Quiz steps only) */}
      {step >= 1 && step <= 7 && (
        <footer className="bg-white border-t border-gray-100 p-4 sticky bottom-0 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
            >
              ‹ Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-[#002B49] text-white font-medium text-sm shadow-md hover:bg-opacity-95 transition"
            >
              {loading ? "Analyzing..." : step === 7 ? "Get Recommendation ✨" : "Next ›"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}