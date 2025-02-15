
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from '@supabase/supabase-js';
import { format } from "date-fns";
import { toast } from "sonner";

// Initialize Supabase client with your project's URL and anon key
const supabase = createClient(
  'https://xmhdvmwahpcgpwlrkwzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaGR2bXdhaHBjZ3B3bHJrd3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAyNjgxMzcsImV4cCI6MjAyNTg0NDEzN30.HFmEBXOZ1CrZcEPQ9qRzUTUBD0TLmRXr_xWrM5qHAYg'
);

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [prices, setPrices] = useState({
    performer: 349,
    audience: 149,
  });

  // Query for performer registrations
  const { data: performerRegistrations = [], isLoading: loadingPerformers, error: performerError } = useQuery({
    queryKey: ['performer-registrations'],
    queryFn: async () => {
      console.log('Fetching performer registrations...');
      const { data, error } = await supabase
        .from('performer_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Performer fetch error:', error);
        throw error;
      }
      console.log('Performer data:', data);
      return data || [];
    },
    enabled: isAuthenticated
  });

  // Query for audience registrations
  const { data: audienceRegistrations = [], isLoading: loadingAudience, error: audienceError } = useQuery({
    queryKey: ['audience-registrations'],
    queryFn: async () => {
      console.log('Fetching audience registrations...');
      const { data, error } = await supabase
        .from('audience_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Audience fetch error:', error);
        throw error;
      }
      console.log('Audience data:', data);
      return data || [];
    },
    enabled: isAuthenticated
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, hardcoded credentials
    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsAuthenticated(true);
      // Manually trigger refetch of data after login
      queryClient.invalidateQueries({ queryKey: ['performer-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['audience-registrations'] });
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'performer' | 'audience') => {
    setPrices({ ...prices, [type]: parseInt(e.target.value) || 0 });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-6 space-y-6 glass-card">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Please enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="text-center">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (performerError || audienceError) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-500">Error loading data</h2>
          <p>{performerError?.message || audienceError?.message}</p>
        </Card>
      </div>
    );
  }

  const renderRegistrationTable = (registrations: any[], type: 'performer' | 'audience') => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>Transaction ID</TableHead>
          {type === 'performer' && <TableHead>Performance Type</TableHead>}
          <TableHead>Registration Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {registrations.map((registration) => (
          <TableRow key={registration.id}>
            <TableCell>{registration.order_id}</TableCell>
            <TableCell>{registration.name}</TableCell>
            <TableCell>{registration.email}</TableCell>
            <TableCell>{registration.mobile}</TableCell>
            <TableCell>{registration.transaction_id}</TableCell>
            {type === 'performer' && (
              <TableCell>{registration.performance_type}</TableCell>
            )}
            <TableCell>
              {format(new Date(registration.created_at), 'PPpp')}
            </TableCell>
            <TableCell>{registration.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        <Card className="p-6 glass-card mb-6">
          <h2 className="text-xl font-semibold mb-4">Price Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performerPrice">Performer Registration Price (₹)</Label>
              <Input
                id="performerPrice"
                type="number"
                value={prices.performer}
                onChange={(e) => handlePriceChange(e, 'performer')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audiencePrice">Audience Registration Price (₹)</Label>
              <Input
                id="audiencePrice"
                type="number"
                value={prices.audience}
                onChange={(e) => handlePriceChange(e, 'audience')}
              />
            </div>
          </div>
          <Button className="mt-4">Save Prices</Button>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Performer Registrations</h2>
            {loadingPerformers ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : performerRegistrations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No registrations to display</div>
            ) : (
              renderRegistrationTable(performerRegistrations, 'performer')
            )}
          </Card>

          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Audience Registrations</h2>
            {loadingAudience ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : audienceRegistrations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No registrations to display</div>
            ) : (
              renderRegistrationTable(audienceRegistrations, 'audience')
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
