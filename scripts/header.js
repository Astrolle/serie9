// header-functions.js - Funciones para los headers interactivos de Serie9

// Funciones para Header V1 - Enhanced Current Design
function initBreathingIndicator() {
    const breathingText = document.querySelector('.breathing-text');
    const breathingIndicator = document.querySelector('.breathing-indicator');

    if (!breathingText || !breathingIndicator) return;

    let isInhaling = true;

    // Configuración de la respiración
    const breathingPattern = {
        inhale: 4000,  // 4 segundos para inhalar
        hold: 1000,    // 1 segundo de pausa
        exhale: 4000,  // 4 segundos para exhalar
        pause: 1000    // 1 segundo de pausa
    };

    function updateBreathing() {
        if (isInhaling) {
            breathingIndicator.classList.add('inhaling');
            breathingIndicator.classList.remove('exhaling');
            breathingText.textContent = 'Inhalando';

            // Después de inhalar, mantener
            setTimeout(() => {
                breathingText.textContent = 'Sostén';

                // Después de sostener, exhalar
                setTimeout(() => {
                    isInhaling = false;
                    updateBreathing();
                }, breathingPattern.hold);
            }, breathingPattern.inhale);

        } else {
            breathingIndicator.classList.add('exhaling');
            breathingIndicator.classList.remove('inhaling');
            breathingText.textContent = 'Exhalando';

            // Después de exhalar, pausar
            setTimeout(() => {
                breathingText.textContent = 'Pausa';

                // Después de la pausa, inhalar de nuevo
                setTimeout(() => {
                    isInhaling = true;
                    updateBreathing();
                }, breathingPattern.pause);
            }, breathingPattern.exhale);
        }
    }

    // Iniciar el ciclo de respiración
    updateBreathing();

    // Opcional: Sincronizar con el sonido de respiración
    if ('Audio' in window) {
        const breathSound = new Audio('breath-sound.mp3'); // Necesitarías este archivo
        breathSound.volume = 0.3;

        // Reproducir sonido en cada cambio
        breathingIndicator.addEventListener('animationiteration', () => {
            // breathSound.play().catch(() => {}); // Descomenta si tienes el sonido
        });
    }
}

// Para el header actualizado, reemplaza el HTML del breathing indicator
function updateHeaderWithLung() {
    const header = document.querySelector('.serie9-header-v1');
    if (!header) return;

    // Encuentra el contenedor del breathing indicator
    const breathingIndicator = header.querySelector('.breathing-indicator');
    if (!breathingIndicator) return;

    // Actualiza el HTML con el pulmón
    breathingIndicator.innerHTML = `
        <div class="lung-container">
            <span class="lung-emoji">🫁</span>
            <div class="lung-pulse"></div>
        </div>
        <span class="breathing-text">Respirando</span>
    `;
}

// Actualizar la función updateUserStats en header-functions.js
function updateUserStats() {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length < 2) return;

    // Actualizar ciclos completados
    statValues[0].textContent = window.completedProductiveTasks || 0;

    // Usar window.totalFocusTime para asegurar que accedemos a la variable global
    const totalMinutes = Math.floor(window.totalFocusTime / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    if (totalHours > 0) {
        const remainingMinutes = totalMinutes % 60;
        statValues[1].textContent = `${totalHours}h ${remainingMinutes}m`;
    } else {
        statValues[1].textContent = `${totalMinutes}m`;
    }
}

// Funciones para Header V2 - Zen Design
function initZenNavigation() {
    const zenButtons = document.querySelectorAll('.zen-btn');

    zenButtons.forEach(button => {
        button.addEventListener('click', function() {
            zenButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Aquí puedes agregar lógica para cambiar entre modos
            const mode = this.textContent;
            console.log('Modo seleccionado:', mode);
        });
    });
}

function updateZenTimer() {
    const cycleTime = document.querySelector('.cycle-time');
    if (!cycleTime) return;

    // Esta función debe actualizarse según el timer actual
    // Por ahora es un ejemplo
    let minutes = 27;
    let seconds = 0;

    setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                minutes = 27;
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }

        cycleTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Funciones para Header V3 - Progressive Header
function updateDailyProgress() {
    const progressCircle = document.querySelector('.circle');
    const percentageText = document.querySelector('.percentage');

    if (!progressCircle || !percentageText) return;

    const completed = completedProductiveTasks || 0;
    const dailyGoal = 6; // Meta de 6 ciclos por día
    const percentage = Math.min(Math.round((completed / dailyGoal) * 100), 100);

    progressCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    percentageText.textContent = `${percentage}%`;

    // Actualizar texto de progreso
    const progressText = document.querySelector('.progress-text .small');
    if (progressText) {
        progressText.textContent = `${completed} de ${dailyGoal} ciclos`;
    }
}

