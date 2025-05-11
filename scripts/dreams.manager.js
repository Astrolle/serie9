// dreams-manager.js - Sistema para que el usuario cree y gestione sus propios sueños

// Categorías disponibles para los sueños
const dreamCategories = {
    creative: { label: 'Creatividad', icon: '🎨', color: '#9c6ade' },
    career: { label: 'Carrera', icon: '🚀', color: '#5c6ac4' },
    personal: { label: 'Personal', icon: '🌟', color: '#eec200' },
    health: { label: 'Salud', icon: '💪', color: '#00b67a' },
    relationships: { label: 'Relaciones', icon: '❤️', color: '#ff6b6b' },
    learning: { label: 'Aprendizaje', icon: '📚', color: '#008060' },
    impact: { label: 'Impacto', icon: '🌍', color: '#0052cc' },
    financial: { label: 'Financiero', icon: '💰', color: '#00b67a' },
    spiritual: { label: 'Espiritual', icon: '🧘', color: '#7c3aed' }
};

// Cargar sueños del usuario desde localStorage
let userDreams = JSON.parse(localStorage.getItem('serie9.userDreams') || '{}');
let dreamProgress = JSON.parse(localStorage.getItem('serie9.dreamProgress') || '{}');

// Guardar sueños del usuario
function saveUserDreams() {
    localStorage.setItem('serie9.userDreams', JSON.stringify(userDreams));
}

// Guardar progreso de sueños
function saveDreamProgress() {
    localStorage.setItem('serie9.dreamProgress', JSON.stringify(dreamProgress));
}

