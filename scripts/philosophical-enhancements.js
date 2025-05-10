// Philosophical Enhancements for Serie9
// This file adds reflection prompts, journal features, and expanded manifesto

// Reflection prompts for different types of pauses
const reflectionPrompts = {
    Pensar: [
        "¿Qué aprendiste de tu último ciclo de enfoque?",
        "¿Qué patrones observas en tu ritmo interno hoy?",
        "¿Cómo se siente tu energía en este momento?",
        "¿Qué puedes soltar ahora mismo?",
        "¿Qué merece tu atención verdadera?",
        "¿Cómo te hablas a ti mismo mientras trabajas?",
        "¿Qué te está pidiendo tu cuerpo?",
        "¿Dónde sientes tensión? ¿Puedes liberarla?",
        "¿Qué celebras de tu trabajo de hoy?",
        "¿Qué te está enseñando esta pausa?"
    ],
    Respirar: [
        "Inhala... sostén... exhala...",
        "Con cada respiración, liberas lo que no necesitas",
        "Tu respiración es el puente entre mente y cuerpo",
        "Deja que tu respiración fluya como las olas del mar",
        "Cada exhalación es una oportunidad de soltar",
        "La respiración profunda resetea tu sistema nervioso",
        "Respira hacia el espacio en tu pecho",
        "Con cada respiración, te reconectas contigo",
        "Deja que la respiración sea tu ancla al presente",
        "Cada respiración es un acto de autocuidado"
    ],
    Meditar: [
        "Observa tus pensamientos sin juzgarlos",
        "El silencio entre latidos contiene verdad",
        "Eres el observador, no los pensamientos",
        "En la quietud encuentras tu centro",
        "Deja que todo sea tal como es ahora",
        "La paz no es ausencia de movimiento, es presencia plena",
        "Cada momento de conciencia es precioso",
        "No tienes que lograr nada en este momento",
        "El vacío está lleno de potencial infinito",
        "Tu ser está completo en este instante"
    ],
    Leer: [
        "Lee no para consumir, sino para contemplar",
        "Cada palabra es una ventana a otra conciencia",
        "La lectura lenta permite que las ideas respiren",
        "¿Qué resonó más profundamente contigo?",
        "Deja que las palabras se asienten en tu ser",
        "Leer es una conversación a través del tiempo",
        "¿Qué preguntas despertó esta lectura?",
        "La sabiduría necesita espacio para germinar",
        "¿Cómo puedes integrar lo leído en tu vida?",
        "Lee como quien saborea, no como quien devora"
    ]
};

// Progress Journal feature
const journalSystem = {
    // Add journal entry
    addEntry: function(type, content, mood = null) {
        const entries = JSON.parse(localStorage.getItem('serie9.journal') || '[]');
        const entry = {
            id: `journal-${Date.now()}`,
            date: new Date().toISOString(),
            type: type, // 'reflection', 'insight', 'gratitude', 'intention'
            content: content,
            mood: mood, // optional: 'peaceful', 'energized', 'focused', 'tired', 'inspired'
            timestamp: Date.now()
        };
        entries.push(entry);
        localStorage.setItem('serie9.journal', JSON.stringify(entries));
        return entry;
    },

    // Get all entries
    getEntries: function(filter = null) {
        const entries = JSON.parse(localStorage.getItem('serie9.journal') || '[]');
        if (filter) {
            return entries.filter(entry => entry.type === filter);
        }
        return entries;
    },

    // Get entries by date range
    getEntriesByDateRange: function(startDate, endDate) {
        const entries = JSON.parse(localStorage.getItem('serie9.journal') || '[]');
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
    },

    // Create weekly summary
    createWeeklySummary: function() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const entries = this.getEntriesByDateRange(weekAgo, new Date());

        const summary = {
            totalEntries: entries.length,
            byType: {},
            moodDistribution: {},
            keyInsights: [],
            gratitudes: []
    };

        entries.forEach(entry => {
            // Count by type
            summary.byType[entry.type] = (summary.byType[entry.type] || 0) + 1;

            // Count moods
            if (entry.mood) {
                summary.moodDistribution[entry.mood] = (summary.moodDistribution[entry.mood] || 0) + 1;
            }

            // Collect insights and gratitudes
            if (entry.type === 'insight') {
                summary.keyInsights.push(entry.content);
            }
            if (entry.type === 'gratitude') {
                summary.gratitudes.push(entry.content);
            }
        });

        return summary;
    }
};

