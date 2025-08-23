document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.querySelector(".task-list");
  const searchInput = document.querySelector(".search");
  const addTaskBtn = document.querySelector(".add-task");
  const filterStarBtn = document.querySelector(".filter-priority");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const filterBtn = filterDropdown.querySelector(".filter-btn");
  const filterMenuItems = filterDropdown.querySelectorAll(".filter-menu li");

  let taskItems = Array.from(taskList.children);
  let showOnlyPriorities = false;
  let activeFilter = "all";

  // -------------------------------
  // 🌎 Fecha en español
  // -------------------------------
  const currentDateEl = document.getElementById("current-date");
  const currentDayEl = document.getElementById("current-day");
  const now = new Date();
  const mes = now.toLocaleString('es-ES', { month: 'short' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const dia = String(now.getDate()).padStart(2, '0');
  const año = now.getFullYear();
  currentDateEl.innerHTML = `${mesCapitalizado} ${dia}, <span style="font-weight:400; color:#6e6e73;">${año}</span>`;
  const diaSemana = now.toLocaleString('es-ES', { weekday: 'long' });
  currentDayEl.textContent = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  // -------------------------------
  // Prioridades
  // -------------------------------
  function addPriorityDots(task) {
    if (task.querySelector(".priority-dots")) return;

    const dateEl = task.querySelector(".task-date");
    const container = document.createElement("span");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "6px";

    const dotsContainer = document.createElement("span");
    dotsContainer.classList.add("priority-dots");

    const orangeDot = document.createElement("span");
    orangeDot.classList.add("priority-dot", "orange");
    const redDot = document.createElement("span");
    redDot.classList.add("priority-dot", "red");

    orangeDot.addEventListener("click", (e) => {
      e.stopPropagation();
      task.classList.remove("priority-high", "gray");
      if(task.classList.contains("priority-medium")){
        task.classList.remove("priority-medium");
        task.classList.add("gray");
      } else {
        task.classList.add("priority-medium");
      }
      updateFilter();
    });

    redDot.addEventListener("click", (e) => {
      e.stopPropagation();
      task.classList.remove("priority-medium", "gray");
      if(task.classList.contains("priority-high")){
        task.classList.remove("priority-high");
        task.classList.add("gray");
      } else {
        task.classList.add("priority-high");
      }
      updateFilter();
    });

    const deleteBtn = document.createElement("span");
    deleteBtn.classList.add("delete-task");
    deleteBtn.textContent = "×";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "#888";
    deleteBtn.style.fontWeight = "600";
    deleteBtn.style.marginLeft = "6px";
    deleteBtn.style.fontSize = "14px";
    deleteBtn.addEventListener("mouseover", () => deleteBtn.style.color = "#d70015");
    deleteBtn.addEventListener("mouseout", () => deleteBtn.style.color = "#888");

    dotsContainer.appendChild(orangeDot);
    dotsContainer.appendChild(redDot);
    container.appendChild(dotsContainer);
    container.appendChild(deleteBtn);

    dateEl.insertAdjacentElement("afterend", container);
  }

  function updateTaskItems() {
    taskItems = Array.from(taskList.children);
  }

  taskItems.forEach(task => addPriorityDots(task));

  // -------------------------------
  // Hover
  // -------------------------------
  taskList.addEventListener("mouseover", (e) => {
    const t = e.target.closest(".task");
    if(!t) return;
    if(t.classList.contains("priority-medium")) t.style.background = "#ffe5b4";
    if(t.classList.contains("priority-high")) t.style.background = "#ffcaca";
  });
  taskList.addEventListener("mouseout", (e) => {
    const t = e.target.closest(".task");
    if(!t) return;
    if(t.classList.contains("priority-medium")) t.style.background = "#fcf9da";
    if(t.classList.contains("priority-high")) t.style.background = "#ffe9e9";
    if(t.classList.contains("gray")) t.style.background = "";
    if(t.classList.contains("completed")) t.style.background = "#d4f4dd";
  });

  // -------------------------------
  // Edición
  // -------------------------------
  let editingTask = null;
  function enterEditMode(task) {
    if (task.classList.contains("editing")) return;
    editingTask = task;
    task.classList.add("editing");
    const textSpan = task.querySelector(".task-text");
    const input = document.createElement("input");
    input.type = "text";
    input.value = textSpan.textContent;
    input.classList.add("task-input");
    task.replaceChild(input, textSpan);
    input.focus();
    input.addEventListener("keydown", (e) => { if(e.key === "Enter") exitEditMode(task); });
  }
  function exitEditMode(task) {
    if(!task.classList.contains("editing")) return;
    task.classList.remove("editing");
    const input = task.querySelector(".task-input");
    const span = document.createElement("span");
    span.classList.add("task-text");
    span.textContent = input.value.trim() === "" ? "Nueva tarea" : input.value;
    task.replaceChild(span, input);
    editingTask = null;
  }

  taskList.addEventListener("click", (e) => {
    const task = e.target.closest(".task");
    if(!task) return;
    if(e.target.classList.contains("priority-dot") || e.target.classList.contains("delete-task")) return;
    if(editingTask && editingTask!==task) exitEditMode(editingTask);
    enterEditMode(task);
  });

  document.addEventListener("click", (e)=>{
    if(!e.target.closest(".task") && !e.target.closest(".add-task") && !e.target.closest(".filter-btn") && !e.target.closest(".filter-menu")){
      if(editingTask) exitEditMode(editingTask);
      filterDropdown.classList.remove("open");
    }
  });

  // -------------------------------
  // Búsqueda
  // -------------------------------
  searchInput.addEventListener("input", updateFilter);

  // -------------------------------
  // Eliminar tarea
  // -------------------------------
  taskList.addEventListener("click", (e)=>{
    if(e.target.classList.contains("delete-task")){
      const task = e.target.closest(".task");
      task.remove();
      updateTaskItems();
      updateFilter();
    }
  });

  // -------------------------------
  // Agregar tarea
  // -------------------------------
  addTaskBtn.addEventListener("click", ()=>{
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    const mmMonth = String(now.getMonth()+1).padStart(2,'0');
    const yyyy = now.getFullYear();

    const newTask = document.createElement("li");
    newTask.classList.add("task","gray");
    newTask.innerHTML = `<span class="task-text"></span><span class="task-date">${dd}/${mmMonth}/${yyyy} ${hh}:${mm}</span>`;
    taskList.prepend(newTask);
    addPriorityDots(newTask);
    updateTaskItems();
    enterEditMode(newTask);
    const input = newTask.querySelector(".task-input");
    if(input) input.placeholder = "Nueva Tarea...";
  });

  // -------------------------------
  // ⭐ Estrella
  // -------------------------------
  filterStarBtn.addEventListener("click", ()=>{
    showOnlyPriorities = !showOnlyPriorities;
    filterStarBtn.style.color = showOnlyPriorities ? "#ff9500" : "#333";
    updateFilter();
  });

  // -------------------------------
  // Dropdown filtro
  // -------------------------------
  filterBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    filterDropdown.classList.toggle("open");
  });

  filterMenuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    activeFilter = item.dataset.filter;
    filterDropdown.classList.remove("open");
    updateFilter();
  });
});

  // -------------------------------
  // Completar tarea con click sostenido
  // -------------------------------
  let holdInterval;
  let holdProgress;

  taskList.addEventListener("mousedown", (e)=>{
    const task = e.target.closest(".task");
    if(!task) return;
    if(e.target.classList.contains("priority-dot") || e.target.classList.contains("delete-task")) return;

    const dateEl = task.querySelector(".task-date");
    let progressBar = task.querySelector(".hold-bar");
    if(!progressBar){
      progressBar = document.createElement("div");
      progressBar.classList.add("hold-bar");
      progressBar.style.position = "absolute";
      progressBar.style.left = "0";
      progressBar.style.top = "0";
      progressBar.style.height = "100%";
      progressBar.style.width = "0%";
      progressBar.style.background = "rgba(52,199,89,0.5)";
      progressBar.style.transition = "width 0.05s linear";
      progressBar.style.borderRadius = "6px";
      task.style.position = "relative";
      task.prepend(progressBar);
    }

    holdProgress = 0;
    holdInterval = setInterval(()=>{
      holdProgress += 2; // incremento %
      progressBar.style.width = holdProgress + "%";
      if(holdProgress >= 100){
        clearInterval(holdInterval);
        task.classList.add("completed");
        task.style.background = "#34c75933";

        const createdDate = dateEl.textContent.split(" ")[0];
        const now = new Date();
        const dd = String(now.getDate()).padStart(2,'0');
        const mm = String(now.getMonth()+1).padStart(2,'0');
        const yyyy = now.getFullYear();
        dateEl.textContent = `${createdDate} – ${dd}/${mm}/${yyyy}`;

        setTimeout(()=>progressBar.remove(),200);
      }
    },20);
  });

  taskList.addEventListener("mouseup", (e)=>{
    clearInterval(holdInterval);
    const task = e.target.closest(".task");
    if(!task) return;
    const progressBar = task.querySelector(".hold-bar");
    if(progressBar) progressBar.remove();
  });

  taskList.addEventListener("mouseleave", (e)=>{
    clearInterval(holdInterval);
    taskItems.forEach(task=>{
      const progressBar = task.querySelector(".hold-bar");
      if(progressBar) progressBar.remove();
    });
  });

  // -------------------------------
  // Aplicar filtros combinados
  // -------------------------------
  function updateFilter() {
  taskItems.forEach(task => {
    let show = true;

    // ⭐ Filtro solo prioridades
    if (
      showOnlyPriorities &&
      !task.classList.contains("priority-high") &&
      !task.classList.contains("priority-medium")
    ) {
      show = false;
    }

    // 📌 Dropdown
    if (activeFilter !== "all") {
      if (activeFilter === "completed") {
        // Mostrar SOLO completadas
        if (!task.classList.contains("completed")) {
          show = false;
        }
      } else {
        // Mostrar SOLO las de prioridad (pero no completadas)
        if (
          !task.classList.contains(activeFilter) ||
          task.classList.contains("completed")
        ) {
          show = false;
        }
      }
    }

    // 🔍 Búsqueda
    const query = searchInput.value.toLowerCase();
    const text = task.querySelector(".task-text").textContent.toLowerCase();
    if (!text.includes(query)) show = false;

    task.style.display = show ? "" : "none";
  });
}

});
