const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
    publicPath:
        process.env.NODE_ENV === "production"
            ? "/Aerobrush/" // Adjust this to your app's subdirectory
            : "/",
    transpileDependencies: true,
});
