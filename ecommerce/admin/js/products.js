import { db, stockStatus, naira, esc, imgSrc } from "./firebase-config.js";
import { requireAdmin } from "./admin-session.js";
import { CATALOG } from "./store-catalog.js";
import { collection, onSnapshot, getDocs, getDoc, setDoc, doc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

await requireAdmin();

const body = document.getElementById("products-table-body");
const empty = document.getElementById("products-empty");
const filterForm = document.getElementById("product-filter-form");
const importStatus = document.getElementById("import-catalog-status");
const pillClass = { Active: "pill-ok", "Low stock": "pill-wait", "Out of stock": "pill-bad", Draft: "pill-info" };
let all = [];

function row(p) {
  const s = stockStatus(p), img = p.images && p.images[0];
  return `<tr data-product-id="${esc(p.id)}"><td><input class="form-check-input" type="checkbox" aria-label="Select"></td>
<td><div class="d-flex align-items-center gap-3"><div class="thumb" ${img ? `style="background:url('${esc(imgSrc(img))}') center/cover"` : ""}></div><div><div class="fw-semibold">${esc(p.name)}</div><div class="small text-muted">${esc(p.sku)}</div></div></div></td>
<td>${esc(p.category)}</td><td>${naira(p.price)}</td>
<td><strong>${Number(p.stock) || 0}</strong> <span class="text-muted">left</span></td>
<td><span class="pill ${pillClass[s]}">${s}</span></td>
<td class="text-end text-nowrap"><a class="btn btn-outline-brand btn-sm" href="product-form.html?id=${encodeURIComponent(p.id)}">Edit</a> <button class="btn btn-outline-brand btn-sm" data-action="delete-product" data-product-id="${esc(p.id)}">Delete</button></td></tr>`;
}

function render() {
  const f = new FormData(filterForm), q = (f.get("q") || "").toLowerCase(), cat = f.get("category"), st = f.get("status");
  const list = all.filter(p =>
    (!q || (p.name || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)) &&
    (!cat || p.category === cat) && (!st || stockStatus(p) === st));
  body.querySelectorAll("tr[data-product-id]").forEach(r => r.remove());
  body.insertAdjacentHTML("afterbegin", list.map(row).join(""));
  empty.classList.toggle("d-none", list.length > 0);
}

function summary() {
  const c = { Active: 0, "Low stock": 0, "Out of stock": 0 };
  all.forEach(p => { const s = stockStatus(p); if (s in c) c[s]++; });
  const set = (id, v) => { document.getElementById(id).textContent = v; };
  set("stat-total", all.length); set("stat-instock", c.Active); set("stat-low", c["Low stock"]); set("stat-out", c["Out of stock"]);
}

function timestamp(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function syncStoreCatalog() {
  importStatus.textContent = "Checking the store catalogue...";
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const existing = snapshot.docs.map(product => product.data());
    const missing = CATALOG.filter(item => !existing.some(product =>
      (product.name || "").trim().toLowerCase() === item.name.toLowerCase() ||
      (Array.isArray(product.images) ? product.images : []).includes(item.images[0])
    ));

    let imported = 0;
    for (const item of missing) {
      const ref = doc(db, "products", item.id);
      if ((await getDoc(ref)).exists()) continue;
      const { id, ...data } = item;
      await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      imported++;
    }

    importStatus.textContent = imported
      ? `Added ${imported} missing products to the admin catalogue.`
      : "All store catalogue products are already in the admin catalogue.";
  } catch (error) {
    console.error("Could not sync store catalogue to admin products.", error);
    importStatus.textContent = `Could not add storefront products: ${error.message}`;
  }
}

onSnapshot(collection(db, "products"),
  snap => {
    all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
    summary();
    render();
  },
  err => {
    console.error(err);
    body.innerHTML = '<tr><td colspan="7" class="text-danger py-4">Could not load products. Check js/firebase-config.js and your Firestore rules.</td></tr>';
  });

syncStoreCatalog();

filterForm.addEventListener("submit", e => { e.preventDefault(); render(); });
filterForm.addEventListener("input", render);

body.addEventListener("click", async e => {
  const b = e.target.closest('[data-action="delete-product"]');
  if (!b) return;
  const p = all.find(x => x.id === b.dataset.productId);
  if (!p || !confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, "products", p.id));
  } catch (err) { alert("Could not delete: " + err.message); }
});
