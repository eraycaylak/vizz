/* VIZZ — shared mock data, brand assets, helpers (presentation mockup) */
const VIZZ_LOGO = "img/bee.png";

/* Yozgat merkez — mahalleler şehrin gerçek street-grid'i boyunca yayıldı (kapsama haritası).
   Harita bunlara fitBounds yapar → bölge çerçevelenir, kümelenme/çakışma olmaz. */
const YOZGAT = { center:[39.8225,34.8065], zoom:14,
  zones:[
    {n:"Karatepe",     c:[39.8345,34.7930]},
    {n:"Şehitler",     c:[39.8350,34.8125]},
    {n:"Köseoğlu",     c:[39.8295,34.8045]},
    {n:"Yukarınohutlu",c:[39.8290,34.8270]},
    {n:"Eskipazar",    c:[39.8258,34.7820]},
    {n:"Çapanoğlu",    c:[39.8235,34.7990]},
    {n:"Cumhuriyet",   c:[39.8222,34.8095]},
    {n:"Aşağınohutlu", c:[39.8195,34.8290]},
    {n:"Medrese",      c:[39.8180,34.8050]},
    {n:"Karşıyaka",    c:[39.8120,34.7910]},
    {n:"Fatih",        c:[39.8110,34.8205]},
    {n:"Bahçelievler", c:[39.8090,34.8070]},
  ],
  // teslimat kapsama sınırı — gerçek Yozgat şehir extent'i (~4 km, vadi boyunca D-B uzun)
  coverage:[
    [39.8372,34.7905],[39.8378,34.8145],[39.8302,34.8305],[39.8185,34.8325],
    [39.8090,34.8245],[39.8066,34.8060],[39.8098,34.7885],[39.8275,34.7790]
  ]};

/* dish photo: Gemini ile üretildi → başlıkla birebir uyumlu */
const IMG = s => `img/${s}.jpg`;
const EMOJI = {izgaraKofte:"🍢","izgara-kofte":"🍢","kofte-tabagi":"🍢",kunefe:"🧀",ayran:"🥛","kiymali-pide":"🫓","kasarli-pide":"🫓","kusbasili-pide":"🫓","su-boregi":"🥐",lahmacun:"🌮",sogus:"🥗",salgam:"🥤","adana-kebap":"🍖","urfa-kebap":"🍖","karisik-izgara":"🍖",baklava:"🍮",manti:"🥟","firin-manti":"🥟",gozleme:"🫓",limonata:"🍋","double-burger":"🍔","burger-cover":"🍔","tavuk-burger":"🍔",patates:"🍟",milkshake:"🥤","serpme-kahvalti":"🍳",menemen:"🍳","bal-kaymak":"🍯",cay:"🍵",sutlac:"🍮",kazandibi:"🍮"};

