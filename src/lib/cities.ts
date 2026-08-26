export type CityEntry = {
  name: string;
  stationCode: string;
  lat: number;
  lon: number;
  isJunction: boolean;
  aliases: string[];
};

export const CITIES: CityEntry[] = [
  // ── Metro & Major Hubs ───────────────────────────────────────────────────
  { name: "Delhi", stationCode: "NDLS", lat: 28.64, lon: 77.22, isJunction: true, aliases: ["New Delhi", "Dilli", "दिल्ली", "dilli", "नई दिल्ली", "delhi", "old delhi", "nizamuddin", "anand vihar"] },
  { name: "Mumbai", stationCode: "BCT", lat: 18.94, lon: 72.83, isJunction: true, aliases: ["Bombay", "Mumbai Central", "CSMT", "Dadar", "मुंबई", "munbaee", "bombaee", "mumbai", "bombay", "bandra", "lokmanya tilak", "kurla"] },
  { name: "Bengaluru", stationCode: "SBC", lat: 12.98, lon: 77.57, isJunction: true, aliases: ["Bangalore", "Banglore", "Bengalore", "बेंगलुरु", "बैंगलोर", "bengaluru", "bangalore", "yeshvantpur", "yeshwanthpur", "krishnarajapuram", "whitefield"] },
  { name: "Chennai", stationCode: "MAS", lat: 13.08, lon: 80.27, isJunction: true, aliases: ["Madras", "चेन्नई", "मद्रास", "chennai", "madras", "egmore", "chennai central", "tambaram"] },
  { name: "Kolkata", stationCode: "HWH", lat: 22.58, lon: 88.34, isJunction: true, aliases: ["Calcutta", "Howrah", "Sealdah", "कोलकाता", "कलकत्ता", "हावड़ा", "kolakata", "kolkata", "sealdah", "shalimar"] },
  { name: "Hyderabad", stationCode: "HYB", lat: 17.39, lon: 78.49, isJunction: true, aliases: ["Secunderabad", "Kacheguda", "हैदराबाद", "सिकंदराबाद", "haidarabad", "hyderabad", "secunderabad"] },
  { name: "Pune", stationCode: "PUNE", lat: 18.53, lon: 73.87, isJunction: true, aliases: ["Poona", "पुणे", "pune", "poona", "shivajinagar", "hadapsar"] },
  { name: "Ahmedabad", stationCode: "ADI", lat: 23.02, lon: 72.57, isJunction: true, aliases: ["Amdavad", "Ahmadabad", "अहमदाबाद", "ahamadabad", "ahmedabad", "amdavad", "sabarmati", "kalupur"] },
  
  // ── North & Jammu / Kashmir ──────────────────────────────────────────────
  { name: "Jammu", stationCode: "JAT", lat: 32.70, lon: 74.87, isJunction: true, aliases: ["Jammu Tawi", "जम्मू", "जम्मू तवी", "jammu", "jammu tawi", "jammutawi"] },
  { name: "Katra", stationCode: "SVDK", lat: 32.99, lon: 74.93, isJunction: false, aliases: ["Shri Mata Vaishno Devi Katra", "कटरा", "कटड़ा", "वैष्णो देवी", "katra", "vaishno devi", "mata vaishno devi"] },
  { name: "Srinagar", stationCode: "SINA", lat: 34.08, lon: 74.80, isJunction: false, aliases: ["श्रीनगर", "srinagar"] },
  { name: "Amritsar", stationCode: "ASR", lat: 31.63, lon: 74.87, isJunction: true, aliases: ["अमृतसर", "amritsar", "amritasara", "golden temple"] },
  { name: "Ludhiana", stationCode: "LDH", lat: 30.90, lon: 75.85, isJunction: true, aliases: ["लुधियाना", "ludhiana"] },
  { name: "Jalandhar", stationCode: "JUC", lat: 31.33, lon: 75.58, isJunction: true, aliases: ["जालंधर", "jalandhar", "jalandhar city", "jalandhar cantt"] },
  { name: "Chandigarh", stationCode: "CDG", lat: 30.74, lon: 76.79, isJunction: false, aliases: ["चंडीगढ़", "chandigarh"] },
  { name: "Kalka", stationCode: "KLK", lat: 30.84, lon: 76.93, isJunction: true, aliases: ["कालका", "kalka", "shimla", "शिमला"] },
  { name: "Dehradun", stationCode: "DDN", lat: 30.32, lon: 78.03, isJunction: false, aliases: ["देहरादून", "dehradun"] },
  { name: "Haridwar", stationCode: "HW", lat: 29.95, lon: 78.16, isJunction: true, aliases: ["हरिद्वार", "haridwar", "hardwar"] },
  { name: "Rishikesh", stationCode: "YNRK", lat: 30.10, lon: 78.29, isJunction: false, aliases: ["ऋषिकेश", "rishikesh", "yog nagari rishikesh"] },
  
  // ── Uttar Pradesh & Bihar ────────────────────────────────────────────────
  { name: "Lucknow", stationCode: "LKO", lat: 26.85, lon: 80.95, isJunction: true, aliases: ["Lucknau", "Lucknow Charbagh", "लखनऊ", "lakhanau", "lucknow", "charbagh"] },
  { name: "Varanasi", stationCode: "BSB", lat: 25.32, lon: 82.99, isJunction: true, aliases: ["Benares", "Banaras", "Kashi", "Manduadih", "वाराणसी", "बनारस", "काशी", "varanasi", "banaras", "kashi", "manduadih"] },
  { name: "Ayodhya", stationCode: "AY", lat: 26.79, lon: 82.20, isJunction: true, aliases: ["Ayodhya Dham", "Ayodhya Cantt", "Faizabad", "अयोध्या", "अयोध्या धाम", "फ़ैज़ाबाद", "ayodhya", "ayodhya dham", "faizabad"] },
  { name: "Kanpur", stationCode: "CNB", lat: 26.45, lon: 80.35, isJunction: true, aliases: ["कानपुर", "kanpur", "kanapur", "kanpur central"] },
  { name: "Agra", stationCode: "AGC", lat: 27.18, lon: 78.02, isJunction: true, aliases: ["आगरा", "agra", "aagara", "agra cantt", "agra fort"] },
  { name: "Mathura", stationCode: "MTJ", lat: 27.49, lon: 77.67, isJunction: true, aliases: ["मथुरा", "mathura", "vrindavan", "वृंदावन"] },
  { name: "Jhansi", stationCode: "JHS", lat: 25.45, lon: 78.57, isJunction: true, aliases: ["Virangana Lakshmibai", "झांसी", "jhansi", "vglb"] },
  { name: "Allahabad", stationCode: "PRYJ", lat: 25.44, lon: 81.85, isJunction: true, aliases: ["Prayagraj", "प्रयागराज", "इलाहाबाद", "prayagraj", "allahabad", "subedarganj"] },
  { name: "Gorakhpur", stationCode: "GKP", lat: 26.76, lon: 83.37, isJunction: true, aliases: ["गोरखपुर", "gorakhpur", "gorakhapur"] },
  { name: "Bareilly", stationCode: "BE", lat: 28.36, lon: 79.42, isJunction: true, aliases: ["बरेली", "bareilly"] },
  { name: "Aligarh", stationCode: "ALJN", lat: 27.89, lon: 78.08, isJunction: true, aliases: ["अलीगढ़", "aligarh"] },
  { name: "Moradabad", stationCode: "MB", lat: 28.84, lon: 78.78, isJunction: true, aliases: ["मुरादाबाद", "moradabad"] },
  { name: "Mughalsarai", stationCode: "DDU", lat: 25.28, lon: 83.12, isJunction: true, aliases: ["Deen Dayal Upadhyaya Jn", "मुगलसराय", "पंडित दीनदयाल उपाध्याय", "mughalsarai", "ddu", "deen dayal upadhyaya"] },
  { name: "Patna", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: ["Patna Jn", "Danapur", "Patliputra", "पटना", "patana", "patna", "danapur", "patliputra"] },
  { name: "Gaya", stationCode: "GAYA", lat: 24.80, lon: 85.00, isJunction: true, aliases: ["गया", "Bodhgaya", "gaya", "bodhgaya"] },
  { name: "Muzaffarpur", stationCode: "MFP", lat: 26.12, lon: 85.39, isJunction: true, aliases: ["मुजफ्फरपुर", "muzaffarpur"] },
  { name: "Darbhanga", stationCode: "DBG", lat: 26.15, lon: 85.90, isJunction: true, aliases: ["दरभंगा", "darbhanga"] },
  { name: "Bhagalpur", stationCode: "BGP", lat: 25.24, lon: 86.98, isJunction: true, aliases: ["भागलपुर", "bhagalpur"] },
  
  // ── Rajasthan & Gujarat & MP ─────────────────────────────────────────────
  { name: "Jaipur", stationCode: "JP", lat: 26.91, lon: 75.79, isJunction: true, aliases: ["जयपुर", "jayapur", "jaipur"] },
  { name: "Jodhpur", stationCode: "JU", lat: 26.29, lon: 73.02, isJunction: true, aliases: ["जोधपुर", "jodhpur"] },
  { name: "Udaipur", stationCode: "UDZ", lat: 24.58, lon: 73.68, isJunction: false, aliases: ["उदयपुर", "udaipur", "city of lakes"] },
  { name: "Ajmer", stationCode: "AII", lat: 26.45, lon: 74.64, isJunction: true, aliases: ["अजमेर", "Pushkar", "ajmer", "pushkar"] },
  { name: "Bikaner", stationCode: "BKN", lat: 28.02, lon: 73.31, isJunction: true, aliases: ["बीकानेर", "bikaner"] },
  { name: "Kota", stationCode: "KOTA", lat: 25.21, lon: 75.86, isJunction: true, aliases: ["कोटा", "kota"] },
  { name: "Surat", stationCode: "ST", lat: 21.17, lon: 72.83, isJunction: true, aliases: ["सूरत", "soorat", "surat"] },
  { name: "Vadodara", stationCode: "BRC", lat: 22.31, lon: 73.18, isJunction: true, aliases: ["Baroda", "वडोदरा", "बड़ौदा", "vadodara", "baroda"] },
  { name: "Rajkot", stationCode: "RJT", lat: 22.30, lon: 70.80, isJunction: false, aliases: ["राजकोट", "rajkot"] },
  { name: "Bhopal", stationCode: "BPL", lat: 23.26, lon: 77.41, isJunction: true, aliases: ["भोपाल", "bhopal", "rani kamlapati", "habibganj"] },
  { name: "Indore", stationCode: "INDB", lat: 22.72, lon: 75.86, isJunction: true, aliases: ["इंदौर", "indaur", "indore"] },
  { name: "Ujjain", stationCode: "UJN", lat: 23.18, lon: 75.77, isJunction: true, aliases: ["उज्जैन", "Mahakaleshwar", "ujjain", "mahakal"] },
  { name: "Gwalior", stationCode: "GWL", lat: 26.22, lon: 78.18, isJunction: false, aliases: ["ग्वालियर", "gwalior"] },
  { name: "Jabalpur", stationCode: "JBP", lat: 23.18, lon: 79.95, isJunction: true, aliases: ["जबलपुर", "jabalpur"] },
  { name: "Itarsi", stationCode: "ET", lat: 22.61, lon: 77.76, isJunction: true, aliases: ["इटारसी", "itarsi"] },
  { name: "Ratlam", stationCode: "RTM", lat: 23.33, lon: 75.04, isJunction: true, aliases: ["रतलाम", "ratlam"] },
  
  // ── Maharashtra & Goa ────────────────────────────────────────────────────
  { name: "Nagpur", stationCode: "NGP", lat: 21.15, lon: 79.09, isJunction: true, aliases: ["नागपुर", "nagapur", "nagpur"] },
  { name: "Nashik", stationCode: "NK", lat: 20.00, lon: 73.79, isJunction: false, aliases: ["नासिक", "nashik", "nasik"] },
  { name: "Goa", stationCode: "MAO", lat: 15.29, lon: 73.96, isJunction: true, aliases: ["Madgaon", "Panaji", "Vasco", "Karmali", "Thivim", "गोवा", "मडगांव", "goa", "madgaon", "panaji", "vasco"] },
  
  // ── East & North-East ────────────────────────────────────────────────────
  { name: "Bhubaneswar", stationCode: "BBS", lat: 20.30, lon: 85.82, isJunction: true, aliases: ["भुवनेश्वर", "Puri", "bhubaneswar", "puri"] },
  { name: "Ranchi", stationCode: "RNC", lat: 23.34, lon: 85.31, isJunction: false, aliases: ["राँची", "रांची", "Hatia", "ranchi", "hatia"] },
  { name: "Jamshedpur", stationCode: "TATA", lat: 22.80, lon: 86.20, isJunction: true, aliases: ["Tatanagar", "Tata", "टाटानगर", "जमशेदपुर", "tatanagar", "tata", "jamshedpur"] },
  { name: "Dhanbad", stationCode: "DHN", lat: 23.80, lon: 86.43, isJunction: true, aliases: ["धनबाद", "dhanbad"] },
  { name: "Raipur", stationCode: "R", lat: 21.25, lon: 81.63, isJunction: true, aliases: ["रायपुर", "raipur", "durg", "bilaspur"] },
  { name: "Bilaspur", stationCode: "BSP", lat: 22.08, lon: 82.14, isJunction: true, aliases: ["बिलासपुर", "bilaspur"] },
  { name: "Guwahati", stationCode: "GHY", lat: 26.17, lon: 91.75, isJunction: true, aliases: ["गुवाहाटी", "Kamakhya", "guwahati", "kamakhya"] },
  { name: "Siliguri", stationCode: "NJP", lat: 26.69, lon: 88.44, isJunction: true, aliases: ["New Jalpaiguri", "NJP", "न्यू जलपाईगुड़ी", "new jalpaiguri", "njp", "siliguri"] },
  
  // ── South India ──────────────────────────────────────────────────────────
  { name: "Kochi", stationCode: "ERS", lat: 9.97, lon: 76.28, isJunction: true, aliases: ["Cochin", "Ernakulam", "कोच्चि", "कोचीन", "kochi", "cochin", "ernakulam"] },
  { name: "Thiruvananthapuram", stationCode: "TVC", lat: 8.49, lon: 76.95, isJunction: true, aliases: ["Trivandrum", "तिरुवनंतपुरम", "trivandrum", "kochuveli"] },
  { name: "Kozhikode", stationCode: "CLT", lat: 11.25, lon: 75.78, isJunction: false, aliases: ["Calicut", "कालीकट", "कोझिकोड", "calicut", "kozhikode"] },
  { name: "Visakhapatnam", stationCode: "VSKP", lat: 17.68, lon: 83.22, isJunction: true, aliases: ["Vizag", "विशाखापत्तनम", "विजाग", "visakhapatnam", "vizag"] },
  { name: "Vijayawada", stationCode: "BZA", lat: 16.51, lon: 80.65, isJunction: true, aliases: ["विजयवाड़ा", "vijayawada"] },
  { name: "Tirupati", stationCode: "TPTY", lat: 13.63, lon: 79.42, isJunction: true, aliases: ["तिरुपति", "tirupati", "renigunta"] },
  { name: "Guntur", stationCode: "GNT", lat: 16.30, lon: 80.44, isJunction: false, aliases: ["गुंटूर", "guntur"] },
  { name: "Coimbatore", stationCode: "CBE", lat: 11.00, lon: 76.97, isJunction: true, aliases: ["कोयंबटूर", "coimbatore"] },
  { name: "Madurai", stationCode: "MDU", lat: 9.93, lon: 78.12, isJunction: true, aliases: ["मदुरै", "madurai"] },
  { name: "Tiruchirappalli", stationCode: "TPJ", lat: 10.79, lon: 78.70, isJunction: true, aliases: ["Trichy", "Tiruchi", "त्रिची", "तिरुचिरापल्ली", "trichy", "tiruchirappalli"] },
  { name: "Mysuru", stationCode: "MYS", lat: 12.30, lon: 76.65, isJunction: false, aliases: ["Mysore", "मैसूर", "mysore", "mysuru"] },
  { name: "Hubballi", stationCode: "UBL", lat: 15.36, lon: 75.12, isJunction: true, aliases: ["Hubli", "हुबली", "hubli", "hubballi"] },
  { name: "Mangaluru", stationCode: "MAQ", lat: 12.87, lon: 74.84, isJunction: true, aliases: ["Mangalore", "मंगलुरु", "मंगलोर", "mangalore", "mangaluru"] },
  { name: "Guntakal", stationCode: "GTL", lat: 15.17, lon: 77.37, isJunction: true, aliases: ["गुंतकल", "guntakal"] },
  { name: "Renigunta", stationCode: "RU", lat: 13.65, lon: 79.51, isJunction: true, aliases: ["रेनिगुंटा", "renigunta"] },
  { name: "Katpadi", stationCode: "KPD", lat: 12.97, lon: 79.14, isJunction: true, aliases: ["काटपाडी", "Vellore", "katpadi", "vellore"] },
  { name: "Gurugram", stationCode: "GGN", lat: 28.46, lon: 77.03, isJunction: false, aliases: ["Gurgaon", "गुरुग्राम", "गुड़गांव", "gurgaon", "gurugram"] },
  { name: "Bihar", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: ["बिहार", "bihar"] } // State alias fallback
];
