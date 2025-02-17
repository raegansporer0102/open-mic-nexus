
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegistrationData {
  name: string;
  email: string;
  mobile: string;
  profile_photo_url: string;
  status: 'pending' | 'approved' | 'declined';
  order_id: string;
}

const BookingStatus = () => {
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("No registration found with this order ID");
        setRegistrationData(null);
        return;
      }

      setRegistrationData(data as RegistrationData);

      // Show status-specific messages
      if (data.status === 'pending') {
        toast.info("Your registration is still pending approval");
      } else if (data.status === 'declined') {
        toast.error("Your registration has been declined");
      } else if (data.status === 'approved') {
        toast.success("Your registration has been approved!");
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
      toast.error("Error checking registration status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-6 space-y-6 glass-card">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Check Booking Status</h1>
          <p className="text-sm text-muted-foreground">
            Enter your order ID to check your booking status
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              placeholder="Enter your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Status"}
          </Button>
        </form>

        {registrationData && (
          <div className="mt-6 space-y-6">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">Your Order ID</h3>
              <p className="text-2xl font-bold text-primary">{registrationData.order_id}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please note: Keep this order ID safe. We are not responsible if you lose it.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              registrationData.status === 'approved' 
                ? 'bg-green-100' 
                : registrationData.status === 'declined'
                ? 'bg-red-100'
                : 'bg-yellow-100'
            }`}>
              <h3 className="font-semibold mb-2">Registration Status</h3>
              <p className="capitalize">{registrationData.status}</p>
            </div>

            {registrationData.status === 'approved' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={registrationData.profile_photo_url} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold">Name:</span> {registrationData.name}</p>
                  <p><span className="font-semibold">Email:</span> {registrationData.email}</p>
                  <p><span className="font-semibold">Mobile:</span> {registrationData.mobile}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default BookingStatus;
