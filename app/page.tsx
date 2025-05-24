"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [animatedStats, setAnimatedStats] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      // Trigger stats animation when scrolled to stats section
      const statsSection = document.querySelector(".stats")
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.75 && !animatedStats) {
          setAnimatedStats(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [animatedStats])

  const handleGetStarted = () => {
    router.push("/onboarding")
  }

  const handleWatchDemo = () => {
    // Demo video functionality would go here
    alert("Demo video coming soon! For now, start your free trial to experience the magic.")
  }

  // Animation for stats
  const StatNumber = ({ end, suffix = "", duration = 2000 }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      if (!animatedStats) return

      let startTime: number | null = null
      const startValue = 0

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setCount(Math.floor(progress * (end - startValue) + startValue))

        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }

      window.requestAnimationFrame(step)
    }, [animatedStats, end, duration])

    return (
      <div className="stat-number">
        {count}
        {suffix}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full py-5 bg-white/95 backdrop-blur-md z-50 transition-all duration-300 ${
          scrolled ? "py-4 border-b border-gray-200" : "border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">AudioBrand</div>
          <Button
            className="bg-black text-white hover:bg-gray-800 rounded-lg transition-all hover:-translate-y-0.5"
            onClick={handleGetStarted}
          >
            Start Free Trial
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-gray-100 px-4 py-1.5 rounded-full text-xs font-medium text-gray-700 uppercase tracking-wide mb-6">
            Transform Your LinkedIn Presence
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            <span className="inline-block bg-black text-white px-3 py-1 rounded-lg mx-1">30 Minutes</span>
            <br />= 7 Days of Content
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop spending hours crafting LinkedIn posts. Share your thoughts once a week, and watch your personal brand
            grow on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-8 py-6 text-base font-medium transition-all hover:-translate-y-0.5"
              onClick={handleGetStarted}
            >
              Get Started - It's Free
            </Button>

            <Button
              variant="outline"
              className="bg-transparent text-black border-2 border-gray-300 hover:border-black hover:bg-gray-50 rounded-lg px-8 py-6 text-base font-medium flex items-center justify-center gap-2"
              onClick={handleWatchDemo}
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="stats flex justify-center gap-12 md:gap-20 flex-wrap">
            <div className="stat text-center">
              {animatedStats ? <StatNumber end={93} suffix="%" /> : <div className="stat-number">0%</div>}
              <div className="stat-label text-xs text-gray-500 uppercase tracking-wider font-medium">Time Saved</div>
            </div>

            <div className="stat text-center">
              {animatedStats ? <StatNumber end={5} suffix="x" /> : <div className="stat-number">0x</div>}
              <div className="stat-label text-xs text-gray-500 uppercase tracking-wider font-medium">
                More Engagement
              </div>
            </div>

            <div className="stat text-center">
              {animatedStats ? <StatNumber end={2847} /> : <div className="stat-number">0</div>}
              <div className="stat-label text-xs text-gray-500 uppercase tracking-wider font-medium">
                Founders Growing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Why Founders Choose AudioBrand</h2>
            <p className="text-xl text-gray-600">We turn your expertise into engaging content that builds authority</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎙️",
                title: "Just Talk, We Listen",
                description:
                  "No typing, no editing. Just share your thoughts naturally in a 30-minute conversation, and our AI captures your unique voice and insights.",
              },
              {
                icon: "✨",
                title: "AI That Gets You",
                description:
                  "Our AI doesn't just transcribe - it understands your industry, your tone, and your audience to create content that sounds authentically you.",
              },
              {
                icon: "📅",
                title: "Week-Long Strategy",
                description:
                  "Get a strategic mix of thought leadership posts, industry insights, personal stories, and engagement hooks - all from one conversation.",
              },
              {
                icon: "📈",
                title: "Optimized for Growth",
                description:
                  "Every post is crafted with LinkedIn's algorithm in mind, using proven frameworks that maximize reach and engagement.",
              },
              {
                icon: "🎯",
                title: "Your Voice, Amplified",
                description:
                  "We maintain your authentic voice while adding the polish and structure that makes content shareable and memorable.",
              },
              {
                icon: "⚡",
                title: "Ready to Post",
                description:
                  "Get perfectly formatted posts with hashtags, hooks, and CTAs. Just copy, paste, and watch your influence grow.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white border border-gray-200 rounded-lg p-10 transition-all hover:border-gray-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-600">From conversation to content in three simple steps</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connector line (hidden on mobile) */}
            <div className="absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200 hidden md:block"></div>

            {[
              {
                number: "1",
                title: "Schedule Your Talk",
                description:
                  "Book a 30-minute slot that fits your schedule. Our AI interviewer will guide you through thought-provoking questions.",
              },
              {
                number: "2",
                title: "Share Your Insights",
                description:
                  "Talk about your industry, share stories, discuss trends. No prep needed - just be yourself.",
              },
              {
                number: "3",
                title: "Get Your Content",
                description: "Within 24 hours, receive 7 polished LinkedIn posts ready to schedule and share.",
              },
            ].map((step, index) => (
              <div key={index} className="step text-center relative z-10">
                <div className="step-number w-20 h-20 border-3 border-black rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 bg-white">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Founders Are Thriving</h2>
            <p className="text-xl text-gray-600">Join thousands who've transformed their LinkedIn presence</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                content:
                  "I went from posting once a month to daily. My network grew by 400% and I've closed 3 major deals from LinkedIn connections.",
                avatar: "SK",
                name: "Sarah Kim",
                title: "Founder, TechFlow",
              },
              {
                content:
                  "The AI captures my voice perfectly. My team couldn't believe I didn't write the posts myself. Game-changer for busy founders.",
                avatar: "MR",
                name: "Marcus Rodriguez",
                title: "CEO, ScaleUp Labs",
              },
              {
                content:
                  "30 minutes on Sunday, content for the entire week. I've become a thought leader in my space without the time investment.",
                avatar: "AP",
                name: "Aisha Patel",
                title: "Founder, GreenTech Solutions",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="testimonial bg-white border border-gray-200 rounded-lg p-8 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-700">
                    {testimonial.avatar}
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
      <section className="final-cta py-32 px-6 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Your Voice Deserves to Be Heard</h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Stop letting great insights go unshared. Start building your personal brand with just 30 minutes a week.
          </p>
          <Button
            className="bg-white text-black hover:bg-gray-100 rounded-lg px-10 py-6 text-lg font-medium transition-all hover:-translate-y-0.5"
            onClick={handleGetStarted}
          >
            Start Your Free Week
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 text-center">
        <div className="max-w-7xl mx-auto text-gray-500 text-sm">
          <p>&copy; 2025 AudioBrand. Empowering founders to share their story.</p>
        </div>
      </footer>
    </div>
  )
}
