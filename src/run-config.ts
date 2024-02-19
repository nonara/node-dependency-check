/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface RunConfig {
  dependencyName: string;
  distTags: string[];
  cmd: string;
  registry: string;
  maxRetry: number;
  artifactName: string;
  maxPerTagMatch: number;
  artifactRetention: number;
  installCmd: string;

  /** @internal */
  artifactId?: number;
}

export namespace RunConfig {
  export type ActionInput = Record<Exclude<keyof RunConfig, 'artifactId'>, string>

  export const getDefaults = () => ({
    distTags: [ 'latest' ],
    cmd: 'npm run test',
    maxRetry: 5,
    registry: 'https://registry.npmjs.org',
    artifactName: 'node-dependency-check-config',
    maxPerTagMatch: 1,
    artifactRetention: 400,
    installCmd: 'npm install %module%'
  }) satisfies Partial<RunConfig>;

  export function fromInput(input: ActionInput): RunConfig {
    const defaults = getDefaults();

    return {
      dependencyName: input.dependencyName,
      distTags: input.distTags ? input.distTags.split(',') : defaults.distTags,
      cmd: input.cmd || defaults.cmd,
      registry: input.registry || defaults.registry,
      maxRetry: !isNaN(+input.maxRetry) ? +input.maxRetry : defaults.maxRetry,
      artifactName: input.artifactName || defaults.artifactName,
      maxPerTagMatch: !isNaN(+input.maxPerTagMatch) ? +input.maxPerTagMatch : defaults.maxPerTagMatch,
      artifactRetention: !isNaN(+input.artifactRetention) ? +input.artifactRetention : defaults.artifactRetention,
      installCmd: input.installCmd || defaults.installCmd,
    };
  }
}

// endregion
