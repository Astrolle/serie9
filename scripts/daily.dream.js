// daily-dreams.js - Sistema de tareas diarias automáticas para sueños

// Estado de tareas diarias
let dailyDreamTasks = JSON.parse(localStorage.getItem('serie9.dailyDreamTasks') || '{}');
let dreamStreak = JSON.parse(localStorage.getItem('serie9.dreamStreak') || '{}');
let dreamBalance = JSON.parse(localStorage.getItem('serie9.dreamBalance') || '{}');

// Guardar estado
function saveDailyState() {
    localStorage.setItem('serie9.dailyDreamTasks', JSON.stringify(dailyDreamTasks));
    localStorage.setItem('serie9.dreamStreak', JSON.stringify(dreamStreak));
    localStorage.setItem('serie9.dreamBalance', JSON.stringify(dreamBalance));
}

// Verificar y crear tareas diarias
function checkAndCreateDailyTasks() {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('serie9.lastDailyCheck');

    // Si ya revisamos hoy, no hacer nada
    if (lastCheck === today) {
        return;
    }

    // Si es un nuevo día, limpiar tareas anteriores no completadas
    if (lastCheck && lastCheck !== today) {
        cleanupYesterdayTasks();
    }

    // Crear nuevas tareas diarias
    createDailyDreamTasks();

    // Actualizar última verificación
    localStorage.setItem('serie9.lastDailyCheck', today);
}

// Limpiar tareas de ayer no completadas
function cleanupYesterdayTasks() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Revisar todas las tareas en el tablero
    const allTasks = document.querySelectorAll('.task-card.daily-dream-task');
    allTasks.forEach(task => {
        const taskDate = task.dataset.createdDate;
        if (taskDate !== new Date().toDateString()) {
            // Si la tarea no es de hoy y no está completada, registrar como fallida
            if (task.querySelector('.timer').textContent !== "✅") {
                const dreamId = task.dataset.dreamId;
                updateDreamBalance(dreamId, false);
                resetStreak(dreamId);
            }
            // Eliminar la tarea
            task.remove();
        }
    });

    saveToLocalStorage();
}

// Crear tareas diarias para cada sueño
function createDailyDreamTasks() {
    const today = new Date().toDateString();
    const todayColumn = document.getElementById(`week-${getCurrentWeek()}`);

    if (!todayColumn) return;

    Object.entries(userDreams).forEach(([dreamId, dream]) => {
        // Verificar si ya existe tarea diaria para este sueño hoy
        const existingTask = document.querySelector(`.daily-dream-task[data-dream-id="${dreamId}"][data-created-date="${today}"]`);
        if (existingTask) return;

        // Crear tarea diaria
        const dailyTask = createDailyDreamTask(dreamId, dream);
        todayColumn.appendChild(dailyTask);
    });

    saveToLocalStorage();
    updateDailyProgress();
}

// Crear tarea diaria individual
function createDailyDreamTask(dreamId, dream) {
    const today = new Date().toDateString();
    const card = document.createElement("div");
    card.classList.add("task-card", "task-dream", "daily-dream-task");
    card.style.borderLeftColor = dream.color;
    card.style.backgroundColor = lightenColor(dream.color, 0.95);
    card.draggable = true;
    card.ondragstart = drag;
    card.id = `daily-${dreamId}-${Date.now()}`;

    card.dataset.dreamId = dreamId;
    card.dataset.createdDate = today;
    card.dataset.isDaily = "true";

    // Agregar indicador de tarea diaria
    const dailyBadge = document.createElement('span');
    dailyBadge.className = 'daily-badge';
    dailyBadge.textContent = '📅 Diaria';

    const label = document.createElement("span");
    label.innerHTML = `${dream.icon} Paso diario: ${dream.title} ${dailyBadge.outerHTML}`;

    const timer = document.createElement("span");
    timer.className = "timer";
    timer.textContent = "27:00";
    timer.style.fontSize = "0.9rem";
    timer.style.color = "#555";

    // Botones
    const startBtn = document.createElement("button");
    startBtn.textContent = "▶️";
    startBtn.onclick = () => startDailyCountdown(timer, startBtn, 27 * 60, card);

    const streakInfo = document.createElement("button");
    streakInfo.textContent = "🔥";
    streakInfo.title = `Racha: ${getStreak(dreamId)} días`;
    streakInfo.onclick = () => showDreamBalance(dreamId);

    const noteBtn = document.createElement("button");
    noteBtn.textContent = "💬";
    noteBtn.onclick = () => openNotes(card.id);

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
    rightSide.appendChild(streakInfo);
    rightSide.appendChild(noteBtn);

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

    return card;
}

