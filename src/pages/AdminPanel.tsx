
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [prices, setPrices] = useState({
    performer: 349,
    audience: 149,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, hardcoded credentials
    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Performer Registrations</h2>
            <div className="text-sm text-muted-foreground">
              No registrations to display
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Audience Registrations</h2>
            <div className="text-sm text-muted-foreground">
              No registrations to display
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
