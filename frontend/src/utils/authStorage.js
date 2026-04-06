export const getStoredUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!user) {
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
};

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
};
