export function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return parseInt(payload.id); // ← полето от claim-а
  } catch {
    return null;
  }
}
