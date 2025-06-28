// src/components/CategoryManager.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supbaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server } from 'http';
import { Cpu, Brain, Wifi, Code, Smartphone, Settings, Palette, Monitor, Database, Cloud, Shield, Zap, Globe, Laptop, Tablet, Watch, Headphones, Camera, Grid3X3, Tv, Phone, MapPin, Calendar, Search, User, Heart, Loader, Bell, Folder, FileText, Trash2, Unlock, Eye, EyeOff, Loader2, Plus } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  key: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Brain,
  Wifi,
  Code,
  Smartphone,
  Settings,
  Palette,
  Monitor,
  Database,
  Cloud,
  Shield,
  Zap,
  Globe,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Grid3X3,
  Tv,
  Phone,
  MapPin,
  Calendar,
  Search,
  User,
  Heart,
  Loader,
  Bell,
  Folder,
  FileText,
  Trash2,
  Unlock,
  Eye,
  EyeOff
};

const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', key: '', icon: 'Monitor' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.key) {
      toast({ title: "Error", description: "Name and Key are required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (error) throw error;
      
      toast({ title: "Success", description: "Category added!" });
      setNewCategory({ name: '', key: '', icon: 'Monitor' });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Projects using it will need to be updated.")) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Category deleted" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Manage Categories</h3>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="text-white">Name *</Label>
          <Input
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white/5 border-white/20 text-white"
            placeholder="e.g., Web Application"
          />
        </div>
        
        <div>
          <Label className="text-white">Key *</Label>
          <Input
            value={newCategory.key}
            onChange={(e) => setNewCategory(prev => ({ ...prev, key: e.target.value.toLowerCase() }))}
            className="bg-white/5 border-white/20 text-white"
            placeholder="e.g., webapp"
          />
        </div>
        
        <div>
          <Label className="text-white">Icon</Label>
          <Select
            value={newCategory.icon}
            onValueChange={(value) => setNewCategory(prev => ({ ...prev, icon: value }))}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(iconMap).map(([name, Icon]) => (
                <SelectItem key={name} value={name}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleAddCategory}
        disabled={isSaving}
        className="mb-8"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Add Category
      </Button>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          categories.map(category => {
            const Icon = iconMap[category.icon] || Grid3X3;
            return (
              <div key={category.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-white">{category.name}</h4>
                    <p className="text-sm text-gray-400">{category.key}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryManager;