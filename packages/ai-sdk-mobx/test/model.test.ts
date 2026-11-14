import assert from 'node:assert/strict';
import test from 'node:test';
import { BaseModel } from 'mobx-restful';

class TestModel extends BaseModel {}

function decorate(value: (this: Example) => string) {
  return function (this: Example) {
    return `decorated: ${value.call(this)}`;
  };
}

class Example {
  @decorate
  message() {
    return 'ready';
  }
}

test('Node.js test runner executes TypeScript with Stage 3 decorators via SWC', () => {
  assert.equal(new Example().message(), 'decorated: ready');
});

test('mobx-restful BaseModel resets request state', () => {
  const model = new TestModel();

  model.downloading = 1;
  model.uploading = 1;
  model.clear();

  assert.equal(model.downloading, 0);
  assert.equal(model.uploading, 0);
});
