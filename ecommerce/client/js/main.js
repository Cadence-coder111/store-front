import { db, esc, naira, PAYSTACK_KEY } from "./firebase.js";
import { collection, getDocs, addDoc, updateDoc, doc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------- Built-in products (edit names/prices/stock here) ---------- */
// Built-in products shown on the Men / Women / Kids / Shoes pages.
// Products you add in the admin page (Firestore) show first; these fill in after them.
// To change a name, price or stock, just edit it here. To add a product, copy a line.
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

// Mix the categories so "New arrivals" on the home page shows a bit of everything.
const lists = [men, women, kids, shoes], longest = Math.max(...lists.map(l => l.length));
const CATALOG = [];
for (let i = 0; i < longest; i++) lists.forEach(l => l[i] && CATALOG.push(l[i]));

const $ = s => document.querySelector(s);
const img = (src, alt) => src ? `<img class="card-img" src="${esc(src)}" alt="${esc(alt)}">` : "Image";
const openCart = () => window.bootstrap && bootstrap.Offcanvas.getOrCreateInstance("#miniCart").show();

/* ---------- Cart (kept in the browser) ---------- */
let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem("gb_cart"));
  cart = Array.isArray(savedCart) ? savedCart.map(i => ({
    ...i,
    qty: Number.isInteger(i.qty) && i.qty > 0 ? i.qty : 1
  })) : [];
} catch (e) { cart = []; }
const keyOf = i => [i.id, i.size, i.colour].join("|");
const subtotal = () => cart.reduce((t, i) => t + i.price * i.qty, 0);
const save = () => { localStorage.setItem("gb_cart", JSON.stringify(cart)); drawCart(); };

function addToCart(p, size = "", colour = "", qty = 1) {
  const item = { id: p.id, name: p.name, price: p.price, image: (p.images || [])[0] || "", size, colour, qty: 0, stock: p.stock };
  let found = cart.find(i => keyOf(i) === keyOf(item));
  if (!found) {
    cart.push(item);
    found = item;
  }
  const stock = Number.isFinite(p.stock) ? p.stock : found.stock;
  found.qty = Number.isFinite(stock) ? Math.min(found.qty + qty, stock) : found.qty + qty;
  found.stock = Number.isFinite(stock) ? stock : null;
  save(); openCart();
}

function drawCart() {
  const variant = i => esc([i.size, i.colour].filter(Boolean).join(", "));
  const count = $("#cart-count");
  if (count) count.textContent = cart.reduce((t, i) => t + i.qty, 0);

  const mini = $("#mini-cart-items");
  if (mini) {
    mini.innerHTML = cart.length ? cart.map(i => `<div class="d-flex gap-3 mb-3"><div class="ph ph-sm">${img(i.image, i.name)}</div><div class="flex-grow-1"><div class="fw-semibold">${esc(i.name)}</div><div class="small text-muted">${variant(i)} Qty ${i.qty}</div></div><div class="fw-bold">${naira(i.price * i.qty)}</div></div>`).join("") : '<p class="text-muted">Your cart is empty.</p>';
    $("#mini-cart-subtotal").textContent = naira(subtotal());
  }

  const rows = $("#cart-items");
  if (rows) {
    rows.innerHTML = cart.length ? cart.map(i => `<tr data-key="${esc(keyOf(i))}"><td><div class="d-flex gap-3 align-items-center"><div class="ph ph-sm">${img(i.image, i.name)}</div><div><div class="fw-semibold">${esc(i.name)}</div><div class="small text-muted">${variant(i)}</div></div></div></td><td>${naira(i.price)}</td><td><input class="form-control qty" type="number" min="1" ${Number.isFinite(i.stock) ? `max="${i.stock}"` : ""} value="${i.qty}" data-action="update-qty" aria-label="Quantity"></td><td class="fw-bold">${naira(i.price * i.qty)}</td><td><button class="btn btn-sm btn-outline-brand" data-action="remove-item">Remove</button></td></tr>`).join("") : '<tr><td colspan="5" class="text-center text-muted py-4">Your cart is empty. <a href="shop.html">Start shopping</a></td></tr>';
    $("#sum-subtotal").textContent = naira(subtotal());
    $("#sum-total").textContent = naira(subtotal());
  }
  drawCheckout();
}

