const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'tastecraft.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS recipe_cache (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    cuisine     TEXT NOT NULL,
    country     TEXT NOT NULL,
    img         TEXT NOT NULL,
    description TEXT,
    ingredients TEXT NOT NULL,
    steps       TEXT NOT NULL,
    diet        TEXT CHECK(diet IN ('veg','egg','nonveg')) NOT NULL,
    source      TEXT,
    youtube     TEXT,
    cached_at   INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL CHECK(length(name) >= 2),
    email      TEXT NOT NULL CHECK(email LIKE '%@%.%'),
    message    TEXT NOT NULL CHECK(length(message) >= 10),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id  TEXT NOT NULL,
    name       TEXT NOT NULL,
    img        TEXT NOT NULL,
    cuisine    TEXT NOT NULL,
    country    TEXT NOT NULL,
    diet       TEXT NOT NULL,
    saved_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(recipe_id)
  );

  CREATE TABLE IF NOT EXISTS user_recipes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL CHECK(length(trim(name)) >= 2),
    cuisine     TEXT NOT NULL,
    country     TEXT NOT NULL,
    img         TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    steps       TEXT NOT NULL,
    diet        TEXT NOT NULL CHECK(diet IN ('veg','egg','nonveg')),
    submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(name)
  );
`);

const stmt = {
  // recipe_cache
  getCachedRecipe:  db.prepare('SELECT * FROM recipe_cache WHERE id = ?'),
  insertRecipe:     db.prepare(`
    INSERT OR REPLACE INTO recipe_cache
    (id, name, cuisine, country, img, description, ingredients, steps, diet, source, youtube)
    VALUES (@id, @name, @cuisine, @country, @img, @description, @ingredients, @steps, @diet, @source, @youtube)
  `),
  updateRecipe:     db.prepare(`
    UPDATE recipe_cache SET
      name=@name, cuisine=@cuisine, country=@country, img=@img,
      description=@description, ingredients=@ingredients,
      steps=@steps, diet=@diet, cached_at=unixepoch()
    WHERE id=@id
  `),
  deleteRecipe:     db.prepare('DELETE FROM recipe_cache WHERE id = ?'),
  getAllCached:     db.prepare('SELECT * FROM recipe_cache ORDER BY cached_at DESC'),

  // contact_messages
  insertMessage:    db.prepare('INSERT INTO contact_messages (name,email,message) VALUES (@name,@email,@message)'),
  getAllMessages:   db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC'),
  deleteMessage:    db.prepare('DELETE FROM contact_messages WHERE id = ?'),

  // favorites
  addFavorite:      db.prepare('INSERT OR IGNORE INTO favorites (recipe_id,name,img,cuisine,country,diet) VALUES (@recipe_id,@name,@img,@cuisine,@country,@diet)'),
  removeFavorite:   db.prepare('DELETE FROM favorites WHERE recipe_id = ?'),
  getAllFavorites:  db.prepare('SELECT * FROM favorites ORDER BY saved_at DESC'),
  isFavorite:       db.prepare('SELECT id FROM favorites WHERE recipe_id = ?'),

  // user_recipes — full CRUD
  insertUserRecipe: db.prepare(`
    INSERT INTO user_recipes (name, cuisine, country, img, description, ingredients, steps, diet)
    VALUES (@name, @cuisine, @country, @img, @description, @ingredients, @steps, @diet)
  `),
  getAllUserRecipes: db.prepare('SELECT * FROM user_recipes ORDER BY submitted_at DESC'),
  getUserRecipeById: db.prepare('SELECT * FROM user_recipes WHERE id = ?'),
  searchUserRecipes: db.prepare("SELECT * FROM user_recipes WHERE name LIKE ? OR cuisine LIKE ? OR country LIKE ?"),
  updateUserRecipe: db.prepare(`
    UPDATE user_recipes SET
      name=@name, cuisine=@cuisine, country=@country, img=@img,
      description=@description, ingredients=@ingredients,
      steps=@steps, diet=@diet
    WHERE id=@id
  `),
  deleteUserRecipe: db.prepare('DELETE FROM user_recipes WHERE id = ?'),
  getUserRecipeByArea: db.prepare('SELECT * FROM user_recipes WHERE cuisine = ? ORDER BY name'),
};

console.log(`DB ready: ${DB_PATH}`);
module.exports = { db, stmt };