/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dbqnutjbrxydltkeftnv.supabase.co'], // Replace with your Supabase project URL
  },
  webpack: (config, { isServer }) => {
    // Add webpack ignore for punycode
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "punycode": false,
    };
    
    return config;
  },
}

module.exports = nextConfig