document.addEventListener("click", e => {
  const row = e.target.closest("tr[data-key]");
  if (row && e.target.closest('[data-action="remove-item"]')) { cart = cart.filter(i => keyOf(i) !== row.dataset.key); save(); return; }
  const add = e.target.closest('.product-card [data-action="add-to-cart"]');
  if (add) {
    let p = (cache || CATALOG).find(x => x.id === add.dataset.productId);
    if (!p) {
      const card = add.closest(".product-card");
      const priceText = card?.querySelector(".price")?.textContent || "";
      const image = card?.querySelector(".card-img")?.getAttribute("src") || "";
      const price = Number(priceText.replace(/[^\d.-]/g, ""));
      const name = card?.querySelector(".fw-semibold")?.textContent?.trim();
      if (!add.dataset.productId || !name || !Number.isFinite(price)) {
        return alert("This product's details are unavailable, so it could not be added to your cart.");
      }
      p = {
        id: add.dataset.productId,
        name,
        price,
        images: image ? [image] : [],
        stock: null
      };
    }
    if ((p.sizes || []).length || (p.shoeSizes || []).length || (p.colours || []).length) location.href = "product.html?id=" + encodeURIComponent(p.id);
    else addToCart(p);
  }
});
document.addEventListener("change", e => {
  const row = e.target.closest("tr[data-key]");
  if (!row || !e.target.matches('[data-action="update-qty"]')) return;
  const item = cart.find(i => keyOf(i) === row.dataset.key);
  const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
  item.qty = Number.isFinite(item.stock) ? Math.min(qty, item.stock) : qty;
  save();
});

/* ---------- Products from Firebase ---------- */
let cache;
let productsError;
async function products() {
  if (!cache) {
    let live = [];
    try {
      const snap = await Promise.race([getDocs(collection(db, "products")), new Promise((_, no) => setTimeout(() => no(new Error("Firestore took too long to answer")), 7000))]);
      const createdAt = value => {
        if (value && typeof value.toMillis === "function") return value.toMillis();
        const time = value instanceof Date ? value.getTime() : Date.parse(value);
        return Number.isFinite(time) ? time : 0;
      };
      live = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.status !== "Draft")
        .sort((a, b) => createdAt(b.createdAt) - createdAt(a.createdAt));
    } catch (err) { productsError = err; console.error(err); }
    // built-in products come after live ones (skipping any picture a live product already uses)
    const used = new Set(live.flatMap(p => p.images || []));
    cache = [...live, ...CATALOG.filter(p => !used.has(p.images[0]))];
  }
  return cache;
}

const card = p => {
  const link = "product.html?id=" + encodeURIComponent(p.id);
  return `<div class="col-6 col-md-4 col-lg-3"><div class="product-card" data-product-id="${esc(p.id)}"><a href="${link}" class="text-decoration-none text-reset"><div class="ph">${img((p.images || [])[0], p.name)}</div></a><div class="p-3"><a href="${link}" class="text-decoration-none text-reset"><div class="fw-semibold">${esc(p.name)}</div></a><div class="price my-1">${naira(p.price)}</div>${p.stock > 0 ? `<button class="btn btn-brand btn-sm w-100" data-action="add-to-cart" data-product-id="${esc(p.id)}">Add to cart</button>` : '<button class="btn btn-outline-brand btn-sm w-100" disabled>Out of stock</button>'}</div></div></div>`;
};
const grid = (sel, list) => { const el = $(sel); if (el) el.innerHTML = list.length ? list.map(card).join("") : '<p class="text-muted">No products yet.</p>'; };

