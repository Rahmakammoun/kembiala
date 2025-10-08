import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
};
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/',         
        destination: '/document', 
        permanent: true,     
      },
    ]
  },
}


export default nextConfig;
