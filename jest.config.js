/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  experimentalEsm: true,
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/*.test.ts"],
  verbose: true,
  forceExit: true,
  injectGlobals: true,
  // automock: true,
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  // clearMocks:true
  // preset: "ts-jest/presets/default-esm", // or other ESM presets
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};