function paint(all) {
    if ($("#new-arrivals") && all.length) {
      grid("#new-arrivals", all.slice(0, 4));
      const more = all.slice(4, 8);
      grid("#best-sellers", more);
      if (!more.length) $("#best-sellers").closest("section").classList.add("d-none");
    }
    if ($("#product-grid") && all.length) {
      const cat = ($("#product-grid").dataset.cat || new URLSearchParams(location.search).get("cat") || "").toLowerCase();
      const list = ["men", "women", "kids", "shoes"].includes(cat) ? all.filter(p => (p.category || "").toLowerCase() === cat) : all;
      grid("#product-grid", list);
      const resultCount = $("#result-count");
      if (resultCount) resultCount.textContent = `Showing ${list.length} product${list.length === 1 ? "" : "s"}`;
      const pagination = $("#pagination");
      if (pagination) pagination.classList.add("d-none");
    }
}

async function loadPage() {
  paint(CATALOG); // show the built-in products straight away, then add live ones when Firestore answers
  try {
    const all = await products();
    paint(all);
    if ($("#product-detail")) showProduct(all);
  } catch (err) {
    console.error(err);
    const el = $("#product-grid") || $("#new-arrivals") || $("#product-detail");
    if (el) {
      const code = err?.code ? ` (${esc(err.code)})` : "";
      const message = err?.message ? ` ${esc(err.message)}` : "";
      el.insertAdjacentHTML("beforebegin", `<p class="text-danger" role="alert">Could not load live products from Firestore${code}.${message} The products shown below are sample content.</p>`);
    }
  }
}

function showProduct(all) {
  const p = all.find(x => x.id === new URLSearchParams(location.search).get("id"));
  if (!p) { $("#product-detail").innerHTML = '<p>Product not found. <a href="shop.html">Back to shop</a></p>'; return; }
  const images = p.images || [], isShoe = (p.category || "").toLowerCase() === "shoes";
  const sizes = isShoe ? (p.shoeSizes || []) : (p.sizes || []), colours = p.colours || [];
  document.title = p.name + " | Gbogbolowo";
  $("#crumb-name").textContent = p.name;
  $("#product-title").textContent = p.name;
  $("#product-price").textContent = naira(p.price);
  $("#product-summary").textContent = p.description || "";
  $("#product-rating").classList.add("d-none");
  $("#tab-desc").innerHTML = `<p>${esc(p.description || "")}</p>`;
  $("#tab-details table").innerHTML = `<tr><th>Category</th><td>${esc(p.category)}</td></tr>` + (colours.length ? `<tr><th>Colours</th><td>${esc(colours.join(", "))}</td></tr>` : "") + (sizes.length ? `<tr><th>${isShoe ? "Shoe sizes (EU)" : "Sizes"}</th><td>${esc(sizes.join(", "))}</td></tr>` : "");
  $("#review-list").innerHTML = '<p class="text-muted">No reviews yet.</p>';
  $("#main-image").innerHTML = img(images[0], p.name);
  $("#thumbnails").innerHTML = images.map(u => `<div class="col-3"><div class="ph" data-src="${esc(u)}">${img(u, p.name)}</div></div>`).join("");
  $("#thumbnails").addEventListener("click", e => { const t = e.target.closest("[data-src]"); if (t) $("#main-image").innerHTML = img(t.dataset.src, p.name); });

  const fill = (sel, label, list) => {
    const s = $(sel);
    if (list.length) s.innerHTML = `<option value="">${label}</option>` + list.map(v => `<option>${esc(v)}</option>`).join("");
    else s.closest(".mb-3").classList.add("d-none");
  };
  fill("#variant-size", isShoe ? "Select EU shoe size" : "Select size", sizes);
  $('label[for="variant-size"]').textContent = isShoe ? "EU shoe size" : "Size";
  fill("#variant-colour", "Select colour", colours);

  const form = $("#add-to-cart-form");
  form.nextElementSibling.textContent = p.stock > 0 ? `${p.stock} left in stock` : "Out of stock";
  if (p.stock <= 0) form.querySelector('[data-action="add-to-cart"]').disabled = true;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const size = form.elements.size.value, colour = form.elements.colour.value;
    if (sizes.length && !size) return alert("Please choose a size.");
    if (colours.length && !colour) return alert("Please choose a colour.");
    addToCart(p, size, colour, Math.max(1, parseInt(form.elements.qty.value, 10) || 1));
  });

  const related = all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  grid("#related-products", related);
  if (!related.length) { $("#related-products").previousElementSibling.classList.add("d-none"); $("#related-products").classList.add("d-none"); }
}

