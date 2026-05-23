// ========== ПОЧАТКОВІ ДАНІ ==========
const DEFAULT_ITEMS = [
  { id: 1, name: 'Помідори', qty: 2, bought: true },
  { id: 2, name: 'Печиво',   qty: 2, bought: false },
  { id: 3, name: 'Сир',      qty: 1, bought: false },
];

let nextId = 4;

// ========== ЗБЕРЕЖЕННЯ В localStorage (Bonus) ==========
function saveToStorage(items) {
  localStorage.setItem('buylist-items', JSON.stringify(items));
  localStorage.setItem('buylist-nextid', nextId);
}

function loadFromStorage() {
  const saved = localStorage.getItem('buylist-items');
  const savedId = localStorage.getItem('buylist-nextid');
  if (saved) {
    nextId = savedId ? parseInt(savedId) : 10;
    return JSON.parse(saved);
  }
  return DEFAULT_ITEMS;
}

// ========== СТАН ==========
let items = loadFromStorage();

// ========== ЕЛЕМЕНТИ ==========
const input    = document.getElementById('new-item-input');
const addBtn   = document.getElementById('add-btn');
const itemList = document.getElementById('item-list');
const remainingTags = document.getElementById('remaining-tags');
const boughtTags    = document.getElementById('bought-tags');

// ========== ДОДАТИ ТОВАР ==========
function addItem() {
  const name = input.value.trim();
  if (!name) return;
  items.push({ id: nextId++, name, qty: 1, bought: false });
  input.value = '';
  input.focus();
  saveToStorage(items);
  render();
}

addBtn.addEventListener('click', addItem);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });

// ========== ВИДАЛИТИ ==========
function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  saveToStorage(items);
  render();
}

// ========== КУПЛЕНО / НЕ КУПЛЕНО ==========
function toggleBought(id) {
  const item = items.find(i => i.id === id);
  if (item) item.bought = !item.bought;
  saveToStorage(items);
  render();
}

// ========== КІЛЬКІСТЬ ==========
function changeQty(id, delta) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveToStorage(items);
  render();
}

// ========== РЕДАГУВАННЯ НАЗВИ ==========
function startEdit(id, spanEl) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = item.name;
  inp.className = 'item-name editing';

  spanEl.replaceWith(inp);
  inp.focus();

  inp.addEventListener('blur', () => {
    const newName = inp.value.trim();
    if (newName) item.name = newName;
    saveToStorage(items);
    render();
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') inp.blur();
  });
}

// ========== РЕНДЕР СПИСКУ ==========
function renderList() {
  itemList.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item-row';

    // Назва
    const nameEl = document.createElement('span');
    nameEl.className = 'item-name' + (item.bought ? ' bought-name' : '');
    nameEl.textContent = item.name;

    if (!item.bought) {
      nameEl.style.cursor = 'pointer';
      nameEl.addEventListener('click', () => startEdit(item.id, nameEl));
    }

    row.appendChild(nameEl);

    // Кількість (тільки для не куплених)
    if (!item.bought) {
      const qtyControls = document.createElement('div');
      qtyControls.className = 'qty-controls';

      const minusBtn = document.createElement('button');
      minusBtn.className = 'btn-qty minus' + (item.qty <= 1 ? ' disabled' : '');
      minusBtn.textContent = '−';
      minusBtn.setAttribute('data-tooltip', 'Зменшити кількість');
      minusBtn.disabled = item.qty <= 1;
      minusBtn.addEventListener('click', () => changeQty(item.id, -1));

      const qtySpan = document.createElement('span');
      qtySpan.className = 'qty-display';
      qtySpan.textContent = item.qty;

      const plusBtn = document.createElement('button');
      plusBtn.className = 'btn-qty plus';
      plusBtn.textContent = '+';
      plusBtn.setAttribute('data-tooltip', 'Збільшити кількість');
      plusBtn.addEventListener('click', () => changeQty(item.id, 1));

      qtyControls.appendChild(minusBtn);
      qtyControls.appendChild(qtySpan);
      qtyControls.appendChild(plusBtn);
      row.appendChild(qtyControls);
    } else {
      // Куплений — просто кількість
      const qtySpan = document.createElement('span');
      qtySpan.className = 'qty-display';
      qtySpan.textContent = item.qty;
      row.appendChild(qtySpan);
    }

    // Кнопка куплено/не куплено
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-toggle' + (item.bought ? ' bought' : '');
    toggleBtn.textContent = item.bought ? 'Куплено' : 'Не куплено';
    toggleBtn.setAttribute('data-tooltip', item.bought ? 'Зробити не купленим' : 'Зробити купленим');
    toggleBtn.addEventListener('click', () => toggleBought(item.id));
    row.appendChild(toggleBtn);

    // Кнопка видалити (тільки для не куплених)
    if (!item.bought) {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('data-tooltip', 'Видалити товар');
      delBtn.addEventListener('click', () => deleteItem(item.id));
      row.appendChild(delBtn);
    }

    itemList.appendChild(row);
  });
}

// ========== РЕНДЕР СТАТИСТИКИ ==========
function renderStats() {
  remainingTags.innerHTML = '';
  boughtTags.innerHTML = '';

  items.filter(i => !i.bought).forEach(item => {
    remainingTags.appendChild(makeTag(item));
  });

  items.filter(i => i.bought).forEach(item => {
    boughtTags.appendChild(makeTag(item, true));
  });
}

function makeTag(item, isBought = false) {
  const span = document.createElement('span');
  span.className = 'product-item' + (isBought ? ' bought-tag' : '');

  const amount = document.createElement('span');
  amount.className = 'amount';
  amount.textContent = item.qty;

  span.textContent = item.name + ' ';
  span.appendChild(amount);
  return span;
}

// ========== ГОЛОВНИЙ РЕНДЕР ==========
function render() {
  renderList();
  renderStats();
}

render();