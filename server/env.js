import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Force Node to use Google's Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to set public DNS servers, falling back to default:', e.message);
}
