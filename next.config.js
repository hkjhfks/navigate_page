/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
  domains: ['favicon.yandex.net', 'www.google.com', 't2.gstatic.com'],
  },
}

module.exports = nextConfig