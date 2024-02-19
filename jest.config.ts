import type { Config } from '@jest/types';
import * as os from 'os';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const config: Config.InitialOptions = {
  testEnvironment: "node",
  preset: 'ts-jest',
  roots: [ '<rootDir>/test/tests' ],
  testRegex: '.*(test|spec)\\.tsx?$',
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  transform: {
    '^.+\\.(ts|tsx)$': [ 'ts-jest', { tsconfig: './test/tsconfig.json' } ],
  },
  modulePaths: [ "<rootDir>/node_modules" ],
  testTimeout: 10000,
  maxConcurrency: os.cpus().length
}

export default config;

// endregion
