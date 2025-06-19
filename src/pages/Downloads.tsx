import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Smartphone, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supbaseClient';

interface DownloadableProduct {
  id: string;
  name: string;
  description: string;
  fileSize: string;
  fileType: string;
  category: string;
  downloadUrl?: string;
}

const Downloads = () => {
  const [products, setProducts] = useState<DownloadableProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      const { data, error } = await supabase
        .from('downloads') // your Supabase table name
        .select('*');

      if (error) {
        console.error('Failed to fetch downloads:', error.message);
        setProducts([]);
      } else {
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.title || item.name,
          description: item.description,
          fileSize: item.file_size || 'Unknown',
          fileType: item.file_type || 'Unknown',
          category: item.category || 'Software',
          downloadUrl: item.file_url,
        }));
        setProducts(mapped);
      }

      setLoading(false);
    };

    fetchDownloads();
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Mobile App':
        return <Smartphone className="h-8 w-8" />;
      case 'Web Template':
        return <Monitor className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const handleDownload = (product: DownloadableProduct) => {
    if (product.downloadUrl) {
      window.open(product.downloadUrl, '_blank');
    } else {
      alert('Download URL not available.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-20">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Downloads</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Access our collection of ready-made software solutions, mobile apps, and development tools. 
              Download and start using them in your projects today.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <p className="text-center text-gray-400">Loading downloads...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400 mb-4">No downloads available yet</p>
                <p className="text-gray-500">Check back soon for our latest tools and software!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Card key={product.id} className="glass-effect group hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="text-blue-400 mr-3">
                          {getIcon(product.category)}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                        >
                          {product.category}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-400 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">Size: {product.fileSize}</span>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {product.fileType}
                        </Badge>
                      </div>
                      
                      <Button
                        onClick={() => handleDownload(product)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
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

export default Downloads;