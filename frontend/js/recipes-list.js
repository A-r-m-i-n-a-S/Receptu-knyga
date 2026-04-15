// Loads and displays the recipe list on index.html.
// Supports filtering by category and search term.

// Redirect to login if not authenticated
if (!localStorage.getItem('jwt_token')) {
  window.location.href = 'login.html';
}

// Show logged-in username in the header
document.getElementById('username-display').textContent = localStorage.getItem('username') || '';

// Logout: clear storage and go to login page
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

const recipesGrid = document.getElementById('recipes-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');

// Builds the query string from current filter values
function getQueryString() {
  const search = searchInput.value.trim();
  const category = categorySelect.value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Renders recipe cards into the grid
function renderRecipes(recipes) {
  recipesGrid.innerHTML = '';

  if (recipes.length === 0) {
    recipesGrid.innerHTML = '<p class="no-results">Receptų nerasta.</p>';
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    // Show filled star for favourites, empty star otherwise
    const star = recipe.is_favourite === 1 ? '★' : '☆';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">${recipe.title}</span>
        <span class="card-star" title="Mėgstamiausias">${star}</span>
      </div>
      <span class="card-category">${recipe.category}</span>
      <a class="card-btn" href="recipe.html?id=${recipe.id}">Peržiūrėti</a>
    `;

    recipesGrid.appendChild(card);
  });
}

// Fetches recipes from API with current filters and re-renders the grid
async function loadRecipes() {
  const qs = getQueryString();
  try {
    const recipes = await apiFetch(`/recipes${qs}`);
    if (recipes) renderRecipes(recipes);
  } catch (err) {
    recipesGrid.innerHTML = '<p class="no-results">Klaida kraunant receptus.</p>';
  }
}

// Re-load recipes whenever search or category changes
searchInput.addEventListener('input', loadRecipes);
categorySelect.addEventListener('change', loadRecipes);

// Initial load
loadRecipes();