const RESTAURANTS = [
 {id:1,name:"Çapanoğlu Köftecisi",cat:"Kebap",cover:"izgara-kofte",rate:4.9,time:"25-35",fee:"Ücretsiz",min:120,badge:"Şehrin En İyisi",zone:"Çapanoğlu",
  menu:[["Izgara Köfte (8'li)","Közde, özel baharatlı","izgara-kofte",165],["Çapanoğlu Special","Köfte + pide + ayran","kofte-tabagi",210],["Künefe","Antep fıstıklı","kunefe",95],["Ayran","Yayık ayranı","ayran",30]]},
 {id:2,name:"Eski Fırın Pidecisi",cat:"Pide",cover:"kiymali-pide",rate:4.7,time:"20-30",fee:"19,90",min:90,badge:"Popüler",zone:"Eskipazar",
  menu:[["Kıymalı Pide","Taş fırın, tereyağlı","kiymali-pide",110],["Kaşarlı Pide","Bol erimiş kaşar","kasarli-pide",120],["Kuşbaşılı Pide","Dana kuşbaşı","kusbasili-pide",150],["Su Böreği","Ev yapımı","su-boregi",70]]},
 {id:3,name:"Bozok Lahmacun",cat:"Lahmacun",cover:"lahmacun",rate:4.6,time:"15-25",fee:"Ücretsiz",min:80,badge:"Yeni",zone:"Medrese",
  menu:[["Lahmacun (2'li)","İnce hamur, bol kıyma","lahmacun",90],["Acılı Lahmacun","Ekstra acı","lahmacun",55],["Söğüş Tabağı","Yanına","sogus",40],["Şalgam","Acılı","salgam",25]]},
 {id:4,name:"Anadolu Lezzetleri",cat:"Kebap",cover:"adana-kebap",rate:4.8,time:"30-45",fee:"24,90",min:150,badge:"Premium",zone:"Köseoğlu",
  menu:[["Adana Kebap","Zırh kıyma, acılı","adana-kebap",195],["Urfa Kebap","Acısız","urfa-kebap",195],["Karışık Izgara","2 kişilik tabak","karisik-izgara",420],["Baklava","Fıstıklı 4 dilim","baklava",130]]},
 {id:5,name:"Kardelen Mantı Evi",cat:"Mantı",cover:"manti",rate:4.7,time:"25-35",fee:"Ücretsiz",min:100,badge:"Ev Yapımı",zone:"Fatih",
  menu:[["Kayseri Mantısı","Yoğurtlu, naneli tereyağı","manti",140],["Fırın Mantı","Çıtır","firin-manti",150],["Gözleme","Ispanaklı/peynirli","gozleme",65],["Limonata","Ev yapımı","limonata",35]]},
 {id:6,name:"Honey Burger House",cat:"Burger",cover:"burger-cover",rate:4.5,time:"20-30",fee:"19,90",min:110,badge:"Hızlı",zone:"Bahçelievler",
  menu:[["VIZZ Double","2x köfte, cheddar, bal-bbq","double-burger",175],["Tavuk Burger","Çıtır tavuk","tavuk-burger",145],["Patates (L)","Baharatlı","patates",55],["Milkshake","Muzlu","milkshake",60]]},
 {id:7,name:"Sarı Kovan Kahvaltı",cat:"Kahvaltı",cover:"serpme-kahvalti",rate:4.9,time:"25-40",fee:"19,90",min:120,badge:"Serpme",zone:"Şehitler",
  menu:[["Serpme Kahvaltı (2 kişi)","20+ çeşit","serpme-kahvalti",340],["Menemen","Bol domates","menemen",90],["Bal-Kaymak","Yöresel","bal-kaymak",110],["Demli Çay","Semaver","cay",20]]},
 {id:8,name:"Tatlıcı Bal Köşkü",cat:"Tatlı",cover:"baklava",rate:4.8,time:"20-30",fee:"Ücretsiz",min:90,badge:"Tatlı Kaçamağı",zone:"Cumhuriyet",
  menu:[["Fıstıklı Baklava (1 kg)","Antep fıstığı","baklava",420],["Künefe","Antep fıstıklı","kunefe",95],["Sütlaç","Fırın","sutlac",55],["Kazandibi","Klasik","kazandibi",60]]},
];

/* ===================================================================
   TEK EKONOMİ MOTORU — single source of truth (arı peteği çekirdeği)
   Her dükkanın kendi teslimat tarifesi var. HER rapor/sipariş bu
   fonksiyonları çağırır → sayılar her yerde birbirini tutar.
   =================================================================== */
const ECON = { KDV:0.20, STOPAJ:0.01, KV:0.25, SABIT:6, KOMISYON:0.08 };
//                  [dükkanın VIZZ'e ödediği teslimat ₺, kuryeye giden ₺]
const TARIFE = {1:[100,62],2:[130,82],3:[90,56],4:[110,70],5:[95,60],6:[105,66],7:[140,88],8:[85,54]};
const MARKET_TARIFE=[70,44];
RESTAURANTS.forEach(r=>{ const t=TARIFE[r.id]||[100,62]; r.tarife=t[0]; r.kuryePay=t[1]; r.gunluk=22+(r.id*17)%58; });

function feeOf(restName){ const r=RESTAURANTS.find(x=>x.name===restName); return r?{tarife:r.tarife,kurye:r.kuryePay}:{tarife:MARKET_TARIFE[0],kurye:MARKET_TARIFE[1]}; }
/* bir siparişin TAM ekonomi kırılımı — petekteki tek hücre */
function econOrder(restName, foodTotal){
  const {tarife,kurye}=feeOf(restName);
  const komisyon=Math.round((foodTotal||0)*ECON.KOMISYON);   // yemek tutarından VIZZ komisyonu
  const gelir=tarife+komisyon;                                // VIZZ brüt gelir (teslimat + komisyon)
  const gelirNet=gelir/(1+ECON.KDV), kdv=gelir-gelirNet;      // KDV ayrıştır
  const brutKar=gelirNet-kurye-ECON.SABIT;                    // − kurye − sabit gider
  const kv=Math.max(0,brutKar)*ECON.KV;                       // kurumlar vergisi
  const net=Math.round(brutKar-kv);                           // vergi sonrası net kâr
  return {tarife,kurye,komisyon,gelir,kdv:Math.round(kdv),sabit:ECON.SABIT,brutKar:Math.round(brutKar),kv:Math.round(kv),net,brutMarj:gelir-kurye};
}
/* dükkan bazlı günlük toplam — Dükkan Ekonomisi raporu bundan beslenir */
function econDukkan(){ return RESTAURANTS.map(r=>{ const e=econOrder(r.name,260); return {id:r.id,name:r.name,zone:r.zone,tarife:r.tarife,kurye:r.kuryePay,adet:r.gunluk,
  gelir:e.gelir*r.gunluk, komisyon:e.komisyon*r.gunluk, kuryeGider:r.kuryePay*r.gunluk, net:e.net*r.gunluk}; }); }

