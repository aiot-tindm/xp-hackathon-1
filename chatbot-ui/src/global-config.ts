import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  isStaticExport: boolean;
  auth: {
    method: 'jwt';
    skip: boolean;
    redirectPath: string;
  };
  mapboxApiKey: string;
  api: {
    chatbotBaseUrl: string;
    exportPdfBaseUrl: string;
  };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'XP Team demo',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
  isStaticExport: JSON.parse(`${process.env.BUILD_STATIC_EXPORT}`),
  /**
   * Auth
   * @method jwt
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY ?? '',
  /**
   * API Base URLs
   */
  api: {
    chatbotBaseUrl: process.env.NEXT_PUBLIC_CHATBOT_BASE_URL ?? '',
    exportPdfBaseUrl: process.env.NEXT_PUBLIC_EXPORT_PDF_BASE_URL ?? '',
  },
};
