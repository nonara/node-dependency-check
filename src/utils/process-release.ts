import { Context } from '../context';
import { ReleaseInfo } from './get-npm-releases';
import { execSync, StdioOptions } from 'child_process';


/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export async function processRelease(ctx: Context, release: ReleaseInfo): Promise<void> {
  const { version } = release;
  const { dependencyName, cmd } = ctx.runConfig;

  const packageName = `${dependencyName}@${version}`;
  const installCmd = ctx.runConfig.installCmd.replace(/%module%/g, packageName);

  /* Install package */
  const stdio: StdioOptions = process.env.DEBUG ? 'inherit' : [ 'ignore', 'ignore', 'pipe' ];
  execSync(installCmd, { stdio });

  /* Run command */
  execSync(cmd, { stdio: 'inherit' });
}

// endregion
