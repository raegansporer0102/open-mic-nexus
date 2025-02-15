
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";

const AudienceRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    transactionId: "",
    profilePhoto: null as File | null,
    paymentScreenshot: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'paymentScreenshot') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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

          <Button type="submit" className="w-full">
            Register Now
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
