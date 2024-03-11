export function generateTsconfigJsonData() {
  const content = {
    extends: "@tsconfig/node20",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./transpiled",
      declarationDir: "./types",
      sourceMap: true,
      declaration: true,
      composite: true,
      lib: ["es2023", "DOM"],
    },
    include: ["src/**/*"],
  };
  return content;
}
