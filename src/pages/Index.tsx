
import { Download, Code, Camera, Brain, Shield, Zap, ArrowRight, Check, CreditCard, Activity, Settings, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/5 via-transparent to-purple-500/5 rounded-full animate-spin [animation-duration:60s]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          {/* Circuit Pattern Overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-32 h-32 border border-blue-400/30 rounded-lg transform rotate-12"></div>
            <div className="absolute top-40 right-20 w-24 h-24 border border-purple-400/30 rounded-full"></div>
            <div className="absolute bottom-20 left-1/3 w-16 h-16 border border-cyan-400/30 rounded-lg transform -rotate-12"></div>
          </div>

          <div className="text-center relative z-10">
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-blue-400/30 mb-8 relative">
                <Code className="w-12 h-12 text-blue-400" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-xl"></div>
              </div>
              <Badge variant="secondary" className="mb-6 bg-blue-950/50 text-blue-300 border-blue-400/30 backdrop-blur-sm px-4 py-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                Desktop AI Tool • Undetectable • Offline Ready
              </Badge>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Silently AI
            </h1>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-3xl md:text-4xl text-blue-100 mb-6 font-light">
                Code in silence. Work undetected.
              </p>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                The intelligent desktop tool that converts text to code, screenshots to implementations, 
                and solves aptitude problems — all while staying completely invisible to monitoring systems.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white px-12 py-5 text-xl rounded-xl shadow-2xl shadow-blue-500/25 border border-blue-400/30 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Download className="mr-3 h-7 w-7 relative z-10" />
                <span className="relative z-10">Download Free</span>
              </Button>
              <Button variant="outline" size="lg" className="border-blue-400/50 text-blue-300 hover:bg-blue-950/50 hover:border-blue-400 px-12 py-5 text-xl rounded-xl backdrop-blur-sm group">
                <CreditCard className="mr-3 h-6 w-6" />
                <span className="mr-3">View Pricing</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>Works 100% offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>Undetectable typing simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>Instant kill switch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Stealth Features That Actually Work
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Built for students, freelancers, and professionals who need results without detection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                emoji: "⚡",
                title: "Text → Code Magic",
                description: "Select any text problem statement and instantly get clean, working code solutions",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Camera,
                emoji: "📸",
                title: "Screenshot → Implementation",
                description: "Upload any UI screenshot or long image and get pixel-perfect code implementation",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Brain,
                emoji: "🧠",
                title: "Aptitude Problem Solver",
                description: "Crack quantitative aptitude, logical reasoning, and coding problems in seconds",
                gradient: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Timer,
                emoji: "⌨️",
                title: "Human-Like Typing",
                description: "AI types your solutions with natural delays and corrections to avoid detection",
                gradient: "from-yellow-500/20 to-orange-500/20"
              },
              {
                icon: Shield,
                emoji: "🔒",
                title: "Master Kill Switch",
                description: "Press Ctrl+Shift+K to instantly hide all AI activity and return to normal work",
                gradient: "from-red-500/20 to-rose-500/20"
              },
              {
                icon: Zap,
                emoji: "💾",
                title: "100% Offline Mode",
                description: "Download as .exe and work completely offline when internet monitoring is strict",
                gradient: "from-indigo-500/20 to-blue-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 backdrop-blur-xl group hover:shadow-2xl hover:shadow-blue-500/10 rounded-2xl overflow-hidden">
                <CardHeader className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{feature.emoji}</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-600/50">
                      Core Feature
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-blue-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Get Started in 3 Minutes
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Download & Install",
                description: "Get the .exe file and install Silently AI on your Windows desktop. No admin rights needed.",
                action: "Download takes 2 minutes"
              },
              {
                step: "02", 
                title: "Choose Your Plan",
                description: "Start free with shortcut access or upgrade to Pro/Advanced for full API access and premium features.",
                action: "Plans start at ₹800/month"
              },
              {
                step: "03",
                title: "Work in Stealth Mode",
                description: "Select text, capture screens, or input problems. Get instant AI solutions with undetectable typing simulation.",
                action: "Ready to use immediately"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-8 group">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-semibold text-white group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="bg-green-950/50 text-green-300 border-green-400/30">
                      {item.action}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Fair & Transparent Pricing
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">
              No yearly lock-ins. No hidden fees. Pay for what you use.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "/forever",
                description: "Basic access via keyboard shortcuts",
                features: ["Shortcut-only access", "Limited daily use", "Basic text-to-code", "Community support"],
                buttonText: "Download Free",
                popular: false,
                badge: "Perfect for trying out"
              },
              {
                name: "Pro",
                price: "₹800",
                period: "/month", 
                description: "100 API calls included",
                features: ["100 API calls/month", "All core features", "Priority typing simulation", "Email support", "Offline mode"],
                buttonText: "Start Pro",
                popular: true,
                badge: "Most Popular"
              },
              {
                name: "Advanced",
                price: "₹2000",
                period: "/month",
                description: "300 API calls + premium features", 
                features: ["300 API calls/month", "Advanced aptitude solver", "Batch screenshot processing", "Custom shortcuts", "Premium support"],
                buttonText: "Go Advanced",
                popular: false,
                badge: "Best Value"
              },
              {
                name: "Top-Up",
                price: "₹10",
                period: "/call",
                description: "Add credits anytime",
                features: ["Pay per API call", "No monthly commitment", "Add to any plan", "Perfect for heavy usage"],
                buttonText: "Buy Credits",
                popular: false,
                badge: "Flexible"
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative rounded-2xl overflow-hidden backdrop-blur-xl border transition-all duration-500 hover:shadow-2xl ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-950/80 to-purple-950/80 border-blue-400/50 hover:border-blue-400 shadow-blue-500/20' 
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-blue-400/50 hover:shadow-blue-500/10'
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-1">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-6">
                  <div className="mb-4">
                    <CardTitle className="text-xl text-white mb-2">{plan.name}</CardTitle>
                    <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-600/50 text-xs">
                      {plan.badge}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-base">{plan.period}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full rounded-xl py-3 text-base font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-blue-400/50'
                  }`}>
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 text-lg">
              All plans include <span className="text-blue-300 font-semibold">undetectable typing simulation</span> and <span className="text-blue-300 font-semibold">master kill switch</span>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Trusted by 10,000+ Users
          </h2>
          <p className="text-center text-slate-400 text-lg mb-16">Students, freelancers, and professionals love the stealth approach</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Arjun K.", 
                role: "CS Student, IIT Delhi", 
                initials: "AK", 
                quote: "Cracked 15+ OAs with Silently AI. The typing simulation is so natural, no one suspected anything.",
                plan: "Pro Plan"
              },
              { 
                name: "Priya S.", 
                role: "Freelance Developer", 
                initials: "PS", 
                quote: "Screenshot-to-code feature saves me 4+ hours daily. Clients think I'm coding super fast!",
                plan: "Advanced Plan"
              },
              { 
                name: "Rohit M.", 
                role: "Job Seeker", 
                initials: "RM", 
                quote: "Used it during 10+ technical interviews. The kill switch saved me twice when interviewer looked closely.",
                plan: "Top-up Credits"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl rounded-2xl hover:border-blue-400/50 transition-all duration-500">
                <CardContent className="pt-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}</div>
                      <Badge variant="secondary" className="bg-blue-950/50 text-blue-300 border-blue-400/30 text-xs mt-1">
                        {testimonial.plan}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-slate-400 text-lg mb-16">Everything you need to know about using Silently AI</p>
          
          <Accordion type="single" collapsible className="space-y-6">
            {[
              {
                value: "item-1",
                question: "How does the stealth typing feature actually work?",
                answer: "Our AI analyzes human typing patterns and replicates natural delays, corrections, and variations. It types at 45-65 WPM with realistic pauses, making it indistinguishable from human typing to monitoring software."
              },
              {
                value: "item-2", 
                question: "Can I use this during online exams and interviews?",
                answer: "Silently AI is designed to be undetectable, but always check your institution's/company's policies first. The master kill switch (Ctrl+Shift+K) instantly hides all activity if needed."
              },
              {
                value: "item-3",
                question: "What happens when I run out of API calls?",
                answer: "You'll get notified when you have 10 calls remaining. You can instantly top-up with ₹10 per call or upgrade your plan. The app works offline for basic features even without API credits."
              },
              {
                value: "item-4",
                question: "Is Razorpay payment safe and do you store card details?",
                answer: "We use Razorpay (India's leading payment gateway) for all transactions. We never store your card details - everything is handled securely by Razorpay with bank-level encryption."
              },
              {
                value: "item-5",
                question: "Can I get refund if it doesn't work for my use case?",
                answer: "We offer a 7-day money-back guarantee for all paid plans. If Silently AI doesn't meet your expectations, contact support for a full refund within 7 days of purchase."
              },
              {
                value: "item-6",
                question: "Does it work on Mac/Linux or only Windows?",
                answer: "Currently only Windows (.exe) is supported. Mac and Linux versions are in development. You can use Windows in a VM on Mac/Linux as a temporary solution."
              }
            ].map((item, index) => (
              <AccordionItem key={index} value={item.value} className="border-slate-700/50 rounded-xl bg-slate-900/30 backdrop-blur-sm">
                <AccordionTrigger className="text-white hover:text-blue-300 px-6 py-4 text-lg font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 px-6 pb-6 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-slate-800/50 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Silently AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                The undetectable desktop AI tool for students, developers, and professionals who need results without detection.
              </p>
              <Badge variant="secondary" className="bg-green-950/50 text-green-300 border-green-400/30">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                10,000+ Active Users
              </Badge>
            </div>
            {[
              {
                title: "Product",
                links: ["Download", "Features", "Pricing", "Roadmap"]
              },
              {
                title: "Support", 
                links: ["Help Center", "API Docs", "Contact Us", "Bug Reports"]
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Refund Policy", "GDPR"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-white mb-6 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-slate-400 hover:text-blue-300 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400">
            <div>© 2024 Silently AI. All rights reserved.</div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-sm">Made in India 🇮🇳</span>
              <span className="text-sm">•</span>
              <span className="text-sm">Powered by Razorpay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
