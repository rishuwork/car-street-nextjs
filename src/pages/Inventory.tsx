import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search } from "lucide-react";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const vehicles = [
    {
      id: 1,
      year: 2020,
      make: "Honda",
      model: "Civic",
      price: 18995,
      mileage: "45,000 km",
      transmission: "Automatic",
      fuelType: "Gasoline",
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      year: 2019,
      make: "Toyota",
      model: "Camry",
      price: 22995,
      mileage: "38,000 km",
      transmission: "Automatic",
      fuelType: "Hybrid",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      year: 2021,
      make: "Mazda",
      model: "CX-5",
      price: 28995,
      mileage: "32,000 km",
      transmission: "Automatic",
      fuelType: "Gasoline",
      image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      year: 2018,
      make: "Ford",
      model: "F-150",
      price: 32995,
      mileage: "62,000 km",
      transmission: "Automatic",
      fuelType: "Gasoline",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      year: 2020,
      make: "BMW",
      model: "3 Series",
      price: 35995,
      mileage: "28,000 km",
      transmission: "Automatic",
      fuelType: "Gasoline",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      year: 2019,
      make: "Honda",
      model: "CR-V",
      price: 26995,
      mileage: "42,000 km",
      transmission: "Automatic",
      fuelType: "Gasoline",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop",
    },
  ];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = searchTerm === "" || 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toString().includes(searchTerm);
    
    const matchesMake = makeFilter === "all" || vehicle.make === makeFilter;
    
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "under20k" && vehicle.price < 20000) ||
      (priceFilter === "20to30k" && vehicle.price >= 20000 && vehicle.price < 30000) ||
      (priceFilter === "over30k" && vehicle.price >= 30000);

    return matchesSearch && matchesMake && matchesPrice;
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
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Mazda">Mazda</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
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

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-lg text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredVehicles.length}</span> vehicles
            </p>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={vehicle.image} 
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-bold">
                    ${vehicle.price.toLocaleString()}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-heading font-bold mb-3">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Mileage:</span>
                      <span className="font-medium text-foreground">{vehicle.mileage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transmission:</span>
                      <span className="font-medium text-foreground">{vehicle.transmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Type:</span>
                      <span className="font-medium text-foreground">{vehicle.fuelType}</span>
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
            ))}
          </div>

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
