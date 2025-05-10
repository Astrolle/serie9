// Tutorial Interactivo para Serie9
// Este script agrega un tutorial paso a paso para nuevos usuarios

// Configuración del tutorial
const serie9Tutorial = {
    // Estado del tutorial
    active: false,
    currentStep: 0,
    completedSteps: [],
    firstVisit: true,

    // Pasos del tutorial
    steps: [
        {
            id: 'welcome',
            element: 'body',
            title: '¡Bienvenido a Serie9!',
            content: '¿Quieres aprender cómo usar Serie9 para equilibrar tus tiempos de creación y descanso? Este tutorial te guiará paso a paso.',
            position: 'center',
            buttons: ['Comenzar tutorial', 'Saltar por ahora']
        },
        {
            id: 'thermometer',
            element: '.heatmap-section',
            title: 'Termómetro de ritmo interior',
            content: 'Aquí puedes ver tu nivel de estrés semanal. Los colores más claros indican menos estrés, los más oscuros indican mayor actividad sin pausas.',
            position: 'bottom',
            buttons: ['Siguiente']
        },
        {
            id: 'waiting-column',
            element: '#waitingColumn',
            title: 'Ideas que aguardan su momento',
            content: 'Esta es tu sala de espera para nuevas ideas. Aquí colocas todas tus intenciones antes de programarlas en una semana específica.',
            position: 'right',
            buttons: ['Siguiente']
        },
        {
            id: 'limit-selector',
            element: '#limitSelector',
            title: 'Ritmo de trabajo',
            content: 'Define cuántas tareas productivas quieres completar antes de ser recordado para tomar una pausa. El valor recomendado es 3.',
            position: 'right',
            buttons: ['Siguiente']
        },
        {
            id: 'week-columns',
            element: '#kanbanBoard',
            title: 'Ciclos de intención',
            content: 'Organiza tus propósitos por semanas. Puedes arrastrar y soltar tus tarjetas entre columnas para reorganizar tus prioridades.',
            position: 'top',
            buttons: ['Siguiente']
        },
        {
            id: 'create-task',
            element: '.fab',
            title: 'Crea un propósito',
            content: 'Pulsa este botón para crear un nuevo propósito. Puede ser un tiempo de enfoque (27 min) o una pausa sagrada (9 min).',
            position: 'left',
            action: openModal,
            buttons: ['Crear mi primer propósito']
        },
        {
            id: 'task-type',
            element: '#taskType',
            title: 'Tipo de propósito',
            content: 'Elige entre "Foco total" para tareas productivas de 27 minutos, o "Pausa sagrada" para momentos de reconexión de 9 minutos.',
            position: 'bottom',
            buttons: ['Siguiente']
        },
        {
            id: 'save-purpose',
            element: '.modal-content button.btn-primary',
            title: 'Guardar propósito',
            content: 'Después de completar los detalles, guarda tu propósito y aparecerá en "Ideas que aguardan su momento".',
            position: 'bottom',
            buttons: ['Entendido']
        },
        {
            id: 'bottom-nav',
            element: '.bottom-nav',
            title: 'Navegación',
            content: 'Usa estos botones para acceder a tu agenda, gestionar tu ritmo, ver tus notas o conocer más sobre la filosofía Serie9.',
            position: 'top',
            buttons: ['Finalizar tutorial']
        }
    ],

    // Iniciar el tutorial
    init() {
        // Verificar si es primera visita
        const visited = localStorage.getItem('serie9.tutorialShown');
        if (!visited) {
            setTimeout(() => {
                this.start();
                localStorage.setItem('serie9.tutorialShown', 'true');
            }, 2000); // Esperar a que la pantalla de carga desaparezca
        }
    },

    // Comenzar tutorial
    start() {
        this.active = true;
        this.currentStep = 0;
        this.createTutorialOverlay();
        this.showStep(0);
        document.body.classList.add('tutorial-active');
    },

    // Mostrar un paso específico
    showStep(index) {
        if (index >= this.steps.length) {
            this.finish();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];

        // Verificar si el elemento existe en la página
        const targetElement = document.querySelector(step.element);
        if (!targetElement && index > 0) {
            // Si no existe el elemento, saltamos al siguiente paso
            this.showStep(index + 1);
            return;
        }

        // Crear o actualizar el tooltip
        this.updateTooltip(step, targetElement);

        // Resaltar el elemento
        this.highlightElement(targetElement);
    },

    // Crear el overlay del tutorial
    createTutorialOverlay() {
        // Crear el overlay principal si no existe
        if (!document.getElementById('tutorial-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'tutorial-overlay';
            document.body.appendChild(overlay);

            // Estilos CSS para el overlay
            const style = document.createElement('style');
            style.textContent = `
        #tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          z-index: 9000;
          pointer-events: none;
        }
        
        .tutorial-highlight {
          position: absolute;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.65);
          border-radius: 4px;
          z-index: 9001;
          pointer-events: none;
        }
        
        .tutorial-tooltip {
          position: absolute;
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: 300px;
          z-index: 9002;
          pointer-events: all;
          font-family: 'Inter', sans-serif;
          animation: tooltip-appear 0.3s ease-out;
        }
        
        @keyframes tooltip-appear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .tutorial-tooltip h3 {
          margin: 0 0 8px 0;
          color: #008060;
          font-size: 18px;
        }
        
        .tutorial-tooltip p {
          margin: 0 0 16px 0;
          color: #212b36;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .tutorial-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        .tutorial-btn {
          background-color: #008060;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .tutorial-btn:hover {
          background-color: #006e52;
        }
        
        .tutorial-btn-secondary {
          background-color: transparent;
          color: #637381;
          border: 1px solid #dfe3e8;
        }
        
        .tutorial-btn-secondary:hover {
          background-color: #f9fafb;
        }
        
        .tutorial-active .task-card,
        .tutorial-active .column:not(.highlight-target),
        .tutorial-active button:not(.highlight-target):not(.tutorial-btn) {
          pointer-events: none;
        }
        
        .pulse-animation {
          animation: pulse-tutorial 2s infinite;
        }
        
        @keyframes pulse-tutorial {
          0% { box-shadow: 0 0 0 0 rgba(0, 128, 96, 0.7), 0 0 0 9999px rgba(0,0,0,0.65); }
          70% { box-shadow: 0 0 0 10px rgba(0, 128, 96, 0), 0 0 0 9999px rgba(0,0,0,0.65); }
          100% { box-shadow: 0 0 0 0 rgba(0, 128, 96, 0), 0 0 0 9999px rgba(0,0,0,0.65); }
        }
      `;
            document.head.appendChild(style);
        }
    },

    // Actualizar el tooltip para un paso
    updateTooltip(step, targetElement) {
        // Eliminar tooltip anterior si existe
        const oldTooltip = document.querySelector('.tutorial-tooltip');
        if (oldTooltip) oldTooltip.remove();

        // Crear nuevo tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.innerHTML = `
      <h3>${step.title}</h3>
      <p>${step.content}</p>
      <div class="tutorial-actions"></div>
    `;

        // Añadir botones
        const actionsDiv = tooltip.querySelector('.tutorial-actions');

        if (step.buttons.length === 2) {
            // Si hay dos botones, el primero es primario y el segundo secundario
            const secondaryBtn = document.createElement('button');
            secondaryBtn.className = 'tutorial-btn tutorial-btn-secondary';
            secondaryBtn.textContent = step.buttons[1];
            secondaryBtn.onclick = () => this.finish();
            actionsDiv.appendChild(secondaryBtn);

            const primaryBtn = document.createElement('button');
            primaryBtn.className = 'tutorial-btn';
            primaryBtn.textContent = step.buttons[0];
            primaryBtn.onclick = () => {
                if (step.action) step.action();
                this.showStep(this.currentStep + 1);
            };
            actionsDiv.appendChild(primaryBtn);
        } else {
            // Si hay un botón, es siempre primario
            const primaryBtn = document.createElement('button');
            primaryBtn.className = 'tutorial-btn';
            primaryBtn.textContent = step.buttons[0];
            primaryBtn.onclick = () => {
                if (step.action) step.action();
                this.showStep(this.currentStep + 1);
            };
            actionsDiv.appendChild(primaryBtn);
        }

        // Añadir tooltip al DOM
        document.body.appendChild(tooltip);

        // Posicionar tooltip relativo al elemento
        if (step.id === 'welcome') {
            // Centrar en la pantalla para el paso de bienvenida
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
            // Posicionar relativo al elemento para otros pasos
            this.positionTooltip(tooltip, targetElement, step.position);
        }
    },

    // Posicionar tooltip relativamente al elemento destacado
    positionTooltip(tooltip, element, position) {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const margin = 20; // Margen entre el elemento y el tooltip

        switch (position) {
            case 'top':
                tooltip.style.bottom = `${window.innerHeight - rect.top + margin}px`;
                tooltip.style.left = `${rect.left + rect.width/2 - tooltipRect.width/2}px`;
                break;
            case 'bottom':
                tooltip.style.top = `${rect.bottom + margin}px`;
                tooltip.style.left = `${rect.left + rect.width/2 - tooltipRect.width/2}px`;
                break;
            case 'left':
                tooltip.style.top = `${rect.top + rect.height/2 - tooltipRect.height/2}px`;
                tooltip.style.right = `${window.innerWidth - rect.left + margin}px`;
                break;
            case 'right':
                tooltip.style.top = `${rect.top + rect.height/2 - tooltipRect.height/2}px`;
                tooltip.style.left = `${rect.right + margin}px`;
                break;
            case 'center':
                tooltip.style.top = '50%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translate(-50%, -50%)';
                break;
        }

        // Asegurar que el tooltip esté siempre visible en la pantalla
        const finalRect = tooltip.getBoundingClientRect();

        if (finalRect.left < 10) tooltip.style.left = '10px';
        if (finalRect.right > window.innerWidth - 10) tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
        if (finalRect.top < 10) tooltip.style.top = '10px';
        if (finalRect.bottom > window.innerHeight - 10) tooltip.style.top = `${window.innerHeight - tooltipRect.height - 10}px`;
    },

    // Resaltar un elemento
    highlightElement(element) {
        // Eliminar highlight anterior
        const oldHighlight = document.querySelector('.tutorial-highlight');
        if (oldHighlight) oldHighlight.remove();

        // Si estamos en el paso de bienvenida, no resaltamos nada
        if (this.steps[this.currentStep].id === 'welcome') return;

        // Crear highlight para el elemento actual
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight pulse-animation';
        document.body.appendChild(highlight);

        // Posicionar highlight sobre el elemento
        if (element) {
            const rect = element.getBoundingClientRect();
            highlight.style.top = `${rect.top}px`;
            highlight.style.left = `${rect.left}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;

            // Añadir clase para identificar el elemento actual
            element.classList.add('highlight-target');
        }
    },

    // Finalizar tutorial
    finish() {
        this.active = false;
        document.body.classList.remove('tutorial-active');

        // Eliminar elementos del tutorial
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.remove();

        const tooltip = document.querySelector('.tutorial-tooltip');
        if (tooltip) tooltip.remove();

        const highlight = document.querySelector('.tutorial-highlight');
        if (highlight) highlight.remove();

        // Eliminar clases adicionales
        const highlightTargets = document.querySelectorAll('.highlight-target');
        highlightTargets.forEach(el => el.classList.remove('highlight-target'));

        // Mostrar mensaje de finalización
        const completionToast = document.createElement('div');
        completionToast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #008060;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      animation: toast-appear 0.3s ease-out;
    `;
        completionToast.textContent = '¡Tutorial completado! Ahora puedes usar Serie9 con confianza.';
        document.body.appendChild(completionToast);

        setTimeout(() => {
            completionToast.style.animation = 'toast-disappear 0.3s ease-out forwards';
            setTimeout(() => completionToast.remove(), 300);
        }, 5000);
    },

    // Reiniciar tutorial (para botón en configuración)
    restart() {
        localStorage.removeItem('serie9.tutorialShown');
        this.start();
    }
};

// Estilos adicionales para la animación del toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toast-appear {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  
  @keyframes toast-disappear {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, 20px); }
  }
`;
document.head.appendChild(toastStyles);

// Añadir botón de tutorial al menú (en el sidebar del manifiesto)
function addTutorialButton() {
    const sidebar = document.getElementById('manifestSidebar');
    if (!sidebar) return;

    const tutorialBtn = document.createElement('button');
    tutorialBtn.className = 'btn btn-outline-primary mt-4 w-100';
    tutorialBtn.textContent = 'Reiniciar Tutorial';
    tutorialBtn.onclick = () => serie9Tutorial.restart();

    // Añadir al final del contenido del sidebar
    sidebar.querySelector('div').appendChild(tutorialBtn);
}

// Inicializar tutorial cuando la página termine de cargar
window.addEventListener('load', () => {
    // Esperar a que se termine de cargar la aplicación
    setTimeout(() => {
        serie9Tutorial.init();
        addTutorialButton();
    }, 2000);
});

// Permitir iniciar el tutorial desde la consola para desarrolladores
window.startSerie9Tutorial = () => serie9Tutorial.start();

// Exportar para uso en otros scripts
window.serie9Tutorial = serie9Tutorial;