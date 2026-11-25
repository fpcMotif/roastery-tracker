export type CountryCode =
  | "US" | "CA" | "NO" | "DK" | "SE" | "DE" | "GB" | "NL" | "IT" | "ES"
  | "AU" | "JP" | "KR" | "TW" | "CN";

export type Roastery = {
  id: string;
  name: string;
  city: string;
  country: CountryCode;
  shop?: string;
  note?: string;
};

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  US: "United States",
  CA: "Canada",
  NO: "Norway",
  DK: "Denmark",
  SE: "Sweden",
  DE: "Germany",
  GB: "United Kingdom",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  AU: "Australia",
  JP: "Japan",
  KR: "South Korea",
  TW: "Taiwan",
  CN: "China",
};

export const ROASTERIES: Roastery[] = [
  { id: "sey", shop: "seycoffee.com", name: "SEY Coffee", city: "New York (Brooklyn)", country: "US", note: "Very light, Nordic-style roasts" },
  { id: "onyx", shop: "onyxcoffeelab.com", name: "Onyx Coffee Lab", city: "Rogers, Arkansas", country: "US" },
  { id: "heart", shop: "heartroasters.com", name: "Heart Coffee Roasters", city: "Portland", country: "US" },
  { id: "coava", name: "Coava Coffee Roasters", city: "Portland", country: "US" },
  { id: "stumptown", name: "Stumptown Coffee Roasters", city: "Portland", country: "US" },
  { id: "sightglass", shop: "sightglasscoffee.com", name: "Sightglass Coffee", city: "San Francisco", country: "US" },
  { id: "blue-bottle", name: "Blue Bottle Coffee", city: "Oakland", country: "US" },
  { id: "counter-culture", shop: "counterculturecoffee.com", name: "Counter Culture Coffee", city: "Durham, North Carolina", country: "US" },
  { id: "intelligentsia", shop: "intelligentsia.com", name: "Intelligentsia Coffee", city: "Chicago", country: "US" },
  { id: "george-howell", shop: "georgehowellcoffee.com", name: "George Howell Coffee", city: "Boston area", country: "US" },
  { id: "black-and-white", name: "Black & White Coffee Roasters", city: "Wake Forest, North Carolina", country: "US" },
  { id: "passenger", shop: "passengercoffee.com", name: "Passenger Coffee", city: "Lancaster, Pennsylvania", country: "US" },
  { id: "phil-and-sebastian", name: "Phil & Sebastian Coffee Roasters", city: "Calgary", country: "CA" },
  { id: "pilot", name: "Pilot Coffee Roasters", city: "Toronto", country: "CA" },
  { id: "tim-wendelboe", shop: "timwendelboe.no", name: "Tim Wendelboe", city: "Oslo", country: "NO", note: "Nordic light-roast pioneer" },
  { id: "fuglen", name: "Fuglen", city: "Oslo", country: "NO", note: "Also runs cafés in Tokyo" },
  { id: "supreme-roastworks", name: "Supreme Roastworks", city: "Oslo", country: "NO" },
  { id: "la-cabra", shop: "lacabra.com", name: "La Cabra", city: "Aarhus", country: "DK" },
  { id: "coffee-collective", shop: "coffeecollective.dk", name: "The Coffee Collective", city: "Copenhagen", country: "DK" },
  { id: "april", name: "April Coffee Roasters", city: "Copenhagen", country: "DK" },
  { id: "prolog", name: "Prolog Coffee", city: "Copenhagen", country: "DK" },
  { id: "drop", shop: "dropcoffee.com", name: "Drop Coffee", city: "Stockholm", country: "SE" },
  { id: "koppi", name: "Koppi", city: "Helsingborg", country: "SE" },
  { id: "the-barn", shop: "thebarn.de", name: "The Barn", city: "Berlin", country: "DE" },
  { id: "five-elephant", name: "Five Elephant", city: "Berlin", country: "DE" },
  { id: "square-mile", shop: "squaremilecoffee.com", name: "Square Mile Coffee Roasters", city: "London", country: "GB" },
  { id: "friedhats", name: "Friedhats", city: "Amsterdam", country: "NL" },
  { id: "manhattan", name: "Manhattan Coffee Roasters", city: "Rotterdam", country: "NL" },
  { id: "gardelli", name: "Gardelli Specialty Coffees", city: "Forlì", country: "IT" },
  { id: "nomad", name: "Nomad Coffee", city: "Barcelona", country: "ES" },
  { id: "ona", shop: "onacoffee.com.au", name: "Ona Coffee", city: "Canberra", country: "AU" },
  { id: "market-lane", shop: "marketlane.com.au", name: "Market Lane Coffee", city: "Melbourne", country: "AU" },
  { id: "proud-mary", shop: "proudmarycoffee.com.au", name: "Proud Mary", city: "Melbourne", country: "AU" },
  { id: "seven-seeds", name: "Seven Seeds", city: "Melbourne", country: "AU" },
  { id: "single-o", name: "Single O", city: "Sydney", country: "AU" },
  { id: "glitch", name: "Glitch Coffee & Roasters", city: "Tokyo", country: "JP", note: "Light roasts, Jimbocho" },
  { id: "onibus", shop: "onibuscoffee.com", name: "Onibus Coffee", city: "Tokyo", country: "JP", note: "Nakameguro" },
  { id: "koffee-mameya", name: "Koffee Mameya", city: "Tokyo", country: "JP", note: "Omotesando bean shop" },
  { id: "leaves", name: "Leaves Coffee Roasters", city: "Tokyo", country: "JP" },
  { id: "light-up", shop: "lightupcoffee.com", name: "Light Up Coffee", city: "Tokyo", country: "JP", note: "Kichijoji" },
  { id: "streamer", name: "Streamer Coffee Company", city: "Tokyo", country: "JP" },
  { id: "switch", name: "Switch Coffee Tokyo", city: "Tokyo", country: "JP" },
  { id: "philocoffea", name: "Philocoffea", city: "Funabashi, Chiba", country: "JP", note: "Founded by 2016 World Brewers Cup champion Tetsu Kasuya" },
  { id: "maruyama", name: "Maruyama Coffee", city: "Karuizawa, Nagano", country: "JP" },
  { id: "weekenders", name: "Weekenders Coffee", city: "Kyoto", country: "JP" },
  { id: "arabica", name: "% Arabica", city: "Kyoto", country: "JP" },
  { id: "kurasu", shop: "kurasu.kyoto", name: "Kurasu", city: "Kyoto", country: "JP" },
  { id: "unir", name: "Unir", city: "Kyoto", country: "JP" },
  { id: "lilo", name: "Lilo Coffee Roasters", city: "Osaka", country: "JP" },
  { id: "fritz", name: "Fritz Coffee Company", city: "Seoul", country: "KR" },
  { id: "coffee-libre", name: "Coffee Libre", city: "Seoul", country: "KR" },
  { id: "anthracite", name: "Anthracite Coffee Roasters", city: "Seoul", country: "KR" },
  { id: "center", name: "Center Coffee", city: "Seoul", country: "KR", note: "Seongsu" },
  { id: "namusairo", name: "Namusairo", city: "Seoul", country: "KR" },
  { id: "felt", name: "Felt Coffee", city: "Seoul", country: "KR" },
  { id: "bean-brothers", name: "Bean Brothers", city: "Seoul", country: "KR" },
  { id: "manufact", name: "Manufact Coffee", city: "Seoul", country: "KR" },
  { id: "momos", name: "Momos Coffee", city: "Busan", country: "KR", note: "Home of 2019 World Barista Champion Jooyeon Jeon" },
  { id: "terarosa", name: "Terarosa", city: "Gangneung", country: "KR" },
  { id: "simple-kaffa", name: "Simple Kaffa", city: "Taipei", country: "TW", note: "Founded by 2016 World Barista Champion Berg Wu" },
  { id: "seesaw", name: "Seesaw Coffee", city: "Shanghai", country: "CN" },
];
