import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Zap, Lock, Globe, CheckCircle2, ArrowRight, Star, Users, TrendingUp, AlertTriangle, Target, Award, Play, Menu, X, Search, Camera, Smartphone, DollarSign } from "lucide-react";
// Boxicons CSS
import 'boxicons/css/boxicons.css';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">KARKA</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">How it Works</button>
                <button onClick={() => scrollToSection('why-karka')} className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Why KARKA</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Testimonials</button>
                <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Pricing</button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <Button 
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
              <button onClick={() => scrollToSection('features')} className="block text-slate-600 hover:text-slate-900 px-3 py-2 text-base font-medium w-full text-left">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="block text-slate-600 hover:text-slate-900 px-3 py-2 text-base font-medium w-full text-left">How it Works</button>
              <button onClick={() => scrollToSection('why-karka')} className="block text-slate-600 hover:text-slate-900 px-3 py-2 text-base font-medium w-full text-left">Why KARKA</button>
              <button onClick={() => scrollToSection('testimonials')} className="block text-slate-600 hover:text-slate-900 px-3 py-2 text-base font-medium w-full text-left">Testimonials</button>
              <button onClick={() => scrollToSection('pricing')} className="block text-slate-600 hover:text-slate-900 px-3 py-2 text-base font-medium w-full text-left">Pricing</button>
              <div className="pt-4 pb-3 border-t border-slate-200">
                <div className="flex items-center gap-3 px-3">
                  <Button 
                    onClick={() => navigate("/auth?mode=signup")}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  KARKA
                  <span className="text-secondary block mt-2">
                    Your Digital Identity Deserves Real Protection
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                  Creators and public figures are constantly exposed to impersonation, AI deepfakes and unauthorized reposts. 
                  KARKA helps you monitor where your likeness appears online and gives you a simple way to act on misuse.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-blue-800 font-medium text-sm">
                    Built for creators. Designed for the AI era.
                  </p>
                </div>
              </div>
              
              {/* Enhanced Hero CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Get Early Access
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-slate-600 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-medium text-slate-800">Trusted by creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="font-medium text-slate-800">Early access program</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-500 text-sm ml-4">KARKA Dashboard</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-secondary" />
                        <span className="font-semibold text-blue-800">Monitoring Active</span>
                      </div>
                      <p className="text-sm text-blue-700">Scanning for your digital likeness across platforms</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Identity Protected</span>
                      </div>
                      <p className="text-sm text-green-700">Your digital identity secured on CAMP Network</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-secondary" />
                        <span className="font-semibold text-slate-800">Ready for Action</span>
                      </div>
                      <p className="text-sm text-slate-700">One-click enforcement when needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Coverage */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Comprehensive Platform Protection
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              From <span className="text-secondary font-semibold">TikTok to YouTube</span>, from 
              <span className="text-secondary font-semibold"> Instagram to Twitter</span>, 
              KARKA monitors the platforms where your <span className="text-slate-900 font-semibold">digital identity matters most</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="bx bxl-twitter text-white text-xl"></i>
              </div>
              <p className="text-sm font-medium text-slate-900">Twitter/X</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="bx bxl-youtube text-white text-xl"></i>
              </div>
              <p className="text-sm font-medium text-slate-900">YouTube</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="bx bxl-tiktok text-white text-xl"></i>
              </div>
              <p className="text-sm font-medium text-slate-900">TikTok</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="bx bxl-instagram text-white text-xl"></i>
              </div>
              <p className="text-sm font-medium text-slate-900">Instagram</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-slate-600">
              + 44 more platforms monitored continuously with <span className="text-secondary font-semibold">AI-powered precision</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - What KARKA Does */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              What KARKA Does
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              A lightweight identity shield for the modern creator
            </p>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-12">
              KARKA scans key platforms for signs of misuse, alerts you when something suspicious appears and helps you respond quickly.
              Early-stage, practical and focused on what matters most: awareness and simple enforcement.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">KARKA helps you:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Track where your face, name or content appears.</p>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Detect possible impersonation or reposts.</p>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Keep a record of violations for future action.</p>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Send a quick, auto-generated takedown or warning message.</p>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 md:col-span-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Anchor your identity hash on-chain for proof of authenticity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              How It Works (3-Step Flow)
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Search className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Register Your Identity</h3>
                <p className="text-slate-600 text-center mb-6">
                  Upload a few clear photos or short videos. We generate a secure hash of your identity and anchor it on the CAMP Network.
                </p>
              </div>
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-300"></div>
            </div>

            <div className="relative">
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Eye className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Monitoring Begins</h3>
                <p className="text-slate-600 text-center mb-6">
                  KARKA checks priority platforms for lookalike content, similar profiles and potential misuse.
                </p>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 font-medium">
                    For the MVP, we focus on a limited set of platforms to ensure quality.
                  </p>
                </div>
              </div>
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-300"></div>
            </div>

            <div className="relative">
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">You Take Action</h3>
                <p className="text-slate-600 text-center mb-4">
                  If something looks suspicious, you'll see it instantly.
                </p>
                <p className="text-slate-600 text-center mb-6">
                  Ignore it, mark the source as safe or send an automated takedown-style message.
                </p>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 font-medium text-center">
                    Simple, fast and creator-friendly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Now */}
      <section id="why-karka" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why This Matters Now
            </h2>
            <h3 className="text-2xl font-semibold text-secondary mb-8">The rise of AI-generated identity abuse</h3>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-12">
              AI tools make it incredibly easy to copy someone's face or voice. That has led to a sharp increase in scams, 
              fake accounts and untraceable repost networks.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h4 className="text-xl font-bold text-slate-900 mb-8 text-center">A few highlights:</h4>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-700">
                  • Deepfake-related fraud grew significantly in 2024 (source: various cybersecurity reports).
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-700">
                  • Creators report losing revenue from reposted content across TikTok, YouTube and Instagram.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-700">
                  • Most creators don't have any system to monitor their online identity.
                </p>
              </div>
            </div>
            <div className="text-center mt-12">
              <p className="text-xl font-semibold text-slate-900">
                KARKA aims to close that gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built With Privacy First */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Built With Privacy First
            </h2>
            <h3 className="text-2xl font-semibold text-secondary mb-8">On-chain identity hashing for verification, not exposure</h3>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-12">
              Your photos never leave our system.
              The only thing stored on-chain is a cryptographic hash, which acts as a proof-of-origin stamp when you need to validate your identity.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h4 className="text-xl font-bold text-slate-900 mb-8 text-center">This helps in:</h4>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Establishing provenance</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Supporting takedown requests</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Showing evidence when reporting impersonation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early User Stories */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Early User Stories
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Credible, Not Exaggerated
            </p>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto">
              Creators are already facing this problem
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <blockquote className="text-slate-700 mb-6 italic text-lg">
                "Someone reposted my video with my name removed. I didn't even know until a friend sent it. Tools like this would save time and stress."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CC</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Content Creator</p>
                  <p className="text-slate-600 text-sm">85k followers</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <blockquote className="text-slate-700 mb-6 italic text-lg">
                "I deal with fake profiles pretending to be me almost weekly. A simple alert system would help me stay ahead."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AT</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Artist</p>
                  <p className="text-slate-600 text-sm">120k followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Building For */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Who We're Building For
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              KARKA is designed for:
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Creators</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Influencers</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Public figures</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Digital entrepreneurs</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-secondary mt-1" />
                  <p className="text-slate-700">Anyone whose voice or face is part of their brand</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-medium italic text-slate-900">
                Don't let <span className="text-secondary font-semibold">impersonators win</span>. 
                Your digital identity deserves <span className="text-secondary font-semibold">real protection</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Join the Early Access Program
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're currently onboarding a limited number of creators while we expand platform support.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creator Preview */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Creator Preview</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-secondary">Free</span>
                  <span className="text-slate-600"> (during early access)</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Identity registration</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Monitoring on core platforms</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Basic alert dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Limited automated actions</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/auth?mode=signup")}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
              >
                Join Waitlist
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-secondary text-white px-4 py-1">
                  Coming Soon
                </Badge>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-secondary">TBD</span>
                  <span className="text-slate-600"> (coming soon)</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Expanded platform coverage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Faster scanning</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Advanced enforcement tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Priority notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-slate-700">Detailed reporting</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/auth?mode=signup")}
                className="w-full bg-slate-200 text-slate-600 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
              Your identity is part of your story. 
              <span className="text-secondary block">Keep it in your control.</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Get early access and help shape KARKA as we build the future of digital identity protection.
            </p>
            
            {/* Final CTA */}
            <div className="flex justify-center items-center pt-6">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Join Early Access
                <Shield className="h-5 w-5 ml-2" />
              </Button>
            </div>
            

          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">KARKA</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Protecting digital identities with AI-powered monitoring and automated enforcement. 
                The only defense creators need against impersonation and identity theft.
              </p>
              <div className="flex gap-4">
                <div className="text-sm">
                  <p className="text-slate-400">Email</p>
                  <p className="text-white">hello@karka.com</p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-400">Support</p>
                  <p className="text-white">support@karka.com</p>
                </div>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 KARKA. All rights reserved. Protecting creators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

