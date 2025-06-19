import { supabase } from '@/lib/supbaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image as ImageIcon } from 'lucide-react';
import DownloadsForm from '@/components/DownloadsForm';

import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  FolderOpen, 
  ShoppingCart,
  TrendingUp,
  Save,
  X,
  Settings,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  image_url?: string; // Changed from 'image' to match Supabase column
  demo_url?: string;
}

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectTitle: string;
  description: string;
  budget: string;
  timeline: string;
  status: 'pending' | 'in-progress' | 'completed';
  submittedAt: string;
  fileUrls?: string[];
}

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // New state for upload progress
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    technologies: [],
    image_url: '',
    demo_url: '',
  });
  // START: New state for handling the image file
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  // END: New state for handling the image file

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    // Fetch both projects and orders on component mount
    fetchProjects();
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // START: New function to fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // END: New function to fetch projects

  // START: Modified handleAddProject function
  const handleAddProject = async () => {
  if (!newProject.name || !newProject.description || !projectImageFile) {
    toast({
      title: "Error",
      description: "Please fill in all required fields and select an image.",
      variant: "destructive",
    });
    return;
  }

  setIsUploading(true);
  let imageUrl = '';

  try {
    // 1. Upload image to Supabase Storage
    const fileExt = projectImageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName; // Store directly at root of the bucket

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, projectImageFile);

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Could not get public URL for the image.");
    }

    imageUrl = urlData.publicUrl;

    // 3. Insert project into database
    const { data: insertedProject, error: insertError } = await supabase
      .from('projects')
      .insert([
        {
          name: newProject.name,
          description: newProject.description,
          image_url: imageUrl,
          demo_url: newProject.demo_url
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Update UI state
    setProjects(prev => [...prev, insertedProject]);

    

    toast({
      title: "Success",
      description: "Project added successfully!",
    });

    setShowAddProject(false);
    setNewProject({ name: '', description: '', demo_url: '', technologies: [] });
    setProjectImageFile(null);

    // 5. Reset form
    setNewProject({ name: '', description: '', demo_url: '', technologies: [] });
    setProjectImageFile(null);
  } catch (error) {
    console.error('Error adding project:', error);
    toast({
      title: "Upload Failed",
      description: error.message || "An error occurred while uploading the project.",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};
  // END: Modified handleAddProject function

  // START: Modified handleDeleteProject function
  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }
    
    try {
      // 1. Delete the record from the 'projects' table
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (dbError) throw dbError;

      // 2. Delete the associated image from storage
      if (project.image_url) {
        const urlParts = project.image_url.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('public')).join('/');
        
        const { error: storageError } = await supabase.storage
          .from('project-images')
          .remove([filePath]);

        if (storageError) {
          // Log the error but don't block the user; the main record is deleted.
          console.warn("Could not delete project image from storage:", storageError.message);
        }
      }

      // 3. Update local state
      setProjects(projects.filter(p => p.id !== project.id));
      
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;

      // Directly transform the data without creating signed URLs
      const transformedOrders = data.map(order => ({
        id: order.id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        projectTitle: order.project_title,
        description: order.description,
        budget: order.budget,
        timeline: order.timeline,
        fileUrls: order.file_urls || [], // Use the public URLs directly
        status: order.status,
        submittedAt: order.submitted_at,
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      // You might want to show a toast notification here
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handlePasswordChange = () => {
    // Validate form
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Attempt to change password
    const success = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (success) {
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      toast({
        title: "Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
    }
  };

  const addTechnology = (tech: string) => {
    if (tech.trim() && !newProject.technologies.includes(tech.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech.trim()]
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const stats = {
    totalProjects: projects.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
  };

  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    console.log('Current orders state:', orders);
    orders.forEach(order => {
      if (order.fileUrls && order.fileUrls.length > 0) {
        console.log(`Order ${order.id} has ${order.fileUrls.length} files:`, order.fileUrls);
      }
    });
  }, [orders]);

  const [editProjectId, setEditProjectId] = useState(null);
  const [editFields, setEditFields] = useState({
    name: '',
    description: '',
    technologies: [],
  });

  const handleEditStart = (project) => {
    setEditProjectId(project.id);
    setEditFields({
      name: project.name,
      description: project.description,
      technologies: project.technologies || [],
    });
  };

  const handleEditSave = async (id) => {
    const { error } = await supabase
      .from('projects')
      .update({
        name: editFields.name,
        description: editFields.description,
        technologies: editFields.technologies,
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Project updated' });
      setEditProjectId(null);
      fetchProjects(); // refetch data if needed
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your portfolio and orders</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600">Portfolio</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">Settings</TabsTrigger>
          <TabsTrigger value="downloads" className="data-[state=active]:bg-blue-600">Downloads</TabsTrigger>
        </TabsList>

        

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
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
                      <Label className="text-white">Description *</Label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Describe the project..."
                        rows={3}
                      />
                    </div>

                    {/* START: New File Input for Project Image */}
                    <div>
                      <Label className="text-white">Project Image *</Label>
                       <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={(e) => {
                            if (e.target.files) {
                              setProjectImageFile(e.target.files[0]);
                            }
                          }}
                          className="bg-white/5 border-white/20 text-white file:text-white file:bg-transparent file:border-0"
                        />
                        {projectImageFile && <p className="text-sm text-gray-400 mt-2">Selected: {projectImageFile.name}</p>}
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
                {/* START: Modified Project List Rendering */}
                {projects.map((project) => (
                  <div key={project.id} className="flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10 gap-4">
                    <div className="flex items-start gap-4 w-full">
                      {project.image_url ? (
                        <img 
                          src={project.image_url} 
                          alt={project.name}
                          className="h-20 w-20 rounded-md object-cover border border-white/20"
                        />
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
                            />
                            <Textarea
                              value={editFields.description}
                              onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                              placeholder="Description"
                            />
                            <Input
                              value={editFields.technologies.join(', ')}
                              onChange={(e) =>
                                setEditFields({ ...editFields, technologies: e.target.value.split(',').map(t => t.trim()) })
                              }
                              placeholder="Technologies (comma-separated)"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleEditSave(project.id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditProjectId(null)}>Cancel</Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-white">{project.name}</h4>
                            <p className="text-gray-400 text-sm">{project.description}</p>
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
                {/* END: Modified Project List Rendering */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex justify-between items-center">
                Order Management
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchOrders}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading orders...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-400">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchOrders}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No orders received yet.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-white text-lg">{order.projectTitle}</h4>
                          <p className="text-gray-400">by {order.name} • {order.email}</p>
                          <p className="text-gray-500 text-sm">
                            Submitted: {new Date(order.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : order.status === 'in-progress' ? 'secondary' : 'outline'}
                          className={
                            order.status === 'completed' ? 'bg-green-600' :
                            order.status === 'in-progress' ? 'bg-yellow-600' : 'bg-gray-600'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{order.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Budget: </span>
                          <span className="text-white">{order.budget || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Timeline: </span>
                          <span className="text-white">{order.timeline || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Phone: </span>
                          <span className="text-white">{order.phone || 'Not provided'}</span>
                        </div>
                      </div>
                      
                      {/* Show attached files if any */}
                      {order.fileUrls && order.fileUrls.length > 0 && (
                        <div className="mb-4">
                          <span className="text-gray-400 text-sm">Attached Files: </span>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {order.fileUrls.map((url, index) => {
                              // Simple check for image extensions
                              const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);

                              if (isImage) {
                                return (
                                  <a 
                                    key={index}
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group relative"
                                  >
                                    <img
                                      src={url}
                                      alt={`Attachment ${index + 1}`}
                                      className="h-20 w-20 rounded-md object-cover border border-white/20 group-hover:border-blue-400 transition-colors"
                                      loading="lazy"
                                    />
                                  </a>
                                );
                              } else {
                                return (
                                  <a 
                                    key={index}
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex h-20 w-20 flex-col items-center justify-center rounded-md border border-white/20 bg-white/5 p-2 text-center text-blue-400 hover:border-blue-400 hover:text-blue-300 transition-colors"
                                    title={url.split('/').pop()} // Show filename on hover
                                  >
                                    <FileText className="h-8 w-8" />
                                    <span className="mt-1 text-xs truncate">File {index + 1}</span>
                                  </a>
                                );
                              }
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, 'in-progress')}
                          disabled={order.status === 'in-progress'}
                        >
                          Mark In Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          disabled={order.status === 'completed'}
                        >
                          Mark Completed
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Admin Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Change Password
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePasswordChange}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> Your password will be stored locally and persist across browser sessions. 
                    Make sure to remember your new password as there's no recovery option.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads">
          <DownloadsForm />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminDashboard;