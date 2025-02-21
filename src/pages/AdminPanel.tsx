
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginCard } from "@/components/admin/LoginCard";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const handleStatusUpdate = async (registrationId: string, newStatus: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) {
        console.error('Error updating status:', error);
        toast.error(`Failed to ${newStatus} registration: ${error.message}`);
        return;
      }

      toast.success(`Registration ${newStatus} successfully`);
      
      // Invalidate and refetch all registration queries
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const { data: performerRegistrations = [], isLoading: loadingPerformers, error: performerError } = useQuery({
    queryKey: ['registrations', 'performer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('type', 'performer')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  const { data: audienceRegistrations = [], isLoading: loadingAudience, error: audienceError } = useQuery({
    queryKey: ['registrations', 'audience'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('type', 'audience')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <LoginCard onLogin={setIsAuthenticated} />;
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

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Performer Registrations</h2>
            {loadingPerformers ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : performerRegistrations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No registrations to display</div>
            ) : (
              <RegistrationsTable
                registrations={performerRegistrations}
                type="performer"
                onStatusUpdate={handleStatusUpdate}
                onImageSelect={setSelectedImage}
              />
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Audience Registrations</h2>
            {loadingAudience ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : audienceRegistrations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No registrations to display</div>
            ) : (
              <RegistrationsTable
                registrations={audienceRegistrations}
                type="audience"
                onStatusUpdate={handleStatusUpdate}
                onImageSelect={setSelectedImage}
              />
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
          <DialogDescription className="mt-4">
            Click the image to view in full size
          </DialogDescription>
          {selectedImage && (
            <a 
              href={selectedImage.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 block"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.type}
                className="w-full h-auto rounded-lg cursor-zoom-in"
              />
            </a>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
