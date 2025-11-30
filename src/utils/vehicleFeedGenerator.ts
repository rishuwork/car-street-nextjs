import { Tables } from '@/integrations/supabase/types';

// Generate vehicle feed for Meta Dynamic Product Ads
export const generateVehicleFeedXML = (vehicles: (Tables<'vehicles'> & { primaryImage?: string })[]) => {
  const items = vehicles.map(vehicle => `
    <item>
      <id>${vehicle.vin}</id>
      <title>${vehicle.year} ${vehicle.make} ${vehicle.model}</title>
      <description>${vehicle.description || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</description>
      <availability>${vehicle.status === 'available' ? 'in stock' : 'out of stock'}</availability>
      <condition>${vehicle.condition}</condition>
      <price>${vehicle.price} CAD</price>
      <link>${window.location.origin}/vehicle/${vehicle.id}</link>
      <image_link>${vehicle.primaryImage || `${window.location.origin}/placeholder.svg`}</image_link>
      <brand>${vehicle.make}</brand>
      <google_product_category>Vehicles &amp; Parts &gt; Vehicles &gt; Motor Vehicles</google_product_category>
      <product_type>Used Cars &gt; ${vehicle.make} &gt; ${vehicle.model}</product_type>
      <custom_label_0>${vehicle.year}</custom_label_0>
      <custom_label_1>${vehicle.transmission}</custom_label_1>
      <custom_label_2>${vehicle.fuel_type}</custom_label_2>
      <custom_label_3>${vehicle.mileage} km</custom_label_3>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Car Street Vehicle Inventory</title>
    <link>${window.location.origin}/inventory</link>
    <description>Quality pre-owned vehicles</description>
    ${items}
  </channel>
</rss>`;
};

// Generate CSV format for vehicle feed
export const generateVehicleFeedCSV = (vehicles: (Tables<'vehicles'> & { primaryImage?: string })[]) => {
  const headers = [
    'id', 'title', 'description', 'availability', 'condition', 'price',
    'link', 'image_link', 'brand', 'year', 'mileage', 'transmission', 'fuel_type'
  ].join(',');

  const rows = vehicles.map(vehicle => [
    vehicle.vin,
    `"${vehicle.year} ${vehicle.make} ${vehicle.model}"`,
    `"${(vehicle.description || '').replace(/"/g, '""')}"`,
    vehicle.status === 'available' ? 'in stock' : 'out of stock',
    vehicle.condition,
    `${vehicle.price} CAD`,
    `${window.location.origin}/vehicle/${vehicle.id}`,
    vehicle.primaryImage || `${window.location.origin}/placeholder.svg`,
    vehicle.make,
    vehicle.year,
    vehicle.mileage,
    vehicle.transmission,
    vehicle.fuel_type
  ].join(','));

  return [headers, ...rows].join('\n');
};