function setDailyIntention() {
    const intentionElement = document.querySelector('.daily-intention');
    if (!intentionElement) return;

    // Obtener intención del localStorage o mostrar una por defecto
    const savedIntention = localStorage.getItem('serie9.dailyIntention');
    if (savedIntention) {
        intentionElement.textContent = `"${savedIntention}"`;
    } else {
        intentionElement.textContent = '"Hoy me enfoco en la claridad mental"';
    }

    // Permitir editar la intención al hacer click
    intentionElement.addEventListener('click', () => {
        const newIntention = prompt('¿Cuál es tu intención para hoy?', savedIntention || '');
        if (newIntention) {
            localStorage.setItem('serie9.dailyIntention', newIntention);
            intentionElement.textContent = `"${newIntention}"`;
        }
    });
}

// Funciones para Header V4 - Mood-Based
function initMoodSelector() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodTip = document.querySelector('.mood-based-tip');
    const adaptiveTitle = document.querySelector('.adaptive-message h1');

    const moodMessages = {
        energized: {
            title: 'Tiempo de enfoque profundo',
            tip: 'Aprovecha tu energía para tareas importantes'
        },
        focused: {
            title: 'Mantén tu concentración',
            tip: 'Ideal para trabajo que requiere precisión'
        },
        stressed: {
            title: 'Momento de respirar',
            tip: 'Una pausa consciente te ayudará a recuperar el balance'
        },
        calm: {
            title: 'Fluye con serenidad',
            tip: 'Perfecto para tareas creativas y reflexión'
        }
    };

    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            moodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const mood = this.dataset.mood;
            if (moodMessages[mood] && moodTip && adaptiveTitle) {
                adaptiveTitle.textContent = moodMessages[mood].title;
                moodTip.textContent = moodMessages[mood].tip;
            }

            // Guardar el mood seleccionado
            localStorage.setItem('serie9.currentMood', mood);
        });
    });

    // Cargar mood guardado
    const savedMood = localStorage.getItem('serie9.currentMood');
    if (savedMood) {
        const savedButton = document.querySelector(`[data-mood="${savedMood}"]`);
        if (savedButton) {
            savedButton.click();
        }
    }
}

function updateSessionInfo() {
    const sessionName = document.querySelector('.session-name');
    const sessionTimer = document.querySelector('.session-timer');

    // Aquí deberías conectar con tu sistema actual de tareas
    // Por ahora es un ejemplo
    if (sessionName) {
        const currentTask = document.querySelector('.task-card[data-locked="true"] span');
        if (currentTask) {
            sessionName.textContent = currentTask.textContent.split('[')[0].trim();
        }
    }
}

// Funciones para Header V5 - Ambient Header
function initZenMode() {
    const zenToggle = document.querySelector('.zen-toggle');
    if (!zenToggle) return;

    zenToggle.addEventListener('click', () => {
        document.body.classList.toggle('zen-mode');

        if (document.body.classList.contains('zen-mode')) {
            // Ocultar elementos no esenciales
            document.querySelector('.bottom-nav').style.display = 'none';
            document.querySelector('.fab').style.display = 'none';

            // Cambiar texto del botón
            zenToggle.querySelector('.zen-text').textContent = 'Salir Zen';
        } else {
            // Restaurar elementos
            document.querySelector('.bottom-nav').style.display = 'flex';
            document.querySelector('.fab').style.display = 'block';

            // Restaurar texto del botón
            zenToggle.querySelector('.zen-text').textContent = 'Modo Zen';
        }
    });
}

// Inicialización general
function initHeaderFeatures() {
    // Detectar qué versión de header está activa
    if (document.querySelector('.serie9-header-v1')) {
        initBreathingIndicator();
        updateUserStats();
        // Actualizar stats cada minuto
        setInterval(updateUserStats, 60000);
    }

    if (document.querySelector('.serie9-header-v2')) {
        initZenNavigation();
        updateZenTimer();
    }

    if (document.querySelector('.serie9-header-v3')) {
        updateDailyProgress();
        setDailyIntention();
        // Actualizar progreso cuando cambie completedProductiveTasks
        setInterval(updateDailyProgress, 30000);
    }

    if (document.querySelector('.serie9-header-v4')) {
        initMoodSelector();
        updateSessionInfo();
        // Actualizar info de sesión cada 30 segundos
        setInterval(updateSessionInfo, 30000);
    }

    if (document.querySelector('.serie9-header-v5')) {
        initZenMode();
    }
}



// Exportar funciones para uso global
window.headerFunctions = {
    updateUserStats,
    updateDailyProgress,
    updateSessionInfo,
    initHeaderFeatures
};