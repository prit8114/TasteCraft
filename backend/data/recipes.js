const recipes = [
  {
    id: 1,
    name: "Butter Chicken",
    cuisine: "indian",
    country: "India",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    description: "Creamy tomato-based curry with tender chicken.",
    ingredients: [
      "500g chicken", "1 cup tomato puree", "1 cup heavy cream",
      "2 tbsp butter", "1 tsp garam masala", "1 tsp cumin",
      "1 tsp turmeric", "Salt to taste", "Fresh coriander"
    ],
    steps: [
      "Marinate chicken in yogurt and spices for 30 minutes.",
      "Cook chicken in butter until golden brown on all sides.",
      "Add tomato puree and cook for 10 minutes on medium heat.",
      "Pour in heavy cream and stir gently.",
      "Simmer for 15 minutes until sauce thickens.",
      "Garnish with fresh coriander and serve with naan."
    ]
  },
  {
    id: 2,
    name: "Pasta Carbonara",
    cuisine: "italian",
    country: "Italy",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    description: "Silky egg and cheese sauce with crispy pancetta.",
    ingredients: [
      "400g spaghetti", "200g pancetta", "4 egg yolks",
      "100g Pecorino Romano", "100g Parmesan", "Black pepper",
      "Salt", "2 cloves garlic"
    ],
    steps: [
      "Cook spaghetti in salted boiling water until al dente.",
      "Fry pancetta and garlic until crispy, then remove garlic.",
      "Mix egg yolks with grated cheese and black pepper.",
      "Remove pan from heat and add drained pasta.",
      "Add egg mixture and toss quickly — heat of pasta cooks the eggs.",
      "Add pasta water gradually to make it silky. Serve immediately."
    ]
  },
  {
    id: 3,
    name: "Kung Pao Chicken",
    cuisine: "chinese",
    country: "China",
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    description: "Spicy stir-fried chicken with peanuts and chili.",
    ingredients: [
      "500g chicken breast", "1 cup peanuts", "8 dried chillies",
      "3 tbsp soy sauce", "2 tbsp rice vinegar", "1 tbsp sugar",
      "2 tsp cornstarch", "Sesame oil", "Spring onions"
    ],
    steps: [
      "Cut chicken into cubes and marinate with soy sauce and cornstarch.",
      "Mix sauce: soy sauce, vinegar, sugar and sesame oil.",
      "Stir-fry dried chillies in hot oil until fragrant.",
      "Add chicken and cook until golden.",
      "Pour in sauce and toss everything together.",
      "Add peanuts and spring onions. Serve with steamed rice."
    ]
  },
  {
    id: 4,
    name: "Street Tacos",
    cuisine: "mexican",
    country: "Mexico",
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    description: "Soft corn tortillas loaded with seasoned meat and salsa.",
    ingredients: [
      "8 corn tortillas", "400g beef or chicken", "1 white onion",
      "Fresh cilantro", "2 limes", "Salsa verde",
      "1 tsp cumin", "1 tsp chili powder", "Salt"
    ],
    steps: [
      "Season meat with cumin, chili powder and salt.",
      "Cook meat on high heat until charred at edges.",
      "Warm corn tortillas on a dry pan for 30 seconds each side.",
      "Chop onion and cilantro finely.",
      "Fill each tortilla with meat, onion and cilantro.",
      "Squeeze lime juice on top and add salsa verde."
    ]
  },
  {
    id: 5,
    name: "Chicken Biryani",
    cuisine: "indian",
    country: "India",
    img: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800",
    description: "Fragrant basmati rice layered with spiced chicken.",
    ingredients: [
      "2 cups basmati rice", "600g chicken", "2 onions",
      "1 cup yogurt", "Saffron in warm milk", "Biryani masala",
      "Fresh mint", "Ghee", "Fried onions"
    ],
    steps: [
      "Marinate chicken in yogurt and biryani masala for 1 hour.",
      "Cook rice until 70% done, drain and set aside.",
      "Cook marinated chicken in ghee until tender.",
      "Layer half rice over chicken in a heavy pot.",
      "Add saffron milk, mint and fried onions, then remaining rice.",
      "Seal pot with foil and cook on low heat for 25 minutes (dum)."
    ]
  },
  {
    id: 6,
    name: "Margherita Pizza",
    cuisine: "italian",
    country: "Italy",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    description: "Classic Neapolitan pizza with tomato and mozzarella.",
    ingredients: [
      "Pizza dough", "1 cup tomato sauce", "200g fresh mozzarella",
      "Fresh basil leaves", "Olive oil", "Salt", "Pinch of sugar"
    ],
    steps: [
      "Preheat oven to 250°C (max temperature) for 30 minutes.",
      "Stretch dough into a thin round base.",
      "Spread tomato sauce leaving 2cm border.",
      "Tear mozzarella and place evenly on top.",
      "Bake for 8-10 minutes until crust is charred at edges.",
      "Add fresh basil and drizzle olive oil before serving."
    ]
  }
];

module.exports = recipes;