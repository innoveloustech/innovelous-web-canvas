
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
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  image?: string;
  demoUrl?: string;
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
}

const AdminDashboard = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    technologies: [],
    image: '',
    demoUrl: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }

    // Load data from localStorage
    const savedProjects = localStorage.getItem('portfolio_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      technologies: newProject.technologies.filter(tech => tech.trim() !== ''),
    };

    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects));
    
    setNewProject({
      name: '',
      description: '',
      technologies: [],
      image: '',
      demoUrl: '',
    });
    setShowAddProject(false);
    
    toast({
      title: "Success",
      description: "Project added successfully!",
    });
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects));
    
    toast({
      title: "Success",
      description: "Project deleted successfully!",
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Success",
      description: "Order status updated!",
    });
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

  const stats = {
    totalProjects: projects.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
  };

  if (!isAuthenticated) {
    return null;
  }

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
                          value={newProject.demoUrl}
                          onChange={(e) => setNewProject(prev => ({ ...prev, demoUrl: e.target.value }))}
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
                        {newProject.technologies.map((tech, index) => (
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
                      <Button onClick={handleAddProject}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Project
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
                  <div key={project.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <h4 className="font-semibold text-white">{project.name}</h4>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                      <div className="flex gap-1 mt-2">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
