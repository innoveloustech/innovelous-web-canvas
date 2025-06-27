import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supbaseClient';

import { 
  Cpu, Brain, Wifi, Code, Smartphone, Settings, Palette, 
  Monitor, Database, Cloud, Shield, Zap, Globe, 
  Laptop, Tablet, Watch, Headphones, Camera 
} from 'lucide-react';

const iconMap = {
  'Cpu': Cpu,
  'Brain': Brain,
  'Wifi': Wifi,
  'Code': Code,
  'Smartphone': Smartphone,
  'Settings': Settings,
  'Palette': Palette,
  'Monitor': Monitor,
  'Database': Database,
  'Cloud': Cloud,
  'Shield': Shield,
  'Zap': Zap,
  'Globe': Globe,
  'Laptop': Laptop,
  'Tablet': Tablet,
  'Watch': Watch,
  'Headphones': Headphones,
  'Camera': Camera,
};

const ServicesDisplay = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Cpu;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Expertise</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Loading our services...
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-black/20 backdrop-blur-sm border-gray-700 animate-pulse">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded mx-auto mb-6"></div>
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Expertise</span>
            </h2>
            <p className="text-xl text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
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
          {services.map((service, index) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <Card 
                key={service.id} 
                className="glass-effect group hover:bg-black/60 transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-purple-400 mb-6 group-hover:text-purple-300 transition-colors duration-300 flex justify-center">
                    <IconComponent className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length === 0 && (
          <div className="text-center text-gray-400">
            No services available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesDisplay;