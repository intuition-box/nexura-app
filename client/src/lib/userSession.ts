const USER_SESSION_KEY = "nexura_user_session";

export const storeUserSession = (data: any) => {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(data));
};

export const getStoredUserSession = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const getStoredUserToken = () => {
  const user = getStoredUserSession();
  return user?.token || null;
};