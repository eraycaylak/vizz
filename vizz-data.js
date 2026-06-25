/* VIZZ — shared mock data, brand assets, helpers (presentation mockup) */
const VIZZ_LOGO = "data:image/jpeg;base64,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";

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
  {id:"m-sutlu-cik",n:"Sütlü Çikolata",cat:"cikolata",price:34,old:40,unit:"80 g",emo:"🍫",stock:42,tag:"Çok Satan"},
  {id:"m-findikli",n:"Fındıklı Çikolata",cat:"cikolata",price:38,unit:"80 g",emo:"🍫",stock:30},
  {id:"m-gofret",n:"Çikolatalı Gofret",cat:"cikolata",price:18,unit:"36 g",emo:"🍫",stock:120},
  {id:"m-kakaolu-bar",n:"Kakaolu Bar",cat:"cikolata",price:22,unit:"50 g",emo:"🍫",stock:64},
  {id:"m-beyaz-cik",n:"Beyaz Çikolata",cat:"cikolata",price:36,unit:"80 g",emo:"🍫",stock:0,tag:"Tükendi"},
  {id:"m-findik-krem",n:"Fındık Kreması",cat:"cikolata",price:96,old:115,unit:"350 g",emo:"🍯",stock:18,tag:"Fırsat"},
  {id:"m-klasik-cips",n:"Klasik Patates Cipsi",cat:"cips",price:42,unit:"107 g",emo:"🥔",stock:58,tag:"Çok Satan"},
  {id:"m-baharatli",n:"Baharatlı Cips",cat:"cips",price:42,unit:"107 g",emo:"🌶️",stock:47},
  {id:"m-misir-cips",n:"Mısır Cipsi (Nacho)",cat:"cips",price:38,unit:"140 g",emo:"🌽",stock:33},
  {id:"m-cubuk-kraker",n:"Çubuk Kraker",cat:"cips",price:16,unit:"45 g",emo:"🥨",stock:90},
  {id:"m-citir-misir",n:"Çıtır Mısır",cat:"cips",price:28,unit:"100 g",emo:"🍿",stock:25},
  {id:"m-soslu-cips",n:"Soslu Cips + Dip",cat:"cips",price:54,old:64,unit:"160 g",emo:"🥔",stock:12,tag:"Fırsat"},
  {id:"m-kakaolu-bisk",n:"Kakaolu Bisküvi",cat:"biskuvi",price:24,unit:"100 g",emo:"🍪",stock:70},
  {id:"m-sandvic-bisk",n:"Sandviç Bisküvi",cat:"biskuvi",price:20,unit:"70 g",emo:"🍪",stock:85,tag:"Çok Satan"},
  {id:"m-kremali-bisk",n:"Kremalı Bisküvi",cat:"biskuvi",price:22,unit:"90 g",emo:"🍪",stock:48},
  {id:"m-tuzlu-kraker",n:"Tuzlu Kraker",cat:"biskuvi",price:14,unit:"75 g",emo:"🧂",stock:110},
  {id:"m-yulaf-bar",n:"Yulaf Bar",cat:"biskuvi",price:26,unit:"40 g",emo:"🌾",stock:36,tag:"Yeni"},
  {id:"m-kola",n:"Kola (Kutu)",cat:"icecek",price:28,unit:"330 ml",emo:"🥤",stock:140,tag:"Çok Satan"},
  {id:"m-kola-zero",n:"Kola Zero (Kutu)",cat:"icecek",price:28,unit:"330 ml",emo:"🥤",stock:96},
  {id:"m-gazoz",n:"Limonlu Gazoz",cat:"icecek",price:22,unit:"250 ml",emo:"🍋",stock:60},
  {id:"m-su",n:"Su",cat:"icecek",price:8,unit:"500 ml",emo:"💧",stock:200},
  {id:"m-maden-suyu",n:"Maden Suyu",cat:"icecek",price:14,unit:"200 ml",emo:"🫧",stock:88},
  {id:"m-meyve-suyu",n:"Meyve Suyu (Şeftali)",cat:"icecek",price:24,unit:"200 ml",emo:"🧃",stock:54},
  {id:"m-enerji",n:"Enerji İçeceği",cat:"icecek",price:46,old:55,unit:"250 ml",emo:"⚡",stock:40,tag:"Fırsat"},
  {id:"m-soguk-kahve",n:"Soğuk Kahve",cat:"icecek",price:52,unit:"250 ml",emo:"☕",stock:28,tag:"Yeni"},
  {id:"m-ayran",n:"Ayran",cat:"icecek",price:18,unit:"300 ml",emo:"🥛",stock:64},
  {id:"m-kulah",n:"Külah Dondurma",cat:"dondurma",price:38,unit:"110 ml",emo:"🍦",stock:35,tag:"Çok Satan"},
  {id:"m-cubuk-dond",n:"Çubuk Dondurma",cat:"dondurma",price:30,unit:"70 ml",emo:"🍡",stock:44},
  {id:"m-sandvic-dond",n:"Sandviç Dondurma",cat:"dondurma",price:34,unit:"90 ml",emo:"🍨",stock:22},
  {id:"m-kutu-dond",n:"Kutu Dondurma",cat:"dondurma",price:120,old:140,unit:"900 ml",emo:"🍨",stock:10,tag:"Fırsat"},
  {id:"m-sakiz",n:"Naneli Sakız",cat:"seker",price:12,unit:"14'lü",emo:"🍬",stock:150},
  {id:"m-jelibon",n:"Jelibon",cat:"seker",price:26,unit:"80 g",emo:"🐻",stock:58,tag:"Çok Satan"},
  {id:"m-lolipop",n:"Lolipop",cat:"seker",price:6,unit:"1 adet",emo:"🍭",stock:200},
  {id:"m-cikolata-top",n:"Çikolatalı Toplar",cat:"seker",price:30,unit:"90 g",emo:"🟤",stock:40},
  {id:"m-nane-sekeri",n:"Nane Şekeri",cat:"seker",price:16,unit:"50 g",emo:"🌿",stock:75},
  {id:"m-findik",n:"Kavrulmuş Fındık",cat:"kuruyemis",price:64,unit:"150 g",emo:"🌰",stock:30,tag:"Çok Satan"},
  {id:"m-leblebi",n:"Leblebi",cat:"kuruyemis",price:28,unit:"150 g",emo:"🟡",stock:52},
  {id:"m-cekirdek",n:"Çekirdek",cat:"kuruyemis",price:24,unit:"180 g",emo:"🌻",stock:88},
  {id:"m-karisik",n:"Karışık Kuruyemiş",cat:"kuruyemis",price:86,old:99,unit:"200 g",emo:"🥜",stock:16,tag:"Fırsat"},
  {id:"m-fistik",n:"Antep Fıstığı",cat:"kuruyemis",price:140,unit:"150 g",emo:"🟢",stock:9},
  {id:"m-badem",n:"Çiğ Badem",cat:"kuruyemis",price:78,unit:"150 g",emo:"🌰",stock:21},
  {id:"m-tost",n:"Hazır Tost",cat:"atistir",price:48,unit:"1 adet",emo:"🥪",stock:18,tag:"Çok Satan"},
  {id:"m-pogaca",n:"Peynirli Poğaça",cat:"atistir",price:22,unit:"1 adet",emo:"🥐",stock:26},
  {id:"m-simit",n:"Susamlı Simit",cat:"atistir",price:15,unit:"1 adet",emo:"🥯",stock:30},
  {id:"m-borek",n:"Su Böreği (Dilim)",cat:"atistir",price:34,unit:"1 dilim",emo:"🥧",stock:14},
  {id:"m-sandvic",n:"Hazır Sandviç",cat:"atistir",price:52,unit:"1 adet",emo:"🥖",stock:12,tag:"Yeni"},
  {id:"m-cakmak",n:"Çakmak",cat:"acil",price:18,unit:"1 adet",emo:"🔥",stock:80},
  {id:"m-pil",n:"Kalem Pil (4'lü)",cat:"acil",price:64,unit:"4'lü",emo:"🔋",stock:34},
  {id:"m-mum",n:"Mum (Paket)",cat:"acil",price:30,unit:"6'lı",emo:"🕯️",stock:22},
  {id:"m-mendil",n:"Islak Mendil",cat:"acil",price:26,unit:"60'lı",emo:"🧻",stock:48},
  {id:"m-pecete",n:"Kağıt Peçete",cat:"acil",price:20,unit:"100'lü",emo:"🧻",stock:60},
];
const MARKET = {depo:MARKET_DEPO,cats:MARKET_CATS,products:MARKET_PRODUCTS,freeOver:150,fee:19.90,minBasket:0};

ORDERS.forEach(o=>o.vertical=o.vertical||"food");
ORDERS.push(
  {id:"VZ-M204",rest:"VIZZ Market",cust:"B. Aksu",zone:"Cumhuriyet",items:4,total:138,pay:"Online",status:"Hazırlanıyor",min:4,courier:null,vertical:"market"},
  {id:"VZ-M205",rest:"VIZZ Market",cust:"N. Tok",zone:"Bahçelievler",items:2,total:64,pay:"Kapıda Kart",status:"Atanıyor",min:1,courier:null,vertical:"market"},
  {id:"VZ-M206",rest:"VIZZ Market",cust:"R. Gül",zone:"Şehitler",items:3,total:92,pay:"Online",status:"Kurye yolda",min:7,courier:"Okan V.",vertical:"market"},
);

window.VIZZ={LOGO:VIZZ_LOGO,YOZGAT,RESTAURANTS,COURIERS,ORDERS,CATS,CAT_EMOJI,IMG,EMOJI,imgFallback,MARKET};
