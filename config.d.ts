declare module 'react-native-config' {
  export interface NativeConfig {
    DEV_ID: string;
    API_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
