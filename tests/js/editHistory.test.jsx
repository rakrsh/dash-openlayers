import { getEditHistory } from '../../src/lib/utils/editHistory';

describe('edit history', () => {
  it('undoes and redoes commands and publishes availability', () => {
    const history = getEditHistory({});
    const value = [];
    const listener = jest.fn();
    history.subscribe(listener);

    history.record({
      undo: () => value.pop(),
      redo: () => value.push('draw'),
    });
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });

    expect(history.undo()).toBe(true);
    expect(value).toEqual([]);
    expect(history.getState()).toEqual({ canUndo: false, canRedo: true });

    expect(history.redo()).toBe(true);
    expect(value).toEqual(['draw']);
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('clears redo history when a new edit is recorded', () => {
    const history = getEditHistory({});
    history.record({ undo: jest.fn(), redo: jest.fn() });
    history.undo();

    history.record({ undo: jest.fn(), redo: jest.fn() });

    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    expect(history.redo()).toBe(false);
  });

  it('keeps command stacks isolated by map', () => {
    const first = getEditHistory({});
    const second = getEditHistory({});
    first.record({ undo: jest.fn(), redo: jest.fn() });

    expect(second.getState()).toEqual({ canUndo: false, canRedo: false });
  });

  it('discards commands when their source is removed', () => {
    const history = getEditHistory({});
    const source = {};
    const firstCommand = { undo: jest.fn(), redo: jest.fn() };
    const secondCommand = { undo: jest.fn(), redo: jest.fn() };
    history.record(firstCommand, source);
    history.record(secondCommand, source);
    history.undo();

    history.removeSource(source);

    expect(history.getState()).toEqual({ canUndo: false, canRedo: false });
    expect(history.undo()).toBe(false);
    expect(history.redo()).toBe(false);
    expect(firstCommand.undo).not.toHaveBeenCalled();
    expect(secondCommand.redo).not.toHaveBeenCalled();
  });
});
