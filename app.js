/* Utilidades de fechas */
const locale = 'es-EC'; // puedes cambiar a 'es-ES' si prefieres
const monthNames = Array.from({length: 12}, (_, m) =>
  new Date(2000, m, 1).toLocaleString(locale, { month: 'long' })
).map(s => s.replace(/^\w/, c => c.toUpperCase())); // Capitalizar

// Estado de navegación
let state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-11
  day: new Date().getDate()
};

// Referencias DOM
const yearView = document.getElementById('yearView');
const monthView = document.getElementById('monthView');
const dayView = document.getElementById('dayView');

const yearLabel = document.getElementById('yearLabel');
const monthsGrid = document.getElementById('monthsGrid');

const monthLabel = document.getElementById('monthLabel');
const daysGrid = document.getElementById('daysGrid');

const dayLabel = document.getElementById('dayLabel');
const tasksList = document.getElementById('tasksList');

const appTitle = document.getElementById('appTitle');
const backBtn = document.getElementById('backBtn');

const prevYear = document.getElementById('prevYear');
const nextYear = document.getElementById('nextYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');

// Datos de ejemplo para el día (placeholder)
const sampleTasks = {
  // 'YYYY-MM-DD': [{ title, time }]
  // Ejemplo:
  // '2025-08-21': [{title:'Reunión', time:'09:00'}, {title:'Enviar reporte', time:'17:00'}]
};

// Helpers
const pad2 = n => String(n).padStart(2, '0');
const isoDate = (y, m, d) => `${y}-${pad2(m+1)}-${pad2(d)}`;

// Lunes como primer día de la semana.
// JS: 0=Dom ... 6=Sab. Convertimos para que 0=Lun ... 6=Dom
function weekdayIndexMondayFirst(jsDayIndex){
  return (jsDayIndex + 6) % 7;
}
function daysInMonth(y, m){ return new Date(y, m+1, 0).getDate(); }
function isToday(y, m, d){
  const t = new Date();
  return y === t.getFullYear() && m === t.getMonth() && d === t.getDate();
}

/* Render: Vista Año */
function renderYear(){
  appTitle.textContent = 'Calendario';
  backBtn.hidden = true;
  yearLabel.textContent = state.year;
  monthsGrid.innerHTML = '';

  for(let m=0; m<12; m++){
    const card = document.createElement('div');
    card.className = 'month-card';
    card.addEventListener('click', () => {
      state.month = m;
      navigate(yearView, monthView, 'forward');
      renderMonth();
    });

    const name = document.createElement('div');
    name.className = 'month-name';
    name.textContent = monthNames[m];

    const mini = document.createElement('div');
    mini.className = 'month-mini';
    // mini calendario de 6x7 como puntos
    const first = new Date(state.year, m, 1);
    const firstOffset = weekdayIndexMondayFirst(first.getDay());
    const dim = daysInMonth(state.year, m);
    const totalCells = 42; // 6 semanas
    for(let i=0; i<totalCells; i++){
      const dot = document.createElement('div');
      dot.className = 'dot';
      // resaltar hoy ligeramente
      const dayNum = i - firstOffset + 1;
      if(dayNum === new Date().getDate() && m === new Date().getMonth() && state.year === new Date().getFullYear()){
        dot.style.outline = '1px solid var(--today)';
        dot.style.outlineOffset = '-1px';
      }
      mini.appendChild(dot);
    }

    card.appendChild(name);
    card.appendChild(mini);
    monthsGrid.appendChild(card);
  }
}

/* Render: Vista Mes */
function renderMonth(){
  appTitle.textContent = monthNames[state.month];
  backBtn.hidden = false;

  monthLabel.textContent = `${capitalize(monthNames[state.month])} ${state.year}`;
  daysGrid.innerHTML = '';

  const first = new Date(state.year, state.month, 1);
  const firstOffset = weekdayIndexMondayFirst(first.getDay());
  const dim = daysInMonth(state.year, state.month);

  // días del mes anterior para rellenar
  const prevDim = daysInMonth(state.year, (state.month + 11) % 12, state.month === 0 ? state.year - 1 : state.year);
  for(let i=0; i<firstOffset; i++){
    const d = prevDim - firstOffset + i + 1;
    daysGrid.appendChild(dayCell(d, true));
  }

  // días del mes actual
  for(let d=1; d<=dim; d++){
    daysGrid.appendChild(dayCell(d, false));
  }

  // completar hasta 42 celdas (6 semanas)
  const filled = firstOffset + dim;
  for(let i=filled; i<42; i++){
    const d = i - filled + 1;
    daysGrid.appendChild(dayCell(d, true));
  }
}

