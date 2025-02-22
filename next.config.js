/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dbqnutjbrxydltkeftnv.supabase.co'], // Replace with your Supabase project URL
  },
  webpack: (config, { isServer }) => {
    // Suppress the punycode warning
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "punycode": require.resolve('punycode/'),
      }
    };
    
    return config;
  },
  redirects: async () => {
    return [
      {
        source: '/ordbog/artrose-slidgigt-',
        destination: '/ordbog/artrose-slidgigt',
        permanent: true, // This is a 308 redirect
      },
    ];
  },
}

module.exports = nextConfig
