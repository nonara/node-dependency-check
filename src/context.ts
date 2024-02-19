import { RunConfig } from './run-config';
import { DependencyConfig } from './config';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface Context {
  runConfig: RunConfig;
  dependencyConfig: DependencyConfig;
}

// endregion

/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export function createContext(runConfig: RunConfig, dependencyConfig: DependencyConfig): Context {
  return { runConfig, dependencyConfig };
}

// endregion
