import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supbaseClient';
import RichTextEditor from './RichTextEditor'

import { 
  Cpu, Brain, Wifi, Code, Smartphone, Settings, Palette, 
  Monitor, Database, Cloud, Shield, Zap, Globe, 
  Laptop, Tablet, Watch, Headphones, Camera, 
  Plus, Edit, Trash2, Save, X 
} from 'lucide-react';

// Available icons for selection
const iconOptions = [
  { name: 'Cpu', component: Cpu },
  { name: 'Brain', component: Brain },
  { name: 'Wifi', component: Wifi },
  { name: 'Code', component: Code },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Settings', component: Settings },
  { name: 'Palette', component: Palette },
  { name: 'Monitor', component: Monitor },
  { name: 'Database', component: Database },
  { name: 'Cloud', component: Cloud },
  { name: 'Shield', component: Shield },
  { name: 'Zap', component: Zap },
  { name: 'Globe', component: Globe },
  { name: 'Laptop', component: Laptop },
  { name: 'Tablet', component: Tablet },
  { name: 'Watch', component: Watch },
  { name: 'Headphones', component: Headphones },
  { name: 'Camera', component: Camera },
];

const Expertise = () => {
  const [services, setServices] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    description: '',
    long_description: '',
  });
  const [loading, setLoading] = useState(false);
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
      setError('Failed to fetch services');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.icon || !formData.title || !formData.description) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('services')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('services')
          .insert([{ ...formData }]);
        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({ icon: '', title: '', description: '', long_description: '' });
      fetchServices();
    } catch (err) {
      setError('Failed to save service');
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (service) => {
    setFormData({
      icon: service.icon,
      title: service.title,
      description: service.description,
      long_description: service.long_description
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchServices();
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ icon: '', title: '', description: '' , long_description: ''});
    setError('');
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    return iconOption ? iconOption.component : Cpu;
  };

  const renderIconPreview = () => {
    if (!formData.icon) return null;
    const IconComponent = getIconComponent(formData.icon);
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg">
        <IconComponent className="h-8 w-8 text-purple-600" />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services Manager</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Service' : 'Add New Service'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({...formData, icon: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => {
                        const IconComponent = icon.component;
                        return (
                          <SelectItem key={icon.name} value={icon.name}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {icon.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  {renderIconPreview()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Service title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description for card"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Description</label>
                <RichTextEditor
                  value={formData.long_description}
                  onChange={(value) => setFormData({...formData, long_description: value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const IconComponent = getIconComponent(service.icon);
          return (
            <Card key={service.id} className="relative group">
              <CardContent className="p-6">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-purple-600 mb-4 flex justify-center">
                    <IconComponent className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-xs text-gray-500">
                    {service.long_description ? 
                      "Click to view detailed description" : 
                      "No detailed description available"}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No services found. Add your first service to get started.
        </div>
      )}
    </div>
  );
};

export default Expertise;