// Enhanced reflection modal
function createReflectionModal() {
    const modal = document.createElement('div');
    modal.id = 'reflectionModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content reflection-modal">
      <span class="close" onclick="closeReflectionModal()">×</span>
      <h2>Momento de Reflexión</h2>
      <p id="reflectionPrompt" class="reflection-prompt"></p>
      
      <div class="journal-input-section">
        <textarea id="reflectionInput" placeholder="Escribe tu reflexión..." rows="6"></textarea>
        
        <div class="mood-selector">
          <label>¿Cómo te sientes?</label>
          <div class="mood-options">
            <button class="mood-btn" data-mood="peaceful">😌 Paz</button>
            <button class="mood-btn" data-mood="energized">⚡ Energía</button>
            <button class="mood-btn" data-mood="focused">🎯 Enfoque</button>
            <button class="mood-btn" data-mood="tired">😴 Cansancio</button>
            <button class="mood-btn" data-mood="inspired">✨ Inspiración</button>
          </div>
        </div>
        
        <div class="journal-actions">
          <button class="btn btn-secondary" onclick="skipReflection()">Saltar</button>
          <button class="btn btn-primary" onclick="saveReflection()">Guardar reflexión</button>
        </div>
      </div>
      
      <div class="daily-quote">
        <p id="dailyQuote"></p>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

// Journal viewer modal
function createJournalModal() {
    const modal = document.createElement('div');
    modal.id = 'journalModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content journal-modal">
      <span class="close" onclick="closeJournalModal()">×</span>
      <h2>Tu Diario de Conciencia</h2>
      
      <div class="journal-tabs">
        <button class="journal-tab active" data-filter="all">Todo</button>
        <button class="journal-tab" data-filter="reflection">Reflexiones</button>
        <button class="journal-tab" data-filter="insight">Descubrimientos</button>
        <button class="journal-tab" data-filter="gratitude">Gratitud</button>
        <button class="journal-tab" data-filter="intention">Intenciones</button>
      </div>
      
      <div id="journalEntries" class="journal-entries"></div>
      
      <div class="journal-footer">
        <button class="btn btn-secondary" onclick="exportJournal()">Exportar diario</button>
        <button class="btn btn-primary" onclick="showWeeklySummary()">Resumen semanal</button>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

// Show reflection modal
function showReflectionModal(pauseType = 'Pensar') {
    const modal = document.getElementById('reflectionModal');
    const promptElement = document.getElementById('reflectionPrompt');
    const prompts = reflectionPrompts[pauseType] || reflectionPrompts.Pensar;

    // Select random prompt
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    promptElement.textContent = randomPrompt;

    // Show daily quote
    const dailyQuote = getDailyQuote();
    document.getElementById('dailyQuote').textContent = dailyQuote;

    modal.style.display = 'block';
}

// Get daily philosophical quote
function getDailyQuote() {
    const quotes = [
        "\"El tiempo no es dinero. El tiempo es vida.\" - José Luis Sampedro",
        "\"La prisa es el enemigo del arte y de la humanidad.\" - Charlie Chaplin",
        "\"No es el tiempo lo que nos falta, es la capacidad de estar presentes.\" - Thich Nhat Hanh",
        "\"El silencio es el espacio en el que todo sucede.\" - Krishnamurti",
        "\"La creatividad requiere el coraje de soltar certezas.\" - Erich Fromm",
        "\"El descanso no es ocio, es reparación.\" - Daniel Goleman",
        "\"Apresurarse lentamente.\" - Proverbio latino",
        "\"La profundidad es más valiosa que la velocidad.\" - Cal Newport",
        "\"Cada respiración es una oportunidad de comenzar de nuevo.\" - Jon Kabat-Zinn",
        "\"El arte de descansar es una parte del arte de trabajar.\" - John Steinbeck"
    ];

    // Use day of year as seed for consistent daily quote
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return quotes[dayOfYear % quotes.length];
}

// Save reflection
function saveReflection() {
    const content = document.getElementById('reflectionInput').value.trim();
    const selectedMood = document.querySelector('.mood-btn.selected');

    if (content) {
        const mood = selectedMood ? selectedMood.dataset.mood : null;
        journalSystem.addEntry('reflection', content, mood);

        // Show confirmation toast
        showToast('Reflexión guardada ✨');

        closeReflectionModal();
        document.getElementById('reflectionInput').value = '';
    }
}

// Show journal entries
function showJournalEntries(filter = 'all') {
    const entries = filter === 'all' ? journalSystem.getEntries() : journalSystem.getEntries(filter);
    const container = document.getElementById('journalEntries');

    container.innerHTML = entries.map(entry => `
    <div class="journal-entry ${entry.type}">
      <div class="entry-header">
        <span class="entry-type">${getEntryTypeLabel(entry.type)}</span>
        <span class="entry-date">${formatEntryDate(entry.date)}</span>
        ${entry.mood ? `<span class="entry-mood">${getMoodEmoji(entry.mood)}</span>` : ''}
      </div>
      <div class="entry-content">${entry.content}</div>
    </div>
  `).join('');
}

// Helper functions
function getEntryTypeLabel(type) {
    const labels = {
        reflection: 'Reflexión',
        insight: 'Descubrimiento',
        gratitude: 'Gratitud',
        intention: 'Intención'
    };
    return labels[type] || type;
}

function getMoodEmoji(mood) {
    const emojis = {
        peaceful: '😌',
        energized: '⚡',
        focused: '🎯',
        tired: '😴',
        inspired: '✨'
    };
    return emojis[mood] || '';
}

function formatEntryDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es', options);
}

// Export journal functionality
function exportJournal() {
    const entries = journalSystem.getEntries();
    const exportData = {
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        entries: entries
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serie9-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Weekly summary modal
function showWeeklySummary() {
    const summary = journalSystem.createWeeklySummary();
    const modal = document.createElement('div');
    modal.className = 'modal summary-modal';
    modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.parentElement.parentElement.remove()">×</span>
      <h2>Resumen Semanal de Tu Práctica</h2>
      
      <div class="summary-stats">
        <div class="stat-card">
          <span class="stat-number">${summary.totalEntries}</span>
          <span class="stat-label">Entradas totales</span>
        </div>
        
        <div class="stat-card">
          <span class="stat-number">${Object.keys(summary.moodDistribution).length}</span>
          <span class="stat-label">Estados emocionales</span>
        </div>
        
        <div class="stat-card">
          <span class="stat-number">${summary.keyInsights.length}</span>
          <span class="stat-label">Descubrimientos</span>
        </div>
      </div>
      
      <div class="summary-insights">
        <h3>Tus descubrimientos esta semana</h3>
        ${summary.keyInsights.map(insight => `<p>"${insight}"</p>`).join('')}
      </div>
      
      <div class="summary-gratitude">
        <h3>Momentos de gratitud</h3>
        ${summary.gratitudes.map(gratitude => `<p>"${gratitude}"</p>`).join('')}
      </div>
      
      <div class="summary-mood">
        <h3>Tu paisaje emocional</h3>
        <div class="mood-chart">
          ${Object.entries(summary.moodDistribution).map(([mood, count]) => `
            <div class="mood-bar">
              <span>${getMoodEmoji(mood)} ${mood}</span>
              <div class="bar" style="width: ${(count / summary.totalEntries) * 100}%"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Toast notification
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

// Initialize all philosophical features
function initPhilosophicalFeatures() {
    createReflectionModal();
    createJournalModal();

    // Add journal button to bottom nav
    const navButtons = document.querySelector('.bottom-nav');
    const journalBtn = document.createElement('button');
    journalBtn.className = 'nav-btn';
    journalBtn.innerHTML = '📔<span>Diario</span>';
    journalBtn.onclick = () => {
        document.getElementById('journalModal').style.display = 'block';
        showJournalEntries('all');
    };

    // Insert before the last button (Más)
    navButtons.insertBefore(journalBtn, navButtons.lastElementChild);

    // Add mood button event listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-btn')) {
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    // Add journal tab functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('journal-tab')) {
            document.querySelectorAll('.journal-tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            showJournalEntries(e.target.dataset.filter);
        }
    });
}

// Modify the existing startCountdown function to show reflection after pause
const originalStartCountdown = window.startCountdown;
window.startCountdown = function(timerElement, button, duration, type, card, restartBtn = null, originalDuration = duration) {
    // Store original callback
    const originalCallback = () => originalStartCountdown.apply(this, arguments);

    // Wrap with reflection logic
    const wrappedStartCountdown = function(timerElement, button, duration, type, card, restartBtn = null, originalDuration = duration) {
        let totalSeconds = duration;
        const progressBar = card.querySelector(".progress-bar");
        const taskId = card.id;

        button.disabled = true;
        card.draggable = false;
        card.dataset.locked = "true";
        document.getElementById("startSound").play().catch(() => {});

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

                // Show reflection modal after pause completion
                if (type === "pause") {
                    const taskLabel = card.querySelector("span").textContent;
                    const pauseType = taskLabel.includes("Respirar") ? "Respirar" :
                        taskLabel.includes("Meditar") ? "Meditar" :
                            taskLabel.includes("Leer") ? "Leer" : "Pensar";

                    setTimeout(() => showReflectionModal(pauseType), 1000);
                }

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
    };

    return wrappedStartCountdown.apply(this, arguments);
};

// Add this to philosophical-enhancements.js to enable manual journal entries

// Create manual journal entry modal
function createManualJournalModal() {
    const modal = document.createElement('div');
    modal.id = 'manualJournalModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content journal-entry-modal">
      <span class="close" onclick="closeManualJournalModal()">×</span>
      <h2>Nueva Entrada de Diario</h2>
      
      <div class="entry-type-selector">
        <label>Tipo de entrada:</label>
        <select id="manualEntryType" class="form-select">
          <option value="reflection">Reflexión</option>
          <option value="insight">Descubrimiento</option>
          <option value="gratitude">Gratitud</option>
          <option value="intention">Intención</option>
        </select>
      </div>
      
      <div class="journal-input-section">
        <textarea id="manualJournalInput" placeholder="Escribe tu entrada..." rows="6"></textarea>
        
        <div class="mood-selector">
          <label>¿Cómo te sientes? (opcional)</label>
          <div class="mood-options">
            <button class="mood-btn manual-mood" data-mood="peaceful">😌 Paz</button>
            <button class="mood-btn manual-mood" data-mood="energized">⚡ Energía</button>
            <button class="mood-btn manual-mood" data-mood="focused">🎯 Enfoque</button>
            <button class="mood-btn manual-mood" data-mood="tired">😴 Cansancio</button>
            <button class="mood-btn manual-mood" data-mood="inspired">✨ Inspiración</button>
          </div>
        </div>
        
        <div class="journal-actions">
          <button class="btn btn-secondary" onclick="closeManualJournalModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveManualJournalEntry()">Guardar entrada</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

// Update the journal modal to include a "New Entry" button
function updateJournalModalWithNewEntryButton() {
    const originalCreateJournalModal = createJournalModal;

    window.createJournalModal = function() {
        originalCreateJournalModal();

        // Add new entry button to journal modal
        const journalModal = document.getElementById('journalModal');
        const journalHeader = journalModal.querySelector('h2');

        const newEntryBtn = document.createElement('button');
        newEntryBtn.className = 'btn btn-primary new-entry-btn';
        newEntryBtn.textContent = '+ Nueva Entrada';
        newEntryBtn.onclick = openManualJournalModal;

        journalHeader.parentNode.insertBefore(newEntryBtn, journalHeader.nextSibling);
    };
}

// Open manual journal entry modal
function openManualJournalModal() {
    document.getElementById('manualJournalModal').style.display = 'block';
    document.getElementById('manualJournalInput').value = '';

    // Clear mood selection
    document.querySelectorAll('.manual-mood').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Close manual journal entry modal
function closeManualJournalModal() {
    document.getElementById('manualJournalModal').style.display = 'none';
}

// Save manual journal entry
function saveManualJournalEntry() {
    const content = document.getElementById('manualJournalInput').value.trim();
    const type = document.getElementById('manualEntryType').value;
    const selectedMood = document.querySelector('.manual-mood.selected');

    if (content) {
        const mood = selectedMood ? selectedMood.dataset.mood : null;
        journalSystem.addEntry(type, content, mood);

        // Show confirmation toast
        showToast(`${getEntryTypeLabel(type)} guardada ✨`);

        closeManualJournalModal();

        // Refresh journal entries if journal modal is open
        if (document.getElementById('journalModal').style.display === 'block') {
            const activeTab = document.querySelector('.journal-tab.active');
            const filter = activeTab ? activeTab.dataset.filter : 'all';
            showJournalEntries(filter);
        }
    }
}

// Add quick entry buttons to journal system
function addQuickEntryButtons() {
    // Create floating quick entry menu
    const quickMenu = document.createElement('div');
    quickMenu.id = 'quickJournalMenu';
    quickMenu.className = 'quick-journal-menu hidden';
    quickMenu.innerHTML = `
    <button class="quick-entry-btn" onclick="quickJournalEntry('gratitude')">
      🙏 Gratitud rápida
    </button>
    <button class="quick-entry-btn" onclick="quickJournalEntry('insight')">
      💡 Descubrimiento rápido
    </button>
    <button class="quick-entry-btn" onclick="quickJournalEntry('intention')">
      🎯 Intención rápida
    </button>
    <button class="quick-entry-btn" onclick="openManualJournalModal()">
      ✍️ Entrada completa
    </button>
  `;
    document.body.appendChild(quickMenu);

    // Add quick entry trigger button to bottom nav
    const quickEntryTrigger = document.createElement('button');
    quickEntryTrigger.className = 'nav-btn quick-entry-trigger';
    quickEntryTrigger.innerHTML = '✍️<span>Entrada</span>';
    quickEntryTrigger.onclick = toggleQuickJournalMenu;

    // Insert after journal button
    const navButtons = document.querySelector('.bottom-nav');
    const journalBtn = Array.from(navButtons.children).find(btn =>
        btn.innerHTML.includes('Diario')
    );
    if (journalBtn) {
        navButtons.insertBefore(quickEntryTrigger, journalBtn.nextSibling);
    }
}

// Toggle quick journal menu
function toggleQuickJournalMenu() {
    const menu = document.getElementById('quickJournalMenu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('show');
}

// Quick journal entry
function quickJournalEntry(type) {
    const prompts = {
        gratitude: "¿Por qué estás agradecido ahora mismo?",
        insight: "¿Qué descubrimiento has tenido?",
        intention: "¿Cuál es tu intención?"
    };

    const content = prompt(prompts[type]);
    if (content && content.trim()) {
        journalSystem.addEntry(type, content.trim());
        showToast(`${getEntryTypeLabel(type)} guardada ✨`);
        toggleQuickJournalMenu();
    }
}

// Update the initialization function
const originalInitPhilosophicalFeatures = initPhilosophicalFeatures;
window.initPhilosophicalFeatures = function() {
    originalInitPhilosophicalFeatures();

    // Create manual journal modal
    createManualJournalModal();

    // Update journal modal to include new entry button
    updateJournalModalWithNewEntryButton();

    // Add quick entry buttons
    addQuickEntryButtons();

    // Add event listener for manual mood buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('manual-mood')) {
            document.querySelectorAll('.manual-mood').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    // Close quick menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('quickJournalMenu');
        const trigger = document.querySelector('.quick-entry-trigger');
        if (!menu.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
            menu.classList.add('hidden');
            menu.classList.remove('show');
        }
    });
};

// Make functions available globally
window.openManualJournalModal = openManualJournalModal;
window.closeManualJournalModal = closeManualJournalModal;
window.saveManualJournalEntry = saveManualJournalEntry;
window.quickJournalEntry = quickJournalEntry;
window.toggleQuickJournalMenu = toggleQuickJournalMenu;




// Add initialization to window load
const originalWindowOnload = window.onload;
window.onload = function() {
    originalWindowOnload();
    initPhilosophicalFeatures();
};

// Close modal functions
window.closeReflectionModal = function() {
    document.getElementById('reflectionModal').style.display = 'none';
};

window.closeJournalModal = function() {
    document.getElementById('journalModal').style.display = 'none';
};

window.skipReflection = function() {
    closeReflectionModal();
};