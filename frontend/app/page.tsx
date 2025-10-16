"use client";

import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  CheckCircle, 
  DollarSign,
  Wallet,
  BarChart3,
  Lock,
  Globe,
  Target,
  Star,
  Play,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  // Animated counter hook
  const useAnimatedCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime: number;
      const startValue = 0;
      const endValue = end;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [end, duration]);
    
    return count;
  };

  // Intersection observer for animations
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only run intersection observer on client side
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      observer.observe(heroElement);
    }
    
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "All transactions and yields are recorded on-chain with full transparency. Your funds are secured by smart contracts."
    },
    {
      icon: TrendingUp,
      title: "Multi-Strategy Yield",
      description: "Diversify across 3 optimized strategies: sBTC Staking (8% APY), STX Lending (6.5% APY), and Liquidity Pools (12% APY)."
    },
    {
      icon: Zap,
      title: "Automated Harvesting",
      description: "Our automated harvester maximizes your returns by regularly compounding yields across all strategies."
    },
    {
      icon: BarChart3,
      title: "Flexible Allocation",
      description: "Customize your risk profile by allocating funds across strategies based on your preferences and risk tolerance."
    },
    {
      icon: Lock,
      title: "Non-Custodial",
      description: "You maintain full control of your funds. No middleman, no centralized custody - just pure DeFi."
    },
    {
      icon: Globe,
      title: "Built on Stacks",
      description: "Leveraging the security and decentralization of Bitcoin through the Stacks blockchain for maximum reliability."
    }
  ];

  const strategies = [
    {
      name: "sBTC Staking",
      apy: "8.0%",
      risk: "Low",
      icon: "₿",
      description: "Earn rewards by participating in Bitcoin's security through sBTC staking mechanisms.",
      color: "bg-blue-500"
    },
    {
      name: "STX Lending",
      apy: "6.5%",
      risk: "Low", 
      icon: "Ӿ",
      description: "Provide liquidity to the Stacks ecosystem and earn consistent lending rewards.",
      color: "bg-green-500"
    },
    {
      name: "Liquidity Pool",
      apy: "12.0%",
      risk: "Medium",
      icon: "💧", 
      description: "Participate in high-yield liquidity pools with enhanced returns and moderate risk.",
      color: "bg-purple-500"
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "$2.4M", icon: DollarSign, numeric: 2400000 },
    { label: "Active Users", value: "1,247", icon: Users, numeric: 1247 },
    { label: "Average APY", value: "8.8%", icon: TrendingUp, numeric: 8.8 },
    { label: "Strategies", value: "3", icon: Target, numeric: 3 }
  ];

  // Animated counters
  const tvlCount = useAnimatedCounter(2400000, 2500);
  const usersCount = useAnimatedCounter(1247, 2000);
  const apyCount = useAnimatedCounter(8.8, 1500);
  const strategiesCount = useAnimatedCounter(3, 1000);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "StacksHaven",
    "description": "The Ultimate Yield Aggregator on Stacks - Maximize your STX returns with automated yield farming across multiple strategies.",
    "url": "https://stackshaven.com",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "2% performance fee only"
    },
    "provider": {
      "@type": "Organization",
      "name": "StacksHaven",
      "url": "https://stackshaven.com"
    },
    "featureList": [
      "Automated yield optimization",
      "Multi-strategy diversification",
      "Transparent on-chain accounting",
      "Non-custodial fund management",
      "Regular yield compounding"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="space-y-20" role="main">
      {/* Enhanced Hero Section */}
      <section id="hero-section" className="relative text-center space-y-12 py-20 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20" role="banner" aria-label="Trust badge">
            <Sparkles className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-medium text-white">Trusted by 1,247+ DeFi users</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
            <span className="text-white">Stacks</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Haven</span>
          </h1>
            
            <div className="space-y-4">
              <p className="text-xl sm:text-2xl md:text-3xl text-purple-100 leading-relaxed font-light px-4">
            The Ultimate Yield Aggregator on Stacks
          </p>
              <p className="text-base sm:text-lg md:text-xl text-purple-200 max-w-4xl mx-auto leading-relaxed px-4">
            Maximize your STX returns with automated yield farming across multiple strategies. 
            Deposit once, allocate smartly, and watch your vault shares grow through transparent, 
            on-chain yield generation.
          </p>
            </div>
        </div>
        
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4">
          <Link
            href="/app"
              className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:from-blue-700 focus:to-blue-800 text-white font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              aria-label="Start earning yield by launching the app"
          >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            Start Earning Yield
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
            
            <button 
              className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white/10 hover:bg-white/20 focus:bg-white/20 text-white border border-white/20 font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
              aria-label="Watch a demonstration of the platform"
            >
              <Play className="w-5 h-5" aria-hidden="true" />
              Watch Demo
            </button>
        </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto pt-12 sm:pt-16 px-4">
            {[
              { label: "Total Value Locked", value: `$${(tvlCount / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-green-400" },
              { label: "Active Users", value: usersCount.toLocaleString(), icon: Users, color: "text-blue-400" },
              { label: "Average APY", value: `${apyCount.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-400" },
              { label: "Strategies", value: strategiesCount.toString(), icon: Target, color: "text-orange-400" }
            ].map((stat, index) => (
              <div key={index} className="group text-center space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} transition-all duration-500`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-purple-300 font-medium leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-8">
            <a 
              href="#how-it-works" 
              className="group animate-bounce focus:outline-none focus:ring-4 focus:ring-white/30 rounded-full p-2"
              aria-label="Scroll down to learn how it works"
            >
              <ChevronDown className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" aria-hidden="true" />
            </a>
            </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section id="how-it-works" className="relative space-y-20 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-400/30">
              <span className="text-blue-400 font-semibold">How It Works</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              Simple, Secure, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automated</span>
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Start earning yield in three simple steps. No complex DeFi knowledge required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: Wallet,
                title: "Deposit STX",
                description: "Connect your wallet and deposit your STX tokens into our secure vault. Your funds remain under your control at all times.",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-400/30"
              },
              {
                step: "02", 
                icon: Target,
                title: "Allocate Strategies",
                description: "Choose how to distribute your funds across our three yield strategies. Customize your risk profile and expected returns.",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-400/30"
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Earn Automatically",
                description: "Our automated harvester compounds your yields regularly. Watch your vault shares grow with transparent, on-chain accounting.",
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-400/30"
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-400/30 via-green-400/30 to-purple-400/30 transform translate-x-6"></div>
                )}
                
                <div className={`relative p-8 rounded-3xl ${item.bgColor} border ${item.borderColor} backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                    <span className="text-lg font-bold text-white">{item.step}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Content */}
          <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                    <p className="text-purple-200 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/5 rounded-full"></div>
                </div>
            </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Link
              href="/app"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Strategies */}
      <section className="relative space-y-20 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-400/30">
              <span className="text-purple-400 font-semibold">Yield Strategies</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              Maximize Returns with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Smart Allocation</span>
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Diversify your portfolio across three carefully selected yield opportunities, each optimized for different risk profiles.
          </p>
        </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {strategies.map((strategy, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${strategy.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Header */}
                  <div className="relative flex items-center justify-between mb-6">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {strategy.icon}
                    </div>
                  <div className="text-right">
                      <div className="text-4xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                        {strategy.apy}
                      </div>
                      <div className="text-sm text-purple-300 font-medium">APY</div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative space-y-4">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                      {strategy.name}
                    </h3>
                    <p className="text-purple-200 leading-relaxed group-hover:text-purple-100 transition-colors">
                      {strategy.description}
                    </p>
                    
                    {/* Risk Badge */}
                    <div className="flex items-center gap-3 pt-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        strategy.risk === 'Low' 
                          ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                      } group-hover:scale-105 transition-transform duration-300`}>
                        {strategy.risk} Risk
                      </span>
                      
                      {/* Additional Info */}
                      <div className="flex items-center gap-1 text-xs text-purple-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Optimized</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Strategy Comparison */}
          <div className="mt-20 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-white">Why This Combination Works</h3>
              <p className="text-purple-200 max-w-3xl mx-auto">
                Our three-strategy approach balances security, consistency, and growth potential to maximize your overall returns while minimizing risk.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white">Stability</h4>
                  <p className="text-sm text-purple-300">Low-risk strategies provide consistent returns</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white">Growth</h4>
                  <p className="text-sm text-purple-300">Higher-yield opportunities boost overall performance</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white">Diversification</h4>
                  <p className="text-sm text-purple-300">Spread risk across multiple yield sources</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features */}
      <section className="relative space-y-20 py-20">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full border border-indigo-400/30">
              <span className="text-indigo-400 font-semibold">Why Choose StacksHaven?</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Excellence</span>
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Every feature is designed with security, transparency, and user experience at its core.
          </p>
        </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-purple-200 leading-relaxed group-hover:text-purple-100 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="relative space-y-20 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-400/30">
              <span className="text-green-400 font-semibold">Trusted by Users</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Community</span> Says
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who are already maximizing their STX returns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Alex Chen",
                role: "DeFi Enthusiast",
                avatar: "AC",
                content: "StacksHaven has been a game-changer for my STX holdings. The automated harvesting saves me hours of manual work, and the yields are consistently impressive.",
                rating: 5
              },
              {
                name: "Sarah Martinez",
                role: "Crypto Investor",
                avatar: "SM",
                content: "I love how transparent everything is. I can see exactly where my funds are allocated and track my earnings in real-time. No hidden surprises!",
                rating: 5
              },
              {
                name: "David Kim",
                role: "Portfolio Manager",
                avatar: "DK",
                content: "The multi-strategy approach is brilliant. I can customize my risk profile while still getting great returns. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="group relative">
                <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <blockquote className="text-purple-200 leading-relaxed mb-6 group-hover:text-purple-100 transition-colors">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-purple-300">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: "Security Audited", value: "100%" },
              { label: "Uptime", value: "99.9%" },
              { label: "User Satisfaction", value: "4.9/5" },
              { label: "Funds Protected", value: "$2.4M+" }
            ].map((indicator, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-400">{indicator.value}</div>
                <div className="text-sm text-purple-300">{indicator.label}</div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Enhanced Benefits/CTA */}
      <section className="relative space-y-20 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative text-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Yield Journey</span> Today
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Join thousands of users already earning passive income with StacksHaven. 
                  No complex setup, no hidden fees, just pure yield optimization.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 text-left max-w-5xl mx-auto">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                What You Get
              </h3>
                  <ul className="space-y-3 text-purple-200">
                    {[
                      "Automated yield optimization",
                      "Multi-strategy diversification", 
                      "Transparent on-chain accounting",
                      "Non-custodial fund management",
                      "Regular yield compounding"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
              </ul>
            </div>
            
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    Transparent Pricing
              </h3>
                  <ul className="space-y-3 text-purple-200">
                    {[
                      "Only 2% performance fee",
                      "No deposit or withdrawal fees",
                      "No hidden costs",
                      "Transparent fee structure",
                      "Gas fees only for transactions"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/app"
                  className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl transition-all duration-300 inline-flex items-center gap-3 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
            >
                  <Sparkles className="w-6 h-6" />
              Launch App & Start Earning
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative text-center space-y-12 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Maximize</span> Your STX?
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
          Join StacksHaven today and start earning competitive yields on your STX holdings 
          with our automated, transparent, and secure yield aggregation platform.
        </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Link
          href="/app"
              className="group px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl transition-all duration-300 inline-flex items-center gap-3 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
        >
              <Sparkles className="w-6 h-6" />
          Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
            
            <button className="px-12 py-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xl transition-all duration-300 flex items-center gap-3 backdrop-blur-sm hover:scale-105">
              <Play className="w-6 h-6" />
              Watch Demo
            </button>
          </div>
          
          {/* Final Trust Indicators */}
          <div className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">$2.4M+</div>
              <div className="text-sm text-purple-300">TVL</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">1,247+</div>
              <div className="text-sm text-purple-300">Users</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-400">8.8%</div>
              <div className="text-sm text-purple-300">Avg APY</div>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}