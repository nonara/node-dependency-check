import fetch from 'node-fetch';
import { Context } from '../context';
import { createRegExpFromString } from './general';


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface ReleaseInfo {
  version: string;
  date: Date;
  matchedConfigTagKey: string;
}

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

const checkTagMatch = (remoteTag: string, tagConfig: string) => {
  if (tagConfig.startsWith('/')) {
    const regExp = createRegExpFromString(tagConfig)
    return regExp.test(remoteTag);
  } else {
    return remoteTag === tagConfig;
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export async function getLatestReleases(ctx: Context): Promise<ReleaseInfo[]> {
  const { dependencyName: moduleName, distTags, registry } = ctx.runConfig;
  const { lastCompleted } = ctx.dependencyConfig;

  const res = await fetch(`${registry}/${moduleName}`);

  if (!res.ok) throw new Error(`Failed to fetch data for ${moduleName}: ${res.statusText}`);
  const data = await res.json();

  const time = data.time as Record<string, string> | undefined;
  if (!time) throw new Error(`Failed to fetch time data for ${moduleName}`);

  const fetchedTags = data['dist-tags'] as Record<string, string>;
  if (!fetchedTags) throw new Error(`Failed to fetch dist-tags data for ${moduleName}`);

  /* Find matching releases by tag */
  let releases: ReleaseInfo[] = [];
  for (const [ tag, version ] of Object.entries(fetchedTags)) {
    const matchTag = distTags.find(t => checkTagMatch(tag, t));
    if (!matchTag) continue;
    releases.push({ version, date: new Date(time[version]), matchedConfigTagKey: matchTag });
  }

  /* Filter out releases that are older than lastCompleted */
  releases = releases.filter(release => !lastCompleted || release.date > lastCompleted);

  return releases;
}


// endregion
