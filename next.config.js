/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.com'], // Replace with your actual domain or remove if using only local images
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
