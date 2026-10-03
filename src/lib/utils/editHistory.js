const histories = new WeakMap();

export const getEditHistory = (map) => {
  let history = histories.get(map);
  if (history) return history;

  const undoStack = [];
  const redoStack = [];
  const listeners = new Set();

  const getState = () => ({
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  });

  const notify = () => {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  };

  history = {
    getState,
    subscribe(listener) {
      listeners.add(listener);
      listener(getState());
      return () => listeners.delete(listener);
    },
    record(command, source) {
      undoStack.push({ ...command, source });
      redoStack.length = 0;
      notify();
    },
    removeSource(source) {
      const removeOwnedCommands = (stack) => {
        const retained = stack.filter((command) => command.source !== source);
        const changed = retained.length !== stack.length;
        stack.splice(0, stack.length, ...retained);
        return changed;
      };

      const undoChanged = removeOwnedCommands(undoStack);
      const redoChanged = removeOwnedCommands(redoStack);
      if (undoChanged || redoChanged) notify();
    },
    undo() {
      const command = undoStack.pop();
      if (!command) return false;
      command.undo();
      redoStack.push(command);
      notify();
      return true;
    },
    redo() {
      const command = redoStack.pop();
      if (!command) return false;
      command.redo();
      undoStack.push(command);
      notify();
      return true;
    },
  };

  histories.set(map, history);
  return history;
};
