import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.9'],
  output: 'export', // Forces static HTML export
  images: {
    unoptimized: true, // Required because there is no Next.js backend server r>
  },
  // If you are using React Three Fiber / Canvas elements, keeping concurrent f>
  reactStrictMode: true,
};

export default nextConfig;
