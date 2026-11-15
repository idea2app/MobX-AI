import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanup, render, screen } from '@testing-library/react';

test('React testing library renders TSX in jsdom', () => {
  const Greeting = () => <p>AI components are ready</p>;

  render(<Greeting />);

  assert.equal(screen.getByText('AI components are ready').textContent, 'AI components are ready');
  cleanup();
});
