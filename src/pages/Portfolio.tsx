import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, ChevronLeft, ChevronRight, X, Monitor, Smartphone, Laptop, Server, Grid3X3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supbaseClient';
import { 
  Cpu, Brain, Wifi, Code, Settings, Palette, Database, Cloud, Shield, Zap, Globe, Tablet, Watch,
  Headphones, Camera, Tv, Phone, MapPin, Calendar, Search, User, Heart, Loader, Bell, Folder,
  FileText, Trash2, Unlock, EyeOff
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  image_urls: string[];
  demo_url?: string;
  category: string;
  created_at: string;
}


interface Category {
  id: string;
  name: string;
  key: string;
  icon: string;
}


// Add this helper function at the top of your Portfolio component
const getFirstLine = (html: string) => {
  if (!html) return 'No description available';
  
  try {
    // Create a temporary parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract all text content
    const text = doc.body.textContent || '';
    
    // Find the first non-empty line
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.length > 0 ? lines[0] + (lines.length > 1 ? '....' : '') : 'No description available';
  } catch (error) {
    console.error('Error parsing description:', error);
    return 'Project description';
  }
};


const Portfolio = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Cpu: Cpu,
    Brain: Brain,
    Wifi: Wifi,
    Code: Code,
    Smartphone: Smartphone,
    Settings: Settings,
    Palette: Palette,
    Monitor: Monitor,
    Database: Database,
    Cloud: Cloud,
    Shield: Shield,
    Zap: Zap,
    Globe: Globe,
    Laptop: Laptop,
    Tablet: Tablet,
    Watch: Watch,
    Headphones: Headphones,
    Camera: Camera,
    Grid3X3: Grid3X3,
    Tv: Tv,
    Phone: Phone,
    MapPin: MapPin,
    Calendar: Calendar,
    Search: Search,
    User: User,
    Heart: Heart,
    Loader: Loader,
    Bell: Bell,
    Folder: Folder,
    FileText: FileText,
    Trash2: Trash2,
    Unlock: Unlock,
    Eye: Eye,
    EyeOff: EyeOff,
    Server: Server
  };



  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select('id, name, description, technologies, image_urls, demo_url, category, created_at')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        const mappedProjects = data.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          technologies: project.technologies || [],
          image_urls: project.image_urls || [],
          demo_url: project.demo_url || undefined,
          category: project.category || 'website',
          created_at: project.created_at
        }));

        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === activeFilter));
    }
  }, [activeFilter, projects]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  const openImageModal = (project: Project, imageIndex: number = 0) => {
    setSelectedProject(project);
    setCurrentImageIndex(imageIndex);
  };

  const closeImageModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.image_urls.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.image_urls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.image_urls.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.image_urls.length - 1 : prev - 1
      );
    }
  };

  const filterCategories = [
    { key: 'all', name: 'All Projects', icon: 'Grid3X3' },
    ...categories
  ];

  const getCategoryIcon = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey);
    const iconName = category?.icon || 'Grid3X3';
    return iconMap[iconName] || Grid3X3;
  };


  // Get category name
  const getCategoryName = (key: string) => {
    return categories.find(c => c.key === key)?.name || key;
  };


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

        {/* Filter Buttons */}
        <section className="py-8">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {filterCategories.map((category) => {
              const Icon = iconMap[category.icon] || Grid3X3;
              const isActive = activeFilter === category.key;
              const count = category.key === 'all' 
                ? projects.length 
                : projects.filter(p => p.category === category.key).length;
              
              return (
                <Button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  variant={isActive ? "default" : "outline"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-600/20 text-blue-300'
                    }`}
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-2xl text-gray-400 mb-4">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">{error}</p>
                <p className="text-gray-500">Please refresh the page or contact support.</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">
                  {activeFilter === 'all' ? 'No projects found' : `No ${categories.find(c => c.key === activeFilter)?.name.toLowerCase()} found`}
                </p>
                <p className="text-gray-500">
                  {activeFilter === 'all' ? 'Check back soon for our latest work!' : 'Try selecting a different category.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => {
                  const CategoryIcon = getCategoryIcon(project.category);
                  
                  return (
                    <Card key={project.id} className="glass-effect group hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-0">
                        {project.image_urls && project.image_urls.length > 0 ? (
                          <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg relative overflow-hidden">
                            <img 
                              src={project.image_urls[0]} 
                              alt={project.name}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openImageModal(project, 0)}
                            />
                            
                            {/* Category badge */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <CategoryIcon className="h-3 w-3" />
                              {project.category}
                            </div>
                            
                            {/* Image counter badge */}
                            {project.image_urls.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                1/{project.image_urls.length}
                              </div>
                            )}
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-center">
                                <Eye className="h-8 w-8 text-white mx-auto mb-2" />
                                {project.image_urls.length > 1 && (
                                  <p className="text-white text-sm">
                                    View all {project.image_urls.length} images
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-t-lg flex items-center justify-center">
                            <div className="text-center">
                              <CategoryIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <Eye className="h-12 w-12 text-blue-400 mx-auto mb-2 opacity-50" />
                              <p className="text-gray-400 text-sm">No Preview Available</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                            {project.name}
                          </h3>
                          <div 
                            className="text-gray-400 mb-4 leading-relaxed line-clamp-3 min-h-[3.5rem]"
                            dangerouslySetInnerHTML={{ 
                              __html: getFirstLine(project.description) 
                            }}
                          />
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.map((tech, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Fixed positioned action buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {project.demo_url && (
                                <a 
                                  href={project.demo_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                >
                                  View Demo
                                  <ExternalLink className="ml-1 h-4 w-4" />
                                </a>
                              )}
                            </div>
                            
                            <div className="flex-1 flex justify-end">
                              {project.image_urls && project.image_urls.length > 0 && (
                                <button
                                  onClick={() => openImageModal(project, 0)}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 text-sm font-medium"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Gallery
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Image Modal - Same as before */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur">
          <div className="relative max-w-4xl w-full h-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {selectedProject.image_urls.length}
            </div>

            {/* Main image container */}
            <div className="relative flex-1 min-h-0 mb-4">
              <img
                src={selectedProject.image_urls[currentImageIndex]}
                alt={`${selectedProject.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain rounded-lg"
              />

              {/* Navigation arrows */}
              {selectedProject.image_urls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Project info and thumbnails */}
            <div className="flex-shrink-0">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {(() => {
                    const CategoryIcon = getCategoryIcon(selectedProject.category);
                    return <CategoryIcon className="h-5 w-5 text-blue-400" />;
                  })()}
                  <span className="text-blue-400 text-sm capitalize">
                    {getCategoryName(selectedProject.category)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedProject.name}
                </h3>
                
                {/* Scrollable description container */}
                <div className="max-h-[150px] overflow-y-auto mb-3 px-4 scrollbar-thin scrollbar-thumb-blue-600/50 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                  <div 
                    className="formatted-text text-sm max-w-2xl mx-auto break-words"
                    dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                  />
                </div>
                
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {selectedProject.technologies.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {selectedProject.demo_url && (
                  <a 
                    href={selectedProject.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm"
                  >
                    View Live Demo
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Thumbnail strip */}
              {selectedProject.image_urls.length > 1 && (
                <div className="flex justify-center space-x-2 overflow-x-auto pb-2 px-4">
                  <div className="flex space-x-2 min-w-max">
                    {selectedProject.image_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-blue-400 opacity-100' 
                            : 'border-gray-600 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
