import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BudgetCalculator from "@/components/BudgetCalculator";
import FeaturedVehiclesCarousel from "@/components/FeaturedVehiclesCarousel";
import CustomerReviews from "@/components/CustomerReviews";
import { SEO } from "@/components/SEO";
import { CreditCard, Eye, Scale, FileText } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const { data: featuredVehicles = [] } = useQuery({
    queryKey: ["featured-vehicles"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          vehicle_images(image_url, is_primary)
        `)
        .eq("featured", true)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return vehicles.map((vehicle: Tables<"vehicles"> & { vehicle_images: Array<{ image_url: string; is_primary: boolean }> }) => ({
        ...vehicle,
        primaryImage: vehicle.vehicle_images.find(img => img.is_primary)?.image_url || vehicle.vehicle_images[0]?.image_url,
      }));
    },
  });

  const whyChooseUs = [
    {
      icon: CreditCard,
      title: "Special Financing Offers",
      description: "Get approved instantly with low-interest rates & flexible terms—no credit, bad credit, no problem!"
    },
    {
      icon: Eye,
      title: "Transparent Pricing",
      description: "What you see is what you pay—fair, honest, and upfront deals every time!"
    },
    {
      icon: Scale,
      title: "Buy Smart, Sell Right",
      description: "We ensure you get top value—no overpaying, no underselling!"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Quality Used Cars in Langton, Ontario"
        description="We are certified used car dealers in Langton. Browse our pre-owned vehicles today & drive home your favourite! Contact us."
        url="https://carstreet.ca/"
      />
      <Header />

      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center text-white bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})` }}
      >
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 animate-fade-in">
            Find Your Dream Car Today
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
            Quality pre-owned vehicles with transparent pricing and exceptional service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button size="lg" variant="default" asChild className="text-lg px-8">
              <Link to="/inventory">Browse Inventory</Link>
            </Button>
            <Button size="lg" variant="default" asChild className="text-lg px-8">
              <Link to="/pre-approval">Get Pre-Approved</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Budget Calculator Section */}
      <section className="py-4 bg-muted">
        <div className="container mx-auto px-4">
          <BudgetCalculator />
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-heading font-bold mb-2">Featured Vehicles</h2>
            <p className="text-lg text-muted-foreground">Check out our hand-picked selection of quality vehicles</p>
          </div>

          <div className="mb-6 px-8 md:px-12">
            <FeaturedVehiclesCarousel vehicles={featuredVehicles} />
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/inventory">View All Inventory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-4 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold mb-6 text-center">Why Choose Car Street?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* CTA Section */}
      <section className="py-4 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-3">Ready to Find Your Perfect Car?</h2>
          <p className="text-lg mb-6 opacity-90">Visit us today or browse our inventory online</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/inventory">View Inventory</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;