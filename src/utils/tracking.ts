// Global tracking utilities for analytics and remarketing

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    vehicleData?: {
      id: string;
      name: string;
      price: number;
      year: number;
      make: string;
      model: string;
    };
    identifyUser?: (emailOrPhone: string, data: any) => void;
  }
}

// Initialize dataLayer if not exists
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Track vehicle view event
export const trackVehicleView = (vehicle: {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  price: number;
}) => {
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  
  // Set global vehicle data
  window.vehicleData = {
    id: vehicle.vin,
    name: vehicleName,
    price: vehicle.price,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
  };

  // GA4 Event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: vehicle.vin,
          item_name: vehicleName,
          price: vehicle.price,
          vehicle_year: vehicle.year,
          vehicle_make: vehicle.make,
          vehicle_model: vehicle.model,
        }]
      }
    });
  }

  // Meta Pixel Event
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: 'vehicle',
      content_ids: [vehicle.vin],
      content_name: vehicleName,
      value: vehicle.price,
      currency: 'CAD',
    });
  }

  // Google Ads Dynamic Remarketing
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      ecomm_prodid: vehicle.vin,
      ecomm_totalvalue: vehicle.price,
      ecomm_pagetype: 'product',
    });
  }

  // Store in viewed history
  storeViewedVehicle(vehicle);
};

// Track inventory search
export const trackInventorySearch = (filters: {
  searchQuery?: string;
  priceFilter?: string;
  makeFilter?: string;
  [key: string]: any;
}) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'search_inventory',
      search_query: filters.searchQuery || '',
      selected_filters: filters,
    });
  }
};

// Track click to call
export const trackClickToCall = (phoneNumber: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'click_call',
      phone_number: phoneNumber,
    });
  }

  if (window.fbq) {
    window.fbq('track', 'Contact');
  }
};

// Track form start
export const trackFormStart = (formType: string, vehicleId?: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'form_start',
      form_type: formType,
      vehicle_id: vehicleId || '',
      timestamp: new Date().toISOString(),
    });
  }
};

// Track form submission
export const trackFormSubmit = (formType: string, vehicleId?: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'form_submit',
      form_type: formType,
      vehicle_id: vehicleId || '',
    });
  }

  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: formType,
      content_category: 'form_submission',
    });
  }

  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
      value: 1.0,
      currency: 'CAD',
    });
  }
};

// Track add to favorites
export const trackAddToFavorites = (vehicleId: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_favorites',
      vehicle_id: vehicleId,
    });
  }
};

// Store viewed vehicle history
const storeViewedVehicle = (vehicle: any) => {
  try {
    const history = JSON.parse(localStorage.getItem('vehicleViewsHistory') || '[]');
    const newHistory = [
      { id: vehicle.id, vin: vehicle.vin, name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, viewedAt: new Date().toISOString() },
      ...history.filter((v: any) => v.id !== vehicle.id),
    ].slice(0, 5);
    localStorage.setItem('vehicleViewsHistory', JSON.stringify(newHistory));
  } catch (e) {
    console.error('Failed to store vehicle history', e);
  }
};

// Get viewed vehicle history
export const getViewedVehicleHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('vehicleViewsHistory') || '[]');
  } catch (e) {
    return [];
  }
};

// User identification hook for CRM
export const identifyUser = (emailOrPhone: string, data: any = {}) => {
  console.log('CRM Identify:', emailOrPhone, data);
  
  // This will be replaced with real CRM integration later (HubSpot/Zoho/etc.)
  if (window.identifyUser) {
    window.identifyUser(emailOrPhone, data);
  }

  // Pass viewed history to CRM
  const viewedHistory = getViewedVehicleHistory();
  if (viewedHistory.length > 0) {
    console.log('User viewed vehicles:', viewedHistory);
  }
};

// Enhanced e-commerce tracking
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};
