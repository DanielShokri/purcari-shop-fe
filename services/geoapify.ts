const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

export interface GeoapifyAddress {
  street?: string;
  housenumber?: string;
  city?: string;
  postcode?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  country?: string;
  country_code?: string;
  state?: string;
  lat?: number;
  lon?: number;
}

export interface GeoapifyFeature {
  type: string;
  properties: GeoapifyAddress;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeoapifyAutocompleteResponse {
  type: string;
  features: GeoapifyFeature[];
}

interface AutocompleteParams {
  text: string;
  lang?: string;
  limit?: number;
  filter?: string;
}

/**
 * Geoapify Address Autocomplete API
 * Docs: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/
 */
export async function autocomplete(params: AutocompleteParams): Promise<GeoapifyAutocompleteResponse> {
  const { 
    text, 
    lang = 'he',  // Hebrew by default for Israeli site
    limit = 8, 
    filter = 'countrycode:il'  // Filter to Israel
  } = params;

  if (!GEOAPIFY_API_KEY) {
    console.warn('Geoapify API key is not configured');
    return { type: 'FeatureCollection', features: [] };
  }

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.searchParams.set('text', text);
  url.searchParams.set('lang', lang);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('filter', filter);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('apiKey', GEOAPIFY_API_KEY);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Geoapify request failed: ${response.status}`);
  }
  
  return response.json();
}
