export const getItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    // silence
    return null;
  }
};

export const setItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // silence
  }
};

export const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // silence
  }
};