/* ===================================================================
   BÜYÜME & ÖDÜL MOTORU — "Hızır'dan pay al" teşvik sistemi (tek kaynak)
   Kurye ödülleri + işletme teşvikleri. operasyon yönetir, kurye+restoran
   ekranı gösterir. Teşvik = maliyet → econ peteğine bağlanır.
   =================================================================== */
const GROWTH = {
  rakip:'Hızır', rakipPay:95, vizzPay:5,
  gecenDukkanAy:14, gecenKuryeAy:23, hedefDukkanAy:40, hedefKuryeAy:50,
  kampanyalar:[
    {id:'k1',tip:'kurye',ad:'Geçiş Bonusu',ikon:'🎁',desc:"Hızır'dan gelen kuryeye ilk 100 teslimatta teslimat başı +30₺",bonus:30,butce:30000,harcanan:18600,aktif:true},
    {id:'k2',tip:'kurye',ad:'Günün Primi',ikon:'⚡',desc:'Bugün her teslimat +5₺ ekstra · yoğun saatte ×2',bonus:5,butce:8000,harcanan:5400,aktif:true},
    {id:'k3',tip:'kurye',ad:'Şanslı Teslimat',ikon:'🍀',desc:"Her ~20 teslimattan 1'i sürpriz +50₺ (ekranda kutlama)",bonus:50,butce:6000,harcanan:3100,aktif:true},
    {id:'k4',tip:'kurye',ad:'Haftalık Seri',ikon:'🔥',desc:'7 gün üst üste 10+ teslimat → +500₺',bonus:500,butce:7500,harcanan:4000,aktif:true},
    {id:'k5',tip:'dukkan',ad:'Şanslı Gün',ikon:'🎰',desc:"Her gün rastgele 1 siparişin teslimatı VIZZ'ten — dükkana 0₺ (panelde kutlama)",bonus:0,butce:9000,harcanan:5200,aktif:true},
    {id:'k6',tip:'dukkan',ad:'Geçiş Paketi',ikon:'🤝',desc:"Hızır'dan gelen dükkana ilk 30 gün komisyon %0",bonus:0,butce:15000,harcanan:9800,aktif:true},
    {id:'k7',tip:'dukkan',ad:'Hacim Primi',ikon:'📈',desc:'Günde 30+ sipariş → ertesi gün tarifede %15 indirim',bonus:0,butce:6000,harcanan:2600,aktif:false},
  ],
};
GROWTH.toplamButce = GROWTH.kampanyalar.reduce((a,k)=>a+k.butce,0);
GROWTH.toplamHarcanan = GROWTH.kampanyalar.filter(k=>k.aktif).reduce((a,k)=>a+k.harcanan,0);

/* ===== ÖDÜL MOTORU — basit & sürdürülebilir =====
   1) Her teslimata küçük anında bonus (2-4₺)
   2) %0.1 ihtimalle 30₺ jackpot (sürpriz)
   3) Hedefler: teslimat sayısı → tek seferlik bonus (100 paket → +50₺ gibi) */
