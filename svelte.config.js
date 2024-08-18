import { preprocessMeltUI, sequence } from "@melt-ui/pp";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import("@sveltejs/kit").Config}*/
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  kit: {
    adapter: adapter({
      // default options are shown. On some platforms
      assets: "build",
      fallback: "404.html",
      // these options are set automatically — see below
      pages: "build",
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.argv.includes("dev") ? "" : process.env.BASE_PATH
    }
  },
  // for more information about preprocessors
  preprocess: sequence([vitePreprocess(), preprocessMeltUI()])
};
export default config;
