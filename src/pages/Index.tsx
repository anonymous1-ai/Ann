
import { Download, Code, Camera, Brain, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <Badge variant="secondary" className="mb-4 bg-purple-900/50 text-purple-300 border-purple-700">
              Desktop AI Tool
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Silently AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Code in silence. Work undetected.
          </p>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            The intelligent desktop solution that converts text to code, screenshots to implementations, 
            and solves complex problems - all while staying completely invisible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3">
              <Download className="mr-2 h-5 w-5" />
              Download Now
            </Button>
            <Button variant="outline" size="lg" className="border-purple-500 text-purple-300 hover:bg-purple-900/50 px-8 py-3">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to work efficiently while maintaining complete stealth
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Selected Text to Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Instantly convert any selected text into functional code with AI-powered intelligence
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Image to Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Transform screenshots and long images into clean, working code implementations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Aptitude Solver</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Solve complex aptitude problems and technical challenges with advanced AI reasoning
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Stealth Typing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Simulate natural typing patterns to avoid detection systems and maintain authenticity
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Master Kill Switch</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Instantly disable all AI activity with a single keystroke for complete control
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Offline Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Download as .exe file and work completely offline when needed
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Download & Install</h3>
                <p className="text-gray-400">Get the .exe file and install Silently AI on your Windows desktop in under 2 minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add API Credits</h3>
                <p className="text-gray-400">Purchase credits at ₹10 per call or choose a monthly plan for better value.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Start Working Silently</h3>
                <p className="text-gray-400">Select text, capture screens, or input problems - get instant AI-powered solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simple Pricing
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Pay per use or choose a monthly plan. No yearly commitments, no discounts.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Pay Per Use</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  ₹10
                  <span className="text-lg text-gray-400 font-normal">/call</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-300">Perfect for occasional use</div>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-purple-900/50 to-gray-800 border-purple-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Basic Plan</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  ₹800
                  <span className="text-lg text-gray-400 font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-300">100 API calls included</div>
                <div className="text-center text-sm text-gray-400">₹8 per call</div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Pro Plan</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  ₹2000
                  <span className="text-lg text-gray-400 font-normal">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-300">300 API calls included</div>
                <div className="text-center text-sm text-gray-400">₹6.67 per call</div>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What People Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    JS
                  </div>
                  <div>
                    <div className="font-semibold text-white">Jon Sune</div>
                    <div className="text-sm text-gray-400">Developer</div>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Silently AI has revolutionized my coding workflow. The stealth features are incredible."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    MS
                  </div>
                  <div>
                    <div className="font-semibold text-white">Marc Jo Smith</div>
                    <div className="text-sm text-gray-400">Student</div>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Perfect for solving aptitude problems quickly. The typing simulation is undetectable."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    TV
                  </div>
                  <div>
                    <div className="font-semibold text-white">Theel Venna</div>
                    <div className="text-sm text-gray-400">Freelancer</div>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Game-changer for my freelance work. Screenshot to code feature saves me hours daily."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-purple-300">
                How does the stealth typing feature work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Our AI simulates natural human typing patterns with realistic delays, variations, and corrections to avoid detection by monitoring systems.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-purple-300">
                Can I use this offline?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Yes! Download the .exe file and certain features work offline. However, AI-powered features require internet connectivity and API calls.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-purple-300">
                What happens when I run out of API calls?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                You can purchase additional calls at ₹10 each or upgrade to a monthly plan. The app will notify you when you're running low on credits.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-gray-700">
              <AccordionTrigger className="text-white hover:text-purple-300">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Absolutely. All data processing happens locally when possible, and any cloud processing uses encrypted connections. We never store your code or personal information.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Silently AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Code in silence. Work undetected.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-300">Features</a></li>
                <li><a href="#" className="hover:text-purple-300">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-300">Download</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-300">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-300">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Silently AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
