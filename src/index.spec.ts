import { describe, it, expect, vi } from 'vitest';

import { Store } from './index';

describe('Store', () => {
  interface TestState {
    count: number;
    name: string;
  }

  function createStore(initial?: Partial<TestState>) {
    return new Store<TestState>({
      count: 0,
      name: 'test',
      ...initial
    });
  }

  describe('value', () => {
    it('should return the initial value', () => {
      const store = createStore();

      expect(store.value).toEqual({ count: 0, name: 'test' });
    });

    it('should return a readonly snapshot', () => {
      const store = createStore();
      const value = store.value;

      expect(Object.isFrozen(value)).toBe(true);
    });
  });

  describe('setValue', () => {
    it('should merge partial values', () => {
      const store = createStore();

      store.setValue({ count: 5 });

      expect(store.value).toEqual({ count: 5, name: 'test' });
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers on value change', () => {
      const store = createStore();
      const subscriber = vi.fn();

      store.subscribe(subscriber);
      store.setValue({ count: 10 });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({ count: 10 })
      );
    });

    it('should return unsubscribe function', () => {
      const store = createStore();
      const subscriber = vi.fn();

      subscriber.mockReset();
      const unsubscribe = store.subscribe(subscriber);
      subscriber.mockReset();

      unsubscribe();

      store.setValue({ count: 10 });

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('listen', () => {
    it('should notify listener on change', () => {
      const store = createStore();
      const listener = vi.fn();

      store.listen(listener);
      store.setValue({ count: 10 });

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset to initial value', () => {
      const store = createStore();

      store.setValue({ count: 99, name: 'changed' });
      store.reset();

      expect(store.value).toEqual({ count: 0, name: 'test' });
    });
  });
});
