const { db, stmt } = require('./db');

const recipes = [
  {
    name: "Fried Momo",
    cuisine: "nepali",
    country: "Nepal",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400",
    description: "Crispy pan-fried dumplings stuffed with spiced minced meat or vegetables.",
    ingredients: JSON.stringify(["500g minced chicken", "2 cups flour", "1 onion finely chopped", "2 cloves garlic", "1 tsp ginger", "1 tsp soy sauce", "1 tsp sesame oil", "Salt to taste", "Water for dough", "Oil for frying"]),
    steps: JSON.stringify(["Mix flour and water to make a firm dough. Rest for 30 minutes.", "Mix minced chicken with onion, garlic, ginger, soy sauce, sesame oil and salt.", "Roll dough thin, cut circles, add filling and fold into dumplings.", "Steam momos for 10 minutes.", "Pan-fry in oil until golden and crispy on all sides.", "Serve hot with tomato-sesame dipping sauce."]),
    diet: "nonveg"
  },
  {
    name: "Pav Bhaji",
    cuisine: "indian",
    country: "India",
    img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
    description: "Mumbai street food — spiced mashed vegetable curry served with buttered bread rolls.",
    ingredients: JSON.stringify(["4 bread rolls (pav)", "2 potatoes boiled", "1 cup cauliflower", "1 cup peas", "2 tomatoes", "1 onion", "2 tbsp pav bhaji masala", "2 tbsp butter", "Lemon juice", "Fresh coriander"]),
    steps: JSON.stringify(["Boil and mash potatoes, cauliflower and peas together.", "Sauté onions in butter until golden, add tomatoes and cook down.", "Add mashed vegetables and pav bhaji masala, mix and mash well.", "Add water and simmer for 10 minutes until thick.", "Toast pav rolls with butter on a hot griddle.", "Serve bhaji topped with butter, onion, lemon and coriander."]),
    diet: "veg"
  },
  {
    name: "Vada Pav",
    cuisine: "indian",
    country: "India",
    img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
    description: "Mumbai's iconic street burger — spiced potato fritter in a bread roll with chutneys.",
    ingredients: JSON.stringify(["4 bread rolls", "4 potatoes boiled and mashed", "1 cup chickpea flour", "1 tsp mustard seeds", "2 green chillies", "1 tsp turmeric", "Oil for frying", "Green chutney", "Tamarind chutney", "Dry garlic chutney"]),
    steps: JSON.stringify(["Mix mashed potatoes with mustard seeds, green chillies, turmeric and salt.", "Shape into round patties.", "Make batter from chickpea flour, turmeric, salt and water.", "Dip patties in batter and deep fry until golden.", "Slice pav rolls, apply all three chutneys.", "Place vada inside and serve immediately."]),
    diet: "veg"
  },
  {
    name: "Pad Thai",
    cuisine: "thai",
    country: "Thailand",
    img: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
    description: "Thailand's most famous stir-fried noodle dish with tamarind, fish sauce and peanuts.",
    ingredients: JSON.stringify(["200g rice noodles", "200g shrimp or tofu", "2 eggs", "3 tbsp tamarind paste", "2 tbsp fish sauce", "1 tbsp sugar", "Bean sprouts", "Spring onions", "Crushed peanuts", "Lime wedges"]),
    steps: JSON.stringify(["Soak rice noodles in warm water for 30 minutes.", "Mix tamarind, fish sauce and sugar into sauce.", "Stir-fry shrimp or tofu in hot wok until cooked.", "Push aside, scramble eggs in same wok.", "Add drained noodles and sauce, toss everything together.", "Add bean sprouts, top with peanuts, spring onions and lime."]),
    diet: "nonveg"
  },
  {
    name: "Jollof Rice",
    cuisine: "nigerian",
    country: "Nigeria",
    img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
    description: "West Africa's most beloved one-pot rice dish cooked in a rich tomato and pepper base.",
    ingredients: JSON.stringify(["2 cups long grain rice", "4 tomatoes", "2 red bell peppers", "1 scotch bonnet chilli", "1 onion", "2 cups chicken stock", "1 tsp thyme", "1 tsp curry powder", "3 tbsp vegetable oil", "Salt to taste"]),
    steps: JSON.stringify(["Blend tomatoes, peppers, chilli and half the onion into a smooth puree.", "Fry remaining onion in oil until soft.", "Add tomato puree and fry for 15-20 minutes until oil floats to top.", "Add stock, thyme, curry powder and salt. Bring to boil.", "Add washed rice, stir, cover tightly and cook on low heat 30 minutes.", "Stir every 10 minutes, adding stock if needed. Serve with fried chicken."]),
    diet: "veg"
  },
  {
    name: "Shakshuka",
    cuisine: "middle eastern",
    country: "Israel",
    img: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=400",
    description: "Eggs poached in a spiced tomato and pepper sauce — a Middle Eastern breakfast staple.",
    ingredients: JSON.stringify(["6 eggs", "4 tomatoes chopped", "2 red bell peppers", "1 onion", "4 cloves garlic", "1 tsp cumin", "1 tsp paprika", "1 tsp chilli flakes", "Fresh parsley", "Feta cheese", "Crusty bread to serve"]),
    steps: JSON.stringify(["Sauté onion and peppers in olive oil until soft.", "Add garlic, cumin, paprika and chilli flakes, cook 1 minute.", "Add tomatoes, crush slightly, simmer 15 minutes until thick.", "Make 6 wells in the sauce, crack an egg into each.", "Cover and cook 5-8 minutes until whites are set but yolks runny.", "Top with feta, parsley and serve with crusty bread."]),
    diet: "egg"
  },
  {
    name: "Chicken Adobo",
    cuisine: "filipino",
    country: "Philippines",
    img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=400",
    description: "Philippines national dish — chicken braised in vinegar, soy sauce, garlic and bay leaves.",
    ingredients: JSON.stringify(["1kg chicken pieces", "1/2 cup white vinegar", "1/4 cup soy sauce", "8 cloves garlic crushed", "3 bay leaves", "1 tsp black peppercorns", "1 tbsp oil", "1 cup water"]),
    steps: JSON.stringify(["Marinate chicken in vinegar, soy sauce, garlic and peppercorns for 1 hour.", "Brown chicken in oil on all sides.", "Add marinade, water and bay leaves. Bring to boil.", "Simmer covered for 30 minutes until chicken is tender.", "Uncover and simmer 10 more minutes until sauce reduces.", "Serve over steamed white rice."]),
    diet: "nonveg"
  },
  {
    name: "Beef Rendang",
    cuisine: "indonesian",
    country: "Indonesia",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    description: "Indonesia's slow-cooked dry beef curry — deeply spiced and caramelised to perfection.",
    ingredients: JSON.stringify(["1kg beef chuck cut into chunks", "400ml coconut milk", "4 lemongrass stalks", "6 kaffir lime leaves", "1 tsp turmeric", "2 tbsp rendang paste", "3 tbsp desiccated coconut toasted", "Salt to taste"]),
    steps: JSON.stringify(["Blend rendang paste with turmeric and a little water.", "Cook paste in a dry pan until fragrant.", "Add beef and coat in paste.", "Add coconut milk, lemongrass and lime leaves. Bring to boil.", "Simmer uncovered on low heat for 3-4 hours, stirring occasionally.", "When liquid is almost gone, add toasted coconut and stir until dark and dry."]),
    diet: "nonveg"
  },
  {
    name: "Dhokla",
    cuisine: "indian",
    country: "India",
    img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
    description: "Gujarati steamed chickpea cake — soft, spongy, tangy and light.",
    ingredients: JSON.stringify(["2 cups chickpea flour", "1 cup yogurt", "1 tsp ginger paste", "2 tsp Eno fruit salt", "1 tsp sugar", "Salt to taste", "2 tbsp oil", "1 tsp mustard seeds", "Curry leaves", "Green chillies"]),
    steps: JSON.stringify(["Mix chickpea flour, yogurt, ginger, sugar and salt into smooth batter.", "Add water to make pouring consistency. Rest 20 minutes.", "Add Eno fruit salt, mix quickly — batter will foam.", "Pour immediately into greased steamer tray.", "Steam for 15 minutes until toothpick comes out clean.", "Temper mustard seeds, curry leaves and chillies in oil, pour over dhokla."]),
    diet: "veg"
  },
  {
    name: "Pho Bo",
    cuisine: "vietnamese",
    country: "Vietnam",
    img: "https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400",
    description: "Vietnam's iconic beef noodle soup — rich bone broth with rice noodles and fresh herbs.",
    ingredients: JSON.stringify(["1kg beef bones", "300g rice noodles", "200g beef sirloin thinly sliced", "2 onions halved", "1 cinnamon stick", "3 star anise", "1 tbsp fish sauce", "Bean sprouts", "Fresh basil", "Lime wedges", "Hoisin sauce"]),
    steps: JSON.stringify(["Char onions over open flame until blackened.", "Blanch beef bones in boiling water 10 minutes, drain and rinse.", "Simmer bones with charred onions, cinnamon, star anise and fish sauce for 4 hours.", "Strain broth, season with salt and fish sauce.", "Cook rice noodles per packet instructions.", "Ladle hot broth over noodles, top with raw beef slices — broth cooks them. Serve with fresh herbs."]),
    diet: "nonveg"
  },
  {
    name: "Feijoada",
    cuisine: "brazilian",
    country: "Brazil",
    img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
    description: "Brazil's national dish — a hearty black bean stew with smoked pork and sausage.",
    ingredients: JSON.stringify(["500g black beans soaked overnight", "300g smoked pork ribs", "200g chorizo", "200g bacon", "1 onion", "6 cloves garlic", "2 bay leaves", "Salt and pepper", "Orange to serve", "Rice to serve"]),
    steps: JSON.stringify(["Brown bacon and chorizo in a large pot.", "Add onion and garlic, cook until soft.", "Add drained beans, pork ribs, bay leaves and enough water to cover.", "Bring to boil then simmer for 2-3 hours until beans are very soft.", "Remove some beans, mash and return to thicken the stew.", "Serve with rice, orange slices and farofa."]),
    diet: "nonveg"
  },
  {
    name: "Mansaf",
    cuisine: "jordanian",
    country: "Jordan",
    img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
    description: "Jordan's national dish — lamb cooked in fermented dried yogurt sauce served over rice.",
    ingredients: JSON.stringify(["1kg lamb shoulder pieces", "500g jameed (dried yogurt) or plain yogurt", "2 cups rice", "1 onion", "1 tsp turmeric", "1 tsp allspice", "Pine nuts toasted", "Fresh parsley", "Flatbread to serve"]),
    steps: JSON.stringify(["Dissolve jameed in warm water to make sauce.", "Brown lamb pieces in oil with onion.", "Add spices and enough water to cover. Simmer 1.5 hours.", "Add yogurt sauce to lamb, simmer 30 minutes — do not boil.", "Cook rice in lamb broth with turmeric.", "Layer flatbread, then rice, then lamb. Pour sauce over everything. Top with pine nuts."]),
    diet: "nonveg"
  },
  {
    name: "Injera with Doro Wat",
    cuisine: "ethiopian",
    country: "Ethiopia",
    img: "https://images.unsplash.com/photo-1567982047351-76b6f93e38ee?w=400",
    description: "Ethiopia's staple — spongy sourdough flatbread served with spiced chicken stew.",
    ingredients: JSON.stringify(["2 cups teff flour", "1 whole chicken cut into pieces", "4 onions finely chopped", "4 tbsp berbere spice", "4 tbsp niter kibbeh (spiced butter)", "4 hard boiled eggs", "4 cloves garlic", "1 tsp ginger"]),
    steps: JSON.stringify(["Mix teff flour with water, ferment for 2-3 days until sour.", "Cook batter on hot griddle — one side only until bubbles form. This is injera.", "Caramelise onions dry in pot for 45 minutes until dark.", "Add niter kibbeh, berbere, garlic and ginger. Cook 10 minutes.", "Add chicken pieces and enough water to cover. Simmer 45 minutes.", "Add whole boiled eggs, simmer 10 more minutes. Serve on injera."]),
    diet: "nonveg"
  },
  {
    name: "Khinkali",
    cuisine: "georgian",
    country: "Georgia",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400",
    description: "Georgian soup dumplings — thick dough filled with spiced meat and broth.",
    ingredients: JSON.stringify(["3 cups flour", "1 cup warm water", "500g minced beef and pork mix", "1 onion finely chopped", "1 tsp cumin", "1 tsp coriander", "Fresh coriander leaves", "Salt and black pepper", "1/2 cup water for filling"]),
    steps: JSON.stringify(["Make stiff dough from flour, water and salt. Rest 30 minutes.", "Mix minced meat with onion, spices, herbs and 1/2 cup water — filling should be wet.", "Roll dough thin, cut large circles 12cm diameter.", "Place filling in centre, pleat edges together into a topknot — at least 18 pleats.", "Boil in salted water for 12-15 minutes until they float then 3 more minutes.", "Eat by holding the topknot, biting a small hole and drinking the broth first."]),
    diet: "nonveg"
  },
  {
    name: "Banh Mi",
    cuisine: "vietnamese",
    country: "Vietnam",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    description: "Vietnam's iconic baguette sandwich — a perfect fusion of French and Vietnamese flavours.",
    ingredients: JSON.stringify(["2 French baguettes", "200g pork belly or chicken", "2 tbsp soy sauce", "1 tbsp fish sauce", "Pickled daikon and carrots", "Fresh cucumber slices", "Fresh coriander", "Jalapeño slices", "Mayonnaise", "Pâté"]),
    steps: JSON.stringify(["Marinate pork in soy sauce, fish sauce and sugar for 30 minutes.", "Grill or pan-fry pork until caramelised and cooked through.", "Pickle daikon and carrots in vinegar, sugar and salt for 20 minutes.", "Slice baguette lengthwise, spread pâté on one side, mayo on other.", "Layer pork, pickled vegetables, cucumber, coriander and jalapeño.", "Press together and serve immediately."]),
    diet: "nonveg"
  }
];

// Only insert if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM user_recipes').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO user_recipes (name, cuisine, country, img, description, ingredients, steps, diet)
    VALUES (@name, @cuisine, @country, @img, @description, @ingredients, @steps, @diet)
  `);

  const insertMany = db.transaction((recipes) => {
    for (const r of recipes) insert.run(r);
  });

  insertMany(recipes);
  console.log(`Seeded ${recipes.length} recipes into user_recipes.`);
} else {
  console.log(`user_recipes already has ${count.c} entries — skipping seed.`);
}