GROWTH.reward = {
  miniBonus:[2,3,4], jackpotSans:0.001, jackpot:30,
  hedefler:[{n:50,b:25},{n:100,b:50},{n:250,b:150},{n:500,b:350}],
};
/* bir teslimat için çekiliş — neredeyse her zaman 2-4₺, çok nadir 30₺ jackpot */
GROWTH.luckyDraw = function(){
  const R=GROWTH.reward;
  if(Math.random()<R.jackpotSans) return {amount:R.jackpot, jackpot:true};
  return {amount:R.miniBonus[Math.floor(Math.random()*R.miniBonus.length)], jackpot:false};
};
/* sahip görünümü: ödül gideri ekonomisi (kurye'ye gösterilmez) */
GROWTH.rewardEcon = function(){
  const de=econDukkan(), totNet=de.reduce((a,r)=>a+r.net,0), totAdet=de.reduce((a,r)=>a+r.adet,0), avgNet=totNet/totAdet, R=GROWTH.reward;
  const miniAvg=R.miniBonus.reduce((a,b)=>a+b,0)/R.miniBonus.length;       // ~3₺
  const jackpotEV=R.jackpotSans*R.jackpot;                                  // 0.03₺
  const hedefEV=R.hedefler.filter(h=>h.n<=100).reduce((a,h)=>a+h.b,0)/100;  // 100 teslimat ufku ~0.75₺
  const evTeslimat=miniAvg+jackpotEV+hedefEV, netSonra=avgNet-evTeslimat;
  return { avgNet, miniAvg, jackpotEV, hedefEV, evTeslimat, netPct:netSonra/avgNet, netSonra,
    gunlukGider:evTeslimat*totAdet, totAdet };
};

const CAT_EMOJI = {"Tümü":"🔥",Kebap:"🥙",Pide:"🫓",Lahmacun:"🌮",Mantı:"🥟",Burger:"🍔",Kahvaltı:"🍳",Tatlı:"🍰"};
const CATS = ["Tümü","Kebap","Pide","Lahmacun","Mantı","Burger","Kahvaltı","Tatlı"];

const NAMES = ["Mehmet K.","Ahmet Y.","Mustafa D.","Hüseyin A.","Emre B.","Burak Ş.","Caner T.","Serkan O.","Okan V.","Volkan E.","Tolga K.","Kaan Y.","Yusuf M.","Murat S.","Selim G."];
const STATUS = [["delivering","Teslimatta","#FFC400"],["online","Müsait","#1FAE5A"],["break","Molada","#9AA0A6"]];

/* 15 esnaf kurye */
const COURIERS = NAMES.map((n,i)=>{
  const z=YOZGAT.zones[i%YOZGAT.zones.length];
  const st=STATUS[i%3];
  return {id:i+1,name:n,phone:"+90 5"+(30+i)+" *** ** "+(10+i),
    status:st[0],statusTr:st[1],color:st[2],
    today:6+(i*3)%14, earn:380+(i*47)%620, rate:(4.4+((i*7)%6)/10).toFixed(1),
    accept:80+(i*5)%19, zone:z.n, pos:z.c.slice()};
});

const ORDERS = [
 {id:"VZ-7741",rest:"Çapanoğlu Köftecisi",cust:"A. Demir",zone:"Fatih",items:3,total:255,pay:"Online",status:"Hazırlanıyor",min:6,courier:null},
 {id:"VZ-7742",rest:"Bozok Lahmacun",cust:"M. Yıldız",zone:"Bahçelievler",items:5,total:180,pay:"Kapıda Nakit",status:"Kurye yolda",min:12,courier:"Mehmet K."},
 {id:"VZ-7743",rest:"Anadolu Lezzetleri",cust:"S. Kaya",zone:"Köseoğlu",items:2,total:420,pay:"Online",status:"Atanıyor",min:1,courier:null},
 {id:"VZ-7744",rest:"Honey Burger House",cust:"E. Şahin",zone:"Karşıyaka",items:4,total:295,pay:"Kapıda Kart",status:"Teslim edildi",min:0,courier:"Caner T."},
 {id:"VZ-7745",rest:"Kardelen Mantı Evi",cust:"Z. Aydın",zone:"Medrese",items:2,total:205,pay:"Online",status:"Kurye yolda",min:9,courier:"Emre B."},
 {id:"VZ-7746",rest:"Eski Fırın Pidecisi",cust:"H. Çelik",zone:"Çapanoğlu",items:3,total:340,pay:"Kapıda Nakit",status:"Hazırlanıyor",min:8,courier:null},
];

/* görsel onerror fallback (üretilmemiş görsel için markalı tile) */
function imgFallback(el,slug){
  el.style.background="linear-gradient(135deg,#FFC400,#F2A900)";
  el.style.display="grid";el.style.placeItems="center";el.style.fontSize="34px";
  el.textContent=(EMOJI[slug]||"🍽️");el.onerror=null;
}