/* ---------- Checkout ---------- */
const form = $("#checkout-form");
function drawCheckout() {
  if (!form || !$("#checkout-items")) return; // skip once the thank-you message has replaced the page
  const f = form.elements, online = f.payment.value === "online";
  $("#checkout-items").innerHTML = cart.length ? cart.map(i => `<div class="d-flex justify-content-between mb-2"><span>${esc(i.name)} x ${i.qty}</span><span>${naira(i.price * i.qty)}</span></div>`).join("") : '<p class="text-muted">Your cart is empty.</p>';
  $("#co-subtotal").textContent = naira(subtotal());
  $("#co-total").textContent = naira(subtotal());
  $("#bank-details").classList.toggle("d-none", f.payment.value !== "transfer");
  $("#online-note").classList.toggle("d-none", !online);
  $("#place-order").textContent = online ? "Pay with Paystack" : "Place order";
}

// Opens the Paystack popup. Paystack wants the amount in kobo (naira x 100).
function payWithPaystack(email, amount, onPaid, onCancel) {
  if (!window.PaystackPop) { alert("Paystack did not load. Check your internet connection."); return onCancel(); }
  PaystackPop.setup({
    key: PAYSTACK_KEY, email, amount: amount * 100, currency: "NGN", ref: "GB" + Date.now(),
    callback: function (res) { onPaid(res.reference); },
    onClose: onCancel
  }).openIframe();
}

async function saveOrder(extra) {
  const f = form.elements;
  const items = cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, colour: i.colour }));
  const order = await addDoc(collection(db, "orders"), {
    items,
    customer: { firstName: f.first_name.value, lastName: f.last_name.value, email: f.email.value, phone: f.phone.value },
    subtotal: subtotal(), total: subtotal(),
    status: "Pending", createdAt: serverTimestamp(), ...extra
  });
  // take the sold items off the stock shown in the admin
  await Promise.all(items.map(i => updateDoc(doc(db, "products", i.id), { stock: increment(-i.qty) }).catch(() => { })));
  cart = []; localStorage.removeItem("gb_cart");
  const paid = extra.paymentStatus === "Paid";
  $("main").innerHTML = `<div class="text-center py-5"><h1 class="h2">Thank you for your order</h1><p>${paid ? "Your payment was received. " : "Please pay by bank transfer and use your order number as the reference. "}Your order number is <strong>${order.id.slice(0, 8).toUpperCase()}</strong>.</p><a class="btn btn-brand" href="shop.html">Continue shopping</a></div>`;
  drawCart();
}

if (form) {
  form.addEventListener("change", drawCheckout);
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!cart.length) return alert("Your cart is empty.");
    const f = form.elements, btn = $("#place-order"), total = subtotal();
    btn.disabled = true;
    const reset = () => { btn.disabled = false; drawCheckout(); };
    const finish = extra => saveOrder(extra).catch(err => {
      console.error(err);
      alert("Could not save the order: " + err.message + (extra.paymentRef ? " Your payment reference is " + extra.paymentRef + ". Please contact us." : ""));
      reset();
    });
    if (f.payment.value === "online") payWithPaystack(f.email.value, total, ref => finish({ payment: "online", paymentStatus: "Paid", paymentRef: ref }), reset);
    else finish({ payment: f.payment.value, paymentStatus: "Awaiting payment" });
  });
}

drawCart();
loadPage();
