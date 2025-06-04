
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingCart, Eye, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalVisits: number;
  totalSignups: number;
  totalOrders: number;
  projectsInProgress: number;
  visitData: Array<{ name: string; visits: number; signups: number; orders: number }>;
  orderStatusData: Array<{ name: string; value: number }>;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    totalSignups: 0,
    totalOrders: 0,
    projectsInProgress: 0,
    visitData: [],
    orderStatusData: []
  });

  useEffect(() => {
    // Load analytics data from localStorage or generate mock data
    const savedAnalytics = localStorage.getItem('site_analytics');
    if (savedAnalytics) {
      setAnalytics(JSON.parse(savedAnalytics));
    } else {
      // Generate mock analytics data
      const mockData: AnalyticsData = {
        totalVisits: 1247,
        totalSignups: 89,
        totalOrders: 23,
        projectsInProgress: 8,
        visitData: [
          { name: 'Mon', visits: 180, signups: 12, orders: 3 },
          { name: 'Tue', visits: 220, signups: 15, orders: 5 },
          { name: 'Wed', visits: 195, signups: 8, orders: 2 },
          { name: 'Thu', visits: 250, signups: 18, orders: 4 },
          { name: 'Fri', visits: 210, signups: 14, orders: 6 },
          { name: 'Sat', visits: 92, signups: 11, orders: 2 },
          { name: 'Sun', visits: 100, signups: 11, orders: 1 },
        ],
        orderStatusData: [
          { name: 'Pending', value: 8 },
          { name: 'In Progress', value: 8 },
          { name: 'Completed', value: 7 },
        ]
      };
      setAnalytics(mockData);
      localStorage.setItem('site_analytics', JSON.stringify(mockData));
    }
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visits"
          value={analytics.totalVisits}
          icon={<Eye className="h-6 w-6 text-white" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Signups"
          value={analytics.totalSignups}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-green-600"
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={<ShoppingCart className="h-6 w-6 text-white" />}
          color="bg-purple-600"
        />
        <StatCard
          title="In Progress"
          value={analytics.projectsInProgress}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.visitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="visits" fill="#3B82F6" name="Visits" />
                <Bar dataKey="signups" fill="#10B981" name="Signups" />
                <Bar dataKey="orders" fill="#8B5CF6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Line Chart */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white">Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.visitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} name="Visits" />
              <Line type="monotone" dataKey="signups" stroke="#10B981" strokeWidth={2} name="Signups" />
              <Line type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