/* =================================================================
   VIZZ MARKET — q-commerce atıştırmalık dikeyi (mock veri)
   Aynı kurye filosu + dispatcher + tasarım sistemi üzerine kurulur.
   ================================================================= */
const MARKET_DEPO = { name:"VIZZ Market Deposu", zone:"Cumhuriyet", sla:"15-25" };
const MARKET_CATS = [
  {id:"tum", n:"Tümü", emo:"🛒"},{id:"cikolata", n:"Çikolata & Gofret", emo:"🍫"},
  {id:"cips", n:"Cips & Çerez", emo:"🥔"},{id:"biskuvi", n:"Bisküvi & Kraker", emo:"🍪"},
  {id:"icecek", n:"İçecek", emo:"🥤"},{id:"dondurma", n:"Dondurma", emo:"🍦"},
  {id:"seker", n:"Şeker & Sakız", emo:"🍬"},{id:"kuruyemis", n:"Kuruyemiş", emo:"🥜"},
  {id:"atistir", n:"Atıştırmalık", emo:"🌭"},{id:"acil", n:"Acil İhtiyaç", emo:"🔋"},
];

const MARKET_PRODUCTS = [
  {id:"m-sutlu-cik",n:"Sütlü Çikolata",cat:"cikolata",price:34,old:40,unit:"80 g",emo:"🍫",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",stock:42,tag:"Çok Satan"},
  {id:"m-findikli",n:"Fındıklı Çikolata",cat:"cikolata",price:38,unit:"80 g",emo:"🍫",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",stock:30},
  {id:"m-gofret",n:"Çikolatalı Gofret",cat:"cikolata",price:18,unit:"36 g",emo:"🍫",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Akbar_Mashti.JPG/330px-Akbar_Mashti.JPG",stock:120},
  {id:"m-kakaolu-bar",n:"Kakaolu Bar",cat:"cikolata",price:22,unit:"50 g",emo:"🍫",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/330px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg",stock:64},
  {id:"m-beyaz-cik",n:"Beyaz Çikolata",cat:"cikolata",price:36,unit:"80 g",emo:"🍫",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chopped_white_chocolate_chunks.jpg/330px-Chopped_white_chocolate_chunks.jpg",stock:0,tag:"Tükendi"},
  {id:"m-findik-krem",n:"Fındık Kreması",cat:"cikolata",price:96,old:115,unit:"350 g",emo:"🍯",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Nutella_for_breakfast_-_Flickr_-_love.jsc.jpg/330px-Nutella_for_breakfast_-_Flickr_-_love.jsc.jpg",stock:18,tag:"Fırsat"},
  {id:"m-klasik-cips",n:"Klasik Patates Cipsi",cat:"cips",price:42,unit:"107 g",emo:"🥔",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/330px-Potato-Chips.jpg",stock:58,tag:"Çok Satan"},
  {id:"m-baharatli",n:"Baharatlı Cips",cat:"cips",price:42,unit:"107 g",emo:"🌶️",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/330px-Potato-Chips.jpg",stock:47},
  {id:"m-misir-cips",n:"Mısır Cipsi (Nacho)",cat:"cips",price:38,unit:"140 g",emo:"🌽",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/4003_-_Zermatt_-_Restaurant_Weisshorn.JPG/330px-4003_-_Zermatt_-_Restaurant_Weisshorn.JPG",stock:33},
  {id:"m-cubuk-kraker",n:"Çubuk Kraker",cat:"cips",price:16,unit:"45 g",emo:"🥨",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BrezelnSalz02_%28cropped%29.JPG/330px-BrezelnSalz02_%28cropped%29.JPG",stock:90},
  {id:"m-citir-misir",n:"Çıtır Mısır",cat:"cips",price:28,unit:"100 g",emo:"🍿",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Popcorn_-_Studio_-_2011.jpg/330px-Popcorn_-_Studio_-_2011.jpg",stock:25},
  {id:"m-soslu-cips",n:"Soslu Cips + Dip",cat:"cips",price:54,old:64,unit:"160 g",emo:"🥔",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/4003_-_Zermatt_-_Restaurant_Weisshorn.JPG/330px-4003_-_Zermatt_-_Restaurant_Weisshorn.JPG",stock:12,tag:"Fırsat"},
  {id:"m-kakaolu-bisk",n:"Kakaolu Bisküvi",cat:"biskuvi",price:24,unit:"100 g",emo:"🍪",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Oreo-Two-Cookies.png/330px-Oreo-Two-Cookies.png",stock:70},
  {id:"m-sandvic-bisk",n:"Sandviç Bisküvi",cat:"biskuvi",price:20,unit:"70 g",emo:"🍪",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bourbon_and_Custard_Cream.jpeg/330px-Bourbon_and_Custard_Cream.jpeg",stock:85,tag:"Çok Satan"},
  {id:"m-kremali-bisk",n:"Kremalı Bisküvi",cat:"biskuvi",price:22,unit:"90 g",emo:"🍪",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Oreo-Two-Cookies.png/330px-Oreo-Two-Cookies.png",stock:48},
  {id:"m-tuzlu-kraker",n:"Tuzlu Kraker",cat:"biskuvi",price:14,unit:"75 g",emo:"🧂",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Crackers_with_herring_and_garlic_sauce.jpg/330px-Crackers_with_herring_and_garlic_sauce.jpg",stock:110},
  {id:"m-yulaf-bar",n:"Yulaf Bar",cat:"biskuvi",price:26,unit:"40 g",emo:"🌾",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/330px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg",stock:36,tag:"Yeni"},
  {id:"m-kola",n:"Kola (Kutu)",cat:"icecek",price:28,unit:"330 ml",emo:"🥤",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Coca_Cola_Flasche_-_Original_Taste.jpg/330px-Coca_Cola_Flasche_-_Original_Taste.jpg",stock:140,tag:"Çok Satan"},
  {id:"m-kola-zero",n:"Kola Zero (Kutu)",cat:"icecek",price:28,unit:"330 ml",emo:"🥤",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Coca_Cola_Flasche_-_Original_Taste.jpg/330px-Coca_Cola_Flasche_-_Original_Taste.jpg",stock:96},
  {id:"m-gazoz",n:"Limonlu Gazoz",cat:"icecek",price:22,unit:"250 ml",emo:"🍋",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sprite_lemon_lime_1.jpg/330px-Sprite_lemon_lime_1.jpg",stock:60},
  {id:"m-su",n:"Su",cat:"icecek",price:8,unit:"500 ml",emo:"💧",img:"https://upload.wikimedia.org/wikipedia/commons/0/02/Stilles_Mineralwasser.jpg",stock:200},
  {id:"m-maden-suyu",n:"Maden Suyu",cat:"icecek",price:14,unit:"200 ml",emo:"🫧",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Vata-Gurgur.jpg/330px-Vata-Gurgur.jpg",stock:88},
  {id:"m-meyve-suyu",n:"Meyve Suyu (Şeftali)",cat:"icecek",price:24,unit:"200 ml",emo:"🧃",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Orange_juice_1.jpg/330px-Orange_juice_1.jpg",stock:54},
  {id:"m-enerji",n:"Enerji İçeceği",cat:"icecek",price:46,old:55,unit:"250 ml",emo:"⚡",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Energydrinks.jpg/330px-Energydrinks.jpg",stock:40,tag:"Fırsat"},
  {id:"m-soguk-kahve",n:"Soğuk Kahve",cat:"icecek",price:52,unit:"250 ml",emo:"☕",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Affogato_al_Caffe.jpg/330px-Affogato_al_Caffe.jpg",stock:28,tag:"Yeni"},
  {id:"m-ayran",n:"Ayran",cat:"icecek",price:18,unit:"300 ml",emo:"🥛",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Fresh_ayran.jpg/330px-Fresh_ayran.jpg",stock:64},
  {id:"m-kulah",n:"Külah Dondurma",cat:"dondurma",price:38,unit:"110 ml",emo:"🍦",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Strawberry_ice_cream_cone_%285076899310%29.jpg/330px-Strawberry_ice_cream_cone_%285076899310%29.jpg",stock:35,tag:"Çok Satan"},
  {id:"m-cubuk-dond",n:"Çubuk Dondurma",cat:"dondurma",price:30,unit:"70 ml",emo:"🍡",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cucumber%2C_elderflower_and_mint_ice_pop_from_Nicepops_%2818159920902%29.jpg/330px-Cucumber%2C_elderflower_and_mint_ice_pop_from_Nicepops_%2818159920902%29.jpg",stock:44},
  {id:"m-sandvic-dond",n:"Sandviç Dondurma",cat:"dondurma",price:34,unit:"90 ml",emo:"🍨",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IceCreamSandwich.jpg/330px-IceCreamSandwich.jpg",stock:22},
  {id:"m-kutu-dond",n:"Kutu Dondurma",cat:"dondurma",price:120,old:140,unit:"900 ml",emo:"🍨",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/330px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg",stock:10,tag:"Fırsat"},
  {id:"m-sakiz",n:"Naneli Sakız",cat:"seker",price:12,unit:"14'lü",emo:"🍬",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Chewing_gum_stick.jpg/330px-Chewing_gum_stick.jpg",stock:150},
  {id:"m-jelibon",n:"Jelibon",cat:"seker",price:26,unit:"80 g",emo:"🐻",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Oursons_g%C3%A9latine_march%C3%A9_Rouffignac.jpg/330px-Oursons_g%C3%A9latine_march%C3%A9_Rouffignac.jpg",stock:58,tag:"Çok Satan"},
  {id:"m-lolipop",n:"Lolipop",cat:"seker",price:6,unit:"1 adet",emo:"🍭",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Farbenfrohe_Lollipops%2C_Austria.jpg/330px-Farbenfrohe_Lollipops%2C_Austria.jpg",stock:200},
  {id:"m-cikolata-top",n:"Çikolatalı Toplar",cat:"seker",price:30,unit:"90 g",emo:"🟤",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/330px-Green_and_Black%27s_dark_chocolate_bar_2.jpg",stock:40},
  {id:"m-nane-sekeri",n:"Nane Şekeri",cat:"seker",price:16,unit:"50 g",emo:"🌿",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Scotch_mints.JPG/330px-Scotch_mints.JPG",stock:75},
  {id:"m-findik",n:"Kavrulmuş Fındık",cat:"kuruyemis",price:64,unit:"150 g",emo:"🌰",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hazelnuts_%28Corylus_avellana%29_-_whole_with_kernels.jpg/330px-Hazelnuts_%28Corylus_avellana%29_-_whole_with_kernels.jpg",stock:30,tag:"Çok Satan"},
  {id:"m-leblebi",n:"Leblebi",cat:"kuruyemis",price:28,unit:"150 g",emo:"🟡",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Chickpea_BNC.jpg/330px-Chickpea_BNC.jpg",stock:52},
  {id:"m-cekirdek",n:"Çekirdek",cat:"kuruyemis",price:24,unit:"180 g",emo:"🌻",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sunflower_Seeds_Kaldari.jpg/330px-Sunflower_Seeds_Kaldari.jpg",stock:88},
  {id:"m-karisik",n:"Karışık Kuruyemiş",cat:"kuruyemis",price:86,old:99,unit:"200 g",emo:"🥜",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg/330px-Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg",stock:16,tag:"Fırsat"},
  {id:"m-fistik",n:"Antep Fıstığı",cat:"kuruyemis",price:140,unit:"150 g",emo:"🟢",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pistachio_vera.jpg/330px-Pistachio_vera.jpg",stock:9},
  {id:"m-badem",n:"Çiğ Badem",cat:"kuruyemis",price:78,unit:"150 g",emo:"🌰",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg/330px-Almonds_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_blanched.jpg",stock:21},
  {id:"m-tost",n:"Hazır Tost",cat:"atistir",price:48,unit:"1 adet",emo:"🥪",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg/330px-An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg",stock:18,tag:"Çok Satan"},
  {id:"m-pogaca",n:"Peynirli Poğaça",cat:"atistir",price:22,unit:"1 adet",emo:"🥐",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg/330px-Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg",stock:26},
  {id:"m-simit",n:"Susamlı Simit",cat:"atistir",price:15,unit:"1 adet",emo:"🥯",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Simit-2x.JPG/330px-Simit-2x.JPG",stock:30},
  {id:"m-borek",n:"Su Böreği (Dilim)",cat:"atistir",price:34,unit:"1 dilim",emo:"🥧",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg/330px-Meat_burek_%28GAK_bakery%2C_Belgrade%2C_Serbia%29.jpg",stock:14},
  {id:"m-sandvic",n:"Hazır Sandviç",cat:"atistir",price:52,unit:"1 adet",emo:"🥖",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg/330px-An_image_of_a_toast_sandwich%2C_shot_from_the_side.jpg",stock:12,tag:"Yeni"},
  {id:"m-cakmak",n:"Çakmak",cat:"acil",price:18,unit:"1 adet",emo:"🔥",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/White_lighter_with_flame.JPG/330px-White_lighter_with_flame.JPG",stock:80},
  {id:"m-pil",n:"Kalem Pil (4'lü)",cat:"acil",price:64,unit:"4'lü",emo:"🔋",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/AA_matchstick-1.jpg/330px-AA_matchstick-1.jpg",stock:34},
  {id:"m-mum",n:"Mum (Paket)",cat:"acil",price:30,unit:"6'lı",emo:"🕯️",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/LA2_Skultuna_kontorsljusstake.jpg/330px-LA2_Skultuna_kontorsljusstake.jpg",stock:22},
  {id:"m-mendil",n:"Islak Mendil",cat:"acil",price:26,unit:"60'lı",emo:"🧻",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Erfrischungstuch.jpg/330px-Erfrischungstuch.jpg",stock:48},
  {id:"m-pecete",n:"Kağıt Peçete",cat:"acil",price:20,unit:"100'lü",emo:"🧻",img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Erfrischungstuch.jpg/330px-Erfrischungstuch.jpg",stock:60},
];
const MARKET = {depo:MARKET_DEPO,cats:MARKET_CATS,products:MARKET_PRODUCTS,freeOver:150,fee:19.90,minBasket:0};

ORDERS.forEach(o=>o.vertical=o.vertical||"food");
ORDERS.push(
  {id:"VZ-M204",rest:"VIZZ Market",cust:"B. Aksu",zone:"Cumhuriyet",items:4,total:138,pay:"Online",status:"Hazırlanıyor",min:4,courier:null,vertical:"market"},
  {id:"VZ-M205",rest:"VIZZ Market",cust:"N. Tok",zone:"Bahçelievler",items:2,total:64,pay:"Kapıda Kart",status:"Atanıyor",min:1,courier:null,vertical:"market"},
  {id:"VZ-M206",rest:"VIZZ Market",cust:"R. Gül",zone:"Şehitler",items:3,total:92,pay:"Online",status:"Kurye yolda",min:7,courier:"Okan V.",vertical:"market"},
);

window.VIZZ={LOGO:VIZZ_LOGO,YOZGAT,RESTAURANTS,COURIERS,ORDERS,CATS,CAT_EMOJI,IMG,EMOJI,imgFallback,MARKET,ECON,feeOf,econOrder,econDukkan,GROWTH};


// ==========================================
// VIZZ Theme Manager - Global Theme Toggle
// ==========================================
(function() {
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.remove('light-theme');
    }
    // Dispatch a global event for theme changes (e.g., for ECharts redrawing)
    window.dispatchEvent(new CustomEvent('vizz-theme-change', { detail: { theme } }));
  }

  // Load theme immediately to prevent flashing
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('vizz-theme') || 'dark';
  } catch (e) {}
  applyTheme(savedTheme);

  // Inject Theme Toggle Switch once DOM is ready
  function initToggle() {
    // Avoid double toggle button injection
    if (document.getElementById('vizz-theme-toggle')) return;
    
    // Do not show the button on the presentation landing page (index.html)
    // as it already has its own light styling.
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/vizz/') || path.endsWith('/vizz')) {
      return;
    }

    const toggle = document.createElement('button');
    toggle.id = 'vizz-theme-toggle';
    toggle.title = 'Aydınlık / Karanlık Tema Değiştir';
    
    // Style toggle button floating at bottom-right
    toggle.style.position = 'fixed';
    toggle.style.bottom = '18px';
    toggle.style.right = '18px';
    toggle.style.zIndex = '99999';
    toggle.style.width = '42px';
    toggle.style.height = '42px';
    toggle.style.borderRadius = '50%';
    toggle.style.border = '1px solid var(--line-2)';
    toggle.style.background = 'var(--s2)';
    toggle.style.color = 'var(--tx)';
    toggle.style.cursor = 'pointer';
    toggle.style.display = 'flex';
    toggle.style.alignItems = 'center';
    toggle.style.justifyContent = 'center';
    toggle.style.boxShadow = 'var(--shadow-pop)';
    toggle.style.fontSize = '18px';
    toggle.style.transition = 'all 0.2s ease';

    const setToggleContent = (theme) => {
      toggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    };

    let currentTheme = 'dark';
    try {
      currentTheme = localStorage.getItem('vizz-theme') || 'dark';
    } catch (e) {}
    setToggleContent(currentTheme);

    toggle.addEventListener('click', () => {
      let current = 'dark';
      try {
        current = localStorage.getItem('vizz-theme') || 'dark';
      } catch (e) {}
      const theme = current === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('vizz-theme', theme);
      } catch (e) {}
      applyTheme(theme);
      setToggleContent(theme);
    });

    document.body.appendChild(toggle);
  }

  // Safe DOM ready execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();
