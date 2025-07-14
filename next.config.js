/** @type {import('next').NextConfig} */
const repo = 'The-Word-2';
const nextConfig = {
  output: 'export',
  basePath: '/' + repo,
  assetPrefix: '/' + repo + '/',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig; 