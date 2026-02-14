// This script is used to revalidate the pages in the production environment.
// To run it use the terminal command: node scripts/revalidate.js

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const paths = [
  '/',
  '/find/fysioterapeut/danmark',
  '/find/fysioterapeut/*', // This will revalidate all location pages
  '/klinik/*', // This will revalidate all clinic pages
  '/blog/*', // This will revalidate all blog pages
  '/ordbog/*', // This will revalidate all dictionary pages
  '/mr-scanning',
  '/dexa-scanning',
  '/vaerktoejer/*' // This will revalidate all tool pages
];

async function revalidatePaths() {
  // Production URL - replace with your actual production URL
  const baseUrl = 'https://fysfinder.dk';
  
  // Get token from environment variable
  const token = process.env.REVALIDATE_TOKEN;
  if (!token) {
    console.error('❌ REVALIDATE_TOKEN environment variable is not set in .env.local');
    process.exit(1);
  }
  
  console.log(`🔄 Starting revalidation for ${baseUrl}...`);
  
  for (const path of paths) {
    try {
      const response = await fetch(
        `${baseUrl}/api/revalidate?path=${encodeURIComponent(path)}&token=${token}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Revalidation failed');
      }
      
      const data = await response.json();
      console.log(`✅ Revalidated ${path}:`, data);
    } catch (error) {
      console.error(`❌ Failed to revalidate ${path}:`, error);
    }
  }
  
  console.log('🏁 Revalidation complete!');
}

revalidatePaths(); 