// Crear sección de gestión de sueños
function createDreamTrackerSection() {
    // Crear el modal principal de sueños
    const modal = document.createElement('div');
    modal.id = 'dreamManagerModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content dream-manager-modal">
            <span class="close" onclick="closeDreamManagerModal()">×</span>
            <div class="dream-header-controls">
                <h2>🌟 Mapa de Sueños</h2>
                <button class="btn btn-primary" onclick="openDreamCreatorModal()">
                    + Crear nuevo sueño
                </button>
            </div>
            <div id="dreamProgressGrid" class="dream-progress-grid"></div>
            <div class="dream-stats-summary mt-3">
                <div class="weekly-focus">
                    <h4>Enfoque esta semana</h4>
                    <div id="weeklyFocusChart"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Función para abrir el modal de sueños
function openDreamManagerModal() {
    const modal = document.getElementById('dreamManagerModal');
    if (modal) {
        modal.style.display = 'block';
        updateDreamProgressDisplay();
    }
}

// Función para cerrar el modal de sueños
function closeDreamManagerModal() {
    const modal = document.getElementById('dreamManagerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}


// Agregar botón a la navegación inferior
function addDreamButtonToNav() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;

    // Verificar si ya existe el botón
    if (document.querySelector('.nav-btn.dreams')) return;

    // Crear el botón de sueños
    const dreamButton = document.createElement('button');
    dreamButton.className = 'nav-btn dreams';
    dreamButton.innerHTML = '🌟<span>Sueños</span>';
    dreamButton.onclick = openDreamManagerModal;

    // Agregar indicador de tareas pendientes
    const pendingTasks = countPendingDailyTasks();
    if (pendingTasks > 0) {
        dreamButton.innerHTML += `<span class="badge">${pendingTasks}</span>`;
    }

    // Insertar antes del botón "Más"
    const moreButton = bottomNav.querySelector('[onclick*="openManifestSidebar"]');
    if (moreButton) {
        bottomNav.insertBefore(dreamButton, moreButton);
    } else {
        bottomNav.appendChild(dreamButton);
    }
}

// Contar tareas diarias pendientes
function countPendingDailyTasks() {
    const today = new Date().toDateString();
    let pendingCount = 0;

    Object.keys(userDreams).forEach(dreamId => {
        const existingTask = document.querySelector(`.daily-dream-task[data-dream-id="${dreamId}"][data-created-date="${today}"]`);
        if (existingTask && existingTask.querySelector('.timer').textContent !== "✅") {
            pendingCount++;
        }
    });

    return pendingCount;
}

// Crear widget compacto en el dashboard principal (opcional)
function createDreamWidget() {
    const heatmapSection = document.querySelector('.heatmap-section');
    if (!heatmapSection) return;

    const widget = document.createElement('div');
    widget.className = 'dream-widget';
    widget.innerHTML = `
        <div class="widget-header">
            <h4>🌟 Mis Sueños</h4>
            <button class="btn-small" onclick="openDreamManagerModal()">Ver todo</button>
        </div>
        <div class="widget-content">
            <div class="dream-quick-stats">
                <div class="quick-stat">
                    <span class="stat-number">${Object.keys(userDreams).length}</span>
                    <span class="stat-text">Sueños activos</span>
                </div>
                <div class="quick-stat">
                    <span class="stat-number">${countTodayProgress()}%</span>
                    <span class="stat-text">Progreso hoy</span>
                </div>
            </div>
        </div>
    `;

    heatmapSection.parentNode.insertBefore(widget, heatmapSection.nextSibling);
}

// Calcular progreso de hoy
function countTodayProgress() {
    const today = new Date().toDateString();
    let completedToday = 0;
    const totalDreams = Object.keys(userDreams).length;

    if (totalDreams === 0) return 0;

    Object.keys(userDreams).forEach(dreamId => {
        const balance = dreamBalance[dreamId];
        if (balance && balance.history.find(h => h.date === today && h.completed)) {
            completedToday++;
        }
    });

    return Math.round((completedToday / totalDreams) * 100);
}

// Modal para crear/editar sueños
function createDreamCreatorModal() {
    const modal = document.createElement('div');
    modal.id = 'dreamCreatorModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content dream-creator-modal">
            <span class="close" onclick="closeDreamCreatorModal()">×</span>
            <h2 id="dreamModalTitle">Crear nuevo sueño</h2>
            
            <form id="dreamForm" onsubmit="saveDream(event)">
                <input type="hidden" id="dreamId" />
                
                <div class="form-group">
                    <label for="dreamTitle">Título del sueño</label>
                    <input type="text" id="dreamTitle" class="form-control" 
                           placeholder="Ej: Escribir mi primer libro" required />
                </div>
                
                <div class="form-group">
                    <label for="dreamCategory">Categoría</label>
                    <select id="dreamCategory" class="form-select" required>
                        ${Object.entries(dreamCategories).map(([key, cat]) => `
                            <option value="${key}">${cat.icon} ${cat.label}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="dreamDescription">Descripción</label>
                    <textarea id="dreamDescription" class="form-control" rows="3"
                              placeholder="¿Qué significa este sueño para ti?" required></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="dreamTotalHours">Meta total (horas)</label>
                        <input type="number" id="dreamTotalHours" class="form-control" 
                               min="1" placeholder="300" required />
                    </div>
                    
                    <div class="form-group">
                        <label for="dreamWeeklyGoal">Objetivo semanal (horas)</label>
                        <input type="number" id="dreamWeeklyGoal" class="form-control" 
                               min="1" placeholder="10" required />
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Hitos del sueño</label>
                    <div id="milestonesContainer">
                        <div class="milestone-input">
                            <input type="text" class="form-control" 
                                   placeholder="Primer hito" required />
                            <button type="button" class="btn btn-remove" onclick="removeMilestone(this)">×</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary mt-2" onclick="addMilestoneInput()">
                        + Agregar hito
                    </button>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeDreamCreatorModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Guardar sueño
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

// Modificar la función de progreso diario para que sea menos invasiva
function createDailyProgressDashboard() {
    // En lugar de crear una sección grande, crear un resumen compacto
    const dailyWidget = document.createElement('div');
    dailyWidget.className = 'daily-progress-widget';
    dailyWidget.innerHTML = `
        <div class="widget-header">
            <h4>📅 Tareas de Hoy</h4>
            <button class="btn-small" onclick="openDreamManagerModal()">
                ${countPendingDailyTasks()} pendientes
            </button>
        </div>
    `;

    // Insertar en algún lugar menos prominente
    const kanbanBoard = document.getElementById('kanbanBoard');
    if (kanbanBoard) {
        kanbanBoard.parentNode.insertBefore(dailyWidget, kanbanBoard);
    }
}

// Abrir modal de creación de sueños
function openDreamCreatorModal(dreamId = null) {
    const modal = document.getElementById('dreamCreatorModal') || createDreamCreatorModal();
    const form = document.getElementById('dreamForm');

    if (dreamId) {
        // Modo edición
        const dream = userDreams[dreamId];
        if (!dream) return;

        document.getElementById('dreamModalTitle').textContent = 'Editar sueño';
        document.getElementById('dreamId').value = dreamId;
        document.getElementById('dreamTitle').value = dream.title;
        document.getElementById('dreamCategory').value = dream.category;
        document.getElementById('dreamDescription').value = dream.description;
        document.getElementById('dreamTotalHours').value = dream.totalHours;
        document.getElementById('dreamWeeklyGoal').value = dream.weeklyGoal;

        // Cargar hitos
        const container = document.getElementById('milestonesContainer');
        container.innerHTML = '';
        dream.milestones.forEach(milestone => {
            addMilestoneInput(milestone);
        });
    } else {
        // Modo creación
        form.reset();
        document.getElementById('dreamModalTitle').textContent = 'Crear nuevo sueño';
        document.getElementById('dreamId').value = '';

        // Un hito por defecto
        const container = document.getElementById('milestonesContainer');
        container.innerHTML = `
            <div class="milestone-input">
                <input type="text" class="form-control" placeholder="Primer hito" required />
                <button type="button" class="btn btn-remove" onclick="removeMilestone(this)">×</button>
            </div>
        `;
    }

    modal.style.display = 'block';
}

// Cerrar modal
function closeDreamCreatorModal() {
    const modal = document.getElementById('dreamCreatorModal');
    if (modal) modal.style.display = 'none';
}

// Agregar input de hito
function addMilestoneInput(value = '') {
    const container = document.getElementById('milestonesContainer');
    const div = document.createElement('div');
    div.className = 'milestone-input';
    div.innerHTML = `
        <input type="text" class="form-control" placeholder="Nuevo hito" value="${value}" required />
        <button type="button" class="btn btn-remove" onclick="removeMilestone(this)">×</button>
    `;
    container.appendChild(div);
}

// Eliminar input de hito
function removeMilestone(button) {
    const container = document.getElementById('milestonesContainer');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

// Guardar sueño
function saveDream(event) {
    event.preventDefault();

    const dreamId = document.getElementById('dreamId').value || `dream-${Date.now()}`;
    const category = document.getElementById('dreamCategory').value;

    // Recopilar hitos
    const milestoneInputs = document.querySelectorAll('#milestonesContainer input');
    const milestones = Array.from(milestoneInputs)
        .map(input => input.value.trim())
        .filter(value => value);

    const dream = {
        id: dreamId,
        title: document.getElementById('dreamTitle').value.trim(),
        category: category,
        icon: dreamCategories[category].icon,
        color: dreamCategories[category].color,
        description: document.getElementById('dreamDescription').value.trim(),
        totalHours: parseInt(document.getElementById('dreamTotalHours').value),
        weeklyGoal: parseInt(document.getElementById('dreamWeeklyGoal').value),
        milestones: milestones,
        createdAt: userDreams[dreamId]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Guardar sueño
    userDreams[dreamId] = dream;
    saveUserDreams();

    // Inicializar progreso si es nuevo
    if (!dreamProgress[dreamId]) {
        dreamProgress[dreamId] = {
            totalMinutes: 0,
            sessionsCompleted: 0,
            lastSession: null,
            weeklyMinutes: 0,
            milestonesCompleted: []
        };
        saveDreamProgress();
    }

    closeDreamCreatorModal();
    updateDreamProgressDisplay();
    showToast('Sueño guardado exitosamente');
}

// Actualizar visualización de progreso
function updateDreamProgressDisplay() {
    const grid = document.getElementById('dreamProgressGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Si no hay sueños, mostrar mensaje
    if (Object.keys(userDreams).length === 0) {
        grid.innerHTML = `
            <div class="no-dreams-message">
                <p>No has creado ningún sueño aún.</p>
                <button class="btn btn-primary" onclick="openDreamCreatorModal()">
                    Crear mi primer sueño
                </button>
            </div>
        `;
        return;
    }

    // Mostrar cada sueño
    Object.entries(userDreams).forEach(([dreamId, dream]) => {
        const progress = dreamProgress[dreamId] || {
            totalMinutes: 0,
            sessionsCompleted: 0,
            weeklyMinutes: 0,
            milestonesCompleted: []
        };

        const totalHours = progress.totalMinutes / 60;
        const percentage = Math.min((totalHours / dream.totalHours) * 100, 100);
        const weeklyHours = progress.weeklyMinutes / 60;

        const dreamCard = document.createElement('div');
        dreamCard.className = 'dream-progress-card';
        dreamCard.style.borderLeftColor = dream.color;
        dreamCard.innerHTML = `
            <div class="dream-card-header">
                <div class="dream-header">
                    <span class="dream-icon">${dream.icon}</span>
                    <div class="dream-info">
                        <h4>${dream.title}</h4>
                        <p class="dream-description">${dream.description}</p>
                    </div>
                </div>
                <div class="dream-actions">
                    <button class="btn-icon" onclick="openDreamCreatorModal('${dreamId}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="deleteDream('${dreamId}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="dream-stats">
                <div class="stat-item">
                    <span class="stat-value">${totalHours.toFixed(1)}h</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${weeklyHours.toFixed(1)}h</span>
                    <span class="stat-label">Esta semana</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${percentage.toFixed(0)}%</span>
                    <span class="stat-label">Completado</span>
                </div>
            </div>
            
            <div class="dream-progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background-color: ${dream.color}"></div>
            </div>
            
            <div class="dream-milestones">
                ${dream.milestones.map((milestone, index) => `
                    <div class="milestone ${progress.milestonesCompleted.includes(index) ? 'completed' : ''}">
                        ${progress.milestonesCompleted.includes(index) ? '✓' : '○'} ${milestone}
                    </div>
                `).join('')}
            </div>
            
            <button class="btn btn-dream" onclick="createDreamTask('${dreamId}')">
                + Trabajar en este sueño
            </button>
        `;

        grid.appendChild(dreamCard);
    });

    updateWeeklyFocusChart();
}

// Eliminar sueño
function deleteDream(dreamId) {
    if (!confirm('¿Estás seguro de eliminar este sueño? Esta acción no se puede deshacer.')) {
        return;
    }

    delete userDreams[dreamId];
    delete dreamProgress[dreamId];

    saveUserDreams();
    saveDreamProgress();
    updateDreamProgressDisplay();
    showToast('Sueño eliminado');
}

// Actualizar gráfico de enfoque semanal
function updateWeeklyFocusChart() {
    const chart = document.getElementById('weeklyFocusChart');
    if (!chart) return;

    let totalWeeklyMinutes = 0;
    const weeklyData = [];

    Object.entries(userDreams).forEach(([dreamId, dream]) => {
        const progress = dreamProgress[dreamId] || { weeklyMinutes: 0 };
        const minutes = progress.weeklyMinutes;
        totalWeeklyMinutes += minutes;

        if (minutes > 0) {
            weeklyData.push({
                dream: dream,
                minutes: minutes,
                hours: minutes / 60
            });
        }
    });

    chart.innerHTML = '';

    if (weeklyData.length === 0) {
        chart.innerHTML = '<p class="no-data">No has trabajado en tus sueños esta semana</p>';
        return;
    }

    weeklyData.sort((a, b) => b.minutes - a.minutes);

    weeklyData.forEach(data => {
        const percentage = (data.minutes / totalWeeklyMinutes) * 100;
        const bar = document.createElement('div');
        bar.className = 'focus-bar';
        bar.innerHTML = `
            <div class="focus-label">
                <span>${data.dream.icon} ${data.dream.title}</span>
                <span>${data.hours.toFixed(1)}h (${percentage.toFixed(0)}%)</span>
            </div>
            <div class="focus-bar-fill" style="width: ${percentage}%; background-color: ${data.dream.color}"></div>
        `;
        chart.appendChild(bar);
    });
}

// Crear tarea para un sueño
function createDreamTask(dreamId) {
    const dream = userDreams[dreamId];
    if (!dream) return;

    // Cerrar modales
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');

    // Abrir modal de tarea
    openModal();

    // Configurar para tarea de sueño
    document.getElementById('taskType').value = 'dream';
    toggleSubcategory();

    // Pre-llenar información
    document.getElementById('taskInput').value = `Trabajar en: ${dream.title}`;

    // Seleccionar el sueño
    setTimeout(() => {
        const dreamSelector = document.getElementById('dreamSelector');
        if (dreamSelector) {
            dreamSelector.value = dreamId;
            updateDreamPreview();
        }
    }, 100);
}

// Modificar el modal de tareas para incluir selector de sueños
function addDreamSelectorToModal() {
    const dreamOptions = document.getElementById('dreamOptions');
    if (!dreamOptions) return;

    dreamOptions.innerHTML = `
        <label for="dreamSelector">Selecciona tu sueño:</label>
        <select id="dreamSelector" class="form-select" required>
            <option value="">-- Selecciona un sueño --</option>
            ${Object.entries(userDreams).map(([id, dream]) => `
                <option value="${id}">${dream.icon} ${dream.title}</option>
            `).join('')}
        </select>
        
        <div class="dream-preview mt-3" id="dreamPreview"></div>
    `;

    document.getElementById('dreamSelector').addEventListener('change', updateDreamPreview);
}

// Actualizar preview del sueño
function updateDreamPreview() {
    const dreamId = document.getElementById('dreamSelector').value;
    const dream = userDreams[dreamId];
    const preview = document.getElementById('dreamPreview');

    if (!dream || !preview) {
        if (preview) preview.innerHTML = '';
        return;
    }

    preview.innerHTML = `
        <div class="dream-preview-card" style="border-left: 4px solid ${dream.color}; padding: 12px; background: ${lightenColor(dream.color, 0.95)}">
            <h5>${dream.icon} ${dream.title}</h5>
            <p>${dream.description}</p>
            <div class="dream-preview-stats">
                <span>Meta: ${dream.totalHours}h total</span>
                <span>Objetivo: ${dream.weeklyGoal}h/semana</span>
            </div>
        </div>
    `;
}

// Modificar addTask para manejar sueños
const originalAddTaskForDreams = window.addTask;
window.addTask = function() {
    const type = document.getElementById("taskType").value;

    if (type === "dream") {
        const dreamId = document.getElementById("dreamSelector").value;

        if (!dreamId) {
            alert('Por favor selecciona un sueño');
            return;
        }

        const dream = userDreams[dreamId];
        const taskName = document.getElementById("taskInput").value.trim() || `Trabajar en: ${dream.title}`;

        const card = createDreamTaskCard(taskName, dreamId, dream);
        document.getElementById("waitingColumn").appendChild(card);
        saveToLocalStorage();

        // Limpiar y cerrar
        document.getElementById("taskInput").value = "";
        closeModal();

        return;
    }

    originalAddTaskForDreams();
};

// Crear tarjeta de tarea de sueño
function createDreamTaskCard(taskName, dreamId, dream) {
    const card = document.createElement("div");
    card.classList.add("task-card", "task-dream");
    card.style.borderLeftColor = dream.color;
    card.style.backgroundColor = lightenColor(dream.color, 0.95);
    card.draggable = true;
    card.ondragstart = drag;
    card.id = `task-${Date.now()}`;

    card.dataset.dreamId = dreamId;
    card.dataset.dreamTitle = dream.title;

    const label = document.createElement("span");
    label.innerHTML = `${dream.icon} ${taskName} <small style="color: ${dream.color}">[${dream.title}]</small>`;

    const timer = document.createElement("span");
    timer.textContent = "27:00";
    timer.style.fontSize = "0.9rem";
    timer.style.color = "#555";

    // Botones
    const startBtn = document.createElement("button");
    startBtn.textContent = "▶️";
    startBtn.onclick = () => startDreamCountdown(timer, startBtn, 27 * 60, card);

    const noteBtn = document.createElement("button");
    noteBtn.textContent = "💬";
    noteBtn.onclick = () => openNotes(card.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => {
        if (confirm("¿Deseas eliminar esta tarea de sueño?")) {
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
    rightSide.appendChild(noteBtn);
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

    return card;
}

// Countdown para sueños
function startDreamCountdown(timerElement, button, duration, card) {
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

            // Actualizar progreso
            updateDreamProgress(dreamId, duration);

            const endSound = document.getElementById("endSound");
            if (endSound) endSound.play().catch(() => {});

            updateDreamProgressDisplay();

            if (window.headerFunctions) {
                window.headerFunctions.updateUserStats();
            }

            saveToLocalStorage();
        }
    }, 1000);
}

// Actualizar progreso del sueño
function updateDreamProgress(dreamId, durationInSeconds) {
    if (!dreamProgress[dreamId]) {
        dreamProgress[dreamId] = {
            totalMinutes: 0,
            sessionsCompleted: 0,
            lastSession: null,
            weeklyMinutes: 0,
            milestonesCompleted: []
        };
    }

    const progress = dreamProgress[dreamId];
    const minutes = durationInSeconds / 60;

    progress.totalMinutes += minutes;
    progress.sessionsCompleted++;
    progress.lastSession = new Date().toISOString();

    // Actualizar minutos semanales
    const weekStart = getWeekStart();
    const lastSessionWeek = progress.lastSession ? getWeekStart(new Date(progress.lastSession)) : null;

    if (!lastSessionWeek || weekStart.getTime() !== lastSessionWeek.getTime()) {
        progress.weeklyMinutes = minutes;
    } else {
        progress.weeklyMinutes += minutes;
    }

    // Verificar milestones
    checkMilestones(dreamId);

    saveDreamProgress();
}

// Verificar milestones
function checkMilestones(dreamId) {
    const dream = userDreams[dreamId];
    const progress = dreamProgress[dreamId];

    if (!dream || !progress) return;

    const totalHours = progress.totalMinutes / 60;
    const percentage = (totalHours / dream.totalHours) * 100;

    // Completar milestones basado en porcentaje
    const milestonesCount = dream.milestones.length;
    const thresholds = [];

    for (let i = 0; i < milestonesCount; i++) {
        thresholds.push(((i + 1) / milestonesCount) * 100);
    }

    thresholds.forEach((threshold, index) => {
        if (percentage >= threshold && !progress.milestonesCompleted.includes(index)) {
            progress.milestonesCompleted.push(index);
            showMilestoneNotification(dream, dream.milestones[index]);
        }
    });
}

// Notificación de milestone
function showMilestoneNotification(dream, milestone) {
    const toast = document.createElement('div');
    toast.className = 'milestone-notification';
    toast.innerHTML = `
        <div class="milestone-content">
            <span class="milestone-icon">${dream.icon}</span>
            <div class="milestone-text">
                <strong>¡Hito alcanzado!</strong>
                <p>${milestone}</p>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Toast genérico
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utilidades
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

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

// Inicializar sistema
function initDreamManager() {
    createDreamTrackerSection();
    createDreamCreatorModal();
    addDreamButtonToNav();
    createDreamWidget(); // Widget opcional

    // Modificar modal de tareas existente
    const originalOpenModal = window.openModal;
    window.openModal = function() {
        originalOpenModal();
        setTimeout(() => {
            addDreamSelectorToModal();
        }, 100);
    };

    // Actualizar toggleSubcategory
    const originalToggle = window.toggleSubcategory;
    window.toggleSubcategory = function() {
        const taskType = document.getElementById("taskType").value;
        document.getElementById("pauseOptions").style.display =
            taskType === "pause" ? "block" : "none";
        document.getElementById("dreamOptions").style.display =
            taskType === "dream" ? "block" : "none";
    };

    // Resetear estadísticas semanales
    checkWeeklyReset();
}
function updateDreamButtonBadge() {
    const dreamButton = document.querySelector('.nav-btn.dreams');
    if (!dreamButton) return;

    const pendingTasks = countPendingDailyTasks();
    const badge = dreamButton.querySelector('.badge');

    if (pendingTasks > 0) {
        if (badge) {
            badge.textContent = pendingTasks;
        } else {
            dreamButton.innerHTML += `<span class="badge">${pendingTasks}</span>`;
        }
    } else if (badge) {
        badge.remove();
    }
}

// Verificar reset semanal
function checkWeeklyReset() {
    const lastReset = localStorage.getItem('serie9.lastWeeklyReset');
    const currentWeek = getWeekStart().toISOString();

    if (lastReset !== currentWeek) {
        Object.keys(dreamProgress).forEach(dreamId => {
            if (dreamProgress[dreamId]) {
                dreamProgress[dreamId].weeklyMinutes = 0;
            }
        });

        saveDreamProgress();
        localStorage.setItem('serie9.lastWeeklyReset', currentWeek);
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDreamManager, 1000);
});

// Exportar funciones globales
window.openDreamCreatorModal = openDreamCreatorModal;
window.closeDreamCreatorModal = closeDreamCreatorModal;
window.saveDream = saveDream;
window.addMilestoneInput = addMilestoneInput;
window.removeMilestone = removeMilestone;
window.createDreamTask = createDreamTask;
window.deleteDream = deleteDream;
window.updateDreamProgress = updateDreamProgress;
window.userDreams = userDreams;
window.dreamProgress = dreamProgress;
// Exportar funciones necesarias
window.openDreamManagerModal = openDreamManagerModal;
window.closeDreamManagerModal = closeDreamManagerModal;