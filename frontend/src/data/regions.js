export const regionsData = {
  "Tanger-Tétouan-Al Hoceïma": ["Tanger-Assilah", "M'diq-Fnideq", "Tétouan", "Fahs-Anjra", "Larache", "Hoceïma", "Chefchaouen", "Ouezzane"],
  "l'Oriental": ["Oujda-Angad", "Nador", "Driouch", "Jerada", "Berkane", "Taourirt", "Guercif", "Figuig"],
  "Fès-Meknès": ["Fès", "Meknès", "El Hajeb", "Ifrane", "Moulay Yacoub", "Sefrou", "Boulemane", "Taounate", "Taza"],
  "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Skhirate-Témara", "Kénitra", "Khémisset", "Sidi Kacem", "Sidi Slimane"],
  "Béni Mellal-Khénifra": ["Béni Mellal", "Azilal", "Fquih Ben Salah", "Khénifra", "Khouribga"],
  "Casablanca-Settat": ["Casablanca", "Mohammadia", "El Jadida", "Nouaceur", "Médiouna", "Benslimane", "Berrechid", "Settat", "Sidi Bennour"],
  "Marrakech-Safi": ["Marrakech", "Chichaoua", "Al Haouz", "El Kelaâ des Sraghna", "Essaouira", "Rehamna", "Safi", "Youssoufia"],
  "Drâa-Tafilalet": ["Errachidia", "Ouarzazate", "Midelt", "Tinghir", "Zagora"],
  "Souss-Massa": ["Agadir-Ida-Ou-Tanane", "Inezgane-Aït Melloul", "Chtouka-Aït Baha", "Taroudant", "Tiznit", "Tata"],
  "Guelmim-Oued Noun": ["Guelmim", "Assa-Zag", "Tan-Tan", "Sidi Ifni"],
  "Laâyoune-Sakia El Hamra": ["Laâyoune", "Boujdour", "Tarfaya", "Es-Semara"],
  "Dakhla-Oued Ed-Dahab": ["Oued Ed-Dahab", "Aousserd"]
};

export const grades = [
  'technicien',
  'administrateur',
  'controleur'
];

// Internal translation dictionary
const transDict = {
  "Tanger-Tétouan-Al Hoceïma": "طنجة-تطوان-الحسيمة",
  "Tanger-Assilah": "طنجة-أصيلة",
  "M'diq-Fnideq": "المضيق-الفنيدق",
  "Tétouan": "تطوان",
  "Fahs-Anjra": "الفحص-أنجرة",
  "Larache": "العرائش",
  "Hoceïma": "الحسيمة",
  "Chefchaouen": "شفشاون",
  "Ouezzane": "وزان",

  "l'Oriental": "الشرق",
  "Oujda-Angad": "وجدة-أنجاد",
  "Nador": "الناظور",
  "Driouch": "الدريوش",
  "Jerada": "جرادة",
  "Berkane": "بركان",
  "Taourirt": "تاوريرت",
  "Guercif": "جرسيف",
  "Figuig": "فكيك",

  "Fès-Meknès": "فاس-مكناس",
  "Fès": "فاس",
  "Meknès": "مكناس",
  "El Hajeb": "الحاجب",
  "Ifrane": "إفران",
  "Moulay Yacoub": "ملاي يعقوب",
  "Sefrou": "صفرو",
  "Boulemane": "بولمان",
  "Taounate": "تاونات",
  "Taza": "تازة",

  "Rabat-Salé-Kénitra": "الرباط-سلا-القنيطرة",
  "Rabat": "الرباط",
  "Salé": "سلا",
  "Skhirate-Témara": "الصخيرات-تمارة",
  "Kénitra": "القنيطرة",
  "Khémisset": "الخميسات",
  "Sidi Kacem": "سيدي قاسم",
  "Sidi Slimane": "سيدي سليمان",

  "Béni Mellal-Khénifra": "بني ملال-خنيفرة",
  "Béni Mellal": "بني ملال",
  "Azilal": "أزيلال",
  "Fquih Ben Salah": "الفقيه بن صالح",
  "Khénifra": "خنيفرة",
  "Khouribga": "خريبكة",

  "Casablanca-Settat": "الدار البيضاء-سطات",
  "Casablanca": "الدار البيضاء",
  "Mohammadia": "المحمدية",
  "El Jadida": "الجديدة",
  "Nouaceur": "النواصر",
  "Médiouna": "مديونة",
  "Benslimane": "بنسليمان",
  "Berrechid": "برشيد",
  "Settat": "سطات",
  "Sidi Bennour": "سيدي بنور",

  "Marrakech-Safi": "مراكش-آسفي",
  "Marrakech": "مراكش",
  "Chichaoua": "شيشاوة",
  "Al Haouz": "الحوز",
  "El Kelaâ des Sraghna": "قلعة السراغنة",
  "Essaouira": "الصويرة",
  "Rehamna": "الرحامنة",
  "Safi": "آسفي",
  "Youssoufia": "اليوسفية",

  "Drâa-Tafilalet": "درعة-تافيلالت",
  "Errachidia": "الرشيدية",
  "Ouarzazate": "ورزازات",
  "Midelt": "ميدلت",
  "Tinghir": "تنغير",
  "Zagora": "زاكورة",

  "Souss-Massa": "سوس-ماسة",
  "Agadir-Ida-Ou-Tanane": "أكادير إدا وتنان",
  "Inezgane-Aït Melloul": "إنزكان-آيت ملول",
  "Chtouka-Aït Baha": "شتوكة-آيت باها",
  "Taroudant": "تارودانت",
  "Tiznit": "تيزنيت",
  "Tata": "طاطا",

  "Guelmim-Oued Noun": "كلميم-واد نون",
  "Guelmim": "كلميم",
  "Assa-Zag": "آسا-الزاك",
  "Tan-Tan": "طانطان",
  "Sidi Ifni": "سيدي إفني",

  "Laâyoune-Sakia El Hamra": "العيون-الساقية الحمراء",
  "Laâyoune": "العيون",
  "Boujdour": "بوجدور",
  "Tarfaya": "طرفاية",
  "Es-Semara": "السمارة",

  "Dakhla-Oued Ed-Dahab": "الداخلة-وادي الذهب",
  "Oued Ed-Dahab": "وادي الذهب",
  "Aousserd": "أوسرد",
  
  "technicien": "تقني",
  "administrateur": "متصرف",
  "controleur": "مراقب",
  "TECHNICIEN": "تقني",
  "ADMINISTRATEUR": "متصرف",
  "CONTROLEUR": "مراقب"
};

// Helper function to safely translate any province, region or grade string
export const t_geo = (lang, text) => {
  if (!text) return text;
  if (lang === 'ar' && transDict[text]) return transDict[text];
  if (lang === 'ar' && transDict[text.toLowerCase()]) return transDict[text.toLowerCase()];
  return text; // Default to English/French
};
