const SESSION_KEY = 'vatar-username';

export function getSessionUsername(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setSessionUsername(username: string) {
  sessionStorage.setItem(SESSION_KEY, username);
}

export function clearSessionUsername() {
  sessionStorage.removeItem(SESSION_KEY);
}
