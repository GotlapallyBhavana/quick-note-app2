const titleInput = document.querySelector("#note-title");
const bodyInput = document.querySelector("#note-body");
const saveButton = document.querySelector("#save-button");
const notesList = document.querySelector("#notes-list");
const searchInput = document.querySelector("#search");
const countLabel = document.querySelector("#note-count");
const emptyState = document.querySelector("#empty-state");
const statusLabel = document.querySelector("#status");

let notes = JSON.parse(localStorage.getItem("quick-notes") || "[]");
let editingId = null;

function persist() {
  localStorage.setItem("quick-notes", JSON.stringify(notes));
  renderNotes();
}

function renderNotes() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter(note =>
    note.title.toLowerCase().includes(query) || note.body.toLowerCase().includes(query)
  );

  notesList.innerHTML = "";
  visibleNotes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled note";
    const body = document.createElement("p");
    body.textContent = note.body;
    const date = document.createElement("small");
    date.textContent = new Date(note.updatedAt).toLocaleString();

    const actions = document.createElement("div");
    actions.className = "note-actions";
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => startEdit(note.id));
    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete";
    remove.addEventListener("click", () => deleteNote(note.id));

    actions.append(edit, remove);
    card.append(title, body, date, actions);
    notesList.append(card);
  });

  countLabel.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
  emptyState.hidden = visibleNotes.length > 0;
  emptyState.textContent = notes.length ? "No matching notes found." : "No notes yet. Add your first note above.";
}

function clearEditor() {
  titleInput.value = "";
  bodyInput.value = "";
  editingId = null;
  saveButton.textContent = "Add note";
}

function startEdit(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return;
  titleInput.value = note.title;
  bodyInput.value = note.body;
  editingId = id;
  saveButton.textContent = "Save changes";
  titleInput.focus();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  notes = notes.filter(note => note.id !== id);
  if (editingId === id) clearEditor();
  persist();
  statusLabel.textContent = "Note deleted.";
}

saveButton.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title && !body) {
    statusLabel.textContent = "Please enter a title or note before saving.";
    return;
  }

  if (editingId) {
    notes = notes.map(note => note.id === editingId
      ? { ...note, title, body, updatedAt: new Date().toISOString() }
      : note);
    statusLabel.textContent = "Changes saved.";
  } else {
    notes.unshift({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title, body, updatedAt: new Date().toISOString()
    });
    statusLabel.textContent = "Note added.";
  }
  clearEditor();
  persist();
});

searchInput.addEventListener("input", renderNotes);
renderNotes();
