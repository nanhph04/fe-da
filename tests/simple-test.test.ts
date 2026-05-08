describe('Simple Test', () => {
  it('should pass', () => {
    const result = 1 + 1;
    if (result !== 2) {
      throw new Error(`Expected 2 but got ${result}`);
    }
  });
});