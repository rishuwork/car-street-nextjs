import { Gauge, Palette, Car, Settings, Fuel, Cog } from "lucide-react";

interface VehicleFeaturesProps {
  mileage: number;
  color: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  condition: string;
}

export default function VehicleFeatures({
  mileage,
  color,
  transmission,
  drivetrain,
  fuelType,
  condition,
}: VehicleFeaturesProps) {
  const features = [
    {
      icon: Gauge,
      label: "Odometer",
      value: `${mileage.toLocaleString()} KM`,
    },
    {
      icon: Palette,
      label: "Exterior Colour",
      value: color,
    },
    {
      icon: Car,
      label: "Condition",
      value: condition.charAt(0).toUpperCase() + condition.slice(1),
    },
    {
      icon: Settings,
      label: "Transmission",
      value: transmission.charAt(0).toUpperCase() + transmission.slice(1),
    },
    {
      icon: Cog,
      label: "Drive Train",
      value: drivetrain.toUpperCase(),
    },
    {
      icon: Fuel,
      label: "Fuel Type",
      value: fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
    },
  ];

  return (
    <div className="bg-muted rounded-lg p-4">
      <h3 className="text-lg font-heading font-bold mb-4">About this vehicle</h3>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{feature.label}</p>
                <p className="text-sm font-medium truncate">{feature.value}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}