// Handles login and register form submissions on login.html

// If user is already logged in, skip to the main page
if (localStorage.getItem('jwt_token')) {
  window.location.href = 'index.html';
}

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');

// Switch between login and register views
document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiFetch('/auth/login', 'POST', { username, password });

    if (data.error) {
      loginError.textContent = data.error;
      return;
    }

    // Save token and username, then redirect to main page
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('username', data.username);
    window.location.href = 'index.html';
  } catch (err) {
    loginError.textContent = 'Klaida jungiantis prie serverio.';
  }
});

// Handle register form submission
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  registerSuccess.textContent = '';

  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    const data = await apiFetch('/auth/register', 'POST', { username, password });

    if (data.error) {
      registerError.textContent = data.error;
      return;
    }

    // Show success and switch back to login form
    registerSuccess.textContent = 'Registracija sėkminga! Prisijunkite.';
    registerForm.reset();
    setTimeout(() => {
      document.getElementById('register-section').classList.add('hidden');
      document.getElementById('login-section').classList.remove('hidden');
    }, 1500);
  } catch (err) {
    registerError.textContent = 'Klaida jungiantis prie serverio.';
  }
});
