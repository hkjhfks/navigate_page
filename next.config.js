/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['favicon.yandex.net', 'www.google.com'],
  },
}

module.exports = nextConfig