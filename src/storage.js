// Drop-in replacement for the `window.storage` API available inside Claude
// artifacts, backed by the browser's real localStorage so the app works as
// a standalone deployed PWA. Keys used throughout the app are already
// namespaced (e.g. "growmap:garden"), so no extra prefix is added here.
export const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      return { key, value };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (e) {
      return null;
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (e) {
      return null;
    }
  },
  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (!prefix || k.startsWith(prefix))) keys.push(k);
      }
      return { keys };
    } catch (e) {
      return null;
    }
  },
};
