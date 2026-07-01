const API = 'http://localhost:3000/api';

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

// Render cards
function renderCards(meals) {
  if (!meals || meals.length === 0) {
    recipesGrid.innerHTML = `<p style="text-align:center;grid-column:1/-1;color:#888">No recipes found.</p>`;
    return;
  }

  recipesGrid.innerHTML = meals.map(meal => `
    <article class="recipe-card visible" data-id="${meal.id}" data-cuisine="${meal.cuisine}">
      <img src="${meal.img}" alt="${meal.name}" loading="lazy" />
      <div class="card-body">
        <span class="tag">${meal.country || meal.cuisine}</span>
        <h3>${meal.name}</h3>
        <p>${meal.description || 'Click to view full recipe.'}</p>
        <button class="view-btn" onclick="openDetail('${meal.id}')">View Recipe →</button>
      </div>
    </article>
  `).join('');

  // Re-observe new cards for scroll reveal
  document.querySelectorAll('.recipe-card').forEach(card => observer.observe(card));
}

//Show loading state
function showLoading() {
  recipesGrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--mocha)">
      <div class="loader"></div>
      <p style="margin-top:1rem;font-family:var(--font-head)">Loading recipes...</p>
    </div>`;
}

//Load all recipes on page load
async function loadRecipes() {
  showLoading();
  try {
    const res = await fetch(`${API}/recipes`);
    const data = await res.json();
    if (data.success) renderCards(data.data);
    else recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center">Failed to load recipes.</p>`;
  } catch (err) {
    recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:red">Server not reachable. Make sure it's running.</p>`;
  }
}

// Filter recipes by cuisine/area
async function filterByCuisine(cuisine) {
  showLoading();
  try {
    let url = cuisine === 'all'
      ? `${API}/recipes`
      : `${API}/recipes/area/${cuisine}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) renderCards(data.data);
  } catch (err) {
    console.error(err);
  }
}

//Search recipes
async function performSearch() {
  const q = heroSearchInput.value.trim();
  if (!q) return;

  document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
  showLoading();

  try {
    const res = await fetch(`${API}/recipes/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.success) renderCards(data.data);
    else {
      recipesGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888">No results for "${q}"</p>`;
    }
  } catch (err) {
    console.error(err);
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
    const res = await fetch(`${API}/recipes/${id}`);
    const data = await res.json();

    if (!data.success) {
      document.getElementById('detail-name').textContent = 'Recipe not found.';
      return;
    }

    const recipe = data.data;

    document.getElementById('detail-img').src = recipe.img;
    document.getElementById('detail-img').alt = recipe.name;
    document.getElementById('detail-name').textContent = recipe.name;
    document.getElementById('detail-country').textContent = `🌍 ${recipe.country}`;

    // Diet badge
    const dietColors = { veg: '#4caf50', egg: '#ff9800', nonveg: '#f44336' };
    const dietLabels = { veg: '🥦 Veg', egg: '🥚 Egg', nonveg: '🍗 Non-Veg' };
    const dietBadge = document.createElement('span');
    dietBadge.textContent = dietLabels[recipe.diet] || '';
    dietBadge.style.cssText = `
      display:inline-block;margin-left:0.8rem;
      background:${dietColors[recipe.diet]};color:white;
      padding:0.2rem 0.8rem;border-radius:20px;
      font-size:0.75rem;font-weight:700;
    `;
    const countryEl = document.getElementById('detail-country');
    countryEl.innerHTML = '';
    countryEl.appendChild(document.createTextNode(`🌍 ${recipe.country}`));
    countryEl.appendChild(dietBadge);

    document.getElementById('ingredients-list').innerHTML =
      recipe.ingredients.map(i => `<li>${i}</li>`).join('');

    document.getElementById('steps-list').innerHTML =
      recipe.steps.map(s => `<li>${s}</li>`).join('');

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
    console.error(err);
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

// ── INIT ──
loadRecipes();