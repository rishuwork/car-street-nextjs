import * as React from "react";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import carfaxLogo from "@/assets/carfax-logo.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type VehicleWithImage = Tables<"vehicles"> & {
  primaryImage?: string;
};

interface FeaturedVehiclesCarouselProps {
  vehicles: VehicleWithImage[];
}

export default function FeaturedVehiclesCarousel({ vehicles }: FeaturedVehiclesCarouselProps) {

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No featured vehicles available at this time.</p>
        <p className="text-sm mt-2">Check back soon for our latest offerings!</p>
      </div>
    );
  }

  // Calculate total slides for dots (accounting for partial slides on different screen sizes)
  const totalSlides = vehicles.length;

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full relative group"
      >
        <CarouselContent className="">
          {vehicles.map((vehicle) => (
            <CarouselItem key={vehicle.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden md:hover:shadow-2xl transition-shadow duration-300 group/card h-full flex flex-col card-hover-lift">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <OptimizedImage
                    src={vehicle.primaryImage || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop"}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover md:group-hover/card:scale-110 transition-transform duration-300"
                    skipAnimation
                  />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-heading font-bold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{vehicle.mileage.toLocaleString()} km</span>
                    {vehicle.carfax_url && (
                      <a href={vehicle.carfax_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity ml-auto">
                        <img src={carfaxLogo} alt="Free CARFAX Report" className="h-6 object-contain" />
                      </a>
                    )}
                  </div>
                  <div className="mb-4 mt-auto pt-4">
                    <p className="text-2xl font-bold text-price">${vehicle.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">+ HST & licensing</p>
                  </div>
                  <div className="grid gap-2">
                    <Button variant="default" className="w-full" asChild>
                      <Link to={`/vehicle/${vehicle.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2 hidden md:flex" />
        <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2 hidden md:flex" />
      </Carousel>

      {/* Dot indicators */}

    </div>
  );
}

