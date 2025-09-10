document.getElementById('cells-container').addEventListener('click', async (e) => {
  if (e.target.classList.contains('run-button')) {
    const cell = e.target.closest('.code-cell');
    const code = cell.querySelector('.code-area').value;
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });    
    const data = await res.json();
    const output = cell.querySelector('.output');
    output.textContent = data.output;
  }
});

document.querySelectorAll('.code-area').forEach(textarea => {
  	textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
});

let lastActiveTab = null;
function toggleSidebar() {
  const sidebar = document.querySelector('aside.sidebar');
  sidebar.classList.toggle('collapsed');
  if (sidebar.classList.contains('collapsed')) {
    const activeTab = document.querySelector('.sidebar-content:not(.hidden)');
    if (activeTab) {
      lastActiveTab = activeTab.id;
      activeTab.classList.add('hidden');
    }
    document.querySelectorAll('.directory-item.active').forEach(item => {
      item.classList.remove('active');
    });
  } else {
    if (lastActiveTab) {
      const tabToShow = document.getElementById(lastActiveTab);
      if (tabToShow) {
        tabToShow.classList.remove('hidden');
      }
      const btnToActivate = document.querySelector(
        `.sidebar-tab[onclick*="${lastActiveTab.replace('-tab','')}"]`
      );
      if (btnToActivate) {
        btnToActivate.classList.add("active");
      }
    }
  }
}

function switchTab(tabName) {
  const selectedTab = document.getElementById(tabName + '-tab');
  const clickedButton = event.currentTarget; // el botón que disparó el click
  if (selectedTab && !selectedTab.classList.contains('hidden') && clickedButton.classList.contains('active')) {
    toggleSidebar()
    return;
  }

  const sidebar = document.querySelector('aside.sidebar');
  if (sidebar.classList.contains('collapsed')){
    toggleSidebar();
  }

  const tabs = document.querySelectorAll('.sidebar-content');
  tabs.forEach(tab => tab.classList.add('hidden'));
  const tabButtons = document.querySelectorAll('.sidebar-tab');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
    lastActiveTab = selectedTab.id; // recordamos la última activa
  }
  clickedButton.classList.add('active');
}

let justSelected = false;

function selectDirectory(element) {
  document.querySelectorAll('.directory-item').forEach(item => {
    item.classList.remove('selected');
  });
  element.classList.add('selected');
  justSelected = true;
  setTimeout(() => { justSelected = false }, 100); // breve protección
  console.log('Directorio seleccionado:', element.dataset.path);
}

function selectFile(element) {
  document.querySelectorAll('.directory-item').forEach(item => {
    item.classList.remove('selected');
  });
  element.classList.add('selected');
  justSelected = true;
  setTimeout(() => { justSelected = false }, 100);
  console.log('Archivo seleccionado:', element.dataset.path);
}



function toggleTerminal() {
  const wrapper = document.querySelector('.abajo');
  wrapper.classList.toggle('collapsed');
}



function addCodeCell(afterElement) {
  const container = document.getElementById('cells-container');
  const index = container.querySelectorAll('.code-cell').length + 1;
  const cell = document.createElement('div');
  cell.className = 'code-cell';
  cell.innerHTML = `
    <div class="input-prompt">[${index}]</div>
    <div class="cell-controls">
      <button class="cell-button run-button" title="Ejecutar">▶</button>
      <button class="cell-button" title="Eliminar" onclick="deleteCell(this)">🗑</button>
    </div>
    <textarea class="code-area" placeholder="-- Nueva celda" style="color: #ffffff;"></textarea>
    <pre class="output"></pre>
  `;
  const insertLine = document.createElement('div');
  insertLine.className = 'insert-line';
  insertLine.onclick = function () {
    addCodeCell(insertLine);
  };
  insertLine.innerHTML = `
    <span class="insert-buttons">
      <button class="new-button" title="Agregar nueva celda">Nuevo</button>
    </span>
  `;
  container.insertBefore(cell, afterElement.nextSibling);
  container.insertBefore(insertLine, cell.nextSibling);
  const textarea = cell.querySelector('.code-area');
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
  renumerarCeldas();
}

function deleteCell(button) {
  const cell = button.closest('.code-cell');
  const next = cell.nextElementSibling;
  if (next && next.classList.contains('insert-line')) {
    next.remove();
  }
  cell.remove();
  renumerarCeldas();
  const container = document.getElementById('cells-container');
  if (container.querySelectorAll('.code-cell').length === 0 &&
      !container.querySelector('.insert-line')) {
    const insertLine = document.createElement('div');
    insertLine.className = 'insert-line';
    insertLine.onclick = function () { addCodeCell(insertLine); };
    insertLine.innerHTML = `
	    <span class="insert-buttons">
	      <button class="new-button" title="Agregar nueva celda">Nuevo</button>
	    </span>
    `;
    container.appendChild(insertLine);
  }
}

function renumerarCeldas() {
  const prompts = document.querySelectorAll('.code-cell .input-prompt');
  prompts.forEach((prompt, i) => {
    prompt.textContent = `[${i + 1}]`;
  });
}


function goToLogin() {
    window.location.href = '/login';
}
function goToAdmin() {
  const session = localStorage.getItem('luacolab_session');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      const now = new Date().getTime();
      if (sessionData.timestamp && (now - sessionData.timestamp) < 24 * 60 * 60 * 1000) {
        window.location.href = '/admin';
      } else {
        localStorage.removeItem('luacolab_session');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      localStorage.removeItem('luacolab_session');
      window.location.href = '/login';
    }
  } else {
    window.location.href = '/login';
  }
}

const terminal = document.querySelector('.abajo');
let terminalActiva = false;

