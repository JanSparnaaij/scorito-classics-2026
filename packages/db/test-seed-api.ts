import nodeFetch from 'node-fetch';

const main = async () => {
  const apiUrl = 'https://scorito-server-production-3f18.up.railway.app/api/prices/seed';
  
  console.log(`Calling ${apiUrl}...`);
  
  try {
    const response = await nodeFetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log(`\n✅ Response status: ${response.status}`);
    console.log(`📊 Result:`, data);
  } catch (err: any) {
    console.error(`❌ Error:`, err.message);
  }
};

main();
