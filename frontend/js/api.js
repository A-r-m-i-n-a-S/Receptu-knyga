// Base URL for all API requests
const BASE_URL = 'http://localhost:3000/api';

// Sends an authenticated fetch request to the API.
// Automatically attaches the JWT token from localStorage.
// Redirects to login.html if the server returns 401 Unauthorized.
async function apiFetch(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('jwt_token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Attach body for POST/PUT requests
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(BASE_URL + endpoint, options);

  // Redirect to login if token is missing or expired
  if (response.status === 401) {
    window.location.href = 'login.html';
    return;
  }

  return response.json();
}
