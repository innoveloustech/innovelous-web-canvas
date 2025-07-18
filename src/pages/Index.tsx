
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {motion} from 'framer-motion'
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Wifi, Mail, Phone, Instagram, Linkedin, ExternalLink, Code, Smartphone, Settings, Palette, LucideMail } from 'lucide-react';
import ServicesDisplay from '@/components/UserExpertise';


const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-800/30 to-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            <div className="mb-8 floating-animation">
              <img 
                src="/logo/logo.png" 
                alt="Innovelous Tech" 
                className="h-24 w-24 mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Innovelous Tech</span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-400 mb-4 font-semibold">
              "Turning big ideas into small screens"
            </p>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              We are a passionate team committed to delivering innovative IoT, Machine Learning, and AI-based technology solutions. 
              Our mission is to bring futuristic ideas into practical solutions that help our clients grow and stand out in the tech world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/portfolio">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
                  View Our Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/place-order">
                <Button variant="outline" size="lg" className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-200">
                  Start Your Project
                </Button>
              </Link>
            </div>
            
            {/* Services offered */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <p className="text-xl font-semibold text-gray-300 mb-4">Our Services</p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                {/* Development */}
                <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  Custom Project Development
                </Badge>
                <Badge className="bg-purple-700/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  Ready-made Solutions
                </Badge>
                <Badge className="bg-purple-800/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  Web App Engineering
                </Badge>

                {/* Consulting */}
                <Badge className="bg-purple-700/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  Project Consultancy
                </Badge>

                {/* UI/UX */}
                <Badge className="bg-purple-800/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  UI/UX Design
                </Badge>
                <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  Design Systems & Prototyping
                </Badge>

                {/* Business */}
                <Badge className="bg-purple-700/30 text-purple-300 border-purple-500/50 px-4 py-2">
                  MVP Launch Services
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

        <ServicesDisplay/>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Our <span className="gradient-text">Values</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {['Quality Assurance','Reliable Delivery', 'Authenticity', 'Scalibility'].map((value, index) => (
              <Card key={index} className="glass-effect">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white">{value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Get A {' '}<span className="gradient-text">Free Consultation</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Ready to bring your ideas to life? Contact us today and let's build something amazing together.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass-effect">
              <CardContent className="p-6 flex items-center space-x-4">
                <Mail className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a href="mailto:innoveloustechno@gmail.com" className="text-gray-400 hover:text-purple-400 transition-colors">
                    innoveloustechno@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardContent className="p-6 flex items-center space-x-4">
                <Phone className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <a href="tel:+923332186309" className="text-gray-400 hover:text-purple-400 transition-colors">
                    +92 333 2186309
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center space-x-6 mb-8">
            <a 
              href="https://instagram.com/innoveloustech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transform hover:scale-110 transition-all duration-200"
            >
              <Instagram className="h-8 w-8" />
            </a>
            <a 
              href="https://linkedin.com/company/innovelous-technology" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transform hover:scale-110 transition-all duration-200"
            >
              <Linkedin className="h-8 w-8" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
