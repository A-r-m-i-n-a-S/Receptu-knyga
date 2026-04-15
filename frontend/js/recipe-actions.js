// This file handles all API calls for creating, editing, deleting, and favouriting recipes.
// It relies on apiFetch() defined in api.js being loaded before this script.

// Creates a new recipe by sending a POST request to the API
async function createRecipe(data) {
  return await apiFetch('/recipes', 'POST', data);
}

// Updates an existing recipe by its ID using a PUT request
async function updateRecipe(id, data) {
  return await apiFetch(`/recipes/${id}`, 'PUT', data);
}

// Deletes a recipe by its ID using a DELETE request
async function deleteRecipe(id) {
  return await apiFetch(`/recipes/${id}`, 'DELETE');
}

// Toggles the favourite status of a recipe by its ID using a PATCH request
async function toggleFavourite(id) {
  return await apiFetch(`/recipes/${id}/favourite`, 'PATCH');
}
