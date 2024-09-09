#!/usr/bin/env node

import { exec } from "child_process";
import { createWriteStream, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { argv, chdir, cwd, exit } from "process";
import { promisify } from "util";

if (process.argv.length < 3) {
  console.log("Please provide a name for your project.");
  console.log("Example:");
  console.log("  npx mpva my-project");
  exit(1);
}

const projectName = argv[2];
const projectPath = join(cwd(), projectName);

if (existsSync(projectPath)) {
  console.log(
    `The '${projectName}' project already exist in the current directory.`
  );
  console.log("Please give it another name.");
  exit(1);
}

console.log("Configuring your project, please wait...");
mkdirSync(projectPath);
chdir(projectPath);
mkdirSync("src");
mkdirSync("src/assets");
mkdirSync("src/assets/fonts");
mkdirSync("src/public");

try {
  const execute = promisify(exec);

  const viewVersion = (pkg) => `npm view ${pkg} version --json`;

  const { stdout: vite } = await execute(viewVersion("vite@5"));
  const { stdout: glob } = await execute(viewVersion("glob@10"));
  const { stdout: tailwindcss } = await execute(viewVersion("tailwindcss@3"));
  const { stdout: postcss } = await execute(viewVersion("postcss@8"));
  const { stdout: autoprefixer } = await execute(
    viewVersion("autoprefixer@10")
  );
  const { stdout: prettier } = await execute(viewVersion("prettier@3"));
  const { stdout: prettierPluginTailwindcss } = await execute(
    viewVersion("prettier-plugin-tailwindcss@0")
  );

  const getLatest = (pkg) => `^${JSON.parse(pkg).at(-1)}`;

  const packageJson = {
    name: projectName,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    devDependencies: {
      autoprefixer: getLatest(autoprefixer),
      glob: getLatest(glob),
      postcss: getLatest(postcss),
      prettier: getLatest(prettier),
      "prettier-plugin-tailwindcss": getLatest(prettierPluginTailwindcss),
      tailwindcss: getLatest(tailwindcss),
      vite: getLatest(vite),
    },
  };

  const createPackageJson = createWriteStream("package.json");
  createPackageJson.write(JSON.stringify(packageJson, null, 2));
  createPackageJson.end();

  const createGitignore = createWriteStream(".gitignore");
  createGitignore.write("node_modules\ndist\n");
  createGitignore.end();

  const prettierrc = {
    plugins: ["prettier-plugin-tailwindcss"],
  };
  const createPrettierrc = createWriteStream(".prettierrc");
  createPrettierrc.write(JSON.stringify(prettierrc, null, 2));
  createPrettierrc.end();

  const github = "https://raw.githubusercontent.com/mochamadboval/mpva/main";

  await execute(`curl ${github}/vite.config.js -o vite.config.js`);
  await execute(`curl ${github}/tailwind.config.js -o tailwind.config.js`);
  await execute(`curl ${github}/postcss.config.js -o postcss.config.js`);
  await execute(`curl ${github}/index.html -o ./src/index.html`);
  await execute(`curl ${github}/404.html -o ./src/404.html`);
  await execute(`curl ${github}/vite.svg -o ./src/public/vite.svg`);

  const createRedirects = createWriteStream("./src/public/_redirects");
  createRedirects.write("/* /404.html 200");
  createRedirects.end();

  const createCSS = createWriteStream("./src/style.css");
  createCSS.write(
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
  );
  createCSS.end();

  const createJS = createWriteStream("./src/main.js");
  createJS.write("console.log('Multi Page Vite App');\n");
  createJS.end();

  console.log("Done. Now run:");
  console.log(`  cd ${projectName}`);
  console.log("  npm install");
  console.log("  npm run dev");
} catch (error) {
  rmSync(projectPath, { force: true, recursive: true });
  console.log(error);
}
