export type CityEntry = {
  name: string;
  stationCode: string;
  lat: number;
  lon: number;
  isJunction: boolean;
  aliases: string[];
};

export const CITIES: CityEntry[] = [
  { name: "Delhi", stationCode: "NDLS", lat: 28.64, lon: 77.22, isJunction: true, aliases: ["New Delhi", "Dilli"] },
  { name: "Mumbai", stationCode: "BCT", lat: 18.94, lon: 72.83, isJunction: true, aliases: ["Bombay", "Mumbai Central", "CSMT", "Dadar"] },
  { name: "Bengaluru", stationCode: "SBC", lat: 12.98, lon: 77.57, isJunction: true, aliases: ["Bangalore", "Banglore", "Bengalore"] },
  { name: "Chennai", stationCode: "MAS", lat: 13.08, lon: 80.27, isJunction: true, aliases: ["Madras"] },
  { name: "Kolkata", stationCode: "HWH", lat: 22.58, lon: 88.34, isJunction: true, aliases: ["Calcutta", "Howrah"] },
  { name: "Hyderabad", stationCode: "HYB", lat: 17.39, lon: 78.49, isJunction: true, aliases: ["Secunderabad"] },
  { name: "Pune", stationCode: "PUNE", lat: 18.53, lon: 73.87, isJunction: true, aliases: ["Poona"] },
  { name: "Ahmedabad", stationCode: "ADI", lat: 23.02, lon: 72.57, isJunction: true, aliases: ["Amdavad", "Ahmadabad"] },
  { name: "Jaipur", stationCode: "JP", lat: 26.91, lon: 75.79, isJunction: true, aliases: [] },
  { name: "Patna", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: ["Patna Jn"] },
  { name: "Lucknow", stationCode: "LKO", lat: 26.85, lon: 80.95, isJunction: true, aliases: ["Lucknau"] },
  { name: "Varanasi", stationCode: "BSB", lat: 25.32, lon: 82.99, isJunction: true, aliases: ["Benares", "Banaras", "Kashi"] },
  { name: "Kochi", stationCode: "ERS", lat: 9.97, lon: 76.28, isJunction: true, aliases: ["Cochin", "Ernakulam"] },
  { name: "Thiruvananthapuram", stationCode: "TVC", lat: 8.49, lon: 76.95, isJunction: true, aliases: ["Trivandrum"] },
  { name: "Nagpur", stationCode: "NGP", lat: 21.15, lon: 79.09, isJunction: true, aliases: [] },
  { name: "Bhopal", stationCode: "BPL", lat: 23.26, lon: 77.41, isJunction: true, aliases: [] },
  { name: "Indore", stationCode: "INDB", lat: 22.72, lon: 75.86, isJunction: true, aliases: [] },
  { name: "Surat", stationCode: "ST", lat: 21.17, lon: 72.83, isJunction: true, aliases: [] },
  { name: "Vadodara", stationCode: "BRC", lat: 22.31, lon: 73.18, isJunction: true, aliases: ["Baroda"] },
  { name: "Kota", stationCode: "KOTA", lat: 25.21, lon: 75.86, isJunction: true, aliases: [] },
  { name: "Ratlam", stationCode: "RTM", lat: 23.33, lon: 75.04, isJunction: true, aliases: [] },
  { name: "Jhansi", stationCode: "JHS", lat: 25.45, lon: 78.57, isJunction: true, aliases: [] },
  { name: "Allahabad", stationCode: "PRYJ", lat: 25.44, lon: 81.85, isJunction: true, aliases: ["Prayagraj"] },
  { name: "Guwahati", stationCode: "GHY", lat: 26.17, lon: 91.75, isJunction: true, aliases: [] },
  { name: "Bhubaneswar", stationCode: "BBS", lat: 20.30, lon: 85.82, isJunction: true, aliases: [] },
  { name: "Visakhapatnam", stationCode: "VSKP", lat: 17.68, lon: 83.22, isJunction: true, aliases: ["Vizag"] },
  { name: "Vijayawada", stationCode: "BZA", lat: 16.51, lon: 80.65, isJunction: true, aliases: [] },
  { name: "Coimbatore", stationCode: "CBE", lat: 11.00, lon: 76.97, isJunction: true, aliases: [] },
  { name: "Madurai", stationCode: "MDU", lat: 9.93, lon: 78.12, isJunction: true, aliases: [] },
  { name: "Mysuru", stationCode: "MYS", lat: 12.30, lon: 76.65, isJunction: false, aliases: ["Mysore"] },
  { name: "Nashik", stationCode: "NK", lat: 20.00, lon: 73.79, isJunction: false, aliases: [] },
  { name: "Rajkot", stationCode: "RJT", lat: 22.30, lon: 70.80, isJunction: false, aliases: [] },
  { name: "Amritsar", stationCode: "ASR", lat: 31.63, lon: 74.87, isJunction: true, aliases: [] },
  { name: "Chandigarh", stationCode: "CDG", lat: 30.74, lon: 76.79, isJunction: false, aliases: [] },
  { name: "Dehradun", stationCode: "DDN", lat: 30.32, lon: 78.03, isJunction: false, aliases: [] },
  { name: "Raipur", stationCode: "R", lat: 21.25, lon: 81.63, isJunction: true, aliases: [] },
  { name: "Ranchi", stationCode: "RNC", lat: 23.34, lon: 85.31, isJunction: false, aliases: [] },
  { name: "Jodhpur", stationCode: "JU", lat: 26.29, lon: 73.02, isJunction: true, aliases: [] },
  { name: "Udaipur", stationCode: "UDZ", lat: 24.58, lon: 73.68, isJunction: false, aliases: [] },
  { name: "Guntur", stationCode: "GNT", lat: 16.30, lon: 80.44, isJunction: false, aliases: [] },
  { name: "Gorakhpur", stationCode: "GKP", lat: 26.76, lon: 83.37, isJunction: true, aliases: [] },
  { name: "Gwalior", stationCode: "GWL", lat: 26.22, lon: 78.18, isJunction: false, aliases: [] },
  { name: "Agra", stationCode: "AGC", lat: 27.18, lon: 78.02, isJunction: true, aliases: [] },
  { name: "Kanpur", stationCode: "CNB", lat: 26.45, lon: 80.35, isJunction: true, aliases: [] },
  { name: "Itarsi", stationCode: "ET", lat: 22.61, lon: 77.76, isJunction: true, aliases: [] },
  { name: "Guntakal", stationCode: "GTL", lat: 15.17, lon: 77.37, isJunction: true, aliases: [] },
  { name: "Renigunta", stationCode: "RU", lat: 13.65, lon: 79.51, isJunction: true, aliases: [] },
  { name: "Katpadi", stationCode: "KPD", lat: 12.97, lon: 79.14, isJunction: true, aliases: [] },
  { name: "Mughalsarai", stationCode: "DDU", lat: 25.28, lon: 83.12, isJunction: true, aliases: ["Deen Dayal Upadhyaya Jn"] },
  { name: "Gurugram", stationCode: "GGN", lat: 28.46, lon: 77.03, isJunction: false, aliases: ["Gurgaon"] },
  { name: "Goa", stationCode: "MAO", lat: 15.29, lon: 73.96, isJunction: true, aliases: ["Madgaon", "Panaji"] },
  { name: "Bihar", stationCode: "PNBE", lat: 25.61, lon: 85.14, isJunction: true, aliases: [] } // State alias fallback
];
