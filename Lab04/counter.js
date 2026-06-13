// ============================================================
// Завдання 2 — Лічильник напоїв з історією
// ============================================================

const STORAGE_KEY = "task-2-counters"; // для збереження стану в localStorage
const HISTORY_LIMIT = 5;
const UNDO_LIMIT = 10;
const THROTTLE_MS = 200;

const countersContainer = document.getElementById("counters"); // контейнер для кнопок + / −
const panel = document.querySelector(".panel"); //undo, reset, export

const totalEl = document.getElementById("total");
const leaderEl = document.getElementById("leader");
const historyEl = document.getElementById("history");

let state = { // поточний стан лічильників, історії та undo-стеку
  counters: { 
    "кави": 0,
    "чаю": 0,
    "води": 0
  },
  history: [],
  undoStack: [] // стек для undo, зберігає попередні стани лічильників
};

const lastClickTime = {};    

// ============================================================
// Завантаження / збереження localStorage
// ============================================================

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY); 

  if (!saved) { 
    return;
  }

  try {
    const parsed = JSON.parse(saved); 

    if (parsed.counters) { 
      state.counters = {
        "кави": parsed.counters["кави"] || 0,
        "чаю": parsed.counters["чаю"] || 0,
        "води": parsed.counters["води"] || 0
      };
    }

    if (Array.isArray(parsed.history)) { // відновлюємо історію
      state.history = parsed.history;
    }

    if (Array.isArray(parsed.undoStack)) { // відновлюємо undo-стек
      state.undoStack = parsed.undoStack;
    }
  } catch (error) { // якщо JSON пошкоджений або має неправильну структуру
    console.log("Помилка читання localStorage:", error);
  }
}

// ============================================================
// Допоміжні функції
// ============================================================

function cloneCounters() { 
  return {
    "кави": state.counters["кави"],
    "чаю": state.counters["чаю"],
    "води": state.counters["води"]
  };
}

function addHistory(text) { 
  state.history.push(text);

  if (state.history.length > HISTORY_LIMIT) {
    state.history = state.history.slice(-HISTORY_LIMIT);
  }
}

function addUndoStep() {
  state.undoStack.push(cloneCounters());

  if (state.undoStack.length > UNDO_LIMIT) { 
    state.undoStack.shift();
  }
}

function isThrottled(name) { 
  const now = Date.now();

  if (lastClickTime[name] && now - lastClickTime[name] < THROTTLE_MS) { 
    return true;
  }

  lastClickTime[name] = now; 
  return false;
}

function formatName(name) { 
  if (name === "кави") return "Кави";
  if (name === "чаю") return "Чаю";
  if (name === "води") return "Води";

  return name;
}

// ============================================================
// Оновлення сторінки
// ============================================================

function renderCounters() { 
  const counterElements = document.querySelectorAll(".counter");

  counterElements.forEach(counter => { 
    const name = counter.dataset.name; 
    const valueEl = counter.querySelector(".value"); 
    const minusBtn = counter.querySelector(".minus");

    valueEl.textContent = state.counters[name]; // оновлюємо число в лічильнику

    if (state.counters[name] === 0) { 
      minusBtn.disabled = true; 
    } else {
      minusBtn.disabled = false; 
    }
  });
}

function renderTotal() { 
  let total = 0;

  for (const name in state.counters) { 
    total += state.counters[name]; 
  }

  totalEl.textContent = total;
}

function renderLeader() { 
  const counterElements = document.querySelectorAll(".counter");

  counterElements.forEach(counter => { 
    counter.classList.remove("is-leader");
  });

  let max = 0;

  for (const name in state.counters) { 
    if (state.counters[name] > max) {
      max = state.counters[name];
    }
  }

  if (max === 0) {
    leaderEl.textContent = "—";
    return;
  }

  const leaders = []; 

  for (const name in state.counters) {
    if (state.counters[name] === max) {
      leaders.push(name);
    }
  }

  leaderEl.textContent = leaders.map(formatName).join(", ");

  counterElements.forEach(counter => {
    const name = counter.dataset.name;

    if (leaders.includes(name)) {
      counter.classList.add("is-leader");
    }
  });
}

function renderHistory() { 
  historyEl.innerHTML = ""; 
  state.history.forEach(item => { 
    const li = document.createElement("li");
    li.textContent = item;
    historyEl.appendChild(li); 
  });
}

function render() { 
  renderCounters();
  renderTotal();
  renderLeader();
  renderHistory();
  saveState();
}

// ============================================================
// Кнопки + / − через event delegation
// ============================================================

 countersContainer.addEventListener("click", function(event) { 
  const button = event.target;

  if (!button.classList.contains("plus") && !button.classList.contains("minus")) {
  return;
  }

  const counter = button.closest(".counter");
  const name = counter.dataset.name;

  if (isThrottled(name)) { 
   return;
  }

  if (button.classList.contains("plus")) {
    addUndoStep(); 

    state.counters[name]++;

   addHistory("+1 " + name);
    render();
  }

  if (button.classList.contains("minus")) {
    if (state.counters[name] === 0) {
     return;
 }

    addUndoStep();

    state.counters[name]--;

    addHistory("−1 " + name);
    render();
  }
});

// ============================================================
// Панель undo / reset / export через event delegation
// ============================================================

panel.addEventListener("click", function(event) {
  const button = event.target;

  if (button.id === "undo") {
    undoLastAction();
  }

  if (button.id === "reset") {
    resetCounters();
  }

  if (button.id === "export") {
    exportJson();
  }
});

// ============================================================
// Undo
// ============================================================

function undoLastAction() { 
  if (state.undoStack.length === 0) {
    return;
  }

  const previousCounters = state.undoStack.pop();

  state.counters = previousCounters;

  addHistory("undo");
  render();
}

// ============================================================
// Reset
// ============================================================

function resetCounters() {
  const answer = confirm("Скинути всі лічильники?");

  if (!answer) {
    return;
  }

  addUndoStep();

  state.counters = {
    "кави": 0,
    "чаю": 0,
    "води": 0
  };

  addHistory("reset");
  render();
}

// ============================================================
// Export JSON
// ============================================================

function exportJson() {
  const total = Number(totalEl.textContent);

  const data = { // для експорту збережемо поточні лічильники, загальну кількість, лідера та історію
    counters: state.counters,
    total: total,
    leader: leaderEl.textContent,
    history: state.history
  };

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { // створюємо Blob з JSON-даними для завантаження
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "drink-counters.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================
// Старт
// ============================================================

loadState();
render();