const P = "images/products/";
const CLOTHES = ["S", "M", "L", "XL"];
const KIDS = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"];
const MEN_SHOES = ["40", "41", "42", "43", "44", "45"];
const WOMEN_SHOES = ["36", "37", "38", "39", "40"];
const item = (file, name, category, price, sizes, description) => {
  const shoe = category === "Shoes";
  return {
    id: "local-" + file.replace(/\.\w+$/, ""),
    name, category, price, stock: 10, status: "Active",
    images: [P + file],
    sizes: shoe ? [] : sizes, shoeSizes: shoe ? sizes : [], colours: [],
    description
  };
};

const men = [
  item("mn.jpg", "Tan Jacket & Beige Chinos Set", "Men", 38000, CLOTHES, "Smart-casual jacket with a crisp white tee and beige chinos."),
  item("mn1.jpg", "Brown Corduroy Jacket", "Men", 32000, CLOTHES, "Soft corduroy jacket with a relaxed fit, perfect for cool evenings."),
  item("mn2.jpg", "Sky Blue Double-Breasted Blazer", "Men", 55000, CLOTHES, "Sharp double-breasted blazer for weddings, parties and the office."),
  item("striped-polo.jpg", "Striped Knit Polo", "Men", 12000, CLOTHES, "Comfortable knit polo with contrast striped trim."),
  item("blue-jeans.jpg", "Slim Fit Jeans", "Men", 28000, CLOTHES, "Classic blue slim fit jeans with a little stretch.")
];
const women = [
  item("wm.jpg", "Brown Wide-Leg Pants Set", "Women", 26000, CLOTHES, "Matching cropped tee and wide-leg pants. Easy, comfortable and stylish."),
  item("wm1.jpg", "Pink Polo Bodycon Dress", "Women", 18000, CLOTHES, "Fitted ribbed polo dress with a button front."),
  item("wm2.jpg", "Pink Floral Wrap Dress", "Women", 22000, CLOTHES, "Light floral wrap dress with flowy sleeves and a flared skirt."),
  item("wm3.jpg", "Blue Floral Puff-Sleeve Top", "Women", 15000, CLOTHES, "Pretty floral top with puff sleeves. Pairs well with jeans or trousers."),
  item("denim-jacket-set.jpg", "Denim Jacket & Jeans Set", "Women", 35000, CLOTHES, "Light-wash denim jacket and flared jeans.")
];
const kids = [
  item("ki.jpg", "Bow Tee & Cargo Pants Set", "Kids", 14000, KIDS, "Cute bow tee with soft blue cargo pants."),
  item("ki1.jpg", "Floral Denim Dungaree Set", "Kids", 16000, KIDS, "Pink bow tee with denim dungaree shorts and flower details."),
  item("ki2.jpg", "Denim Dungaree Shorts", "Kids", 15000, KIDS, "Hard-wearing denim dungaree shorts for play days."),
  item("ki3.jpg", "Washed Grey Cargo Pants", "Kids", 13000, KIDS, "Roomy cargo pants with an elastic waist."),
  item("camo-kids-set.jpg", "Green Jacket & Camo Cargo Set", "Kids", 20000, KIDS, "Bomber-style jacket with camo cargo pants.")
];
const shoes = [
  item("sh1.jpg", "Cream Gum-Sole Sneakers", "Shoes", 30000, MEN_SHOES, "Clean cream sneakers with a warm gum sole."),
  item("sh2.jpg", "Tan Lace-Up Sneakers", "Shoes", 32000, WOMEN_SHOES, "Neutral tan lace-ups that go with everything."),
  item("sh4.jpg", "Olive Green Sneakers", "Shoes", 34000, MEN_SHOES, "Olive and white chunky sneakers with extra cushioning."),
  item("leather-casual-shoes.jpg", "Leather Casual Shoes", "Shoes", 45000, MEN_SHOES, "Brown leather casual lace-ups."),
  item("suede-slip-ons.jpg", "Suede Slip-Ons", "Shoes", 24000, MEN_SHOES, "Easy suede slip-ons with a grippy sole."),
  item("cream-runner-sneakers.jpg", "Cream Runner Sneakers", "Shoes", 38000, WOMEN_SHOES, "Lightweight cream runners for daily wear."),
  item("denim-low-sneakers.jpg", "Denim Low Sneakers", "Shoes", 40000, MEN_SHOES, "Low-top sneakers in a light denim finish."),
  item("grey-orange-sneakers.jpg", "Grey & Orange Sneakers", "Shoes", 42000, MEN_SHOES, "Grey sneakers with an orange accent."),
  item("trail-sneakers.jpg", "Trail Sneakers", "Shoes", 48000, MEN_SHOES, "Rugged trail sneakers with a bold sole."),
  item("white-stripe-sneakers.jpg", "White Stripe Sneakers", "Shoes", 35000, MEN_SHOES, "Classic white sneakers with black stripes.")
];

const lists = [men, women, kids, shoes];
const longest = Math.max(...lists.map(list => list.length));
export const CATALOG = [];
for (let i = 0; i < longest; i++) lists.forEach(list => list[i] && CATALOG.push(list[i]));
