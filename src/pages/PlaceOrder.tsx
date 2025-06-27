import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supbaseClient';

// Initialize Supabase client

interface OrderForm {
  name: string;
  email: string;
  phone: string;
  projectTitle: string;
  description: string;
  budget: string;
  timeline: string;
  files: File[];
}

interface DatabaseOrder {
  name: string;
  email: string;
  phone?: string;
  project_title: string;
  description: string;
  budget?: string;
  timeline?: string;
  file_urls?: string[];
  status: string;
  submitted_at: string;
}


const PlaceOrder = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OrderForm>({
    name: '',
    email: '',
    phone: '',
    projectTitle: '',
    description: '',
    budget: '',
    timeline: '',
    files: [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      filePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: Array.from(e.target.files || []) }));
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `order-attachments/${fileName}`;

      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const removeFile = (indexToRemove: number) => {
    // Revoke the specific object URL to free memory
    URL.revokeObjectURL(filePreviews[indexToRemove]);

    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
    setFilePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload files if any
      let fileUrls: string[] = [];
      if (formData.files.length > 0) {
        try {
          fileUrls = await uploadFiles(formData.files);
        } catch (error) {
          console.error('File upload failed:', error);
          toast({
            title: "File Upload Failed",
            description: "Some files couldn't be uploaded, but we'll still process your order.",
            variant: "destructive",
          });
        }
      }

      // Prepare order data for database
      const orderData: DatabaseOrder = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        project_title: formData.projectTitle,
        description: formData.description,
        budget: formData.budget || null,
        timeline: formData.timeline || null,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      // Insert order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        throw error;
      }

      console.log('Order submitted successfully:', data);
      setIsSubmitted(true);
      toast({
        title: "Order Submitted Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectTitle: '',
        description: '',
        budget: '',
        timeline: '',
        files: [],
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-effect rounded-2xl p-12">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">Order Submitted!</h1>
              <p className="text-xl text-gray-400 mb-8">
                Thank you for choosing Innovelous Tech. We've received your project request and will contact you within 24 hours.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Submit Another Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Start Your <span className="gradient-text">Project</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ready to bring your ideas to life? Fill out the form below and let's discuss how we can help you build something amazing.
            </p>
          </div>

          {/* Form */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="John Doe"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Project Information */}
                <div>
                  <Label htmlFor="projectTitle" className="text-white">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    name="projectTitle"
                    type="text"
                    required
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Smart Home Automation System"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Project Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Describe your project in detail. Include requirements, features, and any specific technologies you'd like us to use..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="files" className="text-white">Attach Files (Optional)</Label>
                  <div className="mt-2">
                    <label htmlFor="files" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Images, documents, or any relevant files
                        </p>
                      </div>
                      <input
                        id="files"
                        name="files"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {formData.files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          {formData.files.length} file(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Project Request'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;