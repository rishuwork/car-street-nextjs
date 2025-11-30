import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;
type VehicleImage = Tables<"vehicle_images">;

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleImages, setVehicleImages] = useState<Record<string, VehicleImage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [makes, setMakes] = useState<string[]>([]);

  // Get maxPrice from URL params (from budget calculator)
  const maxPriceParam = searchParams.get('maxPrice');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    // Track inventory search when filters change
    if (searchTerm || makeFilter !== 'all' || priceFilter !== 'all' || maxPriceParam) {
      import('@/utils/tracking').then(({ trackInventorySearch }) => {
        trackInventorySearch({
          searchQuery: searchTerm,
          makeFilter,
          priceFilter,
          maxPrice: maxPriceParam,
        });
      });
    }
  }, [searchTerm, makeFilter, priceFilter, maxPriceParam]);

  const loadVehicles = async () => {
    setIsLoading(true);
    // Only load available vehicles on public page
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading vehicles:", error);
    } else if (data) {
      setVehicles(data);
      
      // Extract unique makes
      const uniqueMakes = [...new Set(data.map(v => v.make))];
      setMakes(uniqueMakes);

      // Load images for all vehicles
      const imagePromises = data.map(async (vehicle) => {
        const { data: images } = await supabase
          .from("vehicle_images")
          .select("*")
          .eq("vehicle_id", vehicle.id)
          .order("is_primary", { ascending: false });
        return { vehicleId: vehicle.id, images: images || [] };
      });
      
      const imageResults = await Promise.all(imagePromises);
      const imagesMap: Record<string, VehicleImage[]> = {};
      imageResults.forEach(({ vehicleId, images }) => {
        imagesMap[vehicleId] = images;
      });
      setVehicleImages(imagesMap);
    }
    setIsLoading(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = searchTerm === "" || 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm);
    
    const matchesMake = makeFilter === "all" || vehicle.make === makeFilter;
    
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "under20k" && Number(vehicle.price) < 20000) ||
      (priceFilter === "20to30k" && Number(vehicle.price) >= 20000 && Number(vehicle.price) < 30000) ||
      (priceFilter === "over30k" && Number(vehicle.price) >= 30000);

    // Filter by maxPrice from budget calculator
    const matchesMaxPrice = !maxPriceParam || Number(vehicle.price) <= Number(maxPriceParam);

    return matchesSearch && matchesMake && matchesPrice && matchesMaxPrice;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Our Inventory</h1>
            <p className="text-xl text-muted-foreground">Browse our selection of quality pre-owned vehicles</p>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-8 bg-muted">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by make, model, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={makeFilter} onValueChange={setMakeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Makes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Makes</SelectItem>
                    {makes.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under20k">Under $20,000</SelectItem>
                    <SelectItem value="20to30k">$20,000 - $30,000</SelectItem>
                    <SelectItem value="over30k">Over $30,000</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="default" onClick={() => {
                  setSearchTerm("");
                  setMakeFilter("all");
                  setPriceFilter("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-lg text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredVehicles.length}</span> vehicles
                </p>
              </div>

              {/* Vehicle Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => {
                  const images = vehicleImages[vehicle.id] || [];
                  const primaryImage = images.find(img => img.is_primary) || images[0];
                  const imageUrl = primaryImage?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop";

                  return (
                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                      <div className="relative overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-bold">
                          ${Number(vehicle.price).toLocaleString()}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-heading font-bold mb-3">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Mileage:</span>
                            <span className="font-medium text-foreground">{vehicle.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transmission:</span>
                            <span className="font-medium text-foreground capitalize">{vehicle.transmission}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Type:</span>
                            <span className="font-medium text-foreground capitalize">{vehicle.fuel_type}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <Button variant="default" className="w-full" asChild>
                          <Link to={`/vehicle/${vehicle.id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {filteredVehicles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No vehicles found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setMakeFilter("all");
                setPriceFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inventory;
