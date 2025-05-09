const todayStr = new Date().toISOString().slice(0, 10);
let completedProductiveTasks = 0;
let pauseCompletedAfterLimit = true;
let currentNoteTaskId = null;
const taskNotes = {};
const stressByDate = {}; // Clave: YYYY-MM-DD

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function addTask() {
  const input = document.getElementById("taskInput");
  const type = document.getElementById("taskType").value;
  const taskName = input.value.trim();
  if (taskName === "") return;

  let subType = document.getElementById("pauseType").value;
  const customInput = document.getElementById("customPauseInput").value.trim();
  if (customInput !== "") subType = customInput;

  const duration = type === "pause" ? 9 * 60 : 27 * 60;
  const card = document.createElement("div");
  card.classList.add("task-card");

  if (type === "productive") card.classList.add("task-productive");
  else {
    card.classList.add("task-pause");
    const subtypeClass = subType.toLowerCase();
    const valid = { "leer": "read", "respirar": "breathe", "pensar": "think", "meditar": "meditate" };
    if (valid[subtypeClass]) card.classList.add(valid[subtypeClass]);
    else card.style.backgroundColor = "#eee";
  }

  card.draggable = true;
  card.ondragstart = drag;
  card.id = `task-${Date.now()}`;

  const label = document.createElement("span");
  label.textContent = type === "pause"
      ? `${taskName} [Pausa: ${subType}]`
      : `${taskName} [Productivo]`;

  const timer = document.createElement("span");
  timer.textContent = formatTime(duration);
  timer.style.fontSize = "0.9rem";
  timer.style.color = "#555";

  // Botones
  const startBtn = document.createElement("button");
  startBtn.textContent = "▶️";
  startBtn.onclick = () => startCountdown(timer, startBtn, duration, type, card);

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "🔁";
  restartBtn.classList.add("btn-restart");
  restartBtn.style.display = "none";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = () => {
    if (confirm("¿Deseas eliminar esta tarea?")) {
      if (taskNotes[card.id]) delete taskNotes[card.id];
      card.remove();
      saveToLocalStorage();
    }
  };

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";

  const leftSide = document.createElement("div");
  leftSide.style.flexGrow = "1";
  leftSide.appendChild(label);
  leftSide.appendChild(timer);

  const rightSide = document.createElement("div");
  rightSide.className = "task-buttons";
  rightSide.appendChild(startBtn);

  if (type === "productive") {
    const noteBtn = document.createElement("button");
    noteBtn.textContent = "💬";
    noteBtn.onclick = () => openNotes(card.id);
    rightSide.appendChild(noteBtn);
    rightSide.appendChild(restartBtn);
    openNotes(card.id);
  }

  rightSide.appendChild(deleteBtn);

  header.appendChild(leftSide);
  header.appendChild(rightSide);
  card.appendChild(header);

  // Barra de progreso
  const progressWrapper = document.createElement("div");
  progressWrapper.className = "progress";
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressWrapper.appendChild(progressBar);
  card.appendChild(progressWrapper);

  document.getElementById("waitingColumn").appendChild(card);
  saveToLocalStorage();

  input.value = "";
  document.getElementById("customPauseInput").value = "";
}

function restartTask(timerElement, duration, type, card, startBtn, restartBtn) {
  const day = new Date().getDay();

  // 😤 Reiniciar aumenta el estrés
  stressByDate[todayStr] = (stressByDate[todayStr] || 0) + 1;

  // ✅ Actualiza interfaz
  restartBtn.style.display = "none";
  timerElement.textContent = formatTime(duration);

  // 🔁 Comenzar nuevamente
  startCountdown(timerElement, startBtn, duration, type, card, restartBtn, duration);

  // 📦 Guardar nuevo estado
  drawStressHeatmap();
  saveToLocalStorage();
}

