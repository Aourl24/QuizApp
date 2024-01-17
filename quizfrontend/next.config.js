/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: '/_next/static/sounds/',
            outputPath: 'static/sounds/',
          },
        },
      ],
    });

    return config;
  },
};

//module.exports = nextConfig
