const fs = require('fs');

const mappings = {
  "Sütlü Çikolata": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",
  "Fındıklı Çikolata": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",
  "Çikolatalı Gofret": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Akbar_Mashti.JPG/330px-Akbar_Mashti.JPG",
  "Kakaolu Bar": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/330px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg",
  "Beyaz Çikolata": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chopped_white_chocolate_chunks.jpg/330px-Chopped_white_chocolate_chunks.jpg",
  "Fındık Kreması": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Nutella_for_breakfast_-_Flickr_-_love.jsc.jpg/330px-Nutella_for_breakfast_-_Flickr_-_love.jsc.jpg",
  "Klasik Patates Cipsi": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/330px-Potato-Chips.jpg",
  "Baharatlı Cips": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/330px-Potato-Chips.jpg",
  "Mısır Cipsi (Nacho)": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/4003_-_Zermatt_-_Restaurant_Weisshorn.JPG/330px-4003_-_Zermatt_-_Restaurant_Weisshorn.JPG",
  "Çubuk Kraker": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BrezelnSalz02_%28cropped%29.JPG/330px-BrezelnSalz02_%28cropped%29.JPG",
  "Çıtır Mısır": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Popcorn_-_Studio_-_2011.jpg/330px-Popcorn_-_Studio_-_2011.jpg",
  "Soslu Cips + Dip": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/4003_-_Zermatt_-_Restaurant_Weisshorn.JPG/330px-4003_-_Zermatt_-_Restaurant_Weisshorn.JPG",
  "Kakaolu Bisküvi": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Oreo-Two-Cookies.png/330px-Oreo-Two-Cookies.png",
  "Sandviç Bisküvi": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bourbon_and_Custard_Cream.jpeg/330px-Bourbon_and_Custard_Cream.jpeg",
  "Kremalı Bisküvi": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Oreo-Two-Cookies.png/330px-Oreo-Two-Cookies.png",
  "Tuzlu Kraker": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Crackers_with_herring_and_garlic_sauce.jpg/330px-Crackers_with_herring_and_garlic_sauce.jpg",
  "Yulaf Bar": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/330px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg",
  "Kola (Kutu)": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Coca_Cola_Flasche_-_Original_Taste.jpg/330px-Coca_Cola_Flasche_-_Original_Taste.jpg",
  "Kola Zero (Kutu)": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Coca_Cola_Flasche_-_Original_Taste.jpg/330px-Coca_Cola_Flasche_-_Original_Taste.jpg",
  "Limonlu Gazoz": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sprite_lemon_lime_1.jpg/330px-Sprite_lemon_lime_1.jpg",
  "Su": "https://upload.wikimedia.org/wikipedia/commons/0/02/Stilles_Mineralwasser.jpg",
  "Maden Suyu": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Vata-Gurgur.jpg/330px-Vata-Gurgur.jpg",
  "Meyve Suyu (Şeftali)": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Orange_juice_1.jpg/330px-Orange_juice_1.jpg",
  "Enerji İçeceği": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Energydrinks.jpg/330px-Energydrinks.jpg",
  "Soğuk Kahve": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Affogato_al_Caffe.jpg/330px-Affogato_al_Caffe.jpg",
  "Ayran": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Fresh_ayran.jpg/330px-Fresh_ayran.jpg",
  "Külah Dondurma": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Strawberry_ice_cream_cone_%285076899310%29.jpg/330px-Strawberry_ice_cream_cone_%285076899310%29.jpg",
  "Çubuk Dondurma": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cucumber%2C_elderflower_and_mint_ice_pop_from_Nicepops_%2818159920902%29.jpg/330px-Cucumber%2C_elderflower_and_mint_ice_pop_from_Nicepops_%2818159920902%29.jpg",
  "Sandviç Dondurma": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IceCreamSandwich.jpg/330px-IceCreamSandwich.jpg",
  "Kutu Dondurma": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/330px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg",
  "Naneli Sakız": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Chewing_gum_stick.jpg/330px-Chewing_gum_stick.jpg",
  "Jelibon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Oursons_g%C3%A9latine_march%C3%A9_Rouffignac.jpg/330px-Oursons_g%C3%A9latine_march%C3%A9_Rouffignac.jpg",
  "Lolipop": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Farbenfrohe_Lollipops%2C_Austria.jpg/330px-Farbenfrohe_Lollipops%2C_Austria.jpg",
  "Çikolatalı Toplar": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",
  "Nane Şekeri": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Scotch_mints.JPG/330px-Scotch_mints.JPG",
  "Kavrulmuş Fındık": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hazelnuts_%28Corylus_avellana%29_-_whole_with_kernels.jpg/330px-Hazelnuts_%28Corylus_avellana%29_-_whole_with_kernels.jpg",
  "Leblebi": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Chickpea_BNC.jpg/330px-Chickpea_BNC.jpg",
  "Çekirdek": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sunflower_Seeds_Kaldari.jpg/330px-Sunflower_Seeds_Kaldari.jpg",
  "Karışık Kuruyemiş": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg/330px-Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg",
  "Antep Fıstığı": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pistachio_vera.jpg/330px-Pistachio_vera.jpg",
  "Çiğ Badem": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg/330px-Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg",
  "Hazır Tost": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg/330px-An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg",
  "Peynirli Poğaça": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg/330px-Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg",
  "Susamlı Simit": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Simit-2x.JPG/330px-Simit-2x.JPG",
  "Su Böreği (Dilim)": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg/330px-Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg",
  "Hazır Sandviç": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg/330px-An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg",
  "Çakmak": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/White_lighter_with_flame.JPG/330px-White_lighter_with_flame.JPG",
  "Kalem Pil (4'lü)": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/AA_matchstick-1.jpg/330px-AA_matchstick-1.jpg",
  "Mum (Paket)": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/LA2_Skultuna_kontorsljusstake.jpg/330px-LA2_Skultuna_kontorsljusstake.jpg",
  "Islak Mendil": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Erfrischungstuch.jpg/330px-Erfrischungstuch.jpg",
  "Kağıt Peçete": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Erfrischungstuch.jpg/330px-Erfrischungstuch.jpg"
};

let content = fs.readFileSync('vizz-data.js', 'utf8');

for (const [name, img] of Object.entries(mappings)) {
  if (img) {
    // Escape special characters in name for regex
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace the img attribute
    const regex = new RegExp(`(n:"${safeName}".*?img:)"https://images\\.unsplash\\.com/photo-[^"]+"`, 'g');
    content = content.replace(regex, `$1"${img}"`);
  }
}

fs.writeFileSync('vizz-data.js', content);
console.log("Patched vizz-data.js successfully.");
