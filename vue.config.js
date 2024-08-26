const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
    publicPath:
        process.env.NODE_ENV === "production"
            ? "/BareHands/" // Adjust this to your app's subdirectory
            : "/",
    transpileDependencies: true,
});
