export const getItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    // silence
    return null;
  }
};

export const setItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    // silence
  }
};

export const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // silence
  }
};
