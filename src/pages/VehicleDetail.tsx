import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const VehicleDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
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
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <p>Vehicle not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                {images && images.length > 0 ? (
                  <>
                    <div className="relative group">
                      <img 
                        src={images[selectedImageIndex].image_url} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
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
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                        {images.map((image, index) => (
                          <img 
                            key={image.id}
                            src={image.image_url} 
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className={`w-full h-16 md:h-24 object-cover rounded-lg cursor-pointer transition-all ${
                              selectedImageIndex === index 
                                ? 'ring-2 ring-primary opacity-100' 
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>

              {/* Vehicle Title */}
              <div>
                <h1 className="text-4xl font-heading font-bold mb-2">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{vehicle.mileage.toLocaleString()} km</Badge>
                  <Badge variant="secondary">{vehicle.transmission}</Badge>
                  <Badge variant="secondary">{vehicle.fuel_type}</Badge>
                  <Badge variant="secondary">{vehicle.drivetrain}</Badge>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Specifications */}
              {vehicle.engine && (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Engine</span>
                        <span className="text-muted-foreground">{vehicle.engine}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Drivetrain</span>
                        <span className="text-muted-foreground">{vehicle.drivetrain}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Transmission</span>
                        <span className="text-muted-foreground">{vehicle.transmission}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Fuel Type</span>
                        <span className="text-muted-foreground">{vehicle.fuel_type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">VIN</span>
                      <span className="text-muted-foreground">{vehicle.vin}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Color</span>
                      <span className="text-muted-foreground">{vehicle.color}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Condition</span>
                      <span className="text-muted-foreground capitalize">{vehicle.condition}</span>
                    </div>
                    {vehicle.location && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Location</span>
                        <span className="text-muted-foreground">{vehicle.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Price</p>
                    <p className="text-5xl font-heading font-bold text-primary">
                      ${Number(vehicle.price).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button variant="default" className="w-full" size="lg" asChild>
                      <a href="tel:+15555551234">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <a href="mailto:info@carstreet.com">
                        <Mail className="mr-2 h-5 w-5" />
                        Email Inquiry
                      </a>
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-heading font-semibold mb-3">Why Buy From Us?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Price match guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Full vehicle inspection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Warranty options available</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
    </div>
  );
};

export default VehicleDetail;
