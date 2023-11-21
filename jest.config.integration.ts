import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: false,
  forceExit: true,
  rootDir: ".",
  roots: ["./__tests__/integration/"],
  setupFilesAfterEnv: ["./__tests__/helpers/setup.ts"],

  workerThreads: false,
  detectOpenHandles: true,
};

export default config;
