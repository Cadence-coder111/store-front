import { db, esc, imgSrc } from "./firebase-config.js";
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("product-form");
const alertBox = document.getElementById("form-alert");
const preview = document.getElementById("image-preview");
const saveBtn = document.getElementById("save-product");
const id = new URLSearchParams(location.search).get("id");

const links = () => form.elements["images"].value.split("\n").map(x => x.trim()).filter(Boolean);
const checked = n => [...form.querySelectorAll(`input[name="${n}"]:checked:not(:disabled)`)].map(i => i.value);
const tick = (n, vals) => form.querySelectorAll(`input[name="${n}"]`).forEach(i => { i.checked = vals.includes(i.value); });
const showImages = urls => { preview.innerHTML = urls.map(u => `<div class="col-3"><div class="thumb w-100" style="height:90px;background:url('${esc(imgSrc(u))}') center/cover"></div></div>`).join(""); };
const msg = (text, ok = true) => { alertBox.textContent = text; alertBox.className = "alert " + (ok ? "alert-success" : "alert-danger"); };
const updateSizeOptions = () => {
  const isShoe = form.elements["category"].value === "Shoes";
  const clothingGroup = form.querySelector('input[name="sizes"]').closest(".mb-3");
  const shoeGroup = form.querySelector('input[name="shoe_sizes"]').closest(".mb-3");
  clothingGroup.classList.toggle("d-none", isShoe);
  shoeGroup.classList.toggle("d-none", !isShoe);
  form.querySelectorAll('input[name="sizes"]').forEach(input => { input.disabled = isShoe; });
  form.querySelectorAll('input[name="shoe_sizes"]').forEach(input => { input.disabled = !isShoe; });
};

form.elements["images"].addEventListener("input", () => showImages(links()));
form.elements["category"].addEventListener("change", updateSizeOptions);
updateSizeOptions();


if (id) {
  document.querySelector(".page-head h1").textContent = "Edit product";
  form.dataset.mode = "edit";
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) { msg("Product not found.", false); }
    else {
      const p = snap.data(), set = (n, v) => { form.elements[n].value = v ?? ""; };
      set("name", p.name); set("description", p.description); set("category", p.category); set("sku", p.sku);
      set("price", p.price); set("stock", p.stock); set("status", p.status || "Active");
      set("colours", (p.colours || []).join(", ")); set("seo_title", p.seoTitle); set("seo_description", p.seoDescription);
      set("images", (p.images || []).join("\n"));
      tick("sizes", p.sizes || []); tick("shoe_sizes", p.shoeSizes || []);
      updateSizeOptions();
      showImages(p.images || []);
    }
  } catch (err) { msg("Could not load product: " + err.message, false); }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  saveBtn.disabled = true; alertBox.className = "alert d-none";
  try {
    const urls = links();
    if (urls.length > 6) throw new Error("You can add up to 6 images.");
    const bad = urls.find(u => !/^(https?:\/\/|images\/)/.test(u));
    if (bad) throw new Error(`The image "${bad}" must start with https:// or images/`);
    const g = n => form.elements[n].value.trim();
    const data = {
      name: g("name"), description: g("description"), category: g("category"), sku: g("sku"),
      price: Number(g("price")) || 0, stock: parseInt(g("stock"), 10) || 0, status: g("status"),
      sizes: checked("sizes"), shoeSizes: checked("shoe_sizes"),
      colours: g("colours").split(",").map(x => x.trim()).filter(Boolean),
      images: urls, seoTitle: g("seo_title"), seoDescription: g("seo_description"),
      updatedAt: serverTimestamp()
    };
    if (id) { await updateDoc(doc(db, "products", id), data); }
    else { data.createdAt = serverTimestamp(); await addDoc(collection(db, "products"), data); }
    msg("Product saved. Going back to the list...");
    setTimeout(() => { location.href = "products.html"; }, 1200);
  } catch (err) {
    console.error(err);
    msg("Could not save: " + err.message, false);
    saveBtn.disabled = false;
  }
});
