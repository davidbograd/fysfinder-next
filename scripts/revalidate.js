const paths = [
  '/',
  '/find/fysioterapeut/danmark',
  '/find/fysioterapeut/*', // This will revalidate all location pages
  '/klinik/*', // This will revalidate all clinic pages
  '/fysioterapeut-artikler/*' // This will revalidate all article pages
];

async function revalidatePaths() {
  // Production URL - replace with your actual production URL
  const baseUrl = 'https://fysfinder.dk';
  
  // Get token from environment variable
  const token = process.env.REVALIDATE_TOKEN;
  if (!token) {
    console.error('❌ REVALIDATE_TOKEN environment variable is not set');
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