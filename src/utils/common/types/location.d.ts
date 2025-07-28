export interface GeocodingResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: GoogleAddressDetails;
  boundingbox: [string, string, string, string];
}

export interface GoogleAddressDetails {
  office?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  county?: string;
  state_district?: string;
  state?: string;
  'ISO3166-2-lvl4'?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}
