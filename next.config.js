/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'dbqnutjbrxydltkeftnv.supabase.co', // Replace with your Supabase project URL
      'img.logo.dev', // Logo.dev API for clinic logos
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress the punycode warning
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "punycode": false, // Disable punycode polyfill as it's not needed in modern environments
      }
    };
    
    return config;
  },
  redirects: async () => {
    return [
      {
        source: '/ordbog/artrose-slidgigt-',
        destination: '/ordbog/artrose-slidgigt',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/diabetes',
        destination: '/ordbog/diabetes',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/fibromyalgi',
        destination: '/ordbog/fibromyalgi',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/haelspore',
        destination: '/ordbog/haelspore',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/hovedpine',
        destination: '/ordbog/hovedpine',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/kroniske-smerter',
        destination: '/ordbog/kroniske-smerter',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/laendesmerter',
        destination: '/ordbog/laendesmerter',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/migraene',
        destination: '/ordbog/migraene',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/slidgigt-knae',
        destination: '/ordbog/slidgigt-knae',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/whiplash',
        destination: '/ordbog/whiplash',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/frossenskulder',
        destination: '/ordbog/frossen-skulder',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler/soevn-effekt',
        destination: '/blog/soevn-effekt',
        permanent: true,
      },
      {
        source: '/fysioterapeut-artikler',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
