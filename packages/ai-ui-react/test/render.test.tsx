import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('', { pretendToBeVisual: true });

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  MutationObserver: dom.window.MutationObserver,
});

test('React Testing Library renders TSX in jsdom', async () => {
  const { cleanup, render, screen } = await import('@testing-library/react');
  const Greeting = () => <p>AI components are ready</p>;

  render(<Greeting />);
  assert.equal(screen.getByText('AI components are ready').textContent, 'AI components are ready');
  cleanup();
  dom.window.close();
});
