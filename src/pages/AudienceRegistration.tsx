
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xmhdvmwahpcgpwlrkwzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaGR2bXdhaHBjZ3B3bHJrd3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAyNjgxMzcsImV4cCI6MjAyNTg0NDEzN30.HFmEBXOZ1CrZcEPQ9qRzUTUBD0TLmRXr_xWrM5qHAYg'
);

const AudienceRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    transactionId: "",
    profilePhoto: null as File | null,
    paymentScreenshot: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'paymentScreenshot') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate a random order ID
      const orderId = 'ORD' + Date.now().toString();

      // Upload profile photo
      let profilePhotoUrl = '';
      if (formData.profilePhoto) {
        const fileExt = formData.profilePhoto.name.split('.').pop();
        const fileName = `${orderId}-profile.${fileExt}`;
        
        const { data: profileData, error: profileError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData.profilePhoto);

        if (profileError) {
          console.error('Profile photo upload error:', profileError);
          throw new Error('Error uploading profile photo');
        }
        
        // Get the public URL
        const { data: { publicUrl: profilePublicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
          
        profilePhotoUrl = profilePublicUrl;
      }

      // Upload payment screenshot
      let paymentScreenshotUrl = '';
      if (formData.paymentScreenshot) {
        const fileExt = formData.paymentScreenshot.name.split('.').pop();
        const fileName = `${orderId}-payment.${fileExt}`;
        
        const { data: paymentData, error: paymentError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, formData.paymentScreenshot);

        if (paymentError) {
          console.error('Payment screenshot upload error:', paymentError);
          throw new Error('Error uploading payment screenshot');
        }
        
        // Get the public URL
        const { data: { publicUrl: paymentPublicUrl } } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(fileName);
          
        paymentScreenshotUrl = paymentPublicUrl;
      }

      // Store registration data
      const { error: registrationError } = await supabase
        .from('audience_registrations')
        .insert([
          {
            order_id: orderId,
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            transaction_id: formData.transactionId,
            profile_photo_url: profilePhotoUrl,
            payment_screenshot_url: paymentScreenshotUrl,
            status: 'pending'
          }
        ]);

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw registrationError;
      }

      toast({
        title: "Registration Successful",
        description: `Your order ID is: ${orderId}. Please save this for future reference.`,
      });

      // Redirect to status page with order ID
      navigate(`/status?orderId=${orderId}`);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-6 space-y-6 glass-card">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Audience Registration</h1>
          <p className="text-sm text-muted-foreground">
            Join us for an amazing evening of performances
          </p>
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-accent/50">
          <div className="text-center space-y-2">
            <h2 className="font-semibold">Payment Details</h2>
            <p className="text-sm text-muted-foreground">Registration Fee: ₹149</p>
          </div>
          <div className="flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="UPI QR Code" 
              className="w-48 h-48 border rounded-lg"
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Scan the QR code to pay via UPI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <Input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profilePhoto')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
            <Input
              id="paymentScreenshot"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'paymentScreenshot')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Enter your payment transaction ID"
              value={formData.transactionId}
              onChange={(e) =>
                setFormData({ ...formData, transactionId: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register Now"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AudienceRegistration;
