import assert from 'node:assert/strict';
import test from 'node:test';
import { isObservableProp } from 'mobx';
import { jsonSchema } from 'ai';
import { BaseModel } from 'mobx-restful';
import { ChatModel, CompletionModel, ObjectModel, RealtimeModel } from '../source/index.js';

test('Node.js test runner executes TypeScript with Stage 3 decorators via SWC', () => {
  const decorate = (value: (this: Example) => string) =>
    function (this: Example) {
      return `decorated: ${value.call(this)}`;
    };

  class Example {
    @decorate
    message() {
      return 'ready';
    }
  }
  assert.equal(new Example().message(), 'decorated: ready');
});

test('mobx-restful BaseModel resets request state', () => {
  class TestModel extends BaseModel {}

  const model = new TestModel();

  model.downloading = 1;
  model.uploading = 1;
  model.clear();

  assert.equal(model.downloading, 0);
  assert.equal(model.uploading, 0);
});

test('ChatModel keeps AI chat state observable and clears it', () => {
  const model = new ChatModel();
  const message = {
    id: 'message-1',
    role: 'user',
    parts: [{ type: 'text', text: 'Hello' }],
  };

  model.pushMessage(message as Parameters<typeof model.pushMessage>[0]);

  assert.equal(isObservableProp(model, 'messages'), true);
  assert.equal(model.messages[0].id, 'message-1');
  assert.equal(model.id, model.chat.id);

  model.clear();

  assert.deepEqual(model.messages, []);
  assert.equal(model.status, 'ready');
});

test('CompletionModel streams a completion and tracks request state', async () => {
  let requestBody: unknown;
  const model = new CompletionModel({
    api: '/completion',
    streamProtocol: 'text',
    fetch: async (_input, init) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response('generated text');
    },
  });

  const result = await model.complete('prompt');

  assert.deepEqual(requestBody, { prompt: 'prompt' });
  assert.equal(result, 'generated text');
  assert.equal(model.completion, 'generated text');
  assert.equal(model.isLoading, false);
});

test('ObjectModel parses and validates streamed JSON', async () => {
  const schema = jsonSchema<{ name: string }>(
    { type: 'object', properties: { name: { type: 'string' } } },
    {
      validate: value =>
        value != null && typeof value === 'object' && 'name' in value
          ? { success: true, value: value as { name: string } }
          : { success: false, error: new Error('Invalid object') },
    },
  );
  const model = new ObjectModel({
    api: '/object',
    schema,
    fetch: async () => new Response('{"name":"Ada"}'),
  });

  await model.submit({ prompt: 'name' });

  assert.deepEqual(model.object, { name: 'Ada' });
  assert.equal(model.isLoading, false);
  assert.equal(model.error, undefined);
});

test('RealtimeModel exposes observable realtime hook state', () => {
  const model = new RealtimeModel({
    model: {} as never,
    api: { websocket: 'ws://localhost' },
  });

  assert.equal(model.status, 'disconnected');
  assert.equal(isObservableProp(model, 'status'), true);
  model.dispose();
});
