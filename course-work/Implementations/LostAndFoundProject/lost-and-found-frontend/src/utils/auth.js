

// Запазва токена в localStorage
export function setToken(token) {
  localStorage.setItem('token', token);
}

// Връща токена от localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Изтрива токена (logout)
export function logout() {
  localStorage.removeItem('token');
}

// Проверява дали потребителят е автентикиран
export function isAuthenticated() {
  return !!getToken();
}
