import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  clearMocks: true,
  coverageProvider: "v8",
};

export default config;
