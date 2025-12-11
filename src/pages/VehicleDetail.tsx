import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, ArrowLeft, Check, ChevronLeft, ChevronRight, Calculator, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { trackVehicleView, trackClickToCall } from "@/utils/tracking";
import { generateVehicleStructuredData } from "@/utils/vehicleStructuredData";
import VehicleFeatures from "@/components/VehicleFeatures";
import PaymentCalculatorModal from "@/components/PaymentCalculatorModal";

const VehicleDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["vehicle-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_images")
        .select("*")
        .eq("vehicle_id", id)
        .order("is_primary", { ascending: false })
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  // Auto slideshow
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  // Track vehicle view when data is loaded
  useEffect(() => {
    if (vehicle) {
      trackVehicleView(vehicle);
      
      const structuredData = generateVehicleStructuredData(
        vehicle,
        images?.[0]?.image_url
      );
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [vehicle, images]);

  const handleCallClick = () => {
    trackClickToCall('+16398990000');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-4">
          <div className="container mx-auto px-4">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-4">
          <div className="container mx-auto px-4">
            <p>Vehicle not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const primaryImage = images?.[0]?.image_url;
  const structuredData = vehicle ? generateVehicleStructuredData(vehicle, primaryImage) : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {vehicle && (
        <SEO 
          title={`${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale`}
          description={`Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage.toLocaleString()} km. ${vehicle.transmission} transmission, ${vehicle.fuel_type} fuel. Price: $${Number(vehicle.price).toLocaleString()}. Located at Car Street, Langton ON.`}
          url={`https://carstreet.ca/vehicle/${vehicle.id}`}
          image={primaryImage}
          type="product"
          keywords={`${vehicle.year} ${vehicle.make} ${vehicle.model}, used ${vehicle.make} for sale, ${vehicle.make} ${vehicle.model} Ontario`}
          jsonLd={structuredData}
        />
      )}
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-2">
            <Link to="/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Image Gallery */}
              <div className="space-y-3">
                {images && images.length > 0 ? (
                  <>
                    <div className="relative group aspect-video">
                      <picture>
                        <img 
                          src={images[selectedImageIndex].image_url} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      </picture>
                      {images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          {/* Dots indicator */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === selectedImageIndex ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {images.map((image, index) => (
                          <div key={image.id} className="aspect-video">
                            <picture>
                              <img 
                                src={image.image_url} 
                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                className={`w-full h-full object-cover rounded cursor-pointer transition-all ${
                                  selectedImageIndex === index 
                                    ? 'ring-2 ring-primary opacity-100' 
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                                loading="lazy"
                              />
                            </picture>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-72 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>

              {/* Vehicle Title */}
              <div>
                <h1 className="text-3xl font-heading font-bold mb-3">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
              </div>

              {/* Vehicle Features Section */}
              <VehicleFeatures
                mileage={vehicle.mileage}
                color={vehicle.color}
                transmission={vehicle.transmission}
                drivetrain={vehicle.drivetrain}
                fuelType={vehicle.fuel_type}
                condition={vehicle.condition}
              />

              {/* Description */}
              {vehicle.description && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Key Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vehicle Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-sm">VIN</span>
                      <span className="text-muted-foreground text-sm">{vehicle.vin}</span>
                    </div>
                    {vehicle.engine && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-sm">Engine</span>
                        <span className="text-muted-foreground text-sm">{vehicle.engine}</span>
                      </div>
                    )}
                    {vehicle.location && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-sm">Location</span>
                        <span className="text-muted-foreground text-sm">{vehicle.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Price Card */}
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-heading font-bold text-price">
                      ${Number(vehicle.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">+ Tax & Licensing</p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="lg"
                      onClick={() => setIsCalculatorOpen(true)}
                    >
                      <Calculator className="mr-2 h-5 w-5" />
                      Estimate Your Payments
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="lg"
                      asChild
                    >
                      <Link to="/pre-approval">
                        <FileText className="mr-2 h-5 w-5" />
                        Get Pre-Approved
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        handleCallClick();
                        window.location.href = 'tel:+16398990000';
                      }}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Call Now
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="lg"
                      onClick={() => window.location.href = 'mailto:info@carstreet.ca'}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Email Inquiry
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-heading font-semibold mb-2 text-sm">Why Buy From Us?</h3>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>Price match guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>Full vehicle inspection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>Warranty options available</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>Flexible financing</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Calculator Modal */}
      <PaymentCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        vehiclePrice={Number(vehicle.price)}
      />
    </div>
  );
};

export default VehicleDetail;