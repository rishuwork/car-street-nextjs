import { Tables } from '@/integrations/supabase/types';

export const generateVehicleStructuredData = (
  vehicle: Tables<'vehicles'>,
  primaryImageUrl?: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': ['Vehicle', 'Product'],
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description || `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.mileage.toLocaleString()} km`,
    vehicleIdentificationNumber: vehicle.vin,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    productionDate: vehicle.year.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuel_type,
    driveWheelConfiguration: vehicle.drivetrain,
    vehicleEngine: {
      '@type': 'EngineSpecification',
      name: vehicle.engine || 'Not specified',
    },
    color: vehicle.color,
    itemCondition: getConditionUrl(vehicle.condition),
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'CAD',
      availability: getAvailabilityUrl(vehicle.status),
      url: `${window.location.origin}/vehicle/${vehicle.id}`,
      seller: {
        '@type': 'AutoDealer',
        name: 'Car Street',
      },
    },
    image: primaryImageUrl || `${window.location.origin}/placeholder.svg`,
    url: `${window.location.origin}/vehicle/${vehicle.id}`,
  };
};

const getConditionUrl = (condition: string) => {
  const conditionMap: Record<string, string> = {
    excellent: 'https://schema.org/NewCondition',
    good: 'https://schema.org/UsedCondition',
    fair: 'https://schema.org/UsedCondition',
    needs_work: 'https://schema.org/DamagedCondition',
  };
  return conditionMap[condition] || 'https://schema.org/UsedCondition';
};

const getAvailabilityUrl = (status: string) => {
  const availabilityMap: Record<string, string> = {
    available: 'https://schema.org/InStock',
    pending: 'https://schema.org/PreOrder',
    sold: 'https://schema.org/OutOfStock',
  };
  return availabilityMap[status] || 'https://schema.org/InStock';
};
