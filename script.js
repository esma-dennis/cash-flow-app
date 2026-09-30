const CATS = {
  out: ["Food", "Transport", "Bills", "Shopping", "Health", "Fun", "Other"],
  in: ["Salary", "Side income", "Gift", "Other"],
};
let tx = [],
  type = "out",
  view = new Date();
view.setDate(1);
const $ = (id) => document.getElementById(id);
try {
  tx = JSON.parse(localStorage.getItem("money.tx") || "[]");
} catch (e) {
  tx = [];
}
const save = () => {
  try {
    localStorage.setItem("money.tx", JSON.stringify(tx));
  } catch (e) {}
};
const rm = (n) =>
  "RM " +
  n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const today = () => {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
function render() {
  const key =
    view.getFullYear() + "-" + String(view.getMonth() + 1).padStart(2, "0");
  $("mLabel").textContent = view.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const m = tx
    .filter((t) => t.date.startsWith(key))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const inc = m.filter((t) => t.type == "in").reduce((s, t) => s + t.amt, 0),
    exp = m.filter((t) => t.type == "out").reduce((s, t) => s + t.amt, 0);
  $("inc").textContent = rm(inc);
  $("exp").textContent = rm(exp);
  const b = $("bal");
  b.textContent = rm(inc - exp);
  b.className = "n " + (inc - exp < 0 ? "out" : "");
  const by = {};
  m.filter((t) => t.type == "out").forEach(
    (t) => (by[t.cat] = (by[t.cat] || 0) + t.amt),
  );
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  $("cats").innerHTML = rows.length
    ? rows
        .map(
          ([c, v]) =>
            `<div class="cat"><div class="l"><span>${esc(c)}</span><span>${rm(v)}</span></div><div class="bar"><i style="width:${(v / exp) * 100}%"></i></div></div>`,
        )
        .join("")
    : '<div class="empty">No spending yet this month.</div>';
  const days = {};
  m.forEach((t) => (days[t.date] = days[t.date] || []).push(t));
  const item = (t) =>
    `<div class="item"><div class="d"><div>${esc(t.note || t.cat)}</div><small>${esc(t.cat)}</small></div><div class="a ${t.type}">${t.type == "in" ? "+" : "−"}${rm(t.amt)}</div><button class="x" data-id="${t.id}" aria-label="Delete">×</button></div>`;
  $("list").innerHTML = m.length
    ? Object.keys(days)
        .map((d) => {
          const L = days[d],
            s = L.filter((t) => t.type == "out").reduce((a, t) => a + t.amt, 0),
            i = L.filter((t) => t.type == "in").reduce((a, t) => a + t.amt, 0),
            dt = new Date(d + "T00:00");
          return (
            `<div class="day"><span>${dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span><span>${s ? `<span class="out">- ${rm(s)}</span>` : ""}${i ? ` <span class="in">+${rm(i)}</span>` : ""}</span></div>` +
            L.map(item).join("")
          );
        })
        .join("")
    : '<div class="empty">Tap Add to record your first expense or income.</div>';
}
function setType(t) {
  type = t;
  $("tOut").className = t == "out" ? "on" : "";
  $("tIn").className = t == "in" ? "on" : "";
  $("cat").innerHTML = CATS[t].map((c) => `<option>${c}</option>`).join("");
}
$("add").onclick = () => {
  setType("out");
  $("amt").value = "";
  $("note").value = "";
  $("date").value = today();
  $("dlg").showModal();
  $("amt").focus();
};
$("tOut").onclick = () => setType("out");
$("tIn").onclick = () => setType("in");
$("cancel").onclick = () => $("dlg").close();
$("save").onclick = () => {
  const a = parseFloat($("amt").value);
  if (!(a > 0)) {
    $("amt").focus();
    return;
  }
  tx.push({
    id: Date.now(),
    type,
    amt: a,
    cat: $("cat").value,
    note: $("note").value.trim(),
    date: $("date").value || today(),
  });
  save();
  $("dlg").close();
  view = new Date($("date").value || today());
  view.setDate(1);
  render();
};
$("list").onclick = (e) => {
  const id = e.target.dataset.id;
  if (id && confirm("Delete this entry?")) {
    tx = tx.filter((t) => t.id != id);
    save();
    render();
  }
};
$("prev").onclick = () => {
  view.setMonth(view.getMonth() - 1);
  render();
};
$("next").onclick = () => {
  view.setMonth(view.getMonth() + 1);
  render();
};
const WP = {
  none: "",
  ocean: "linear-gradient(160deg,#0f4c81,#48b1bf)",
  sunset: "linear-gradient(160deg,#ff9966,#c2185b)",
  forest: "linear-gradient(160deg,#134e4a,#7fb069)",
  night: "linear-gradient(160deg,#0b1026,#3a3f8f)",
};
const ACC = ["", "#0f8a6d", "#2563eb", "#7c3aed", "#db2777", "#ea580c"];
let S = { name: "", accent: "", wp: "none", img: "" };
try {
  S = Object.assign(S, JSON.parse(localStorage.getItem("money.set") || "{}"));
} catch (e) {}
const saveS = () => {
  try {
    localStorage.setItem("money.set", JSON.stringify(S));
  } catch (e) {
    alert("Could not save the photo. Try a smaller one.");
  }
};
function apply() {
  const r = document.documentElement.style;
  if (S.accent) {
    r.setProperty("--acc", S.accent);
    r.setProperty("--accink", "#fff");
  } else {
    r.removeProperty("--acc");
    r.removeProperty("--accink");
  }
  document.body.style.backgroundImage = S.img
    ? `url(${S.img})`
    : WP[S.wp] || "";
  $("hello").textContent = S.name ? "Hi, " + S.name : "My Money";
}
function swatches() {
  $("accSw").innerHTML = ACC.map(
    (c) =>
      `<button data-c="${c}" class="${S.accent == c ? "on" : ""}" style="background:${c || "var(--ink)"}" aria-label="Colour"></button>`,
  ).join("");
  $("wpSw").innerHTML = Object.keys(WP)
    .map(
      (k) =>
        `<button data-w="${k}" class="${!S.img && S.wp == k ? "on" : ""}" style="background:${WP[k] || "var(--bg)"}">${k == "none" ? "None" : ""}</button>`,
    )
    .join("");
}
$("gear").onclick = () => {
  $("uname").value = S.name;
  swatches();
  $("set").showModal();
};
$("uname").oninput = (e) => {
  S.name = e.target.value.trim();
  apply();
  saveS();
};
$("accSw").onclick = (e) => {
  const c = e.target.dataset.c;
  if (c === undefined) return;
  S.accent = c;
  apply();
  saveS();
  swatches();
};
$("wpSw").onclick = (e) => {
  const w = e.target.dataset.w;
  if (!w) return;
  S.wp = w;
  S.img = "";
  apply();
  saveS();
  swatches();
};
$("pick").onclick = () => $("file").click();
$("rmImg").onclick = () => {
  S.img = "";
  apply();
  saveS();
  swatches();
};
$("file").onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const im = new Image(),
    u = URL.createObjectURL(f);
  im.onload = () => {
    const k = Math.min(1, 1000 / Math.max(im.width, im.height)),
      c = document.createElement("canvas");
    c.width = im.width * k;
    c.height = im.height * k;
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    S.img = c.toDataURL("image/jpeg", 0.7);
    URL.revokeObjectURL(u);
    apply();
    saveS();
    swatches();
  };
  im.src = u;
  e.target.value = "";
};
$("done").onclick = () => $("set").close();
apply();
render();