function dayCell(d, outside){
  const cell = document.createElement('div');
  cell.className = 'day-cell' + (outside ? ' outside' : '');
  const label = document.createElement('div');
  label.className = 'day-number';
  label.textContent = d;
  cell.appendChild(label);

  let y = state.year, m = state.month, day = d;

  if(outside){
    // ajustar fecha real para celdas fuera del mes
    const date = new Date(state.year, state.month, d);
    y = date.getFullYear(); m = date.getMonth(); day = date.getDate();
  }

  if(isToday(y, m, day) && !outside){
    cell.classList.add('today');
  }

  cell.addEventListener('click', () => {
    state.year = y; state.month = m; state.day = day;
    renderDay();
    navigate(monthView, dayView, 'forward');
  });

  return cell;
}

/* Render: Vista Día */
function renderDay(){
  appTitle.textContent = 'Día';
  backBtn.hidden = false;

  const dateObj = new Date(state.year, state.month, state.day);
  const weekDayName = dateObj.toLocaleDateString(locale, { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString(locale, { month: 'long' });
  dayLabel.textContent = `${capitalize(weekDayName)}, ${state.day} de ${capitalize(monthName)} de ${state.year}`;

  const key = isoDate(state.year, state.month, state.day);
  const tasks = sampleTasks[key] ?? [];
  tasksList.innerHTML = '';

  if(tasks.length === 0){
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<span>Sin tareas</span><span class="task-time">—</span>`;
    tasksList.appendChild(li);
  } else {
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `<span>${t.title}</span><span class="task-time">${t.time ?? ''}</span>`;
      tasksList.appendChild(li);
    });
  }
}

/* Navegación con transiciones (deslizante) */
function navigate(fromEl, toEl, direction = 'forward'){
  // Reset clases
  [yearView, monthView, dayView].forEach(v => {
    v.classList.remove('active','to-left');
  });

  if(direction === 'forward'){
    // from: centro -> izquierda | to: derecha -> centro
    fromEl.classList.add('to-left');
    toEl.classList.add('active');
  } else {
    // back: from: centro -> derecha | to: izquierda -> centro
    // Para simular, activamos toEl y movemos fromEl a la derecha con inline style temporal
    toEl.style.transform = 'translateX(-100%)';
    toEl.style.opacity = '0.2';
    toEl.classList.add('active');
    requestAnimationFrame(() => {
      toEl.style.transform = '';
      toEl.style.opacity = '';
      fromEl.style.transform = 'translateX(100%)';
      fromEl.style.opacity = '0.2';
      setTimeout(() => {
        fromEl.style.transform = '';
        fromEl.style.opacity = '';
      }, 340);
    });
  }
}

/* Controles */
backBtn.addEventListener('click', () => {
  if(dayView.classList.contains('active')){
    renderMonth();
    navigate(dayView, monthView, 'back');
    appTitle.textContent = monthNames[state.month];
  } else if(monthView.classList.contains('active')){
    renderYear();
    navigate(monthView, yearView, 'back');
    appTitle.textContent = 'Calendario';
  }
});

prevYear.addEventListener('click', () => { state.year--; renderYear(); });
nextYear.addEventListener('click', () => { state.year++; renderYear(); });

prevMonth.addEventListener('click', () => {
  if(state.month === 0){ state.month = 11; state.year--; } else { state.month--; }
  renderMonth();
});
nextMonth.addEventListener('click', () => {
  if(state.month === 11){ state.month = 0; state.year++; } else { state.month++; }
  renderMonth();
});

todayBtn.addEventListener('click', () => {
  const now = new Date();
  state = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  // Ir a mes actual si estamos en año; si ya en mes, refrescar; si en día, saltar al día de hoy
  if(yearView.classList.contains('active')){
    renderMonth();
    navigate(yearView, monthView, 'forward');
  } else if(monthView.classList.contains('active')){
    renderMonth();
  } else {
    renderDay();
  }
});


function renderDay(){
  appTitle.textContent = 'Día';
  backBtn.hidden = false;

  const dateObj = new Date(state.year, state.month, state.day);
  const weekDayName = dateObj.toLocaleDateString(locale, { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString(locale, { month: 'long' });
  dayLabel.textContent = `${capitalize(weekDayName)}, ${state.day} de ${capitalize(monthName)} de ${state.year}`;

  const key = isoDate(state.year, state.month, state.day);
  const tasks = sampleTasks[key] ?? [];
  tasksList.innerHTML = '';

  // Botón para agregar tarea
  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Agregar tarea';
  addBtn.className = 'today-btn';
  addBtn.style.marginBottom = "12px";
  addBtn.onclick = () => {
    tasks.push({ title: 'Nueva tarea', time: '', empresa: '', participantes: '', programado: '' });
    sampleTasks[key] = tasks;
    renderDay();
  };
  tasksList.appendChild(addBtn);

  // Render de cada tarea
  if(tasks.length === 0){
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<span>Sin tareas</span><span class="task-time">—</span>`;
    tasksList.appendChild(li);
  } else {
    tasks.forEach((t, i) => {
  const li = document.createElement('li');
  li.className = 'task-item';

  // Primera línea de la tarea
  const mainLine = document.createElement('div');
  mainLine.style.display = 'flex';
  mainLine.style.justifyContent = 'space-between';
  mainLine.style.alignItems = 'center';
  mainLine.style.gap = '8px';

  const left = document.createElement('span');
  left.textContent = t.title;

  const time = document.createElement('span');
  time.className = 'task-time';
  time.textContent = t.time || '';

  const expandBtn = document.createElement('button');
  expandBtn.className = 'task-expand';
  expandBtn.innerHTML = '+';

  mainLine.appendChild(left);
  mainLine.appendChild(time);
  mainLine.appendChild(expandBtn);

  // Panel de detalles
  const details = document.createElement('div');
  details.className = 'task-details';
  details.innerHTML = `
    <input type="text" placeholder="Título" value="${t.title}">
    <input type="text" placeholder="Empresa" value="${t.empresa || ''}">
    <input type="text" placeholder="Participantes" value="${t.participantes || ''}">
    <input type="time" placeholder="Hora" value="${t.time || ''}">
    <input type="text" placeholder="Programado para" value="${t.programado || ''}">
    <div style="display:flex; gap:6px;">
      <button class="save-btn">Guardar</button>
      <button class="delete-btn">Eliminar</button>
    </div>
  `;

  // Expandir / colapsar
  expandBtn.onclick = () => {
    const isOpen = details.style.display === 'flex';
    details.style.display = isOpen ? 'none' : 'flex';
    expandBtn.innerHTML = isOpen ? '+' : '–';
  };

  // Guardar cambios
  const saveBtn = details.querySelector('.save-btn');
  saveBtn.onclick = () => {
    const inputs = details.querySelectorAll('input');
    t.title = inputs[0].value;
    t.empresa = inputs[1].value;
    t.participantes = inputs[2].value;
    t.time = inputs[3].value;
    t.programado = inputs[4].value;
    renderDay();
  };

  // Eliminar tarea
  const deleteBtn = details.querySelector('.delete-btn');
  deleteBtn.onclick = () => {
    tasks.splice(i,1); // quitar del array
    renderDay();       // refrescar vista
  };

  li.appendChild(mainLine);
  li.appendChild(details);
  tasksList.appendChild(li);
});
  }
}

/* Util */
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* Init */
function init(){
  // Demo: rellenar algunas tareas de ejemplo
  const now = new Date();
  sampleTasks[isoDate(now.getFullYear(), now.getMonth(), now.getDate())] = [
    { title: 'Revisión de producción', time: '08:30' },
    { title: 'Llamada con proveedor', time: '11:00' },
    { title: 'Actualizar dashboard', time: '16:00' },
  ];

  renderYear();
}
init();
