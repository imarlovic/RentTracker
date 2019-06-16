module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:5000/"
      }
    }
  },

  outputDir: "../wwwroot",
  filenameHashing: false,
  pwa: {
    name: "RentTracker",
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: "src/service-worker.js"
    }
  }
};