terminal.addEventListener('keydown', (e) => {
  if (e.target.classList.contains('entrada') && e.key === 'Enter') {
    e.preventDefault();
    const comando = e.target.innerText.trim();
    e.target.contentEditable = "false";
    if (comando.toLowerCase() === 'cls') {
      terminal.innerHTML = "";
      terminal.style.height = "12vh";
      crearLinea();
      return;
    }
    if (comando.toLowerCase().startsWith("cd ")) {
      const dir = comando.substring(3).trim();
      mostrarDirectorio(dir);
    }
    crearLinea();
  }
  ajustarAltura()
});
function mostrarDirectorio(dir) {
  // Línea que muestra el "comando ejecutado"
  const lineaCmd = document.createElement("div");
  lineaCmd.classList.add("linea-terminal");

  const prompt = document.createElement("span");
  prompt.classList.add("prompt");
  prompt.textContent = "[/>]:";

  const salidaCmd = document.createElement("span");
  salidaCmd.classList.add("salida-cmd");
  salidaCmd.textContent = ` cd ${dir}`;

  lineaCmd.appendChild(prompt);
  //lineaCmd.appendChild(salidaCmd);
  terminal.appendChild(lineaCmd);

  // Línea que muestra los directorios
  const lineaOut = document.createElement("div");
  lineaOut.classList.add("linea-terminal", "salida");
  lineaOut.innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;directorios_existentes: {<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;proyecto/<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;main.lua<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;utils.lua<br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lib/<br>
  &nbsp;&nbsp;&nbsp;&nbsp;}`;

  terminal.appendChild(lineaOut);
}

terminal.addEventListener('focusin', () => {
  terminalActiva = true;
});

terminal.addEventListener('focusout', (e) => {
  if (!terminal.contains(e.relatedTarget)) {
    terminalActiva = false;
    terminal.style.height = "12vh";
  }
});


terminal.addEventListener('click', (e) => {
  const ultEntrada = terminal.querySelector('.linea-terminal:last-child .entrada');
  if (ultEntrada) {
    ultEntrada.focus();
    const range = document.createRange();
    range.selectNodeContents(ultEntrada);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    ajustarAltura();
  }
});

function crearLinea() {
  const nuevaLinea = document.createElement('div');
  nuevaLinea.classList.add('linea-terminal');

  const prompt = document.createElement('span');
  prompt.classList.add('prompt');
  prompt.textContent = '[/>]:';
  prompt.contentEditable = "false";

  const nuevaEntrada = document.createElement('div');
  nuevaEntrada.classList.add('entrada');
  nuevaEntrada.contentEditable = "true";

  nuevaLinea.appendChild(prompt);
  nuevaLinea.appendChild(nuevaEntrada);
  terminal.appendChild(nuevaLinea);

  nuevaEntrada.focus();
}

function ajustarAltura() {
  if (!terminalActiva) return;

  const contenidoAltura = terminal.scrollHeight;
  const maxAltura = window.innerHeight * 0.30;
  const minAltura = window.innerHeight * 0.12;

  let nuevaAltura = Math.min(contenidoAltura + 20, maxAltura);
  if (nuevaAltura < minAltura) nuevaAltura = minAltura;

  terminal.style.height = `${(nuevaAltura / window.innerHeight) * 100}vh`;
}

if (terminal.querySelectorAll('.linea-terminal').length === 0) {
  crearLinea();
}


/*===========================================
DOCUMENT.ADDEVENTLISTENER
===========================================*/

document.addEventListener('click', function (event) {
  if (justSelected) return;

  const clickedItem = event.target.closest('.directory-item');
  const selectedItem = document.querySelector('.directory-item.selected');

  if (!selectedItem) return;

  if (!clickedItem || clickedItem === selectedItem) {
    selectedItem.classList.remove('selected');
  }
});
document.addEventListener('keydown', function (event) {
  const sidebar = document.querySelector('aside.sidebar');
  if (sidebar.classList.contains('collapsed')) return;

  const items = Array.from(document.querySelectorAll('.directory-item'));
  const selected = document.querySelector('.directory-item.selected');
  if (!items.length) return;

  let index = items.indexOf(selected);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    index = index < items.length - 1 ? index + 1 : 0;
    items.forEach(item => item.classList.remove('selected'));
    items[index].classList.add('selected');
    items[index].scrollIntoView({ block: 'nearest' });
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    index = index > 0 ? index - 1 : items.length - 1;
    items.forEach(item => item.classList.remove('selected'));
    items[index].classList.add('selected');
    items[index].scrollIntoView({ block: 'nearest' });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.querySelector('.collapse-btn');
    
    if (window.innerWidth <= 768 && 
        sidebar && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.classList.remove('open');
      }
    }
  });
  
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }
  });
});

document.addEventListener('keydown', (e) => {
  const ultEntrada = terminal.querySelector('.linea-terminal:last-child .entrada');

  if (e.key === 'Escape') {
    terminalActiva = false;
    terminal.style.height = "12vh";
  }

  if (e.key === 'Tab' && ultEntrada && e.target.classList.contains('entrada')) {
    e.preventDefault();

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);

    const tabNode = document.createTextNode('    ');
    range.insertNode(tabNode);

    // mover cursor al final de los espacios insertados
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);

    sel.removeAllRanges();
    sel.addRange(range);
  }

  if (e.key === 'Tab' && e.target.classList.contains('code-area')) {
    e.preventDefault();

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.value =
      textarea.value.substring(0, start) +
      '    ' +
      textarea.value.substring(end);

    textarea.selectionStart = textarea.selectionEnd = start + 4;
  }
});
