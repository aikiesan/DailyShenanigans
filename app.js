/* ── Daily Shenanigans — app.js ───────────────────────────── */

const LS_KEY = 'dailyShenanigans_entries';
const LS_DRAFT_KEY = 'dailyShenanigans_draft';
let entries = [];
let currentDate = null;
let fileHandle = null;
let draftTimer = null;

// ── Date helpers ────────────────────────────────────────────

function todayISO() {
  return new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
}

function formatDatePT(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${dias[date.getDay()]}, ${d} de ${meses[m - 1]} de ${y}`;
}

function formatMonthShortPT(isoDate) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const [, m] = isoDate.split('-').map(Number);
  return meses[m - 1];
}

// ── Data persistence ────────────────────────────────────────

function saveToLS() {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

function loadFromLS() {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveDraft(entry) {
  localStorage.setItem(LS_DRAFT_KEY + '_' + entry.id, JSON.stringify(entry));
}

function loadDraft(date) {
  const raw = localStorage.getItem(LS_DRAFT_KEY + '_' + date);
  return raw ? JSON.parse(raw) : null;
}

async function loadEntries() {
  // Try fetching entries.json (works on GitHub Pages & local server)
  try {
    const res = await fetch('entries.json?v=' + Date.now());
    if (res.ok) {
      const fetched = await res.json();
      // Merge with localStorage: localStorage wins for newer drafts
      const lsEntries = loadFromLS();
      const merged = mergeEntries(fetched, lsEntries);
      entries = merged;
      saveToLS();
      return;
    }
  } catch (_) {}
  // Fallback: use localStorage only
  entries = loadFromLS();
}

function mergeEntries(fromFile, fromLS) {
  const map = {};
  fromFile.forEach(e => { map[e.id] = e; });
  fromLS.forEach(e => { map[e.id] = e; }); // localStorage overwrites (newer)
  return Object.values(map).sort((a, b) => b.id.localeCompare(a.id));
}

function getEntry(date) {
  return entries.find(e => e.id === date) || null;
}

function upsertEntry(entry) {
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  entries.sort((a, b) => b.id.localeCompare(a.id));
  saveToLS();
}

function blankEntry(date) {
  return { id: date, date, todos: [], pesquisa: '', dev: '', notas: '', conquistas: [] };
}

// ── File System Access API ──────────────────────────────────

async function saveToFile() {
  const json = JSON.stringify(entries, null, 2);

  if ('showSaveFilePicker' in window) {
    try {
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: 'entries.json',
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
        });
      }
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      showToast('Arquivo salvo!', 'success');
      setDraftStatus('saved');
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Erro ao salvar: ' + err.message, 'error');
      return false;
    }
  } else {
    // Fallback: download
    downloadJSON(json, 'entries.json');
    showToast('Arquivo baixado — substitua o entries.json no repositório.', 'success');
    return true;
  }
}

function downloadJSON(json, filename) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function importFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      entries = mergeEntries(imported, entries);
      saveToLS();
      renderArchive();
      showToast(`${imported.length} entradas importadas!`, 'success');
    } catch {
      showToast('Erro ao importar arquivo.', 'error');
    }
  };
  input.click();
}

// ── Render Archive ──────────────────────────────────────────

function renderArchive() {
  const grid = document.getElementById('entries-grid');
  grid.innerHTML = '';

  if (entries.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🌱</div>
        <h3>Nenhum registro ainda</h3>
        <p>Comece o seu primeiro dia clicando em "Hoje".</p>
      </div>`;
    return;
  }

  entries.forEach(entry => {
    const [, , d] = entry.date.split('-');
    const totalTodos = entry.todos.length;
    const doneTodos = entry.todos.filter(t => t.done).length;
    const preview = (entry.notas || entry.pesquisa || entry.dev || '').substring(0, 80) || 'Sem notas.';

    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-card-date">
        <div class="day">${d}</div>
        <div class="month">${formatMonthShortPT(entry.date)}</div>
      </div>
      <div class="entry-card-body">
        <h3>${formatDatePT(entry.date)}</h3>
        <div class="entry-card-preview">${escapeHTML(preview)}${(entry.notas || entry.pesquisa || entry.dev || '').length > 80 ? '…' : ''}</div>
      </div>
      <div class="entry-card-meta">
        ${totalTodos > 0 ? `<span class="progress-badge">✅ ${doneTodos}/${totalTodos}</span>` : ''}
        ${entry.conquistas.length > 0 ? `<span class="conquista-badge">⭐ ${entry.conquistas.length}</span>` : ''}
      </div>`;
    card.addEventListener('click', () => openEditor(entry.date));
    grid.appendChild(card);
  });
}

// ── Editor ──────────────────────────────────────────────────

function openEditor(date) {
  currentDate = date;
  const existing = getEntry(date);
  const draft = loadDraft(date);

  // Draft takes priority if it exists and is different
  let entry = draft || existing || blankEntry(date);

  document.getElementById('editor-date').textContent = formatDatePT(date);

  // Todos
  renderTodos(entry.todos);

  // Textareas
  document.getElementById('textarea-pesquisa').value = entry.pesquisa || '';
  document.getElementById('textarea-dev').value = entry.dev || '';
  document.getElementById('textarea-notas').value = entry.notas || '';

  // Conquistas
  renderConquistas(entry.conquistas);

  // Show editor
  document.getElementById('archive-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'block';
  document.querySelector('.floating-bar').classList.remove('hidden');

  setDraftStatus(draft ? 'draft' : 'saved');
  startAutoDraft();
  window.scrollTo(0, 0);
}

function closeEditor() {
  stopAutoDraft();
  document.getElementById('archive-view').style.display = 'block';
  document.getElementById('editor-view').style.display = 'none';
  document.querySelector('.floating-bar').classList.add('hidden');
  currentDate = null;
  renderArchive();
}

// ── Todos ───────────────────────────────────────────────────

function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach((todo, i) => addTodoItem(todo, i));
}

function addTodoItem(todo, index) {
  const list = document.getElementById('todo-list');
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.done ? ' done' : '');
  li.dataset.index = index;

  const check = document.createElement('div');
  check.className = 'todo-check' + (todo.done ? ' checked' : '');
  check.addEventListener('click', () => toggleTodo(index));

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;

  const del = document.createElement('button');
  del.className = 'todo-delete';
  del.title = 'Remover';
  del.textContent = '×';
  del.addEventListener('click', () => deleteTodo(index));

  li.appendChild(check);
  li.appendChild(text);
  li.appendChild(del);
  list.appendChild(li);
}

function toggleTodo(index) {
  const entry = getCurrentEditorEntry();
  entry.todos[index].done = !entry.todos[index].done;
  renderTodos(entry.todos);
  triggerDraft(entry);
}

function deleteTodo(index) {
  const entry = getCurrentEditorEntry();
  entry.todos.splice(index, 1);
  renderTodos(entry.todos);
  triggerDraft(entry);
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  const entry = getCurrentEditorEntry();
  entry.todos.push({ text, done: false });
  renderTodos(entry.todos);
  triggerDraft(entry);
  input.value = '';
  input.focus();
}

// ── Conquistas ──────────────────────────────────────────────

function renderConquistas(conquistas) {
  const list = document.getElementById('conquistas-list');
  list.innerHTML = '';
  conquistas.forEach((c, i) => {
    const tag = document.createElement('span');
    tag.className = 'conquista-tag';
    tag.innerHTML = `${escapeHTML(c)}<button class="conquista-remove" title="Remover" data-index="${i}">×</button>`;
    tag.querySelector('button').addEventListener('click', () => deleteConquista(i));
    list.appendChild(tag);
  });
}

function addConquista() {
  const input = document.getElementById('conquista-input');
  const text = input.value.trim();
  if (!text) return;
  const entry = getCurrentEditorEntry();
  entry.conquistas.push(text);
  renderConquistas(entry.conquistas);
  triggerDraft(entry);
  input.value = '';
  input.focus();
}

function deleteConquista(index) {
  const entry = getCurrentEditorEntry();
  entry.conquistas.splice(index, 1);
  renderConquistas(entry.conquistas);
  triggerDraft(entry);
}

// ── Read editor state ───────────────────────────────────────

function getCurrentEditorEntry() {
  const existing = getEntry(currentDate) || blankEntry(currentDate);
  // Keep todos and conquistas from current render (already updated)
  const list = document.getElementById('todo-list');
  const todos = Array.from(list.querySelectorAll('.todo-item')).map(li => ({
    text: li.querySelector('.todo-text').textContent,
    done: li.classList.contains('done')
  }));
  const conquistasList = document.getElementById('conquistas-list');
  const conquistas = Array.from(conquistasList.querySelectorAll('.conquista-tag')).map(tag => {
    const clone = tag.cloneNode(true);
    clone.querySelector('button')?.remove();
    return clone.textContent.trim();
  });

  return {
    ...existing,
    id: currentDate,
    date: currentDate,
    todos,
    pesquisa: document.getElementById('textarea-pesquisa').value,
    dev: document.getElementById('textarea-dev').value,
    notas: document.getElementById('textarea-notas').value,
    conquistas
  };
}

// ── Draft auto-save ─────────────────────────────────────────

function triggerDraft(entry) {
  upsertEntry(entry);
  saveDraft(entry);
  setDraftStatus('draft');
}

function startAutoDraft() {
  stopAutoDraft();
  draftTimer = setInterval(() => {
    if (!currentDate) return;
    const entry = getCurrentEditorEntry();
    upsertEntry(entry);
    saveDraft(entry);
    setDraftStatus('draft');
  }, 30000);

  // Also save on textarea changes
  ['textarea-pesquisa', 'textarea-dev', 'textarea-notas'].forEach(id => {
    document.getElementById(id).addEventListener('input', onTextareaInput);
  });
}

function onTextareaInput() {
  if (!currentDate) return;
  const entry = getCurrentEditorEntry();
  saveDraft(entry);
  setDraftStatus('draft');
}

function stopAutoDraft() {
  if (draftTimer) clearInterval(draftTimer);
  ['textarea-pesquisa', 'textarea-dev', 'textarea-notas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.removeEventListener('input', onTextareaInput);
  });
}

// ── Save entry ──────────────────────────────────────────────

function saveCurrentEntry() {
  if (!currentDate) return;
  const entry = getCurrentEditorEntry();
  upsertEntry(entry);
  saveDraft(entry);
  showToast('Entrada salva localmente!', 'success');
  setDraftStatus('saved');
}

async function saveEntryAndFile() {
  if (!currentDate) return;
  saveCurrentEntry();
  await saveToFile();
}

// ── UI helpers ──────────────────────────────────────────────

function setDraftStatus(state) {
  const dot = document.getElementById('draft-dot');
  const label = document.getElementById('draft-label');
  if (state === 'draft') {
    dot.classList.remove('saved-dot');
    label.textContent = 'Rascunho não salvo';
  } else {
    dot.classList.add('saved-dot');
    label.textContent = 'Salvo';
  }
}

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' toast-' + type : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHTML(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ────────────────────────────────────────────────────

async function init() {
  await loadEntries();
  renderArchive();

  // Hoje button
  document.getElementById('btn-hoje').addEventListener('click', () => openEditor(todayISO()));

  // Back button
  document.getElementById('btn-back').addEventListener('click', closeEditor);

  // Save buttons
  document.getElementById('btn-save-entry').addEventListener('click', saveCurrentEntry);
  document.getElementById('btn-save-file').addEventListener('click', saveEntryAndFile);

  // Todo add
  document.getElementById('btn-add-todo').addEventListener('click', addTodo);
  document.getElementById('todo-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

  // Conquista add
  document.getElementById('btn-add-conquista').addEventListener('click', addConquista);
  document.getElementById('conquista-input').addEventListener('keydown', e => { if (e.key === 'Enter') addConquista(); });

  // Import/Export
  document.getElementById('btn-export').addEventListener('click', () => {
    downloadJSON(JSON.stringify(entries, null, 2), 'entries.json');
    showToast('Backup exportado!', 'success');
  });
  document.getElementById('btn-import').addEventListener('click', importFromFile);
}

document.addEventListener('DOMContentLoaded', init);
