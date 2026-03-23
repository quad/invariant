import { build, emptyDir } from "@deno/dnt";

const denoJson = JSON.parse(await Deno.readTextFile("./deno.json"));

await emptyDir("./npm");

await build({
  entryPoints: ["./src/invariant.ts"],
  outDir: "./npm",
  shims: {},
  scriptModule: false,
  test: false,
  package: {
    name: denoJson.name,
    version: denoJson.version,
    description: denoJson.description,
    license: denoJson.license,
    devDependencies: {
      "@types/node": "*",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/quad/invariant.git",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
