export type CityEntry = {
  name: string;
  stationCode: string;
  lat: number;
  lon: number;
  isJunction: boolean;
  aliases: string[];
};

export const CITIES: CityEntry[] = [
  { name: "Delhi", stationCode: "NDLS", lat: 28.64, lon: 77.22, isJunction: true, aliases: ["New Delhi", "Dilli", "दिल्ली", "dilli", "नई दिल्ली", "delhi"] },
  { name: "Mumbai", stationCode: "BCT", lat: 18.94, lon: 72.83, isJunction: true, aliases: ["Bombay", "Mumbai Central", "CSMT", "Dadar", "मुंबई", "munbaee", "bombaee", "mumbai", "bombay"] },
  { name: "Bengaluru", stationCode: "SBC", lat: 12.98, lon: 77.57, isJunction: true, aliases: ["Bangalore", "Banglore", "Bengalore", "बेंगलुरु", "बैंगलोर", "bengaluru", "bangalore"] },
  { name: "Chennai", stationCode: "MAS", lat: 13.08, lon: 80.27, isJunction: true, aliases: ["Madras", "चेन्नई", "मद्रास", "chennai", "madras"] },
  { name: "Kolkata", stationCode: "HWH", lat: 22.58, lon: 88.34, isJunction: true, aliases: ["Calcutta", "Howrah", "कोलकाता", "कलकत्ता", "हावड़ा", "kolakata", "kolkata"] },
  { name: "Hyderabad", stationCode: "HYB", lat: 17.39, lon: 78.49, isJunction: true, aliases: ["Secunderabad", "हैदराबाद", "सिकंदराबाद", "haidarabad", "hyderabad"] },
  { name: "Pune", stationCode: "PUNE", lat: 18.53, lon: 73.87, isJunction: true, aliases: ["Poona", "पुणे", "pune", "poona"] },
  { name: "Ahmedabad", stationCode: "ADI", lat: 23.02, lon: 72.57, isJunction: true, aliases: ["Amdavad", "Ahmadabad", "अहमदाबाद", "ahamadabad", "ahmedabad", "amdavad"] },
  { name: "Jaipur", stationCode: "JP", lat: 26.91, lon: 75.79, isJunction: true, aliases: ["जयपुर", "jayapur", "jaipur"] },
  { name: "Patna", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: ["Patna Jn", "पटना", "patana", "patna"] },
  { name: "Lucknow", stationCode: "LKO", lat: 26.85, lon: 80.95, isJunction: true, aliases: ["Lucknau", "लखनऊ", "lakhanau", "lucknow"] },
  { name: "Varanasi", stationCode: "BSB", lat: 25.32, lon: 82.99, isJunction: true, aliases: ["Benares", "Banaras", "Kashi", "वाराणसी", "बनारस", "काशी", "varanasi", "banaras", "kashi"] },
  { name: "Kochi", stationCode: "ERS", lat: 9.97, lon: 76.28, isJunction: true, aliases: ["Cochin", "Ernakulam", "कोच्चि", "कोचीन", "kochi", "cochin"] },
  { name: "Thiruvananthapuram", stationCode: "TVC", lat: 8.49, lon: 76.95, isJunction: true, aliases: ["Trivandrum", "तिरुवनंतपुरम", "trivandrum"] },
  { name: "Nagpur", stationCode: "NGP", lat: 21.15, lon: 79.09, isJunction: true, aliases: ["नागपुर", "nagapur", "nagpur"] },
  { name: "Bhopal", stationCode: "BPL", lat: 23.26, lon: 77.41, isJunction: true, aliases: ["भोपाल", "bhopal"] },
  { name: "Indore", stationCode: "INDB", lat: 22.72, lon: 75.86, isJunction: true, aliases: ["इंदौर", "indaur", "indore"] },
  { name: "Surat", stationCode: "ST", lat: 21.17, lon: 72.83, isJunction: true, aliases: ["सूरत", "soorat", "surat"] },
  { name: "Vadodara", stationCode: "BRC", lat: 22.31, lon: 73.18, isJunction: true, aliases: ["Baroda", "वडोदरा", "बड़ौदा", "vadodara", "baroda"] },
  { name: "Kota", stationCode: "KOTA", lat: 25.21, lon: 75.86, isJunction: true, aliases: ["कोटा", "kota"] },
  { name: "Ratlam", stationCode: "RTM", lat: 23.33, lon: 75.04, isJunction: true, aliases: ["रतलाम", "ratlam"] },
  { name: "Jhansi", stationCode: "JHS", lat: 25.45, lon: 78.57, isJunction: true, aliases: ["झांसी", "jhansi"] },
  { name: "Allahabad", stationCode: "PRYJ", lat: 25.44, lon: 81.85, isJunction: true, aliases: ["Prayagraj", "प्रयागराज", "इलाहाबाद", "prayagraj", "allahabad"] },
  { name: "Guwahati", stationCode: "GHY", lat: 26.17, lon: 91.75, isJunction: true, aliases: ["गुवाहाटी", "guwahati"] },
  { name: "Bhubaneswar", stationCode: "BBS", lat: 20.30, lon: 85.82, isJunction: true, aliases: ["भुवनेश्वर", "bhubaneswar"] },
  { name: "Visakhapatnam", stationCode: "VSKP", lat: 17.68, lon: 83.22, isJunction: true, aliases: ["Vizag", "विशाखापत्तनम", "विजाग", "visakhapatnam", "vizag"] },
  { name: "Vijayawada", stationCode: "BZA", lat: 16.51, lon: 80.65, isJunction: true, aliases: ["विजयवाड़ा", "vijayawada"] },
  { name: "Coimbatore", stationCode: "CBE", lat: 11.00, lon: 76.97, isJunction: true, aliases: ["कोयंबटूर", "coimbatore"] },
  { name: "Madurai", stationCode: "MDU", lat: 9.93, lon: 78.12, isJunction: true, aliases: ["मदुरै", "madurai"] },
  { name: "Mysuru", stationCode: "MYS", lat: 12.30, lon: 76.65, isJunction: false, aliases: ["Mysore", "मैसूर", "mysore", "mysuru"] },
  { name: "Nashik", stationCode: "NK", lat: 20.00, lon: 73.79, isJunction: false, aliases: ["नासिक", "nashik"] },
  { name: "Rajkot", stationCode: "RJT", lat: 22.30, lon: 70.80, isJunction: false, aliases: ["राजकोट", "rajkot"] },
  { name: "Amritsar", stationCode: "ASR", lat: 31.63, lon: 74.87, isJunction: true, aliases: ["अमृतसर", "amritsar", "amritasara"] },
  { name: "Chandigarh", stationCode: "CDG", lat: 30.74, lon: 76.79, isJunction: false, aliases: ["चंडीगढ़", "chandigarh"] },
  { name: "Dehradun", stationCode: "DDN", lat: 30.32, lon: 78.03, isJunction: false, aliases: ["देहरादून", "dehradun"] },
  { name: "Raipur", stationCode: "R", lat: 21.25, lon: 81.63, isJunction: true, aliases: ["रायपुर", "raipur"] },
  { name: "Ranchi", stationCode: "RNC", lat: 23.34, lon: 85.31, isJunction: false, aliases: ["राँची", "रांची", "ranchi"] },
  { name: "Jodhpur", stationCode: "JU", lat: 26.29, lon: 73.02, isJunction: true, aliases: ["जोधपुर", "jodhpur"] },
  { name: "Udaipur", stationCode: "UDZ", lat: 24.58, lon: 73.68, isJunction: false, aliases: ["उदयपुर", "udaipur"] },
  { name: "Guntur", stationCode: "GNT", lat: 16.30, lon: 80.44, isJunction: false, aliases: ["गुंटूर", "guntur"] },
  { name: "Gorakhpur", stationCode: "GKP", lat: 26.76, lon: 83.37, isJunction: true, aliases: ["गोरखपुर", "gorakhpur", "gorakhapur"] },
  { name: "Gwalior", stationCode: "GWL", lat: 26.22, lon: 78.18, isJunction: false, aliases: ["ग्वालियर", "gwalior"] },
  { name: "Agra", stationCode: "AGC", lat: 27.18, lon: 78.02, isJunction: true, aliases: ["आगरा", "agra", "aagara"] },
  { name: "Kanpur", stationCode: "CNB", lat: 26.45, lon: 80.35, isJunction: true, aliases: ["कानपुर", "kanpur", "kanapur"] },
  { name: "Itarsi", stationCode: "ET", lat: 22.61, lon: 77.76, isJunction: true, aliases: ["इटारसी", "itarsi"] },
  { name: "Guntakal", stationCode: "GTL", lat: 15.17, lon: 77.37, isJunction: true, aliases: ["गुंतकल", "guntakal"] },
  { name: "Renigunta", stationCode: "RU", lat: 13.65, lon: 79.51, isJunction: true, aliases: ["रेनिगुंटा", "renigunta"] },
  { name: "Katpadi", stationCode: "KPD", lat: 12.97, lon: 79.14, isJunction: true, aliases: ["काटपाडी", "katpadi"] },
  { name: "Mughalsarai", stationCode: "DDU", lat: 25.28, lon: 83.12, isJunction: true, aliases: ["Deen Dayal Upadhyaya Jn", "मुगलसराय", "पंडित दीनदयाल उपाध्याय", "mughalsarai", "ddu"] },
  { name: "Gurugram", stationCode: "GGN", lat: 28.46, lon: 77.03, isJunction: false, aliases: ["Gurgaon", "गुरुग्राम", "गुड़गांव", "gurgaon", "gurugram"] },
  { name: "Goa", stationCode: "MAO", lat: 15.29, lon: 73.96, isJunction: true, aliases: ["Madgaon", "Panaji", "गोवा", "मडगांव", "goa", "madgaon"] },
  { name: "Bihar", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: ["बिहार", "bihar"] } // State alias fallback
];
