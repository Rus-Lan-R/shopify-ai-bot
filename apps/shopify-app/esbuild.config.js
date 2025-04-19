import esbuild from "esbuild";
import cssModulesPlugin from "esbuild-plugin-css-modules";

esbuild
  .build({
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
  })
  .catch((error) => {
    console.log(error);
    return process.exit(1);
  });
