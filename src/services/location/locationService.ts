import {GeocodingResponse} from '../../utils/common/types/location';

const getCurrentLocationDetails = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`);
    const data = (await response.json()) as GeocodingResponse;
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default {getCurrentLocationDetails};
