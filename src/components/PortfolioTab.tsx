// src/components/PortfolioTab.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supbaseClient';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Loader2, Plus, Trash2, Edit, Save, X, 
  Monitor, Smartphone, Laptop, Server, Grid3X3,
  Cpu, Brain, Wifi, Code, Settings, Palette, Database, Cloud, Shield, Zap, Globe, Tablet, Watch,
  Headphones, Camera, Tv, Phone, MapPin, Calendar, Search, User, Heart, Loader, Bell, Folder,
  FileText, Unlock, EyeOff, Pin } from 'lucide-react';

import RichTextEditor from '@/components/RichTextEditor';
import { Checkbox } from './ui/checkbox';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  image_urls?: string[];
  demo_url?: string;
  category: string;
  pinned: boolean;
}

interface PortfolioTabProps {
  projects: Project[];
  fetchProjects: () => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  key: string;
}

const truncateDescription = (html: string) => {
  if (!html) return '';
  
  // Convert HTML to plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || '';
  
  const firstLineBreak = text.indexOf('\n');
  const firstLine = firstLineBreak > 0 
    ? text.substring(0, firstLineBreak) 
    : text;
  return firstLine + (text.length > firstLine.length ? '....' : '');
};

const PortfolioTab = ({ projects, setProjects, fetchProjects }: PortfolioTabProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [projectImageFiles, setProjectImageFiles] = useState<File[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  



  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({ 
    name: '', 
    description: '', 
    technologies: [], 
    image_urls: [], 
    demo_url: '',
    category: 'website',
    pinned: false,
  });
  
  const [editFields, setEditFields] = useState({ 
    name: '', 
    description: '', 
    technologies: [] as string[], 
    image_urls: [] as string[], 
    demo_url: '',
    category: '',
    pinned: false,
  });

  const addTechnology = (tech: string) => {
    if (tech.trim() && !newProject.technologies.includes(tech.trim())) {
      setNewProject(prev => ({ ...prev, technologies: [...prev.technologies, tech.trim()] }));
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }));
  };

  const addEditTechnology = (tech: string) => {
    if (tech.trim() && !editFields.technologies.includes(tech.trim())) {
      setEditFields(prev => ({ ...prev, technologies: [...prev.technologies, tech.trim()] }));
    }
  };

  const removeEditTechnology = (tech: string) => {
    setEditFields(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }));
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey);
    const iconName = category?.icon || 'Grid3X3';
    return iconMap[iconName] || Grid3X3;
  };


  const handleAddProject = async () => {
    if (!newProject.name || !newProject.description || projectImageFiles.length === 0) {
      toast({ title: "Error", description: "Please fill in required fields and select an image.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrls = await Promise.all(projectImageFiles.map(async (file) => {
        const filePath = `${uuidv4()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('project-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(filePath);
        return publicUrl;
      }));

      await supabase.from('projects').insert([{ ...newProject, image_urls: imageUrls }]);
      
      toast({ title: "Success", description: "Project added successfully!" });
      fetchProjects();
      setShowAddProject(false);
      setNewProject({ name: '', description: '', demo_url: '', technologies: [], image_urls: [], category: 'website', pinned: false });
      setProjectImageFiles([]);
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleEditStart = (project: Project) => {
    setEditProjectId(project.id);
    setEditFields({
      name: project.name,
      description: project.description,
      technologies: project.technologies || [],
      image_urls: project.image_urls || [],
      demo_url: project.demo_url || '',
      category: project.category || 'website',
      pinned: project.pinned || false
    });
  };

  const handleEditSave = async (id: string) => {
    const { error } = await supabase.from('projects').update({ ...editFields }).eq('id', id);
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Project updated' });
      setEditProjectId(null);
      fetchProjects();
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"?`)) return;
    try {
      if (project.image_urls?.length) {
        const filePaths = project.image_urls.map(url => url.substring(url.lastIndexOf('/project-images/') + 16));
        await supabase.storage.from('project-images').remove(filePaths);
      }
      await supabase.from('projects').delete().eq('id', project.id);
      toast({ title: "Project deleted", description: `${project.name} has been removed.` });
      fetchProjects();
    } catch (error: any) {
      toast({ title: "Deletion failed", description: error.message, variant: "destructive" });
    }
  };

  const handleAddProjectImages = async (projectId: string) => {
    if (newImageFiles.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = newImageFiles.map(async (file) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        
        const { error } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
        return publicUrl;
      });
      
      const newImageUrls = await Promise.all(uploadPromises);
      
      const project = projects.find(p => p.id === projectId);
      const currentImages = project?.image_urls || [];
      const updatedImages = [...currentImages, ...newImageUrls];
      
      const { error: dbError } = await supabase
        .from('projects')
        .update({ image_urls: updatedImages })
        .eq('id', projectId);
      if (dbError) throw dbError;
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, image_urls: updatedImages } : p
      ));
      
      if (editProjectId === projectId) {
        setEditFields({ ...editFields, image_urls: updatedImages });
      }
      
      setNewImageFiles([]);
      toast({
        title: "Images added",
        description: `${newImageFiles.length} images added to project`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProjectImage = async (projectId: string, imageIndex: number) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project || !project.image_urls || !project.image_urls[imageIndex]) return;

      const imageUrl = project.image_urls[imageIndex];
      const urlParts = imageUrl.split('/project-images/');
      if (urlParts.length < 2) throw new Error('Invalid image URL');
      const filePath = urlParts[1];
      
      const { error: storageError } = await supabase.storage
        .from('project-images')
        .remove([filePath]);
      if (storageError) throw storageError;
      
      const updatedImages = [...project.image_urls];
      updatedImages.splice(imageIndex, 1);
      
      const { error: dbError } = await supabase
        .from('projects')
        .update({ image_urls: updatedImages })
        .eq('id', projectId);
      if (dbError) throw dbError;
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, image_urls: updatedImages } : p
      ));
      
      if (editProjectId === projectId) {
        setEditFields({ ...editFields, image_urls: updatedImages });
      }
      
      toast({
        title: "Image deleted",
        description: "The image has been removed from the project",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  // Create icon map
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
    EyeOff: EyeOff,
    Server: Server,
    Pin: Pin,
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Manage Portfolio</CardTitle>
        <Button 
          onClick={() => setShowAddProject(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent>
        {showAddProject && (
          <div className="mb-6 p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Project</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Project Name *</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label className="text-white">Demo URL</Label>
                  <Input
                    value={newProject.demo_url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, demo_url: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pin-project"
                    checked={newProject.pinned}
                    onCheckedChange={(checked: boolean) => 
                      setNewProject(prev => ({ ...prev, pinned: checked }))
                    }
                  />
                  <Label htmlFor="pin-project" className="text-white">
                    Pin this project (appears first on portfolio)
                  </Label>
                </div>
              </div>

              <div>
                <Label className="text-white">Category</Label>
                <Select 
                  value={newProject.category} 
                  onValueChange={(value) =>  // Remove hardcoded type annotation
                    setNewProject(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const IconComponent = iconMap[category.icon];
                      return (
                        <SelectItem key={category.key} value={category.key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white">Description *</Label>
                <RichTextEditor
                  value={newProject.description}
                  onChange={(value) => setNewProject(prev => ({ ...prev, description: value }))}
                />
              </div>

              <div>
                <Label className="text-white">Project Images * (Select multiple)</Label>
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setProjectImageFiles(Array.from(e.target.files));
                    }
                  }}
                  className="bg-white/5 border-white/20 text-white file:text-white file:bg-transparent file:border-0"
                />
                {projectImageFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-2">Selected images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {projectImageFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 rounded-md object-cover border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => setProjectImageFiles(files => files.filter((_, i) => i !== index))}
                            className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white transition-transform hover:scale-110 focus:outline-none -translate-y-1/2 translate-x-1/2 transform"
                          >
                            <span className="sr-only">Remove image</span>
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-white">Technologies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add technology and press Enter"
                    className="bg-white/5 border-white/20 text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(newProject.technologies) &&
                    newProject.technologies.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 text-blue-300 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddProject} disabled={isUploading}>
                  {isUploading ? (
                    <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Project
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddProject(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10 gap-4">
              <div className="flex items-start gap-4 w-full">
                {project.image_urls && project.image_urls.length > 0 ? (
                  <div className="relative">
                    <img 
                      src={project.image_urls[0]} 
                      alt={project.name}
                      className="h-20 w-20 rounded-md object-cover border border-white/20"
                    />
                    {project.image_urls.length > 1 && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        +{project.image_urls.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-md bg-white/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-grow space-y-2">
                  {editProjectId === project.id ? (
                    <>
                      <Input
                        value={editFields.name}
                        onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                        placeholder="Project Name"
                        className="bg-white/5 border-white/20 text-white"
                      />
                      <Select 
                        value={editFields.category} 
                        onValueChange={(value) =>  // Remove type annotation here too
                          setEditFields({ ...editFields, category: value })
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => {
                            const IconComponent = iconMap[category.icon];
                            return (
                              <SelectItem key={category.key} value={category.key}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {category.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <RichTextEditor
                        value={editFields.description}
                        onChange={(value) => setEditFields(prev => ({ ...prev, description: value }))}
                      />
                      <Input
                        value={editFields.demo_url || ''}
                        onChange={(e) => setEditFields({ ...editFields, demo_url: e.target.value })}
                        placeholder="Demo URL"
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`pin-edit-${project.id}`}
                          checked={editFields.pinned}
                          onCheckedChange={(checked: boolean) => 
                            setEditFields(prev => ({ ...prev, pinned: checked }))
                          }
                        />
                        <Label htmlFor={`pin-edit-${project.id}`} className="text-white">
                          Pin this project
                        </Label>
                      </div>
                      <div>
                        <Label className="text-white text-sm">Technologies</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add technology and press Enter"
                            className="bg-white/5 border-white/20 text-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addEditTechnology((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editFields.technologies.map((tech, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                            >
                              {tech}
                              <button
                                onClick={() => removeEditTechnology(tech)}
                                className="ml-1 text-blue-300 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <Label className="text-white text-sm">Current Images</Label>
                        {editFields.image_urls && editFields.image_urls.length > 0 ? (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {editFields.image_urls.map((url, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={url} 
                                  alt={`${project.name} ${index + 1}`}
                                  className="h-16 w-16 rounded-md object-cover border border-white/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProjectImage(project.id, index)}
                                  className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white transition-transform hover:scale-110 focus:outline-none -translate-y-1/2 translate-x-1/2 transform"
                                >
                                  <span className="sr-only">Remove image</span>
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No images</p>
                        )}
                        
                        <div className="pt-2">
                          <Label className="text-white text-sm">Add New Images</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  setNewImageFiles(Array.from(e.target.files));
                                }
                              }}
                              className="bg-white/5 border-white/20 text-white file:text-white file:bg-transparent file:border-0"
                            />
                            {newImageFiles.length > 0 && (
                              <Button 
                                size="sm" 
                                onClick={() => handleAddProjectImages(project.id)}
                                disabled={isUploading}
                              >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add`}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => handleEditSave(project.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditProjectId(null)}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{project.name}</h4>
                        {(() => {
                          const IconComponent = getCategoryIcon(project.category);
                          return <IconComponent className="h-4 w-4 text-gray-400" />;
                        })()}
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-transparent border-gray-500 text-gray-400"
                        >
                          {categories.find(cat => cat.key === project.category)?.name || 'Other'}
                        </Badge>
                        {project.pinned && (
                          <Pin className="h-4 w-4 text-yellow-400"/>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{truncateDescription(project.description)}</p>
                      {project.demo_url && (
                        <a 
                          href={project.demo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          View Demo
                        </a>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-600/20 text-blue-300 border-blue-500/30">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {editProjectId === project.id ? null : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTab;