describe('Node.js and SWC test toolchain', () => {
  it('runs in Node.js and transpiles TypeScript with SWC', () => {
    const identity = <Value>(value: Value): Value => value;

    expect(process.versions.node).toBeDefined();
    expect(identity('ready')).toBe('ready');
  });
});