// Countdown especial para tareas diarias
function startDailyCountdown(timerElement, button, duration, card) {
    const dreamId = card.dataset.dreamId;
    let totalSeconds = duration;
    const progressBar = card.querySelector(".progress-bar");

    button.disabled = true;
    card.draggable = false;
    card.dataset.locked = "true";

    const startSound = document.getElementById("startSound");
    if (startSound) startSound.play().catch(() => {});

    const interval = setInterval(() => {
        timerElement.textContent = formatTime(totalSeconds);
        const percentage = ((duration - totalSeconds) / duration) * 100;
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, percentage).toFixed(1)}%`;
        }

        totalSeconds--;

        if (totalSeconds < 0) {
            clearInterval(interval);
            card.draggable = true;
            delete card.dataset.locked;
            timerElement.textContent = "✅";

            // Marcar como completada
            card.dataset.completed = "true";

            // Actualizar progreso del sueño
            updateDreamProgress(dreamId, duration);

            // Actualizar balance y racha
            updateDreamBalance(dreamId, true);
            updateStreak(dreamId);

            // Mostrar notificación de progreso
            showDailyCompletionNotification(dreamId);

            const endSound = document.getElementById("endSound");
            if (endSound) endSound.play().catch(() => {});

            updateDailyProgress();
            updateDreamProgressDisplay();

            if (window.headerFunctions) {
                window.headerFunctions.updateUserStats();
            }

            saveToLocalStorage();
        }
    }, 1000);
}

// Obtener racha actual
function getStreak(dreamId) {
    return dreamStreak[dreamId] || 0;
}

// Actualizar racha
function updateStreak(dreamId) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const lastCompletion = dreamStreak[`${dreamId}_lastDate`];

    if (lastCompletion === yesterdayStr) {
        // Continuar racha
        dreamStreak[dreamId] = (dreamStreak[dreamId] || 0) + 1;
    } else if (lastCompletion === new Date().toDateString()) {
        // Ya completado hoy, no hacer nada
        return;
    } else {
        // Nueva racha
        dreamStreak[dreamId] = 1;
    }

    dreamStreak[`${dreamId}_lastDate`] = new Date().toDateString();
    saveDailyState();
}

// Resetear racha
function resetStreak(dreamId) {
    dreamStreak[dreamId] = 0;
    saveDailyState();
}

// Actualizar balance de sueños
function updateDreamBalance(dreamId, completed) {
    const today = new Date().toDateString();

    if (!dreamBalance[dreamId]) {
        dreamBalance[dreamId] = {
            total: 0,
            completed: 0,
            failed: 0,
            history: []
        };
    }

    const balance = dreamBalance[dreamId];

    // Evitar duplicados del mismo día
    const todayRecord = balance.history.find(record => record.date === today);
    if (todayRecord) return;

    balance.total++;
    if (completed) {
        balance.completed++;
    } else {
        balance.failed++;
    }

    balance.history.push({
        date: today,
        completed: completed,
        streak: getStreak(dreamId)
    });

    // Mantener solo los últimos 30 días
    if (balance.history.length > 30) {
        balance.history = balance.history.slice(-30);
    }

    saveDailyState();
}

// Mostrar balance de un sueño
function showDreamBalance(dreamId) {
    const dream = userDreams[dreamId];
    const balance = dreamBalance[dreamId] || { total: 0, completed: 0, failed: 0, history: [] };
    const streak = getStreak(dreamId);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content dream-balance-modal">
            <span class="close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>${dream.icon} Balance: ${dream.title}</h2>
            
            <div class="balance-stats">
                <div class="balance-stat">
                    <span class="stat-icon">🔥</span>
                    <span class="stat-value">${streak}</span>
                    <span class="stat-label">Racha actual</span>
                </div>
                <div class="balance-stat">
                    <span class="stat-icon">✅</span>
                    <span class="stat-value">${balance.completed}</span>
                    <span class="stat-label">Días completados</span>
                </div>
                <div class="balance-stat">
                    <span class="stat-icon">📊</span>
                    <span class="stat-value">${balance.total > 0 ? Math.round((balance.completed / balance.total) * 100) : 0}%</span>
                    <span class="stat-label">Tasa de éxito</span>
                </div>
            </div>
            
            <div class="balance-calendar">
                <h3>Últimos 30 días</h3>
                <div class="calendar-grid">
                    ${generateCalendarGrid(balance.history)}
                </div>
            </div>
            
            <div class="balance-insights">
                <h3>Reflexiones</h3>
                ${generateInsights(balance, streak)}
            </div>
            
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                Cerrar
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Generar grid de calendario
function generateCalendarGrid(history) {
    const grid = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const record = history.find(h => h.date === dateStr);
        const dayClass = record ? (record.completed ? 'completed' : 'failed') : 'no-data';

        grid.push(`
            <div class="calendar-day ${dayClass}" title="${date.toLocaleDateString()}">
                ${date.getDate()}
            </div>
        `);
    }

    return grid.join('');
}

// Generar insights del balance
function generateInsights(balance, streak) {
    const successRate = balance.total > 0 ? Math.round((balance.completed / balance.total) * 100) : 0;
    const insights = [];

    if (streak >= 7) {
        insights.push(`🎉 ¡Increíble! Llevas ${streak} días consecutivos. Estás creando un hábito sólido.`);
    } else if (streak >= 3) {
        insights.push(`💪 Bien hecho, llevas ${streak} días seguidos. ¡Sigue así!`);
    } else if (streak === 0) {
        insights.push(`🌱 Hoy es un nuevo comienzo. Cada paso cuenta.`);
    }

    if (successRate >= 80) {
        insights.push(`⭐ Tu constancia es admirable con un ${successRate}% de éxito.`);
    } else if (successRate >= 50) {
        insights.push(`📈 Vas por buen camino con ${successRate}% de días completados.`);
    } else {
        insights.push(`🎯 Cada día es una nueva oportunidad. Has completado ${balance.completed} días.`);
    }

    // Buscar el mejor streak
    let bestStreak = streak;
    let currentStreak = 0;
    balance.history.forEach(record => {
        if (record.completed) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    });

    if (bestStreak > streak) {
        insights.push(`🏆 Tu mejor racha fue de ${bestStreak} días. ¡Puedes superarla!`);
    }

    return insights.map(insight => `<p>${insight}</p>`).join('');
}

// Mostrar notificación de completado diario
function showDailyCompletionNotification(dreamId) {
    const dream = userDreams[dreamId];
    const streak = getStreak(dreamId);
    const balance = dreamBalance[dreamId];

    let message = `¡Completaste tu paso diario para "${dream.title}"! `;

    if (streak > 1) {
        message += `🔥 Racha de ${streak} días`;
    }

    const toast = document.createElement('div');
    toast.className = 'daily-completion-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${dream.icon}</span>
            <div class="toast-text">
                <strong>¡Progreso diario!</strong>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Crear dashboard de progreso diario
function createDailyProgressDashboard() {
    const dailySection = document.createElement('div');
    dailySection.className = 'daily-progress-section mb-4';
    dailySection.innerHTML = `
        <h3>📅 Mi Progreso Diario</h3>
        <div id="dailyProgressGrid" class="daily-progress-grid"></div>
    `;

    // Insertar antes del Mapa de Sueños
    const dreamSection = document.querySelector('.dream-tracker-section');
    if (dreamSection) {
        dreamSection.parentNode.insertBefore(dailySection, dreamSection);
    }

    updateDailyProgress();
}

// Actualizar visualización del progreso diario
function updateDailyProgress() {
    const grid = document.getElementById('dailyProgressGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const today = new Date().toDateString();
    const totalDreams = Object.keys(userDreams).length;
    let completedToday = 0;

    // Contar tareas completadas hoy
    Object.keys(userDreams).forEach(dreamId => {
        const balance = dreamBalance[dreamId];
        if (balance && balance.history.find(h => h.date === today && h.completed)) {
            completedToday++;
        }
    });

    // Crear resumen del día
    const summaryCard = document.createElement('div');
    summaryCard.className = 'daily-summary-card';
    summaryCard.innerHTML = `
        <div class="summary-header">
            <h4>Hoy ${new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
            <span class="summary-progress">${completedToday} de ${totalDreams} sueños</span>
        </div>
        
        <div class="summary-bar">
            <div class="summary-bar-fill" style="width: ${totalDreams > 0 ? (completedToday / totalDreams) * 100 : 0}%"></div>
        </div>
        
        <div class="summary-streaks">
            ${Object.entries(userDreams).map(([dreamId, dream]) => {
        const streak = getStreak(dreamId);
        const completed = dreamBalance[dreamId]?.history.find(h => h.date === today && h.completed);
        return `
                    <div class="streak-item ${completed ? 'completed' : 'pending'}">
                        <span>${dream.icon}</span>
                        <span>${streak > 0 ? `🔥${streak}` : ''}</span>
                    </div>
                `;
    }).join('')}
        </div>
    `;

    grid.appendChild(summaryCard);
}

// Actualizar la función getCurrentWeek para que funcione correctamente
function getCurrentWeek() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Inicializar sistema de tareas diarias
function initDailyDreams() {
    // Crear dashboard de progreso diario
    createDailyProgressDashboard();

    // Verificar y crear tareas diarias
    checkAndCreateDailyTasks();

    // Verificar cada vez que se enfoca la ventana
    window.addEventListener('focus', checkAndCreateDailyTasks);

    // Verificar cada hora
    setInterval(checkAndCreateDailyTasks, 60 * 60 * 1000);
}

// Función auxiliar para aclarar colores
function lightenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que se cargue el sistema de sueños principal
    setTimeout(() => {
        if (typeof userDreams !== 'undefined') {
            initDailyDreams();
        }
    }, 2000);
});


// Crear dashboard de progreso diario (VERSIÓN ACTUALIZADA)
function createDailyProgressDashboard() {
    const dailySection = document.createElement('div');
    dailySection.className = 'daily-progress-section mb-4';
    dailySection.innerHTML = `
        <div class="daily-header-controls">
            <h3>📅 Mi Progreso Diario</h3>
            <button class="btn btn-secondary" onclick="forceUpdateDailyTasks()">
                🔄 Actualizar tareas diarias
            </button>
        </div>
        <div id="dailyProgressGrid" class="daily-progress-grid"></div>
    `;

    // Insertar antes del Mapa de Sueños
    const dreamSection = document.querySelector('.dream-tracker-section');
    if (dreamSection) {
        dreamSection.parentNode.insertBefore(dailySection, dreamSection);
    }

    updateDailyProgress();
}


// Nueva función para forzar actualización
function forceUpdateDailyTasks() {
    // Limpiar tareas anteriores no completadas
    cleanupYesterdayTasks();

    // Crear nuevas tareas
    createDailyDreamTasks();

    // Actualizar visualización
    updateDailyProgress();

    // Mostrar notificación
    showToast('Tareas diarias actualizadas');
}

// Exportar funciones globales
window.showDreamBalance = showDreamBalance;
window.checkAndCreateDailyTasks = checkAndCreateDailyTasks;
window.forceUpdateDailyTasks = forceUpdateDailyTasks;

