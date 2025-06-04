
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Wifi, Mail, Phone, Instagram, Linkedin } from 'lucide-react';

const Index = () => {
  const services = [
    {
      icon: <Cpu className="h-12 w-12" />,
      title: "IoT Solutions",
      description: "Smart connected devices and systems for modern automation",
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "Machine Learning",
      description: "Intelligent algorithms that learn and adapt to your business needs",
    },
    {
      icon: <Wifi className="h-12 w-12" />,
      title: "AI Integration",
      description: "Seamless artificial intelligence integration for enhanced productivity",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            <div className="mb-8 floating-animation">
              <img 
                src="/lovable-uploads/faa120d8-8962-453d-a9c7-fc01ead007f7.png" 
                alt="Innovelous Tech" 
                className="h-24 w-24 mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Innovelous Tech</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Building the future with cutting-edge IoT, Machine Learning, and AI solutions. 
              We transform ideas into intelligent, connected experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/portfolio">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
                  View Our Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/place-order">
                <Button variant="outline" size="lg" className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-200">
                  Start Your Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Expertise</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We specialize in creating innovative solutions that bridge the gap between technology and real-world applications
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="glass-effect group hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="text-blue-400 mb-6 group-hover:text-purple-400 transition-colors duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{service.description}</p>
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
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Ready to bring your ideas to life? Contact us today and let's build something amazing together.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass-effect">
              <CardContent className="p-6 flex items-center space-x-4">
                <Mail className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p className="text-gray-400">contact@innovelous.tech</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardContent className="p-6 flex items-center space-x-4">
                <Phone className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-pink-400 transform hover:scale-110 transition-all duration-200">
              <Instagram className="h-8 w-8" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transform hover:scale-110 transition-all duration-200">
              <Linkedin className="h-8 w-8" />
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transform hover:scale-110 transition-all duration-200">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-7.753-.022c0-1.229-.947-2.3-2.357-2.3-1.357 0-2.357 1.071-2.357 2.3 0 1.229 1 2.3 2.357 2.3 1.41 0 2.357-1.071 2.357-2.3zm-10.484 0c0-1.229.947-2.3 2.357-2.3 1.357 0 2.357 1.071 2.357 2.3 0 1.229-1 2.3-2.357 2.3-1.41 0-2.357-1.071-2.357-2.3z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Innovelous Tech. All rights reserved. Building the future, one innovation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
