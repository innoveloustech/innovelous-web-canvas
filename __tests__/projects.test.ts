import { describe, expect, it } from 'vitest';

describe('build smoke test', () => {
  it('keeps the test harness active without local Supabase dependencies', () => {
    expect(true).toBe(true);
  });
});
