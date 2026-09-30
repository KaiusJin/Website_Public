import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { loadContent, loadContentTables } from '../src/data/content.js';

function clientWith(fetch) {
  return createClient('https://cms.example.test', 'test-key', {
    global: { fetch }, auth: { persistSession: false, autoRefreshToken: false },
  });
}

test('shared CMS loader preserves ordered rows and passes cancellation to the request', async () => {
  const rows = [{ id: 'second', order: 0 }, { id: 'first', order: 1 }];
  const signal = new AbortController().signal;
  const client = clientWith(async (input, options) => {
    const url = new URL(input);
    assert.equal(url.pathname, '/rest/v1/projects');
    assert.equal(url.searchParams.get('select'), '*');
    assert.equal(url.searchParams.get('order'), 'order.asc');
    assert.equal(options.signal, signal);
    return Response.json(rows);
  });
  assert.deepEqual(await loadContent(client, 'projects', signal), rows);
});

test('Journey retains successful tables when another table fails, including rejected requests', async () => {
  const client = clientWith(async input => {
    const table = new URL(input).pathname.split('/').pop();
    if (table === 'awards') return Response.json({ message: 'Unavailable', code: 'test' }, { status: 503 });
    if (table === 'skills') throw new Error('Network unavailable');
    return Response.json([{ id: table }]);
  });
  const result = await loadContentTables(client, ['projects', 'awards', 'skills', 'site_profile'], new AbortController().signal);
  assert.deepEqual(result.data, {
    projects: [{ id: 'projects' }], awards: [], skills: [], site_profile: [{ id: 'site_profile' }],
  });
  assert.deepEqual(result.failedTables, ['awards', 'skills']);
});

test('an empty table is successful and is not reported as a failed load', async () => {
  const client = clientWith(async () => Response.json([]));
  assert.deepEqual(await loadContentTables(client, ['projects'], new AbortController().signal), {
    data: { projects: [] }, failedTables: [],
  });
});
