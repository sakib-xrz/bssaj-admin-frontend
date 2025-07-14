/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "syd1.digitaloceanspaces.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
