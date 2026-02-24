import { composePlugins } from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // nx: {
  //   svgr: false,
  // },
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
