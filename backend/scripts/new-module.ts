import { execSync } from "child_process";

// Get module name from command line arguments
const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Provide a module name, e.g., npm run new-modules users");
  process.exit(1);
}

const generatedPath = `modules/${moduleName}`;

// Generate module, controller, and service
execSync(`nest g module ${generatedPath}`, { stdio: "inherit" });
execSync(`nest g controller ${generatedPath}`, { stdio: "inherit" });
execSync(`nest g service ${generatedPath}`, { stdio: "inherit" });

// Fix and format generated files
execSync(`eslint src/"${generatedPath}/*.ts" --fix`, { stdio: "inherit" });
execSync(`prettier --write src/"${generatedPath}/*.ts"`, { stdio: "inherit" });
execSync(`prettier --write src/app.module.ts`, { stdio: "inherit" });

console.log(`Module "${moduleName}" generated successfully!`);
