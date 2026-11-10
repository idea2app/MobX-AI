import assert from 'node:assert/strict';
import test from 'node:test';

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
  assert.ok(process.versions.node);
  assert.equal(new Example().message(), 'decorated: ready');
});
