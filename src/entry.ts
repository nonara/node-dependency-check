import * as core from '@actions/core';
import { RunConfig } from './run-config';
import { run } from './main';


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

async function runAction() {
  try {
    const inputs: RunConfig.ActionInput = {
      dependencyName: core.getInput('dependency', { required: true }),
      distTags: core.getInput('dist-tags'),
      cmd: core.getInput('cmd'),
      registry: core.getInput('registry'),
      maxRetry: core.getInput('maxRetry'),
      artifactName: core.getInput('artifact-name'),
      maxPerTagMatch: core.getInput('max-per-tag-max'),
      artifactRetention: core.getInput('artifact-retention'),
      installCmd: core.getInput('install-cmd'),
    };

    const runConfig = RunConfig.fromInput(inputs);

    await run(runConfig);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Entry
/* ****************************************************************************************************************** */

runAction().then();

// endregion
