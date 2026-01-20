import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dulichviet.app',
  appName: 'Travel Support',
  webDir: 'out',
  server: {
    url: 'https://dulichviet.blog',
    cleartext: true
  }
};

export default config;
