import { Download, Code, Camera, Brain, Shield, Zap, ArrowRight, Check, CreditCard, Activity, Settings, Timer, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Silently AI installer is being prepared for download..."
    });
    console.log("Download button clicked");
  };
  const handlePricing = () => {
    document.getElementById('pricing')?.scrollIntoView({
      behavior: 'smooth'
    });
    toast({
      title: "Viewing Pricing",
      description: "Check out our transparent pricing plans below"
    });
  };
  const handlePlanSelect = (planName: string, price: string) => {
    toast({
      title: `${planName} Plan Selected`,
      description: `You selected the ${planName} plan at ${price}. Redirecting to payment...`
    });
    console.log(`Selected plan: ${planName} at ${price}`);
  };
  const handleContactUs = () => {
    toast({
      title: "Contact Us",
      description: "Opening contact form..."
    });
    console.log("Contact us clicked");
  };
  const handleSocialLink = (platform: string) => {
    toast({
      title: `Opening ${platform}`,
      description: `Redirecting to ${platform} page...`
    });
    console.log(`${platform} link clicked`);
  };
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  const handleLogin = () => {
    navigate('/auth');
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 circuit-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 tech-border border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg neon-glow"></div>
              <span className="text-white font-bold text-xl neon-text">Silently AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-cyan-400 transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-cyan-400 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-slate-300 hover:text-cyan-400 transition-colors">FAQ</button>
              {user ? <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 neon-glow">
                  Dashboard
                </Button> : <Button onClick={handleLogin} variant="outline" className="tech-border text-cyan-400 hover:bg-cyan-500/10">
                  Login
                </Button>}
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Convert Anything to
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent neon-text mx-0 px-0 font-bold py-[10px]">Silently AI
            </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Screenshots, text, aptitude problems - transform them into working code instantly. 
              Undetectable typing simulation for seamless coding tests.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold neon-glow transform hover:scale-105 transition-all duration-200">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => scrollToSection('pricing')} variant="outline" size="lg" className="tech-border text-cyan-400 hover:bg-cyan-500/10 px-8 py-4 text-lg font-semibold">
              View Pricing
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400 px-4">
            <div className="flex items-center gap-2">
              <Check className="h-3 md:h-4 w-3 md:w-4 text-cyan-400" />
              <span>Works 100% offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 md:h-4 w-3 md:w-4 text-cyan-400" />
              <span>Undetectable typing simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 md:h-4 w-3 md:w-4 text-cyan-400" />
              <span>Instant kill switch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
              Stealth Features That Actually Work
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 md:px-0">
              Built for students, freelancers, and professionals who need results without detection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[{
            icon: Code,
            emoji: "⚡",
            title: "Text → Code Magic",
            description: "Select any text problem statement and instantly get clean, working code solutions",
            gradient: "from-cyan-500/20 to-blue-500/20"
          }, {
            icon: Camera,
            emoji: "📸",
            title: "Screenshot → Implementation",
            description: "Upload any UI screenshot or long image and get pixel-perfect code implementation",
            gradient: "from-blue-500/20 to-indigo-500/20"
          }, {
            icon: Brain,
            emoji: "🧠",
            title: "Aptitude Problem Solver",
            description: "Crack quantitative aptitude, logical reasoning, and coding problems in seconds",
            gradient: "from-indigo-500/20 to-purple-500/20"
          }, {
            icon: Timer,
            emoji: "⌨️",
            title: "Human-Like Typing",
            description: "AI types your solutions with natural delays and corrections to avoid detection",
            gradient: "from-purple-500/20 to-pink-500/20"
          }, {
            icon: Shield,
            emoji: "🔒",
            title: "Master Kill Switch",
            description: "Press Ctrl+Shift+K to instantly hide all AI activity and return to normal work",
            gradient: "from-pink-500/20 to-red-500/20"
          }, {
            icon: Zap,
            emoji: "💾",
            title: "100% Offline Mode",
            description: "Download as .exe and work completely offline when internet monitoring is strict",
            gradient: "from-red-500/20 to-cyan-500/20"
          }].map((feature, index) => <Card key={index} className="tech-border hover:neon-glow transition-all duration-500 group rounded-2xl overflow-hidden">
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className={`w-12 md:w-16 h-12 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 pulse-glow`}>
                      <span className="text-xl md:text-2xl">{feature.emoji}</span>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-950/50 text-cyan-300 border-cyan-400/30 text-xs">
                      Core Feature
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg md:text-xl group-hover:text-cyan-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
            Get Started in 3 Minutes
          </h2>
          <div className="space-y-8 md:space-y-12">
            {[{
            step: "01",
            title: "Download & Install",
            description: "Get the .exe file and install Silently AI on your Windows desktop. No admin rights needed.",
            action: "Download takes 2 minutes"
          }, {
            step: "02",
            title: "Choose Your Plan",
            description: "Start free with shortcut access or upgrade to Pro/Advanced for full API access and premium features.",
            action: "Plans start at ₹800/month"
          }, {
            step: "03",
            title: "Work in Stealth Mode",
            description: "Select text, capture screens, or input problems. Get instant AI solutions with undetectable typing simulation.",
            action: "Ready to use immediately"
          }].map((item, index) => <div key={index} className="flex flex-col md:flex-row items-start gap-6 md:gap-8 group">
                <div className="flex-shrink-0 w-16 md:w-20 h-16 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 tech-border flex items-center justify-center text-cyan-300 font-bold text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300 mx-auto md:mx-0 pulse-glow">
                  {item.step}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <h3 className="text-xl md:text-2xl font-semibold text-white group-hover:text-cyan-200 transition-colors">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="bg-green-950/50 text-green-300 border-green-400/30 text-xs">
                      {item.action}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text">
              Fair & Transparent Pricing
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto px-4 md:px-0">
              No yearly lock-ins. No hidden fees. Pay for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[{
            name: "Free",
            price: "₹0",
            period: "/forever",
            description: "Basic access via keyboard shortcuts",
            features: ["Shortcut-only access", "Limited daily use", "Basic text-to-code", "Community support"],
            buttonText: "Download Free",
            popular: false,
            badge: "Perfect for trying out"
          }, {
            name: "Pro",
            price: "₹800",
            period: "/month",
            description: "100 API calls included",
            features: ["100 API calls/month", "All core features", "Priority typing simulation", "Email support", "Offline mode"],
            buttonText: "Start Pro",
            popular: true,
            badge: "Most Popular"
          }, {
            name: "Advanced",
            price: "₹2000",
            period: "/month",
            description: "300 API calls + premium features",
            features: ["300 API calls/month", "Advanced aptitude solver", "Batch screenshot processing", "Custom shortcuts", "Premium support"],
            buttonText: "Go Advanced",
            popular: false,
            badge: "Best Value"
          }, {
            name: "Top-Up",
            price: "₹10",
            period: "/call",
            description: "Add credits anytime",
            features: ["Pay per API call", "No monthly commitment", "Add to any plan", "Perfect for heavy usage"],
            buttonText: "Buy Credits",
            popular: false,
            badge: "Flexible"
          }].map((plan, index) => <Card key={index} className={`relative rounded-2xl overflow-hidden tech-border transition-all duration-500 hover:neon-glow ${plan.popular ? 'bg-gradient-to-b from-cyan-950/80 to-blue-950/80 border-cyan-400/50' : 'hover:border-cyan-400/50'}`}>
                {plan.popular}
                <CardHeader className="text-center pb-4 md:pb-6">
                  <div className="mb-3 md:mb-4">
                    <CardTitle className="text-lg md:text-xl text-white mb-2">{plan.name}</CardTitle>
                    <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-600/50 text-xs">
                      {plan.badge}
                    </Badge>
                  </div>
                  <div className="mb-3 md:mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm md:text-base">{plan.period}</span>
                  </div>
                  <p className="text-slate-300 text-xs md:text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <ul className="space-y-2 md:space-y-3">
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center gap-2 md:gap-3 text-slate-300 text-xs md:text-sm">
                        <Check className="h-3 md:h-4 w-3 md:w-4 text-cyan-400 flex-shrink-0" />
                        {feature}
                      </li>)}
                  </ul>
                  <Button onClick={() => handlePlanSelect(plan.name, plan.price + plan.period)} className={`w-full rounded-xl py-2 md:py-3 text-sm md:text-base font-semibold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:via-cyan-600 hover:to-blue-700 text-white neon-glow' : 'tech-border text-cyan-400 hover:bg-cyan-500/10'}`}>
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-slate-400 text-base md:text-lg px-4 md:px-0">
              All plans include <span className="text-cyan-300 font-semibold">undetectable typing simulation</span> and <span className="text-cyan-300 font-semibold">master kill switch</span>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text py-[10px] lg:text-5xl">Trusted by 10,000+ Users

        </h2>
          <p className="text-center text-slate-400 text-base md:text-lg mb-12 md:mb-16">Students, freelancers, and professionals love the stealth approach</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[{
            name: "Arjun K.",
            role: "CS Student, IIT Delhi",
            initials: "AK",
            quote: "Cracked 15+ OAs with Silently AI. The typing simulation is so natural, no one suspected anything.",
            plan: "Pro Plan"
          }, {
            name: "Priya S.",
            role: "Freelance Developer",
            initials: "PS",
            quote: "Screenshot-to-code feature saves me 4+ hours daily. Clients think I'm coding super fast!",
            plan: "Advanced Plan"
          }, {
            name: "Rohit M.",
            role: "Job Seeker",
            initials: "RM",
            quote: "Used it during 10+ technical interviews. The kill switch saved me twice when interviewer looked closely.",
            plan: "Top-up Credits"
          }].map((testimonial, index) => <Card key={index} className="tech-border rounded-2xl hover:neon-glow transition-all duration-500">
                <CardContent className="pt-6 md:pt-8">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-12 md:w-16 h-12 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-xl pulse-glow">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-base md:text-lg">{testimonial.name}</div>
                      <div className="text-slate-400 text-xs md:text-sm">{testimonial.role}</div>
                      <Badge variant="secondary" className="bg-cyan-950/50 text-cyan-300 border-cyan-400/30 text-xs mt-1">
                        {testimonial.plan}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic text-sm md:text-base">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 md:px-6 py-16 md:py-20 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent neon-text py-[10px] lg:text-5xl">Frequently Asked Questions

        </h2>
          
          
          <Accordion type="single" collapsible className="space-y-4 md:space-y-6">
            {[{
            value: "item-1",
            question: "How does the stealth typing feature actually work?",
            answer: "Our AI analyzes human typing patterns and replicates natural delays, corrections, and variations. It types at 45-65 WPM with realistic pauses, making it indistinguishable from human typing to monitoring software."
          }, {
            value: "item-2",
            question: "Can I use this during online exams and interviews?",
            answer: "Silently AI is designed to be undetectable, but always check your institution's/company's policies first. The master kill switch (Ctrl+Shift+K) instantly hides all activity if needed."
          }, {
            value: "item-3",
            question: "What happens when I run out of API calls?",
            answer: "You'll get notified when you have 10 calls remaining. You can instantly top-up with ₹10 per call or upgrade your plan. The app works offline for basic features even without API credits."
          }, {
            value: "item-4",
            question: "Is Razorpay payment safe and do you store card details?",
            answer: "We use Razorpay (India's leading payment gateway) for all transactions. We never store your card details - everything is handled securely by Razorpay with bank-level encryption."
          }, {
            value: "item-5",
            question: "Can I get refund if it doesn't work for my use case?",
            answer: "We offer a 7-day money-back guarantee for all paid plans. If Silently AI doesn't meet your expectations, contact support for a full refund within 7 days of purchase."
          }, {
            value: "item-6",
            question: "Does it work on Mac/Linux or only Windows?",
            answer: "Currently only Windows (.exe) is supported. Mac and Linux versions are in development. You can use Windows in a VM on Mac/Linux as a temporary solution."
          }].map((item, index) => <AccordionItem key={index} value={item.value} className="tech-border rounded-xl">
                <AccordionTrigger className="text-white hover:text-cyan-300 px-4 md:px-6 py-3 md:py-4 text-base md:text-lg font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 px-4 md:px-6 pb-4 md:pb-6 leading-relaxed text-sm md:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-12 md:py-16 border-t border-cyan-800/50 tech-border relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center neon-glow">
                  <Code className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white neon-text">Silently AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                The undetectable desktop AI tool for students, developers, and professionals who need results without detection.
              </p>
              <Badge variant="secondary" className="bg-green-950/50 text-green-300 border-green-400/30 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                10,000+ Active Users
              </Badge>
            </div>
            {[{
            title: "Product",
            links: [{
              name: "Download",
              action: handleDownload
            }, {
              name: "Features",
              action: () => scrollToSection('features')
            }, {
              name: "Pricing",
              action: handlePricing
            }, {
              name: "Roadmap",
              action: () => handleSocialLink("Roadmap")
            }]
          }, {
            title: "Support",
            links: [{
              name: "Help Center",
              action: handleContactUs
            }, {
              name: "API Docs",
              action: () => handleSocialLink("API Docs")
            }, {
              name: "Contact Us",
              action: handleContactUs
            }, {
              name: "Bug Reports",
              action: () => handleSocialLink("Bug Reports")
            }]
          }, {
            title: "Legal",
            links: [{
              name: "Privacy Policy",
              action: () => handleSocialLink("Privacy Policy")
            }, {
              name: "Terms of Service",
              action: () => handleSocialLink("Terms of Service")
            }, {
              name: "Refund Policy",
              action: () => handleSocialLink("Refund Policy")
            }, {
              name: "GDPR",
              action: () => handleSocialLink("GDPR")
            }]
          }].map((section, index) => <div key={index}>
                <h3 className="font-semibold text-white mb-4 md:mb-6 text-base md:text-lg">{section.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {section.links.map((link, linkIndex) => <li key={linkIndex}>
                      <button onClick={link.action} className="text-slate-400 hover:text-cyan-300 transition-colors text-sm md:text-base text-left">
                        {link.name}
                      </button>
                    </li>)}
                </ul>
              </div>)}
          </div>
          <div className="border-t border-cyan-800/50 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 space-y-4 md:space-y-0">
            <div className="text-sm md:text-base">© 2024 Silently AI. All rights reserved.</div>
            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm">
              <span>Made in India 🇮🇳</span>
              <span>•</span>
              <span>Powered by Razorpay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;