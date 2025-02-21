
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const FeatureCard = ({ title, price, route, description }: { title: string; price: string; route: string; description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="w-full md:w-80"
  >
    <Card className="glass-card p-6 space-y-4">
      <Badge variant="secondary" className="mb-2">
        {price}
      </Badge>
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild className="w-full mt-4">
        <Link to={route}>Register Now</Link>
      </Button>
    </Card>
  </motion.div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight fade-in">
          The Navodian Platform Ticket Booking
        </h1>
        <p className="text-lg text-muted-foreground fade-in">
          Join us for an unforgettable evening of talent and entertainment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl fade-in">
        <FeatureCard
          title="Performer Registration"
          price="₹349"
          route="/register/performer"
          description="Showcase your talent on stage. Open for singers, dancers, comedians, and more."
        />
        <FeatureCard
          title="Audience Registration"
          price="₹149"
          route="/register/audience"
          description="Be part of an amazing show. Limited seats available!"
        />
        <FeatureCard
          title="Check Booking Status"
          price="Track Order"
          route="/status"
          description="View your registration status and booking details."
        />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Need help? Contact our support team</p>
      </div>
    </div>

    <div style={{ textAlign: "center", fontSize: "14px", color: "#6c757d", marginTop: "2rem" }}>
  <p>
    <a 
      href="/admin" 
      target="_blank" 
      rel="noopener noreferrer" 
      style={{
        backgroundColor: "red",
        color: "white",
        padding: "8px 16px",
        borderRadius: "4px",
        textDecoration: "none",
        display: "inline-block",
        fontWeight: "bold",
        transition: "background-color 0.3s",
        border: "none",
        cursor: "pointer"
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "darkred")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "red")}
    >
      Admin Login
    </a>
  </p>
</div>

  
  );
};







export default Index;
