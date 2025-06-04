
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  image?: string;
  demoUrl?: string;
}

const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('portfolio_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Default projects for demo
      const defaultProjects: Project[] = [
        {
          id: '1',
          name: 'Smart Home IoT System',
          description: 'Complete home automation system with temperature, lighting, and security controls accessible via mobile app.',
          technologies: ['IoT', 'React Native', 'Node.js', 'MongoDB', 'Arduino'],
        },
        {
          id: '2',
          name: 'AI-Powered Analytics Dashboard',
          description: 'Machine learning dashboard that provides predictive analytics for business intelligence and decision making.',
          technologies: ['Python', 'TensorFlow', 'React', 'FastAPI', 'PostgreSQL'],
        },
        {
          id: '3',
          name: 'Industrial IoT Monitoring',
          description: 'Real-time monitoring system for industrial equipment with predictive maintenance capabilities.',
          technologies: ['LoRaWAN', 'Python', 'InfluxDB', 'Grafana', 'Docker'],
        },
      ];
      setProjects(defaultProjects);
      localStorage.setItem('portfolio_projects', JSON.stringify(defaultProjects));
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-20">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our collection of innovative projects spanning IoT, Machine Learning, and AI. 
              Each project represents our commitment to delivering cutting-edge solutions.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">No projects added yet</p>
                <p className="text-gray-500">Check back soon for our latest work!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Card key={project.id} className="glass-effect group hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <CardContent className="p-0">
                      {project.image ? (
                        <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg relative overflow-hidden">
                          <img 
                            src={project.image} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg flex items-center justify-center">
                          <div className="text-center">
                            <Eye className="h-12 w-12 text-blue-400 mx-auto mb-2 opacity-50" />
                            <p className="text-gray-400 text-sm">Project Preview</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                          {project.name}
                        </h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        {project.demoUrl && (
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
                          >
                            View Demo
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;
