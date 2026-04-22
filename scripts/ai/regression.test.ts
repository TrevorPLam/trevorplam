import { test, expect } from 'vitest';
test('AI generates consistent Vitest config', async () => {
  expect(await runAIPrompt('create vitest config')).toMatchSnapshot();
});