function startCountdown(timerElement, button, duration, type, card, restartBtn = null, originalDuration = duration) {
  let totalSeconds = duration;
  const progressBar = card.querySelector(".progress-bar");
  const taskId = card.id;

  button.disabled = true;
  card.draggable = false;
  card.dataset.locked = "true";
  document.getElementById("startSound").play().catch(() => {});

  // Guardar en localStorage con duración y tipo
  localStorage.setItem(`serie9.timer.${taskId}`, JSON.stringify({
    startTime: Date.now(),
    duration: originalDuration,
    type: type
  }));

  const interval = setInterval(() => {
    timerElement.textContent = formatTime(totalSeconds);
    const percentage = ((originalDuration - totalSeconds) / originalDuration) * 100;
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, percentage).toFixed(1)}%`;
    }

    totalSeconds--;

    if (totalSeconds < 0) {
      card.draggable = true;
      delete card.dataset.locked;
      clearInterval(interval);
      timerElement.textContent = "✅";
      document.getElementById("endSound").play().catch(() => {});
      localStorage.removeItem(`serie9.timer.${taskId}`);

      const day = new Date().getDay();

      if (type === "productive") {
        completedProductiveTasks++;
        pauseCompletedAfterLimit = false;
        stressByDate[todayStr] = (stressByDate[todayStr] || 0) + 1;

        if (completedProductiveTasks % 3 === 0) {
          alert("Has completado 3 actividades productivas. Tómate una pausa de 9 minutos.");
        }

        const btn = restartBtn || card.querySelector(".btn-restart");
        if (btn) btn.style.display = "inline-block";

      } else if (type === "pause") {
        completedProductiveTasks = 0;
        pauseCompletedAfterLimit = true;
        stressByDate[todayStr] = Math.max((stressByDate[todayStr] || 0) - 1, 0);
      }

      drawStressHeatmap();
      saveToLocalStorage();
    }
  }, 1000);
}



function drawStressHeatmap() {
  const container = document.getElementById("stressHeatmap");
  container.innerHTML = "";

  const levels = [0, 1, 2, 3, 4]; // 0 = sin estrés, 4 = alto estrés

  for (let i = 0; i < 7; i++) {
    const value = stressByDate[i] || 0;
    const level = Math.min(4, value);
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    cell.dataset.level = level;
    container.appendChild(cell);
  }
}

function getStressColor(stress) {
  switch (stress) {
    case 0: return "green";
    case 1: return "yellow";
    case 2: return "orange";
    case 3: return "#ff4500";
    default: return "red";
  }
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  const card = event.target;
  if (card.dataset.locked === "true") {
    alert("⏳ Esta tarea está en curso y no puede moverse de semana.");
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData("text", card.id);
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const task = document.getElementById(data);
  event.target.closest(".column").appendChild(task);
  saveToLocalStorage();
}

function openNotes(taskId) {
  currentNoteTaskId = taskId;
  document.getElementById("notesSidebar").classList.remove("hidden");
  document.getElementById("notesSidebar").classList.add("show");
  document.getElementById("notesTextarea").value = taskNotes[taskId] || "";
  document.getElementById("notesTextarea").style.display = "block";
  document.getElementById("saveNoteBtn").style.display = "inline-block";
  document.getElementById("notesList").style.display = "none";
}

function closeNotes() {
  document.getElementById("notesSidebar").classList.remove("show");
  document.getElementById("notesSidebar").classList.add("hidden");
  currentNoteTaskId = null;
}

function saveNote() {
  if (!currentNoteTaskId) return;
  const note = document.getElementById("notesTextarea").value.trim();
  if (note) {
    taskNotes[currentNoteTaskId] = note;
    saveToLocalStorage();
  }
  closeNotes();
}

function showAllNotes() {
  const sidebar = document.getElementById("notesSidebar");
  const notesList = document.getElementById("notesList");
  const textarea = document.getElementById("notesTextarea");
  const saveBtn = document.getElementById("saveNoteBtn");

  textarea.style.display = "none";
  saveBtn.style.display = "none";
  notesList.style.display = "flex";
  notesList.innerHTML = "";

  Object.keys(taskNotes).forEach(taskId => {
    const taskEl = document.getElementById(taskId);
    if (!taskEl) return;

    const label = taskEl.querySelector("span");
    const note = taskNotes[taskId];

    if (label && note) {
      const wrapper = document.createElement("div");
      wrapper.style.padding = "12px";
      wrapper.style.border = "1px solid #ddd";
      wrapper.style.borderRadius = "10px";
      wrapper.style.background = "#f8f9fa";

      const taskTitle = document.createElement("strong");
      taskTitle.textContent = label.textContent;

      const noteText = document.createElement("p");
      noteText.textContent = note;
      noteText.style.marginTop = "6px";
      noteText.style.whiteSpace = "pre-wrap";

      wrapper.appendChild(taskTitle);
      wrapper.appendChild(noteText);
      notesList.appendChild(wrapper);
    }
  });

  sidebar.classList.remove("hidden");
  sidebar.classList.add("show");
}

function saveToLocalStorage() {
  const allTasks = Array.from(document.querySelectorAll(".task-card")).map(card => {
    return {
      id: card.id,
      label: card.querySelector("span")?.textContent || "",
      classList: [...card.classList],
      parentId: card.parentElement.id
    };
  });

  localStorage.setItem("serie9.tasks", JSON.stringify(allTasks));
  localStorage.setItem("serie9.notes", JSON.stringify(taskNotes));
  localStorage.setItem("serie9.stress", JSON.stringify(stressByDate));
}

function loadFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("serie9.tasks") || "[]");
  const notes = JSON.parse(localStorage.getItem("serie9.notes") || "{}");
  const stress = JSON.parse(localStorage.getItem("serie9.stress") || "{}");
  Object.assign(stressByDate, stress);

  Object.assign(taskNotes, notes);

  for (const task of tasks) {
    const card = document.createElement("div");
    card.id = task.id;
    card.className = "task-card";
    task.classList.forEach(c => card.classList.add(c));
    card.draggable = true;
    card.ondragstart = drag;

    const label = document.createElement("span");
    label.textContent = task.label;

    const timer = document.createElement("span");
    timer.textContent = "27:00";
    timer.style.marginLeft = "10px";
    timer.style.fontSize = "0.9rem";
    timer.style.color = "#555";

    const startBtn = document.createElement("button");
    startBtn.textContent = "▶️";

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "🔁";
    restartBtn.style.display = "none";

    const noteBtn = document.createElement("button");
    noteBtn.textContent = "💬";
    noteBtn.onclick = () => openNotes(card.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => {
      if (confirm("¿Deseas eliminar esta tarea?")) {
        if (taskNotes[card.id]) delete taskNotes[card.id];
        localStorage.removeItem(`serie9.timer.${card.id}`);
        card.remove();
        saveToLocalStorage();
      }
    };

    const rightSide = document.createElement("div");
    rightSide.className = "task-buttons";
    rightSide.appendChild(startBtn);
    rightSide.appendChild(noteBtn);
    rightSide.appendChild(restartBtn);
    rightSide.appendChild(deleteBtn);

    const leftSide = document.createElement("div");
    leftSide.style.flexGrow = "1";
    leftSide.appendChild(label);
    leftSide.appendChild(timer);

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "flex-start";
    header.appendChild(leftSide);
    header.appendChild(rightSide);

    card.appendChild(header);

    // 📊 Barra de progreso
    const progressWrapper = document.createElement("div");
    progressWrapper.className = "progress";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressWrapper.appendChild(progressBar);
    card.appendChild(progressWrapper);

    const parent = document.getElementById(task.parentId);
    if (parent) parent.appendChild(card);

    // ⏳ Revisar si hay un temporizador activo
    const timerData = JSON.parse(localStorage.getItem(`serie9.timer.${card.id}`));
    if (timerData) {
      const { startTime, duration, type } = timerData;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = duration - elapsed;

      if (remaining > 0) {
        startCountdown(timer, startBtn, remaining, type || "productive", card, restartBtn, duration);
      } else {
        timer.textContent = "✅";
        progressBar.style.width = "100%";
        localStorage.removeItem(`serie9.timer.${card.id}`);
      }
    } else {
      // Tipo por defecto
      const isPause = card.classList.contains("task-pause");
      const defaultDuration = isPause ? 9 * 60 : 27 * 60;
      const type = isPause ? "pause" : "productive";
      startBtn.onclick = () => startCountdown(timer, startBtn, defaultDuration, type, card, restartBtn, defaultDuration);
      restartBtn.onclick = () => restartTask(timer, defaultDuration, type, card, startBtn, restartBtn);
    }
  }
}



function openModal() {
  document.getElementById("taskInput").value = "";
  document.getElementById("customPauseInput").value = "";
  document.getElementById("taskModal").style.display = "block";
}

function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}

window.onload = () => {
  createWeekColumns();
  loadFromLocalStorage();
  drawStressHeatmap();
  const loading = document.getElementById("loadingScreen");
  if (loading) {
    loading.classList.add("fade-out");
    setTimeout(() => loading.remove(), 1600);
  }
};

function createWeekColumns() {
  const today = new Date();
  const currentWeek = Math.ceil((((today - new Date(today.getFullYear(), 0, 1)) / 86400000) + today.getDay() + 1) / 7);
  const titles = ["Retrasado", "Por Terminar", "Por hacer", "Futuro"];
  const ids = [currentWeek - 1, currentWeek, currentWeek + 1, currentWeek + 2];
  const kanban = document.getElementById("kanbanBoard");

  ids.forEach((weekNum, i) => {
    const column = document.createElement("div");
    column.className = "column col-md-3";
    column.id = `week-${weekNum}`;
    column.ondragover = allowDrop;
    column.ondrop = drop;

    const title = document.createElement("h3");
    title.innerText = `${titles[i]} (Semana ${weekNum})`;

    column.appendChild(title);
    kanban.appendChild(column);
  });
}


function openManifestSidebar() {
  const sidebar = document.getElementById("manifestSidebar");
  sidebar.classList.remove("hidden");
  sidebar.classList.add("show");
}

function closeManifestSidebar() {
  const sidebar = document.getElementById("manifestSidebar");
  sidebar.classList.remove("show");
  sidebar.classList.add("hidden");
}

function openCalendarHeatmap() {
  document.getElementById("calendarHeatmapModal").style.display = "block";
  drawCalendarHeatmap();
}

function closeCalendarHeatmap() {
  document.getElementById("calendarHeatmapModal").style.display = "none";
}

function drawCalendarHeatmap() {
  const container = document.getElementById("calendarHeatmapGrid");
  const monthTitle = document.getElementById("calendarMonthTitle");
  container.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = enero
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // Día de la semana en que empieza

  const stress = JSON.parse(localStorage.getItem("serie9.stress") || "{}");
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  let maxStress = -1;
  let maxDate = "";

  Object.keys(stress).forEach(date => {
    if (stress[date] > maxStress) {
      maxStress = stress[date];
      maxDate = date;
    }
  });

  // Celdas vacías para alinear el primer día
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "heatmap-cell";
    empty.style.visibility = "hidden";
    container.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const stressLevel = Math.min(4, stress[dateStr] || 0);

    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    cell.dataset.level = stressLevel;
    cell.title = `${dateStr} - Estrés: ${stress[dateStr] || 0}`;

    if (dateStr === maxDate) {
      cell.style.border = "2px solid red";
    }

    const dayNumber = document.createElement("div");
    dayNumber.textContent = day;
    dayNumber.style.fontSize = "0.75rem";
    dayNumber.style.color = "#333";

    cell.appendChild(dayNumber);
    container.appendChild(cell);
  }
}




// 🛠️ Registro de Service Worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(function(registration) {
    console.log('Service Worker registrado con éxito:', registration.scope);
  }).catch(function(error) {
    console.log('Fallo al registrar el Service Worker:', error);
  });
}
