import { supabase } from "@/integrations/supabase/client";

/**
 * Submit URLs to IndexNow for instant indexing
 * Call this after creating/updating/deleting vehicles
 */
export async function submitToIndexNow(urls: string[], type: 'vehicle' | 'page' = 'vehicle') {
  try {
    const { data, error } = await supabase.functions.invoke('indexnow', {
      body: { urls, type }
    });

    if (error) {
      console.error('IndexNow submission error:', error);
      return { success: false, error };
    }

    console.log('IndexNow submission result:', data);
    return { success: true, data };
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return { success: false, error };
  }
}

/**
 * Submit a single vehicle URL to IndexNow
 */
export async function submitVehicleToIndexNow(vehicleId: string) {
  return submitToIndexNow([`/vehicle/${vehicleId}`], 'vehicle');
}

/**
 * Submit inventory page to IndexNow (after any vehicle changes)
 */
export async function submitInventoryToIndexNow() {
  return submitToIndexNow(['/inventory'], 'page');
}

/**
 * Batch submit multiple vehicle URLs
 */
export async function submitVehiclesToIndexNow(vehicleIds: string[]) {
  const urls = vehicleIds.map(id => `/vehicle/${id}`);
  urls.push('/inventory'); // Also reindex inventory page
  return submitToIndexNow(urls, 'vehicle');
}
