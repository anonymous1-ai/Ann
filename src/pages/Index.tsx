import { Download, Code, Camera, Brain, Shield, Zap, ArrowRight, Check } from "lucide-react";
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
                Desktop AI Tool
              </Badge>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Silently AI
            </h1>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-2xl md:text-3xl text-blue-100 mb-6 font-light">
                Code in silence. Work undetected.
              </p>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                The intelligent desktop solution that converts text to code, screenshots to implementations, 
                and solves complex problems - all while staying completely invisible to detection systems.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-xl shadow-2xl shadow-blue-500/25 border border-blue-400/30 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Download className="mr-3 h-6 w-6 relative z-10" />
                <span className="relative z-10">Download Now</span>
              </Button>
              <Button variant="outline" size="lg" className="border-blue-400/50 text-blue-300 hover:bg-blue-950/50 hover:border-blue-400 px-10 py-4 text-lg rounded-xl backdrop-blur-sm group">
                <span className="mr-3">View Pricing</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Everything you need to work efficiently while maintaining complete stealth and authenticity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: "Selected Text to Code",
                description: "Instantly convert any selected text into functional code with AI-powered intelligence",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Camera,
                title: "Image to Code",
                description: "Transform screenshots and long images into clean, working code implementations",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Brain,
                title: "Aptitude Solver",
                description: "Solve complex aptitude problems and technical challenges with advanced AI reasoning",
                gradient: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Zap,
                title: "Stealth Typing",
                description: "Simulate natural typing patterns to avoid detection systems and maintain authenticity",
                gradient: "from-yellow-500/20 to-orange-500/20"
              },
              {
                icon: Shield,
                title: "Master Kill Switch",
                description: "Instantly disable all AI activity with a single keystroke for complete control",
                gradient: "from-red-500/20 to-rose-500/20"
              },
              {
                icon: Download,
                title: "Offline Ready",
                description: "Download as .exe file and work completely offline when needed",
                gradient: "from-indigo-500/20 to-blue-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 backdrop-blur-xl group hover:shadow-2xl hover:shadow-blue-500/10 rounded-2xl overflow-hidden">
                <CardHeader className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-blue-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed">
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
            How It Works
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Download & Install",
                description: "Get the .exe file and install Silently AI on your Windows desktop in under 2 minutes."
              },
              {
                step: "02", 
                title: "Add API Credits",
                description: "Purchase credits at ₹10 per call or choose a monthly plan for better value."
              },
              {
                step: "03",
                title: "Start Working Silently",
                description: "Select text, capture screens, or input problems - get instant AI-powered solutions."
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-8 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-blue-200 transition-colors">
                    {item.title}
                  </h3>
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
              Simple Pricing
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">
              Pay per use or choose a monthly plan. No yearly commitments, no discounts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Pay Per Use",
                price: "₹10",
                period: "/call",
                description: "Perfect for occasional use",
                features: ["Pay as you go", "No monthly commitment", "All features included"],
                buttonText: "Get Started",
                popular: false
              },
              {
                name: "Basic Plan",
                price: "₹800",
                period: "/month", 
                description: "100 API calls included",
                features: ["₹8 per call", "Most popular choice", "Priority support"],
                buttonText: "Get Started",
                popular: true
              },
              {
                name: "Pro Plan",
                price: "₹2000",
                period: "/month",
                description: "300 API calls included", 
                features: ["₹6.67 per call", "Best value", "Premium support"],
                buttonText: "Get Started",
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative rounded-2xl overflow-hidden backdrop-blur-xl border transition-all duration-500 hover:shadow-2xl ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-950/80 to-purple-950/80 border-blue-400/50 hover:border-blue-400 shadow-blue-500/20' 
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-blue-400/50 hover:shadow-blue-500/10'
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-white mb-4">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-lg">{plan.period}</span>
                  </div>
                  <p className="text-slate-300">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-slate-300">
                        <Check className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full rounded-xl py-3 text-lg font-semibold transition-all duration-300 ${
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
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            What People Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Jon Sune", role: "Developer", initials: "JS", quote: "Silently AI has revolutionized my coding workflow. The stealth features are incredible." },
              { name: "Marc Jo Smith", role: "Student", initials: "MS", quote: "Perfect for solving aptitude problems quickly. The typing simulation is undetectable." },
              { name: "Theel Venna", role: "Freelancer", initials: "TV", quote: "Game-changer for my freelance work. Screenshot to code feature saves me hours daily." }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl rounded-2xl hover:border-blue-400/50 transition-all duration-500">
                <CardContent className="pt-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                      <div className="text-slate-400">{testimonial.role}</div>
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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-6">
            {[
              {
                value: "item-1",
                question: "How does the stealth typing feature work?",
                answer: "Our AI simulates natural human typing patterns with realistic delays, variations, and corrections to avoid detection by monitoring systems."
              },
              {
                value: "item-2", 
                question: "Can I use this offline?",
                answer: "Yes! Download the .exe file and certain features work offline. However, AI-powered features require internet connectivity and API calls."
              },
              {
                value: "item-3",
                question: "What happens when I run out of API calls?",
                answer: "You can purchase additional calls at ₹10 each or upgrade to a monthly plan. The app will notify you when you're running low on credits."
              },
              {
                value: "item-4",
                question: "Is my data secure?",
                answer: "Absolutely. All data processing happens locally when possible, and any cloud processing uses encrypted connections. We never store your code or personal information."
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
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Silently AI</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Code in silence. Work undetected.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Download"]
              },
              {
                title: "Support", 
                links: ["Documentation", "Help Center", "Contact"]
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service"]
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
          <div className="border-t border-slate-800/50 mt-12 pt-8 text-center text-slate-400">
            © 2024 Silently AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
