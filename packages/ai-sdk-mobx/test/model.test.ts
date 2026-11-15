import assert from 'node:assert/strict';
import test from 'node:test';
import { BaseModel } from 'mobx-restful';

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
