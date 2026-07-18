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
    themeColor: "#3182ce",
    msTileColor: "#3182ce",
    workboxPluginMode: 'InjectManifest',
    manifestOptions: {
      startUrl: '/'
    },
    workboxOptions: {
      swSrc: "src/service-worker.js"
    },
  }
};
