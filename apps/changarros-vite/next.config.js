import { composePlugins } from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // nx: {
  //   svgr: false,
  // },
  env: {
    API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const plugins = [
  // Add more plugins here
];

export default composePlugins(...plugins)(nextConfig);
