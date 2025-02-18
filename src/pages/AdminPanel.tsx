import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [prices, setPrices] = useState({
    performer: 349,
    audience: 149,
  });
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const handleStatusUpdate = async (registrationId: string, newStatus: 'approved' | 'declined') => {
    try {
      console.log('Updating registration status:', { registrationId, newStatus });
      
      // First, get the current registration
      const { data: registration, error: fetchError } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (fetchError || !registration) {
        console.error('Error fetching registration:', fetchError);
        toast.error('Could not find registration');
        return;
      }

      // Update the status with a direct update
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .match({ id: registrationId })
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update status');
        return;
      }

      // Success! Show toast and refresh data
      toast.success(`Registration ${newStatus} successfully`);

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({
        queryKey: ['registrations', registration.type],
        exact: true,
        refetchType: 'active',
      });

      // Force an immediate refetch
      queryClient.refetchQueries({
        queryKey: ['registrations', registration.type],
        exact: true,
        type: 'active',
      });

    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update registration status');
    }
  };

  // Update the queries to use correct options
  const { data: performerRegistrations = [], isLoading: loadingPerformers, error: performerError } = useQuery({
    queryKey: ['registrations', 'performer'],
    queryFn: async () => {
      console.log('Fetching performer registrations...');
      const { data, error } = await supabase
        .from('registrations')
        .select()
        .eq('type', 'performer')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Performer data:', data);
      return data || [];
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0
  });

  const { data: audienceRegistrations = [], isLoading: loadingAudience, error: audienceError } = useQuery({
    queryKey: ['registrations', 'audience'],
    queryFn: async () => {
      console.log('Fetching audience registrations...');
      const { data, error } = await supabase
        .from('registrations')
        .select()
        .eq('type', 'audience')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Audience data:', data);
      return data || [];
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0
  });

  // Add a query to fetch current prices
  const { data: currentPrices } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      console.log('Fetching prices...');
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .single();
      
      if (error) {
        console.error('Prices fetch error:', error);
        throw error;
      }
      
      if (data) {
        setPrices({
          performer: data.performer_price,
          audience: data.audience_price
        });
      }
      
      return data;
    },
    enabled: isAuthenticated
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, hardcoded credentials
    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsAuthenticated(true);
      // Manually trigger refetch of data after login
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'performer' | 'audience') => {
    const value = parseInt(e.target.value) || 0;
    setPrices(prev => ({ ...prev, [type]: value }));
  };

  const handleSavePrices = async () => {
    try {
      console.log('Updating prices:', prices);
      const { error } = await supabase
        .from('prices')
        .update({
          performer_price: prices.performer,
          audience_price: prices.audience
        })
        .eq('id', 1);

      if (error) {
        console.error('Price update error:', error);
        throw error;
      }

      toast.success("Prices updated successfully");
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error("Failed to update prices");
    }
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
          <p className="mt-2">{(performerError as Error)?.message || (audienceError as Error)?.message}</p>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['registrations'] });
            }}
            className="mt-4"
          >
            Retry
          </Button>
          <Link to="/">
            <Button variant="outline" className="ml-2 mt-4">Back to Home</Button>
          </Link>
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
          <TableHead>Photos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
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
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage({
                  url: registration.profile_photo_url,
                  type: 'Profile Photo'
                })}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage({
                  url: registration.payment_screenshot_url,
                  type: 'Payment Screenshot'
                })}
              >
                Payment
              </Button>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-sm ${
                registration.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : registration.status === 'declined'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {registration.status}
              </span>
            </TableCell>
            <TableCell>
              {registration.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusUpdate(registration.id, 'approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(registration.id, 'declined')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </TableCell>
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
          <Button 
            className="mt-4" 
            onClick={handleSavePrices}
          >
            Save Prices
          </Button>
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

      <Dialog 
        open={!!selectedImage} 
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.type}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="mt-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.type}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
