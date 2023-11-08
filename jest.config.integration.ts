import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  rootDir: ".",
  roots: ["./__tests__/"],
  setupFilesAfterEnv: ["./__tests__/helpers/setup.ts"],

  workerThreads: false,
  detectOpenHandles: true,
};

export default config;
