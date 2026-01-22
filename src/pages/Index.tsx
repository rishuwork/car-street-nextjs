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
import whyChooseBg from "@/assets/why-choose-bg.jpg";
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
    },
    {
      icon: FileText,
      title: "Quality Guaranteed",
      description: "Every vehicle is thoroughly inspected and comes with a comprehensive warranty for your peace of mind."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Car Street | Used Car Dealership in Langton, Ontario | Financing Available"
        description="Serving Langton, Brampton, Mississauga, and the GTA. Car Street offers certified used vehicles, transparent pricing, and instant financing for all credit types."
        url="https://carstreet.ca/"
      />
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Luxury car background"
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

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
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <BudgetCalculator />
          </div>
        </section>

        {/* Featured Vehicles Section */}
        <section className="py-12">
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
        <section className="relative py-16 overflow-hidden">
          {/* Background with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={whyChooseBg}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/70 to-black/75" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">
                Why Choose Car Street?
              </h2>
              <p className="text-white/90 text-lg">
                Experience the difference of a dealership that puts you first. At Car Street, we combine exceptional service with unbeatable value to make your car buying journey seamless and stress-free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
              {whyChooseUs.map((item, index) => {
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/5">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold mb-2 text-white uppercase tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-base leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <CustomerReviews />

        {/* CTA Section */}
        <section className="py-12 bg-primary text-primary-foreground">
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;