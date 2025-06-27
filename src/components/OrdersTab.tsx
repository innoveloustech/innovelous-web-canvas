// src/components/OrdersTab.tsx

import { useState } from 'react';
import { supabase } from '@/lib/supbaseClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Trash2 } from 'lucide-react';

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

interface OrdersTabProps {
  orders: Order[];
  fetchOrders: () => void;
  loading: boolean;
  error: string | null;
}

const OrdersTab = ({ orders, fetchOrders, loading, error }: OrdersTabProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Order marked as ${newStatus}.`,
      });

      fetchOrders(); // Refresh data in parent
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    setDeletingId(orderId);
    try {
      // Note: This does not delete associated files from storage.
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order deleted",
        description: "The order has been successfully removed",
      });

      fetchOrders(); // Refresh data in parent
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
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
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && orders.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
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
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        order.status === 'completed' ? 'bg-green-600 text-white border-green-500' :
                        order.status === 'in-progress' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-gray-600 text-white border-gray-500'
                      }
                    >
                      {order.status}
                    </Badge>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      {deletingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{order.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-400">Budget: </span><span className="text-white">{order.budget || 'N/A'}</span></div>
                  <div><span className="text-gray-400">Timeline: </span><span className="text-white">{order.timeline || 'N/A'}</span></div>
                  <div><span className="text-gray-400">Phone: </span><span className="text-white">{order.phone || 'N/A'}</span></div>
                </div>
                
                {order.fileUrls && order.fileUrls.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-400 text-sm">Attached Files:</span>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {order.fileUrls.map((url, index) => (
                        <a 
                          key={index}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group"
                          title={url.split('/').pop()}
                        >
                          {/\.(jpeg|jpg|gif|png|webp)$/i.test(url) ? (
                             <img src={url} alt={`Attachment ${index + 1}`} className="h-20 w-20 rounded-md object-cover border border-white/20 group-hover:border-blue-400 transition-colors" loading="lazy" />
                          ) : (
                            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-md border border-white/20 bg-white/5 p-2 text-center text-blue-400 hover:border-blue-400 hover:text-blue-300 transition-colors">
                              <FileText className="h-8 w-8" />
                              <span className="mt-1 text-xs truncate">File {index + 1}</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, 'in-progress')} disabled={order.status !== 'pending'}>Mark In Progress</Button>
                  <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, 'completed')} disabled={order.status === 'completed'}>Mark Completed</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OrdersTab;