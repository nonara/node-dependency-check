# node-dependency-check

## 🚧 WIP 

This is fully written but still needs to be tested and released.

See: [TODO](./TODO.md)

## Overview

GitHub Action which can be run on a schedule (or by other event), which monitors a specific dependency for new releases.
When a new release is detected, the action will install the new version and run a test command to ensure compatibility.

This helps to serve as an early warning system for breaking changes in dependencies.

## Configuration

Configure the action with the following inputs:

| Option               | Required | Description                                                                                                                      |
|----------------------|----------|----------------------------------------------------------------------------------------------------------------------------------|
| `dependency`         | **Yes**  | The NPM module name to test                                                                                                      |
| `dist-tags`          | No       | Distribution tags to test against. Supports regex patterns <br><br>`default: 'latest'`                                           |
| `install-cmd`        | No       | Module install command. Module & version will be inserted for code `%module%` <br><br>`default: 'npm add %module%'`              |
| `cmd`                | No       | Command to test the module <br><br>`default: 'npm run test'`                                                                     |
| `registry`           | No       | NPM registry URL <br><br>`default: <default NPM registry>`                                                                       |
| `maxRetry`           | No       | Maximum number of times it will retry for _subsequent runs_ <br><br>`default: 5`                                                 |
| `max-per-tag-match`  | No       | Max number of new versions (per match in dist-tags) to check (starts with most recent and includes up to X) <br><br>`default: 3` |
| `artifact-name`      | No       | Unique name for the action's configuration artifact <br><br>`default: 'node-dependency-check-config'`                            |
| `artiface-retention` | No       | Number of days to retain the action's configuration artifact <br><br>`default: 400`                                              |

## Example

In this example, we monitor `typescript` every day, looking for new major versions OR release candidates (ending in -rc).

We override commands so we can use `yarn`.

```yaml
name: Node Dependency Check
on:
  schedule:
    - cron: '9 0 * * *' # Runs daily at 9am
jobs:
  test-module:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Dependency Check
        uses: nonara/node-dependency-check@v1
        with:
          dependency: typescript
          dist-tags: 
            - "latest"
            - "^\\d+\\.\\d+\\.\\d+-rc$"
          install-cmd: yarn add %module%
          cmd: yarn run test
```

## License

This project is licensed under the MIT License

