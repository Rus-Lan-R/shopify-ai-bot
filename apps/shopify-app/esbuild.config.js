import esbuild from "esbuild";
import cssModulesPlugin from "esbuild-plugin-css-modules";
import dotenv from "dotenv";
dotenv.config();

esbuild
  .build({
    external: ["cookie-signature", "crypto"],
    entryPoints: ["./embeded/chat.tsx"],
    bundle: true,
    outfile: "./extensions/chat/assets/chat.js",
    format: "iife",
    globalName: "RemixEmbed",
    // jsx: "react-jsx", //  JSX
    sourcemap: false,
    loader: {
      ".css": "css",
    },
    plugins: [cssModulesPlugin()],
    define: {
      "process.env.SHOPIFY_APP_URL": JSON.stringify(
        process.env.SHOPIFY_APP_URL,
      ),
      "process.env.WS_URL": JSON.stringify(process.env.WS_URL),
    },
  })
  .catch((error) => {
    console.log(error);
    return process.exit(1);
  });
