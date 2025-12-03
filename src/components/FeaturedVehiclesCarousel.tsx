import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Gauge } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type VehicleWithImage = Tables<"vehicles"> & {
  primaryImage?: string;
};

interface FeaturedVehiclesCarouselProps {
  vehicles: VehicleWithImage[];
}

export default function FeaturedVehiclesCarousel({ vehicles }: FeaturedVehiclesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset index when items per page changes to avoid out of bounds
  useEffect(() => {
    const maxIndex = Math.max(0, vehicles.length - itemsPerPage);
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerPage, vehicles.length, currentIndex]);

  const maxIndex = Math.max(0, vehicles.length - itemsPerPage);
  const showNavigation = vehicles.length > itemsPerPage;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleVehicles = vehicles.slice(currentIndex, currentIndex + itemsPerPage);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No featured vehicles available at this time.</p>
        <p className="text-sm mt-2">Check back soon for our latest offerings!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous vehicles"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next vehicles"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <div className="relative overflow-hidden aspect-video">
              <img
                src={vehicle.primaryImage || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop"}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
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
        ))}
      </div>

      {/* Dots Indicator */}
      {showNavigation && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
