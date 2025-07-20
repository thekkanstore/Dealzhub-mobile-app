declare module 'react-native-config' {
  export interface NativeConfig {
    APPLICATION_ID: string;
    BUILD_TYPE: string;
    DEBUG: boolean;
    ENVIRONMENT: string;
    FLAVOR: string;
    IS_HERMES_ENABLED: boolean;
    IS_NEW_ARCHITECTURE_ENABLED: boolean;
    VERSION_CODE: number;
    VERSION_NAME: string;
    GOOGLE_MAPS_API_KEY: string;
    BASE_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
