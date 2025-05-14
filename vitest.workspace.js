import { defineWorkspace } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineWorkspace(["./apps/api/vitest.config.ts", "./apps/web/vite.config.js", {
  extends: 'apps/project-client/vite.config.ts',
  plugins: [
  // The plugin will run tests for the stories defined in your Storybook config
  // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
  storybookTest({
    configDir: path.join(dirname, '.storybook')
  })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      name: 'chromium',
      provider: 'playwright'
    },
    setupFiles: ['apps/project-client/.storybook/vitest.setup.ts']
  }
}]);