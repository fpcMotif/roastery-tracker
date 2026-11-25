export type CountryCode =
  | "US" | "CA" | "NO" | "DK" | "SE" | "DE" | "GB" | "NL" | "IT" | "ES"
  | "AU" | "JP" | "KR" | "TW";

export type Feed =
  | { kind: "shopify"; host: string }
  | { kind: "woocommerce"; host: string }
  | { kind: "pages"; lists: string[]; product: RegExp; currency: string };

export type Roastery = {
  id: string;
  name: string;
  city: string;
  country: CountryCode;
  feed?: Feed;
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
};

const shopify = (host: string): Feed => ({ kind: "shopify", host });
const CAFE24_PRODUCT = /\/product\/(?:detail\.html\?product_no=\d+|[^/?#"]+\/\d+\/?$)/;

export const ROASTERIES: Roastery[] = [
  { id: "sey", feed: shopify("seycoffee.com"), name: "SEY Coffee", city: "New York (Brooklyn)", country: "US", note: "Very light, Nordic-style roasts" },
  { id: "onyx", feed: shopify("onyxcoffeelab.com"), name: "Onyx Coffee Lab", city: "Rogers, Arkansas", country: "US" },
  { id: "heart", feed: shopify("heartroasters.com"), name: "Heart Coffee Roasters", city: "Portland", country: "US" },
  { id: "coava", feed: shopify("shop.coavacoffee.com"), name: "Coava Coffee Roasters", city: "Portland", country: "US" },
  { id: "stumptown", feed: shopify("www.stumptowncoffee.com"), name: "Stumptown Coffee Roasters", city: "Portland", country: "US" },
  { id: "sightglass", feed: shopify("sightglasscoffee.com"), name: "Sightglass Coffee", city: "San Francisco", country: "US" },
  { id: "counter-culture", feed: shopify("counterculturecoffee.com"), name: "Counter Culture Coffee", city: "Durham, North Carolina", country: "US" },
  { id: "intelligentsia", feed: shopify("intelligentsia.com"), name: "Intelligentsia Coffee", city: "Chicago", country: "US" },
  { id: "george-howell", feed: shopify("georgehowellcoffee.com"), name: "George Howell Coffee", city: "Boston area", country: "US" },
  { id: "black-and-white", feed: shopify("www.blackwhiteroasters.com"), name: "Black & White Coffee Roasters", city: "Wake Forest, North Carolina", country: "US" },
  { id: "passenger", feed: shopify("passengercoffee.com"), name: "Passenger Coffee", city: "Lancaster, Pennsylvania", country: "US" },
  { id: "phil-and-sebastian", feed: shopify("philsebastian.com"), name: "Phil & Sebastian Coffee Roasters", city: "Calgary", country: "CA" },
  { id: "pilot", feed: shopify("pilotcoffeeroasters.com"), name: "Pilot Coffee Roasters", city: "Toronto", country: "CA" },
  { id: "tim-wendelboe", feed: shopify("timwendelboe.no"), name: "Tim Wendelboe", city: "Oslo", country: "NO", note: "Nordic light-roast pioneer" },
  { id: "fuglen", feed: shopify("fuglencoffee.jp"), name: "Fuglen", city: "Oslo", country: "NO", note: "Prices from the Tokyo shop" },
  { id: "supreme-roastworks", feed: shopify("srw.no"), name: "Supreme Roastworks", city: "Oslo", country: "NO" },
  { id: "la-cabra", feed: shopify("lacabra.com"), name: "La Cabra", city: "Aarhus", country: "DK" },
  { id: "coffee-collective", feed: shopify("coffeecollective.dk"), name: "The Coffee Collective", city: "Copenhagen", country: "DK" },
  { id: "april", name: "April Coffee Roasters", city: "Copenhagen", country: "DK" },
  { id: "prolog", feed: shopify("www.prologcoffee.com"), name: "Prolog Coffee", city: "Copenhagen", country: "DK" },
  { id: "drop", feed: shopify("dropcoffee.com"), name: "Drop Coffee", city: "Stockholm", country: "SE" },
  { id: "koppi", feed: shopify("koppi.se"), name: "Koppi", city: "Helsingborg", country: "SE" },
  { id: "the-barn", feed: shopify("thebarn.de"), name: "The Barn", city: "Berlin", country: "DE" },
  { id: "five-elephant", feed: shopify("www.fiveelephant.com"), name: "Five Elephant", city: "Berlin", country: "DE" },
  { id: "square-mile", feed: shopify("squaremilecoffee.com"), name: "Square Mile Coffee Roasters", city: "London", country: "GB" },
  { id: "friedhats", feed: shopify("friedhats-coffee.myshopify.com"), name: "Friedhats", city: "Amsterdam", country: "NL" },
  { id: "manhattan", feed: { kind: "woocommerce", host: "manhattancoffeeroasters.com" }, name: "Manhattan Coffee Roasters", city: "Rotterdam", country: "NL" },
  {
    id: "gardelli",
    feed: { kind: "pages", lists: ["https://shop.gardellicoffee.com/14-coffees"], product: /\/coffees\/\d+-[^/?#]+$/, currency: "EUR" },
    name: "Gardelli Specialty Coffees",
    city: "Forlì",
    country: "IT",
  },
  { id: "nomad", feed: shopify("nomadcoffee.es"), name: "Nomad Coffee", city: "Barcelona", country: "ES" },
  { id: "ona", feed: shopify("onacoffee.com.au"), name: "Ona Coffee", city: "Canberra", country: "AU" },
  { id: "market-lane", feed: shopify("marketlane.com.au"), name: "Market Lane Coffee", city: "Melbourne", country: "AU" },
  { id: "proud-mary", feed: shopify("proudmarycoffee.com.au"), name: "Proud Mary", city: "Melbourne", country: "AU" },
  { id: "seven-seeds", feed: shopify("sevenseeds.com.au"), name: "Seven Seeds", city: "Melbourne", country: "AU" },
  { id: "single-o", feed: shopify("singleo.com.au"), name: "Single O", city: "Sydney", country: "AU" },
  { id: "glitch", feed: shopify("shop.glitchcoffee.com"), name: "Glitch Coffee & Roasters", city: "Tokyo", country: "JP", note: "Light roasts, Jimbocho" },
  { id: "onibus", feed: shopify("onibuscoffee.com"), name: "Onibus Coffee", city: "Tokyo", country: "JP", note: "Nakameguro" },
  { id: "koffee-mameya", name: "Koffee Mameya", city: "Tokyo", country: "JP", note: "Omotesando bean shop" },
  { id: "leaves", name: "Leaves Coffee Roasters", city: "Tokyo", country: "JP" },
  { id: "light-up", feed: shopify("lightupcoffee.com"), name: "Light Up Coffee", city: "Tokyo", country: "JP", note: "Kichijoji" },
  { id: "streamer", name: "Streamer Coffee Company", city: "Tokyo", country: "JP" },
  { id: "switch", name: "Switch Coffee Tokyo", city: "Tokyo", country: "JP" },
  { id: "philocoffea", feed: shopify("philocoffea.com"), name: "Philocoffea", city: "Funabashi, Chiba", country: "JP", note: "Founded by 2016 World Brewers Cup champion Tetsu Kasuya" },
  { id: "maruyama", name: "Maruyama Coffee", city: "Karuizawa, Nagano", country: "JP" },
  { id: "weekenders", name: "Weekenders Coffee", city: "Kyoto", country: "JP" },
  { id: "arabica", name: "% Arabica", city: "Kyoto", country: "JP" },
  { id: "kurasu", feed: shopify("kurasu.kyoto"), name: "Kurasu", city: "Kyoto", country: "JP" },
  { id: "unir", name: "Unir", city: "Kyoto", country: "JP" },
  { id: "lilo", name: "Lilo Coffee Roasters", city: "Osaka", country: "JP" },
  {
    id: "fritz",
    feed: { kind: "pages", lists: ["https://fritz.co.kr/product/list.html?cate_no=24", "https://fritz.co.kr/product/list.html?cate_no=25"], product: CAFE24_PRODUCT, currency: "KRW" },
    name: "Fritz Coffee Company",
    city: "Seoul",
    country: "KR",
  },
  {
    id: "coffee-libre",
    feed: { kind: "pages", lists: ["https://coffeelibre.kr/product/list.html?cate_no=47"], product: CAFE24_PRODUCT, currency: "KRW" },
    name: "Coffee Libre",
    city: "Seoul",
    country: "KR",
  },
  { id: "anthracite", name: "Anthracite Coffee Roasters", city: "Seoul", country: "KR" },
  { id: "center", name: "Center Coffee", city: "Seoul", country: "KR", note: "Seongsu" },
  { id: "namusairo", name: "Namusairo", city: "Seoul", country: "KR" },
  {
    id: "felt",
    feed: { kind: "pages", lists: ["https://feltcoffee.com/sitemap.xml"], product: CAFE24_PRODUCT, currency: "KRW" },
    name: "Felt Coffee",
    city: "Seoul",
    country: "KR",
  },
  { id: "bean-brothers", name: "Bean Brothers", city: "Seoul", country: "KR" },
  { id: "manufact", name: "Manufact Coffee", city: "Seoul", country: "KR" },
  {
    id: "momos",
    feed: { kind: "pages", lists: ["https://momos.co.kr/Product_CoffeeBeans"], product: /\?idx=\d+/, currency: "KRW" },
    name: "Momos Coffee",
    city: "Busan",
    country: "KR",
    note: "Home of 2019 World Barista Champion Jooyeon Jeon",
  },
  { id: "terarosa", name: "Terarosa", city: "Gangneung", country: "KR" },
  { id: "simple-kaffa", name: "Simple Kaffa", city: "Taipei", country: "TW", note: "Founded by 2016 World Barista Champion Berg Wu" },
];
