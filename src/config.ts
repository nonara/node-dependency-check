// noinspection ExceptionCaughtLocallyJS

import {
  DefaultArtifactClient, DownloadArtifactResponse, GetArtifactResponse, UploadArtifactResponse
} from '@actions/artifact';
import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import { RunConfig } from './run-config';
import * as os from 'os';
import * as io from '@actions/io';
import { Artifact } from '@actions/artifact/lib/internal/shared/interfaces';


/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */

const tempDirPath = path.join(os.tmpdir(), '._ndc-artifacts_');
const configFileName = 'config.json';

const configFilePath = path.join(tempDirPath, configFileName);

const mockArtifact: Artifact = {
  id: 1,
  name: 'mock',
  size: 0,
}

// endregion


/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

export interface ConfigFile {
  [dependencyName: string]: DependencyConfig.AsJson
}

export interface DependencyConfig {
  lastCompleted: Date | null;
  failed: { version: string; attempts: number }[];
}

export namespace DependencyConfig {
  export type AsJson = Omit<DependencyConfig, 'lastCompleted'> & { lastCompleted: string | null; }

  export const fromJson = (json: AsJson): DependencyConfig => {
    return {
      ...json,
      lastCompleted: json.lastCompleted ? new Date(json.lastCompleted) : null
    };
  }

  export const toJson = (config: DependencyConfig): AsJson => {
    return {
      ...config,
      lastCompleted: config.lastCompleted?.toISOString() ?? null,
    };
  }
}

// endregion


/* ****************************************************************************************************************** */
// region: Helpers
/* ****************************************************************************************************************** */

async function getArtifact(client: DefaultArtifactClient, artifactName: string) {
  try {
    return await client.getArtifact(artifactName);
  } catch (e) {
    core.warning(`Failed to get artifact for ${artifactName}: ${e.message}`);
    return null;
  }
}

async function uploadArtifact(client: DefaultArtifactClient, artifactName: string, files: string[]): Promise<UploadArtifactResponse> {
  if (process.env.USE_MOCK_ARTIFACT) return mockArtifact;
  try {
    return await client.uploadArtifact(artifactName, files, tempDirPath);
  } catch (e) {
    throw new Error(`Failed to upload artifact for ${artifactName}: ${e.message}`);
  }
}

async function downloadArtifact(client: DefaultArtifactClient, artifactId: number): Promise<DownloadArtifactResponse> {
  if (process.env.USE_MOCK_ARTIFACT) return { downloadPath: tempDirPath };
  try {
    return await client.downloadArtifact(artifactId, { path: tempDirPath });
  } catch (e) {
    throw new Error(`Failed to download artifact for ${artifactId}: ${e.message}`);
  }
}

async function getOrCreateArtifactId(runConfig: RunConfig) {
  const artifactClient = new DefaultArtifactClient();
  const artifactName = runConfig.artifactName;

  let artifactId: number | undefined;
  try {
    const res = await getArtifact(artifactClient, artifactName);
    if (res) {
      artifactId = res.artifact.id;
    }
    // Allow persisting of file during dev (TODO - hacky, change later)
    else if (process.env.USE_MOCK_ARTIFACT && fs.existsSync(configFilePath)) {
      artifactId = mockArtifact.id;
    }
  } catch (e) {
    core.warning(`Failed to get artifact id for ${artifactName}: ${e.message}`);
  }

  artifactId ??= await saveConfigFile(runConfig, {});

  return artifactId;
}

async function loadConfigFile(runConfig: RunConfig): Promise<ConfigFile> {
  if (runConfig.artifactId == null) runConfig.artifactId = await getOrCreateArtifactId(runConfig);
  const artifactId = runConfig.artifactId;

  const artifactClient = new DefaultArtifactClient();
  const downloadResponse = await downloadArtifact(artifactClient, artifactId);

  if (!downloadResponse.downloadPath) throw new Error(`Failed to download artifact for ${runConfig.artifactName}`);

  const configPath = path.join(downloadResponse.downloadPath, configFileName);
  const configFileContent = await fs.promises.readFile(configPath, 'utf8');

  return JSON.parse(configFileContent);
}

async function saveConfigFile(runConfig: RunConfig, configFile: ConfigFile): Promise<number> {
  const { artifactName } = runConfig;

  const artifactClient = new DefaultArtifactClient();
  if (!fs.existsSync(tempDirPath)) await io.mkdirP(tempDirPath);

  const data = JSON.stringify(configFile, null, 2);
  fs.writeFileSync(configFilePath, data, 'utf8');

  const createRes = await uploadArtifact(artifactClient, artifactName, [ configFilePath ]);
  const artifactId = createRes.id;

  if (artifactId == null) throw new Error(`Failed to create artifact for ${artifactName}`);

  return artifactId;
}

// endregion


/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export async function getDependencyConfig(runConfig: RunConfig): Promise<DependencyConfig> {
  const configFile = await loadConfigFile(runConfig);
  const { dependencyName } = runConfig;

  const jsonConfig = configFile[dependencyName];

  const dependencyConfig: DependencyConfig = jsonConfig
    ? DependencyConfig.fromJson(jsonConfig)
    : { lastCompleted: null, failed: [] };

  return dependencyConfig
}

export async function updateDependencyConfig(runConfig: RunConfig, dependencyConfig: DependencyConfig): Promise<void> {
  const configFile = await loadConfigFile(runConfig);
  const { dependencyName } = runConfig;

  configFile[dependencyName] = DependencyConfig.toJson(dependencyConfig);

  fs.writeFileSync(configFilePath, JSON.stringify(configFile), 'utf8');

  await saveConfigFile(runConfig, configFile);
}

// endregion
