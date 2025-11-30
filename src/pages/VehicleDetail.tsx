import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, ArrowLeft, Check } from "lucide-react";

const VehicleDetail = () => {
  const { id } = useParams();

  // In a real app, this would fetch from an API
  const vehicle = {
    id: Number(id),
    year: 2020,
    make: "Honda",
    model: "Civic",
    trim: "EX",
    price: 18995,
    mileage: "45,000 km",
    transmission: "Automatic",
    fuelType: "Gasoline",
    exteriorColor: "Crystal Black Pearl",
    interiorColor: "Black Cloth",
    vin: "2HGFC2F59LH123456",
    stockNumber: "CS2024-001",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=1200&auto=format&fit=crop",
    ],
    features: [
      "Blind Spot Monitoring",
      "Backup Camera",
      "Lane Departure Warning",
      "Adaptive Cruise Control",
      "Apple CarPlay & Android Auto",
      "Heated Seats",
      "Sunroof",
      "Alloy Wheels",
      "Keyless Entry",
      "Power Windows & Locks",
      "Climate Control",
      "Bluetooth Connectivity",
    ],
    description: "This well-maintained 2020 Honda Civic EX is the perfect combination of style, efficiency, and reliability. With only 45,000 km on the odometer, this one-owner vehicle has been meticulously cared for and comes with a complete service history. The Civic offers exceptional fuel economy, advanced safety features, and a spacious interior that's perfect for daily commuting or weekend adventures.",
    specifications: {
      "Engine": "2.0L 4-Cylinder",
      "Horsepower": "158 hp",
      "Torque": "138 lb-ft",
      "Drive Type": "Front-Wheel Drive",
      "Fuel Economy (City)": "7.8 L/100km",
      "Fuel Economy (Highway)": "5.9 L/100km",
      "Seating Capacity": "5 Passengers",
      "Doors": "4",
    }
  };

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
                <img 
                  src={vehicle.images[0]} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="grid grid-cols-3 gap-4">
                  {vehicle.images.slice(1).map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - View ${index + 2}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              </div>

              {/* Vehicle Title */}
              <div>
                <h1 className="text-4xl font-heading font-bold mb-2">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{vehicle.mileage}</Badge>
                  <Badge variant="secondary">{vehicle.transmission}</Badge>
                  <Badge variant="secondary">{vehicle.fuelType}</Badge>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(vehicle.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
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
                      <span className="font-medium">Stock Number</span>
                      <span className="text-muted-foreground">{vehicle.stockNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Exterior Color</span>
                      <span className="text-muted-foreground">{vehicle.exteriorColor}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Interior Color</span>
                      <span className="text-muted-foreground">{vehicle.interiorColor}</span>
                    </div>
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
                      ${vehicle.price.toLocaleString()}
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
