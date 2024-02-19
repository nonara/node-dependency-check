import { run } from '../../src/main';
import { RunConfig } from '../../src/run-config';


/* ****************************************************************************************************************** */
// region: Tests
/* ****************************************************************************************************************** */

describe('Run', () => {
  const inputs = {
    dependencyName: 'ts-patch',
  } as RunConfig.ActionInput;

  beforeAll(() => {
    process.env.USE_MOCK_ARTIFACT = 'true';
    process.env.DEBUG = 'true';
  });

  test('Should run', async () => {
    await expect(run(RunConfig.fromInput(inputs))).resolves.not.toThrow();
  });
});

// endregion
