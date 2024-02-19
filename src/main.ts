import { RunConfig } from './run-config';
import { createContext } from './context';
import { getDependencyConfig, updateDependencyConfig } from './config';
import { getLatestReleases } from './utils/get-npm-releases';
import { processRelease } from './utils/process-release';
import * as action from '@actions/core';


/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export async function run(runConfig: RunConfig): Promise<void> {
  /* Get our saved config from artifact */
  const dependencyConfig = await getDependencyConfig(runConfig);

  /* Create context */
  const ctx = createContext(runConfig, dependencyConfig);

  let failedVersions: string[] = [];

  /* Get latest releases from npm */
  action.info('Fetching latest releases...');
  const releases = await getLatestReleases(ctx);

  /* Clean Retries */
  [ ...dependencyConfig.failed ].forEach((entry, entryIdx) => {
    const release = releases.find(r => r.version === entry.version);

    if (!release) dependencyConfig.failed.splice(entryIdx, 1);
  });

  /* Process releases */
  for (const release of releases) {
    action.info(`Checking: ${runConfig.dependencyName}@${release.version}...`);

    const { version } = release;
    let failedEntry = dependencyConfig.failed.find(f => f.version === version);

    if (failedEntry && failedEntry.attempts >= runConfig.maxRetry) {
      action.warning(`Max attempts reached for version ${version}. Skipping...`);
      continue;
    }

    try {
      processRelease(ctx, release);
    } catch (e) {
      failedEntry ??= { version, attempts: 0 };
      failedEntry.attempts++;

      action.error(`Failed to process version ${version}: ${e.message}`);

      failedVersions.push(version);
    }
  }

  if (releases.length === 0) action.info('No new releases found');

  /* Save Config */
  action.info('Saving config...');

  dependencyConfig.lastCompleted = new Date();
  await updateDependencyConfig(runConfig, dependencyConfig);

  /* Report errors */
  if (failedVersions.length) throw new Error(`Failed to process versions: ${failedVersions.join(', ')}`);
}

// endregion
