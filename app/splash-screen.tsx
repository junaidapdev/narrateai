"use client"

import { useEffect, useState, useRef } from "react"
import { Mic, Check, ArrowRight, Play, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visibleElements, setVisibleElements] = useState(new Set())
  const router = useRouter()
  const statsRef = useRef(null)
  const [animatedNumbers, setAnimatedNumbers] = useState({
    timeSaved: 0,
    engagement: 0,
    founders: 0
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.id))
            
            // Trigger number animation for stats
            if (entry.target.id === 'stats-section') {
              animateNumbers()
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const animateNumbers = () => {
    const duration = 2000
    const steps = 50
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedNumbers({
        timeSaved: Math.floor(93 * progress),
        engagement: Math.floor(5 * progress),
        founders: Math.floor(2847 * progress)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)
  }

  const handleGetStarted = () => {
    router.push("/onboarding")
  }

  const handleWatchDemo = () => {
    alert('Demo video coming soon! For now, start your free trial to experience the magic.')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 py-4' 
          : 'bg-white/95 backdrop-blur-md py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold tracking-tight">FounderVoice</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6">
            <button
              onClick={handleGetStarted}
              className="w-full px-5 py-3 bg-black text-white text-sm font-medium rounded-lg"
            >
              Start Free Trial
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 uppercase tracking-wide mb-6">
            Transform Your LinkedIn Presence
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="inline-block bg-black text-white px-3 py-1 rounded-lg mx-1">30 Minutes</span>
            <br />
            = 7 Days of Content
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop spending hours crafting LinkedIn posts. Share your thoughts once a week, 
            and watch your personal brand grow on autopilot.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Get Started - It's Free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={handleWatchDemo}
              className="px-8 py-4 bg-white text-black font-medium rounded-lg border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div 
            id="stats-section"
            ref={statsRef}
            className="animate-on-scroll flex flex-wrap justify-center gap-12 md:gap-20 mt-20"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {animatedNumbers.timeSaved}%
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-medium">
                Time Saved
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {animatedNumbers.engagement}x
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-medium">
                More Engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {animatedNumbers.founders.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-medium">
                Founders Growing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Why Founders Choose FounderVoice
            </h2>
            <p className="text-lg text-gray-600">
              We turn your expertise into engaging content that builds authority
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                id={`feature-${index}`}
                className={`animate-on-scroll bg-white rounded-lg border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all hover:-translate-y-0.5 ${
                  visibleElements.has(`feature-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              From conversation to content in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connector Line - Desktop Only */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gray-200" />
            
            {steps.map((step, index) => (
              <div
                key={index}
                id={`step-${index}`}
                className={`animate-on-scroll text-center relative ${
                  visibleElements.has(`step-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 relative z-10">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Founders Are Thriving
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands who've transformed their LinkedIn presence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                id={`testimonial-${index}`}
                className={`animate-on-scroll bg-white rounded-lg border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all ${
                  visibleElements.has(`testimonial-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-700">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Your Voice Deserves to Be Heard
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Stop letting great insights go unshared. Start building your personal brand 
            with just 30 minutes a week.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 text-lg"
          >
            Start Your Free Week
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 FounderVoice. Empowering founders to share their story.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Data
const features = [
  {
    icon: "🎙️",
    title: "Just Talk, We Listen",
    description: "No typing, no editing. Just share your thoughts naturally in a 30-minute conversation, and our AI captures your unique voice and insights."
  },
  {
    icon: "✨",
    title: "AI That Gets You",
    description: "Our AI doesn't just transcribe - it understands your industry, your tone, and your audience to create content that sounds authentically you."
  },
  {
    icon: "📅",
    title: "Week-Long Strategy",
    description: "Get a strategic mix of thought leadership posts, industry insights, personal stories, and engagement hooks - all from one conversation."
  },
  {
    icon: "📈",
    title: "Optimized for Growth",
    description: "Every post is crafted with LinkedIn's algorithm in mind, using proven frameworks that maximize reach and engagement."
  },
  {
    icon: "🎯",
    title: "Your Voice, Amplified",
    description: "We maintain your authentic voice while adding the polish and structure that makes content shareable and memorable."
  },
  {
    icon: "⚡",
    title: "Ready to Post",
    description: "Get perfectly formatted posts with hashtags, hooks, and CTAs. Just copy, paste, and watch your influence grow."
  }
]

const steps = [
  {
    title: "Schedule Your Talk",
    description: "Book a 30-minute slot that fits your schedule. Our AI interviewer will guide you through thought-provoking questions."
  },
  {
    title: "Share Your Insights",
    description: "Talk about your industry, share stories, discuss trends. No prep needed - just be yourself."
  },
  {
    title: "Get Your Content",
    description: "Within 24 hours, receive 7 polished LinkedIn posts ready to schedule and share."
  }
]

const testimonials = [
  {
    content: "I went from posting once a month to daily. My network grew by 400% and I've closed 3 major deals from LinkedIn connections.",
    name: "Sarah Kim",
    title: "Founder, TechFlow",
    initials: "SK"
  },
  {
    content: "The AI captures my voice perfectly. My team couldn't believe I didn't write the posts myself. Game-changer for busy founders.",
    name: "Marcus Rodriguez",
    title: "CEO, ScaleUp Labs",
    initials: "MR"
  },
  {
    content: "30 minutes on Sunday, content for the entire week. I've become a thought leader in my space without the time investment.",
    name: "Aisha Patel",
    title: "Founder, GreenTech Solutions",
    initials: "AP"
  }
]
