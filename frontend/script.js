const API = '/api';

//State
let activeFilter = 'all';
let activeDiet = 'all';

//DOM elements
const mainPage   = document.getElementById('main-page');
const detailPage = document.getElementById('detail-page');
const backBtn    = document.getElementById('back-btn');
const recipesGrid = document.querySelector('.recipes-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const menuBtn    = document.querySelector('.menu-btn');
const navLinks   = document.querySelector('.nav-links');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchBtn   = document.getElementById('hero-search-btn');
const favoriteIds = new Set();

// Centralized fetch wrapper
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

async function loadFavoriteState() {
  try {
    const data = await apiFetch(`${API}/favorites`);
    favoriteIds.clear();
    (data.data || []).forEach(favorite => favoriteIds.add(String(favorite.recipe_id)));
  } catch (err) {
    favoriteIds.clear();
  }
}

// Toast notifications
function showToast(message, type = 'error') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    padding: 0.85rem 1.4rem;
    border-radius: 12px;
    font-family: var(--font-head);
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    background: ${type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#2980b9'};
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    animation: slideInToast 0.3s ease;
    max-width: 320px;
    line-height: 1.4;
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Render cards
function renderCards(meals) {
  if (!meals || meals.length === 0) {
    recipesGrid.innerHTML = `<p style="text-align:center;grid-column:1/-1;color:#888">No recipes found.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  meals.forEach(meal => {
    const article = document.createElement('article');
    article.className = 'recipe-card visible';
    article.dataset.id = meal.id;
    article.dataset.cuisine = meal.cuisine;

    const image = document.createElement('img');
    image.src = meal.img;
    image.alt = meal.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 400;
    image.height = 260;

    const body = document.createElement('div');
    body.className = 'card-body';

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = meal.country || meal.cuisine;
    body.appendChild(tag);

    if (meal.isUserSubmitted) {
      const communityTag = document.createElement('span');
      communityTag.className = 'tag';
      communityTag.style.cssText = 'background:var(--mocha);color:white;margin-left:0.3rem';
      communityTag.textContent = 'Community';
      body.appendChild(communityTag);
    }

    const title = document.createElement('h3');
    title.textContent = meal.name;

    const description = document.createElement('p');
    description.textContent = meal.description || 'Click to view full recipe.';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem';

    const viewButton = document.createElement('button');
    viewButton.className = 'view-btn';
    viewButton.type = 'button';
    viewButton.textContent = 'View Recipe →';
    viewButton.addEventListener('click', () => openDetail(meal.id));

    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'fav-btn';
    favoriteButton.type = 'button';
    favoriteButton.title = 'Save to favorites';
    favoriteButton.dataset.recipeId = String(meal.id);
    favoriteButton.textContent = favoriteIds.has(String(meal.id)) ? '❤️' : '🤍';
    if (favoriteIds.has(String(meal.id))) {
      favoriteButton.classList.add('saved');
    }
    favoriteButton.addEventListener('click', event => {
      toggleFavorite(
        event,
        meal.id,
        meal.name,
        meal.img,
        meal.cuisine,
        meal.country || meal.cuisine,
        meal.diet || 'veg'
      );
    });

    actions.appendChild(viewButton);
    actions.appendChild(favoriteButton);
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(actions);

    article.appendChild(image);
    article.appendChild(body);
    fragment.appendChild(article);
  });

  recipesGrid.replaceChildren(fragment);
}

//Show loading state
function showLoading() {
  recipesGrid.setAttribute('aria-busy', 'true');
  recipesGrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--mocha)">
      <div class="loader"></div>
      <p style="margin-top:1rem;font-family:var(--font-head)">Loading recipes...</p>
    </div>`;
}

function hideLoading() {
  recipesGrid.removeAttribute('aria-busy');
}

//Load all recipes on page load
async function loadRecipes() {
  showLoading();
  try {
    await loadFavoriteState();

    const [mealdbRes, userRes] = await Promise.all([
      apiFetch(`${API}/recipes`),
      apiFetch(`${API}/user-recipes`)
    ]);

    const mealdbMeals = mealdbRes.data || [];
    const userMeals = userRes.data || [];

    // Show 6 user recipes at top, then TheMealDB
    const combined = [...userMeals.slice(0, 6), ...mealdbMeals];
    renderCards(combined);
  } catch (err) {
    recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:red">Server not reachable.</p>`;
    showToast('Failed to load recipes. Is the server running?');
  } finally {
    hideLoading();
  }
}

// Filter recipes by cuisine/area
async function filterByCuisine(cuisine) {
  showLoading();
  try {
    let url = cuisine === 'all'
      ? `${API}/recipes`
      : `${API}/recipes/area/${cuisine}`;
    const data = await apiFetch(url);
    renderCards(data.data || []);
  } catch (err) {
    recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888">No recipes found.</p>`;
    showToast(`Could not load ${cuisine} recipes.`);
  } finally {
    hideLoading();
  }
}

//Search recipes
async function performSearch() {
  const q = heroSearchInput.value.trim();
  if (!q) return;

  document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
  showLoading();

  try {
    const data = await apiFetch(`${API}/recipes/search?q=${encodeURIComponent(q)}`);
    renderCards(data.data || []);
  } catch (err) {
    recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888">No results for "${q}"</p>`;
    showToast(err.message.includes('No recipes found') ? `No results for "${q}"` : err.message);
  } finally {
    hideLoading();
  }
}

//Open detail page
async function openDetail(id) {
  mainPage.classList.add('hidden');
  detailPage.classList.remove('hidden');
  window.scrollTo(0, 0);

  // Show loading state on detail page
  document.getElementById('detail-name').textContent = 'Loading...';
  document.getElementById('detail-country').textContent = '';
  document.getElementById('detail-img').src = '';
  document.getElementById('ingredients-list').innerHTML = '';
  document.getElementById('steps-list').innerHTML = '';

  try {
    // Route user recipes to the correct endpoint
    const isUserRecipe = String(id).startsWith('user_');
    const numericId = isUserRecipe ? String(id).replace('user_', '') : id;
    const endpoint = isUserRecipe
      ? `${API}/user-recipes/${numericId}`
      : `${API}/recipes/${id}`;

    const data = await apiFetch(endpoint);

    if (!data.success) {
      document.getElementById('detail-name').textContent = 'Recipe not found.';
      return;
    }

    const recipe = data.data;

    document.getElementById('detail-img').src = recipe.img;
    document.getElementById('detail-img').alt = recipe.name;
    document.getElementById('detail-name').textContent = recipe.name;

    const dietColors = { veg: '#4caf50', egg: '#ff9800', nonveg: '#f44336' };
    const dietLabels = { veg: '🥦 Veg', egg: '🥚 Egg', nonveg: '🍗 Non-Veg' };

    const countryEl = document.getElementById('detail-country');
    countryEl.innerHTML = '';
    countryEl.appendChild(document.createTextNode(`🌍 ${recipe.country}`));

    if (recipe.diet) {
      const dietBadge = document.createElement('span');
      dietBadge.textContent = dietLabels[recipe.diet] || '';
      dietBadge.style.cssText = `
        display:inline-block;margin-left:0.8rem;
        background:${dietColors[recipe.diet]};color:white;
        padding:0.2rem 0.8rem;border-radius:20px;
        font-size:0.75rem;font-weight:700;
      `;
      countryEl.appendChild(dietBadge);
    }

    if (recipe.isUserSubmitted) {
      const badge = document.createElement('span');
      badge.textContent = '✍️ Community Recipe';
      badge.style.cssText = `
        display:inline-block;margin-left:0.8rem;
        background:var(--mocha);color:white;
        padding:0.2rem 0.8rem;border-radius:20px;
        font-size:0.75rem;font-weight:700;
      `;
      countryEl.appendChild(badge);
    }

    const oldActions = document.getElementById('user-recipe-actions');
    if (oldActions) oldActions.remove();

    if (recipe.isUserSubmitted) {
      const actions = document.createElement('div');
      actions.id = 'user-recipe-actions';
      actions.style.cssText = 'display:flex;gap:0.75rem;flex-wrap:wrap;margin:1.25rem 0 0.5rem;';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edit Recipe';
      editBtn.style.cssText = `
        background:var(--mocha);color:white;border:none;
        padding:0.7rem 1.1rem;border-radius:999px;
        font-family:var(--font-head);font-weight:700;cursor:pointer;
      `;
      editBtn.addEventListener('click', async () => {
        const name = window.prompt('Recipe name', recipe.name);
        if (name === null) return;

        const cuisine = window.prompt('Cuisine', recipe.cuisine || '');
        if (cuisine === null) return;

        const country = window.prompt('Country', recipe.country || '');
        if (country === null) return;

        const description = window.prompt('Description', recipe.description || '');
        if (description === null) return;

        const ingredientsText = window.prompt('Ingredients (comma separated)', recipe.ingredients.join(', '));
        if (ingredientsText === null) return;

        const stepsText = window.prompt('Steps (comma separated)', recipe.steps.join(', '));
        if (stepsText === null) return;

        const diet = window.prompt('Diet (veg, egg, nonveg)', recipe.diet || 'veg');
        if (diet === null) return;

        const payload = {
          name: name.trim(),
          cuisine: cuisine.trim(),
          country: country.trim(),
          description: description.trim(),
          ingredients: ingredientsText.split(',').map(item => item.trim()).filter(Boolean),
          steps: stepsText.split(',').map(item => item.trim()).filter(Boolean),
          diet: diet.trim()
        };

        try {
          await apiFetch(`${API}/user-recipes/${numericId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          showToast(`"${name}" updated.`, 'success');
          await openDetail(id);
        } catch (err) {
          showToast(err.message || 'Failed to update recipe.');
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Delete Recipe';
      deleteBtn.style.cssText = `
        background:#b23a48;color:white;border:none;
        padding:0.7rem 1.1rem;border-radius:999px;
        font-family:var(--font-head);font-weight:700;cursor:pointer;
      `;
      deleteBtn.addEventListener('click', async () => {
        if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;

        try {
          await apiFetch(`${API}/user-recipes/${numericId}`, { method: 'DELETE' });

          showToast(`"${recipe.name}" deleted.`, 'success');
          detailPage.classList.add('hidden');
          mainPage.classList.remove('hidden');
          await loadRecipes();
          window.scrollTo(0, 0);
        } catch (err) {
          showToast(err.message || 'Failed to delete recipe.');
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      document.getElementById('detail-content').appendChild(actions);
    }

    document.getElementById('ingredients-list').innerHTML =
      recipe.ingredients.map(i => `<li>${i}</li>`).join('');

    document.getElementById('steps-list').innerHTML =
      recipe.steps.map(s => `<li>${s}</li>`).join('');

    // Remove old YouTube button if present
    const oldYt = document.querySelector('#detail-content > div:last-child a[href*="youtube"]');
    if (oldYt) oldYt.parentElement.remove();

    if (recipe.youtube) {
      const ytSection = document.createElement('div');
      ytSection.style.cssText = 'margin-top:2rem;text-align:center;';
      ytSection.innerHTML = `
        <a href="${recipe.youtube}" target="_blank" style="
          display:inline-block;background:#ff0000;color:white;
          padding:0.7rem 1.5rem;border-radius:30px;
          text-decoration:none;font-family:var(--font-head);font-weight:600;">
          ▶ Watch on YouTube
        </a>`;
      document.getElementById('detail-content').appendChild(ytSection);
    }

  } catch (err) {
    document.getElementById('detail-name').textContent = 'Failed to load recipe.';
    showToast(err.message || 'Could not load recipe details.');
  }
}

//filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cuisine = btn.dataset.cuisine;

    // Capitalize for API (Indian not indian)
    const area = cuisine === 'all' ? 'all' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    filterByCuisine(area);
  });
});

//Back button
backBtn.addEventListener('click', () => {
  detailPage.classList.add('hidden');
  mainPage.classList.remove('hidden');
  window.scrollTo(0, 0);
  // Remove YouTube button if added
  const ytBtn = document.querySelector('#detail-content > div:last-child a[href*="youtube"]');
  if (ytBtn) ytBtn.parentElement.remove();
});

//Hamburger menu toggle
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));

//Hero search
heroSearchBtn.addEventListener('click', performSearch);
heroSearchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') performSearch();
});

//Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

//Parallax
window.addEventListener('scroll', () => {
  if (!detailPage.classList.contains('hidden')) {
    const scrolled = window.scrollY;
    document.getElementById('detail-img').style.transform = `translateY(${scrolled * 0.4}px)`;
  }
});

//Add loader css
const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
  .loader {
    width: 40px; height: 40px;
    border: 4px solid rgba(165,133,111,0.2);
    border-top-color: var(--mocha);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(loaderStyle);

//Contact form submission
const contactSubmit = document.getElementById('contact-submit');
const contactFeedback = document.getElementById('contact-feedback');

contactSubmit.addEventListener('click', async () => {
  const name    = document.getElementById('contact-name').value.trim();
  const email   = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  contactFeedback.className = '';
  contactFeedback.textContent = '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 2 || !email || !message || message.length < 10) {
    contactFeedback.className = 'error';
    contactFeedback.textContent = 'Name (min 2 chars), valid email, and message (min 10 chars) required.';
    return;
  }

  if (!emailRegex.test(email)) {
    contactFeedback.className = 'error';
    contactFeedback.textContent = 'Enter a valid email address.';
    return;
  }

  contactSubmit.disabled = true;
  contactSubmit.textContent = 'Sending...';

  try {
    const data = await apiFetch(`${API}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (data.success) {
      contactFeedback.className = 'success';
      contactFeedback.textContent = '✓ Message sent successfully.';
      showToast('Message sent successfully.', 'success');
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-email').value = '';
      document.getElementById('contact-message').value = '';
    } else {
      contactFeedback.className = 'error';
      contactFeedback.textContent = data.errors ? data.errors.join(' ') : 'Failed to send.';
      showToast(data.errors ? data.errors.join(' ') : 'Failed to send.');
    }
  } catch (err) {
    contactFeedback.className = 'error';
    contactFeedback.textContent = 'Server error. Make sure the server is running.';
    showToast(err.message || 'Server error. Make sure the server is running.');
  } finally {
    contactSubmit.disabled = false;
    contactSubmit.textContent = 'Send Message';
  }
});

//favrite recipes
async function toggleFavorite(e, id, name, img, cuisine, country, diet) {
  e.stopPropagation();
  const btn = e.currentTarget;

  try {
    const recipeId = String(id);
    const isSaved = favoriteIds.has(recipeId);

    if (isSaved) {
      await apiFetch(`${API}/favorites/${recipeId}`, { method: 'DELETE' });
      btn.textContent = '🤍';
      btn.classList.remove('saved');
      favoriteIds.delete(recipeId);
      showToast('Removed from favorites.', 'success');
    } else {
      await apiFetch(`${API}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipeId, name, img, cuisine, country, diet })
      });
      btn.textContent = '❤️';
      btn.classList.add('saved');
      favoriteIds.add(recipeId);
      showToast('Added to favorites.', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Favorite toggle failed.');
  }
}

//Recipe submission form
const srSubmit   = document.getElementById('sr-submit');
const srFeedback = document.getElementById('sr-feedback');

srSubmit.addEventListener('click', async () => {
  srFeedback.className = '';
  srFeedback.textContent = '';

  const name        = document.getElementById('sr-name').value.trim();
  const diet        = document.getElementById('sr-diet').value;
  const cuisine     = document.getElementById('sr-cuisine').value.trim();
  const country     = document.getElementById('sr-country').value.trim();
  const description = document.getElementById('sr-description').value.trim();
  const img         = document.getElementById('sr-img').value.trim();
  const ingredients = document.getElementById('sr-ingredients').value
    .split('\n').map(s => s.trim()).filter(Boolean);
  const steps       = document.getElementById('sr-steps').value
    .split('\n').map(s => s.trim()).filter(Boolean);

  // Client-side validation before hitting server
  if (!name || !cuisine || !country || !description) {
    srFeedback.className = 'error';
    srFeedback.textContent = 'Name, cuisine, country and description are required.';
    return;
  }
  if (ingredients.length < 2) {
    srFeedback.className = 'error';
    srFeedback.textContent = 'Add at least 2 ingredients (one per line).';
    return;
  }
  if (steps.length < 1) {
    srFeedback.className = 'error';
    srFeedback.textContent = 'Add at least 1 step.';
    return;
  }

  srSubmit.disabled = true;
  srSubmit.textContent = 'Submitting...';

  try {
    const data = await apiFetch(`${API}/user-recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, diet, cuisine, country, description, img, ingredients, steps })
    });

    if (data.success) {
      srFeedback.className = 'success';
      srFeedback.textContent = `✓ "${name}" added to TasteCraft.`;
      showToast(`"${name}" added to TasteCraft.`, 'success');

      // Clear form
      ['sr-name','sr-cuisine','sr-country','sr-description','sr-img','sr-ingredients','sr-steps']
        .forEach(id => document.getElementById(id).value = '');
      document.getElementById('sr-diet').value = 'veg';

      // Reload cards so new recipe appears immediately
      await loadRecipes();
    } else {
      srFeedback.className = 'error';
      srFeedback.textContent = data.errors
        ? data.errors.join(' ')
        : (data.message || 'Submission failed.');
      showToast(data.errors ? data.errors.join(' ') : (data.message || 'Submission failed.'));
    }
  } catch (err) {
    srFeedback.className = 'error';
    srFeedback.textContent = 'Server error. Make sure the server is running.';
    showToast(err.message || 'Server error. Make sure the server is running.');
  } finally {
    srSubmit.disabled = false;
    srSubmit.textContent = 'Submit Recipe';
  }
});

//INIT
loadRecipes();