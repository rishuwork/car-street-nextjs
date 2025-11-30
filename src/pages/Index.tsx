import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BudgetCalculator from "@/components/BudgetCalculator";
import { Check, Shield, DollarSign, Award, Phone, Gauge } from "lucide-react";
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
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      return vehicles.map((vehicle: Tables<"vehicles"> & { vehicle_images: Array<{ image_url: string; is_primary: boolean }> }) => ({
        ...vehicle,
        primaryImage: vehicle.vehicle_images.find(img => img.is_primary)?.image_url || vehicle.vehicle_images[0]?.image_url,
      }));
    },
  });


  return (
    <div className="min-h-screen flex flex-col">
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
            <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-foreground">
              <a href="tel:+15555551234">
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Budget Calculator Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <BudgetCalculator />
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">Featured Vehicles</h2>
            <p className="text-xl text-muted-foreground">Check out our hand-picked selection of quality vehicles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredVehicles.length > 0 ? (
              featuredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={vehicle.primaryImage || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop"} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-heading font-bold mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="mb-2 flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-green-600">${vehicle.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">+ HST & licensing</p>
                    </div>
                    <Button variant="default" className="w-full" asChild>
                      <Link to={`/vehicle/${vehicle.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <p className="text-lg">No featured vehicles available at this time.</p>
                <p className="text-sm mt-2">Check back soon for our latest offerings!</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/inventory">View All Inventory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold mb-12 text-center">Why Choose Car Street?</h2>
          
          {/* Three main benefits moved from top */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Quality Assured</h3>
                <p className="text-muted-foreground">Every vehicle undergoes rigorous inspection and comes with warranty options</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Best Prices</h3>
                <p className="text-muted-foreground">Competitive pricing with flexible financing options to fit your budget</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Top-Rated Service</h3>
                <p className="text-muted-foreground">Award-winning customer service with thousands of satisfied customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional benefits list */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[
                "100% price match guarantee",
                "Comprehensive vehicle inspection",
                "Extended warranty options",
                "Flexible financing solutions",
                "Trade-in assistance",
                "7-day exchange policy",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl mb-8 opacity-90">Visit us today or browse our inventory online</p>
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
