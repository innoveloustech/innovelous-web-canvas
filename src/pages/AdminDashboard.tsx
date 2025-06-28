
import { supabase } from '@/lib/supbaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import newly created components
import PortfolioTab from '@/components/PortfolioTab'; // Adjust path if needed
import OrdersTab from '@/components/OrdersTab';       // Adjust path if needed
import DownloadsForm from '@/components/DownloadsForm';
import Expertise from '@/components/AdminExpertise';

import { LogOut, Users, FolderOpen, ShoppingCart, TrendingUp, Settings, Key, Eye, EyeOff } from 'lucide-react';
import CategoryManager from '@/components/CategoryManager';

// Define types centrally or import them
interface Project {
  id: string; name: string; description: string; technologies: string[]; image_urls?: string[]; demo_url?: string; category: string;
}
interface Order {
  id: string; name: string; email: string; phone: string; projectTitle: string; description: string; budget: string; timeline: string; status: 'pending' | 'in-progress' | 'completed'; submittedAt: string; fileUrls?: string[];
}

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching projects", description: error.message, variant: "destructive" });
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      const transformedOrders: Order[] = data.map(o => ({ ...o, projectTitle: o.project_title, fileUrls: o.file_urls, submittedAt: o.submitted_at }));
      setOrders(transformedOrders);
    } catch (error: any) {
      setOrdersError('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin'); return; }
    fetchProjects();
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => { logout(); navigate('/admin'); };
  
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" }); return;
    }
    const success = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if(success) {
      toast({ title: "Success", description: "Password changed!" });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast({ title: "Error", description: "Current password is incorrect", variant: "destructive" });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => setShowPasswords(p => ({ ...p, [field]: !p[field] }));

  const stats = { totalProjects: projects.length, totalOrders: orders.length, pendingOrders: orders.filter(o => o.status === 'pending').length, completedOrders: orders.filter(o => o.status === 'completed').length, };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your portfolio and orders</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-effect"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Projects</p><p className="text-3xl font-bold text-white">{stats.totalProjects}</p></div><FolderOpen className="h-8 w-8 text-blue-400" /></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Orders</p><p className="text-3xl font-bold text-white">{stats.totalOrders}</p></div><ShoppingCart className="h-8 w-8 text-green-400" /></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-gray-400 text-sm">Pending Orders</p><p className="text-3xl font-bold text-white">{stats.pendingOrders}</p></div><TrendingUp className="h-8 w-8 text-yellow-400" /></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-6 flex items-center justify-between"><div><p className="text-gray-400 text-sm">Completed</p><p className="text-3xl font-bold text-white">{stats.completedOrders}</p></div><Users className="h-8 w-8 text-purple-400" /></CardContent></Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600">Portfolio</TabsTrigger>
          <TabsTrigger value="Expertise" className="data-[state=active]:bg-blue-600">Expertise</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">Settings</TabsTrigger>
          <TabsTrigger value="downloads" className="data-[state=active]:bg-blue-600">Downloads</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab orders={orders} fetchOrders={fetchOrders} loading={loadingOrders} error={ordersError} />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioTab projects={projects} setProjects={setProjects} fetchProjects={fetchProjects} />
        </TabsContent>

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

        <TabsContent value="downloads"><DownloadsForm /></TabsContent>
        <TabsContent value="Expertise"><Expertise /></TabsContent>
        <TabsContent value="categories">
          <Card className="glass-effect mt-6">
            <CardHeader>
              <CardTitle className="text-white">Manage Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryManager/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;