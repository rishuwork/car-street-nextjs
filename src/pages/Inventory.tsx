import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp, SlidersHorizontal, Gauge, Palette, Settings, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;
type VehicleImage = Tables<"vehicle_images">;

const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleImages, setVehicleImages] = useState<Record<string, VehicleImage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Get maxPrice from URL params (from budget calculator)
  const maxPriceParam = searchParams.get('maxPrice');

  const handleClearFilters = () => {
    setSearchTerm("");
    setMakeFilter("all");
    setModelFilter("all");
    setYearFilter("all");
    setPriceFilter("all");
    // Clear URL parameters
    navigate('/inventory', { replace: true });
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    // Track inventory search when filters change
    if (searchTerm || makeFilter !== 'all' || modelFilter !== 'all' || yearFilter !== 'all' || priceFilter !== 'all' || maxPriceParam) {
      import('@/utils/tracking').then(({ trackInventorySearch }) => {
        trackInventorySearch({
          searchQuery: searchTerm,
          makeFilter,
          modelFilter,
          yearFilter,
          priceFilter,
          maxPrice: maxPriceParam,
        });
      });
    }
  }, [searchTerm, makeFilter, modelFilter, yearFilter, priceFilter, maxPriceParam]);

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
      // Extract unique makes, models, and years
      const uniqueMakes = [...new Set(data.map(v => v.make))].sort();
      const uniqueModels = [...new Set(data.map(v => v.model))].sort();
      const uniqueYears = [...new Set(data.map(v => v.year))].sort((a, b) => b - a);
      setMakes(uniqueMakes);
      setModels(uniqueModels);
      setYears(uniqueYears);

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
    
    const matchesModel = modelFilter === "all" || vehicle.model === modelFilter;
    
    const matchesYear = yearFilter === "all" || vehicle.year.toString() === yearFilter;
    
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "under20k" && Number(vehicle.price) < 20000) ||
      (priceFilter === "20to30k" && Number(vehicle.price) >= 20000 && Number(vehicle.price) < 30000) ||
      (priceFilter === "over30k" && Number(vehicle.price) >= 30000);

    // Filter by maxPrice from budget calculator
    const matchesMaxPrice = !maxPriceParam || Number(vehicle.price) <= Number(maxPriceParam);

    return matchesSearch && matchesMake && matchesModel && matchesYear && matchesPrice && matchesMaxPrice;
  });

  // Get filtered models based on selected make
  const filteredModels = makeFilter === "all" 
    ? models 
    : [...new Set(vehicles.filter(v => v.make === makeFilter).map(v => v.model))].sort();

  return (
    <div className="min-h-screen flex flex-col">
        <SEO 
          title="Used Car Inventory"
          description="Browse our selection of quality pre-owned vehicles at Car Street. Find the perfect used car with competitive pricing and flexible financing options."
          url="https://carstreet.ca/inventory"
          keywords="used cars for sale, pre-owned vehicles, car inventory, used car dealership Langton Ontario"
        />
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-3">
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">Our Inventory</h1>
            <p className="text-muted-foreground">Browse our selection of quality pre-owned vehicles</p>
          </div>

          {/* Search and Filter Section */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="mb-4">
            <Card className="bg-muted">
              <CollapsibleTrigger asChild>
                <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/80 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="font-medium text-sm">Filters</span>
                    {(searchTerm || makeFilter !== 'all' || modelFilter !== 'all' || yearFilter !== 'all' || priceFilter !== 'all') && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="py-3 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="relative md:col-span-1 lg:col-span-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={makeFilter} onValueChange={(value) => {
                      setMakeFilter(value);
                      setModelFilter("all");
                    }}>
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

                    <Select value={modelFilter} onValueChange={setModelFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Models" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        {filteredModels.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredVehicles.length}</span> vehicles
                </p>
              </div>

              {/* Vehicle Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => {
                  const images = vehicleImages[vehicle.id] || [];
                  const primaryImage = images.find(img => img.is_primary) || images[0];
                  const imageUrl = primaryImage?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop";

                  return (
                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                      <div className="relative overflow-hidden aspect-square">
                        <img 
                          src={imageUrl} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-heading font-bold mb-1">
                          {vehicle.make}
                        </h3>
                        <h3 className="text-base text-muted-foreground mb-1">
                          {vehicle.year} {vehicle.model}
                        </h3>
                        <div className="flex flex-wrap gap-3 my-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-4 w-4" />
                            <span>{vehicle.mileage.toLocaleString()} KM</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Settings className="h-4 w-4" />
                            <span className="capitalize">{vehicle.transmission === 'automatic' ? 'Auto' : vehicle.transmission}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="h-4 w-4" />
                            <span className="uppercase">{vehicle.drivetrain}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Palette className="h-4 w-4" />
                            <span className="capitalize">{vehicle.color}</span>
                          </div>
                        </div>
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-bold text-price">${Number(vehicle.price).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">+ Tax & Licensing</p>
                            </div>
                            <Link to={`/vehicle/${vehicle.id}`} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                              View Details <span>↗</span>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {filteredVehicles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={handleClearFilters}>
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
