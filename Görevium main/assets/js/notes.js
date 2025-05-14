document.addEventListener('DOMContentLoaded', () => {
    const kanbanBoard = document.getElementById('kanban-board');
    const addColumnButton = document.getElementById('add-column-button');
    const noteModalOverlay = document.getElementById('note-modal-overlay');
    const noteForm = document.getElementById('note-form');
    const modalTitle = document.getElementById('modal-title');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentDiv = document.getElementById('note-content'); // This is contenteditable
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');

    let notesData = []; // Main data structure for columns and notes
    let currentEditingNoteId = null;
    let currentColumnId = null;
    let draggedNote = null;

    // --- LocalStorage Operations ---
    function loadNotes() {
        const storedNotes = localStorage.getItem('kanbanNotes');
        if (storedNotes) {
            notesData = JSON.parse(storedNotes);
        } else {
            // Default columns if no notes are stored
            notesData = [{
                id: 'column-1',
                title: 'Yapılacaklar',
                notes: []
            }, {
                id: 'column-2',
                title: 'Devam Edenler',
                notes: []
            }, {
                id: 'column-3',
                title: 'Tamamlananlar',
                notes: []
            }];
        }
        renderBoard();
    }

    function saveNotes() {
        localStorage.setItem('kanbanNotes', JSON.stringify(notesData));
    }

    // --- Rendering Functions ---
    function renderBoard() {
        kanbanBoard.innerHTML = ''; // Clear board before rendering
        notesData.forEach(column => {
            const columnElement = createColumnElement(column);
            kanbanBoard.appendChild(columnElement);
        });
    }

    function createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('kanban-column');
        columnDiv.setAttribute('data-column-id', column.id);
        columnDiv.addEventListener('dragover', handleDragOver);
        columnDiv.addEventListener('drop', handleDrop);
        columnDiv.addEventListener('dragleave', handleDragLeave);

        const headerDiv = document.createElement('div');
        headerDiv.classList.add('column-header');
        headerDiv.textContent = column.title;
        headerDiv.contentEditable = true; // Make header editable
        headerDiv.addEventListener('blur', (e) => renameColumn(column.id, e.target.textContent.trim()));
        headerDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent new line
                e.target.blur(); // Blur to save
            }
        });

        // Column Delete Button
        const deleteColumnBtn = document.createElement('button');
        deleteColumnBtn.classList.add('column-delete-btn');
        deleteColumnBtn.innerHTML = '<i class="bi bi-x-circle"></i>'; // Bootstrap icon for close/delete
        deleteColumnBtn.title = 'Sütunu Sil';
        deleteColumnBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering header blur
            if (confirm(`"${column.title}" sütununu ve içindeki tüm notları silmek istediğinize emin misiniz?`)) {
                deleteColumn(column.id);
            }
        });
        headerDiv.appendChild(deleteColumnBtn); // Append delete button to header

        const notesContainer = document.createElement('div');
        notesContainer.classList.add('notes-container');
        notesContainer.id = `notes-container-${column.id}`;

        column.notes.forEach(note => {
            const noteElement = createNoteElement(note, column.id);
            notesContainer.appendChild(noteElement);
        });

        const addNoteBtn = document.createElement('button');
        addNoteBtn.classList.add('add-note-button');
        addNoteBtn.textContent = 'Not Ekle';
        addNoteBtn.addEventListener('click', () => openNoteModal(column.id));

        columnDiv.appendChild(headerDiv);
        columnDiv.appendChild(notesContainer);
        columnDiv.appendChild(addNoteBtn);

        return columnDiv;
    }

    function createNoteElement(note, columnId) {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note-card');
        noteDiv.setAttribute('draggable', true);
        noteDiv.setAttribute('data-note-id', note.id);
        noteDiv.setAttribute('data-column-id', columnId);
        noteDiv.addEventListener('dragstart', handleDragStart);
        noteDiv.addEventListener('dragend', handleDragEnd);

        const noteTitle = document.createElement('h4');
        noteTitle.textContent = note.title;

        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = note.content;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('note-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Düzenle';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteModal(columnId, note.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Sil';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
                deleteNote(note.id);
            }
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        noteDiv.appendChild(noteTitle);
        noteDiv.appendChild(noteContent);
        noteDiv.appendChild(actionsDiv);

        return noteDiv;
    }

    // --- Modal Operations ---
    function openNoteModal(columnId, noteId = null) {
        currentColumnId = columnId;
        currentEditingNoteId = noteId;

        noteForm.reset();
        noteContentDiv.innerHTML = ''; // Clear contenteditable div

        // Set text color for contenteditable div when opening modal
        noteContentDiv.style.color = '#333'; // Ensure dark text color

        if (noteId) {
            modalTitle.textContent = 'Notu Düzenle';
            const column = notesData.find(col => col.id === columnId);
            const note = column.notes.find(n => n.id === noteId);
            if (note) {
                noteTitleInput.value = note.title;
                noteContentDiv.innerHTML = note.content;
            }
        } else {
            modalTitle.textContent = 'Yeni Not Ekle';
        }
        noteModalOverlay.style.display = 'flex';
    }

    function closeNoteModal() {
        noteModalOverlay.style.display = 'none';
        currentEditingNoteId = null;
        currentColumnId = null;
        // Reset text color in case it was changed dynamically, though CSS should handle it
        noteContentDiv.style.color = ''; 
    }

    // --- CRUD Operations ---
    function addOrUpdateNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentDiv.innerHTML.trim(); // Get HTML content

        if (!title) {
            alert('Not başlığı boş olamaz!');
            return;
        }

        const column = notesData.find(col => col.id === currentColumnId);
        if (!column) return;

        if (currentEditingNoteId) {
            // Update existing note
            const noteIndex = column.notes.findIndex(n => n.id === currentEditingNoteId);
            if (noteIndex !== -1) {
                column.notes[noteIndex].title = title;
                column.notes[noteIndex].content = content;
            }
        } else {
            // Add new note
            const newNote = {
                id: `note-${Date.now()}`,
                title: title,
                content: content
            };
            column.notes.push(newNote);
        }
        saveNotes();
        renderBoard();
        closeNoteModal();
    }

    function deleteNote(noteId) {
        notesData.forEach(column => {
            column.notes = column.notes.filter(note => note.id !== noteId);
        });
        saveNotes();
        renderBoard();
    }

    function renameColumn(columnId, newTitle) {
        const column = notesData.find(col => col.id === columnId);
        if (column && newTitle && newTitle !== column.title) {
            column.title = newTitle;
            saveNotes();
        } else if (!newTitle) { // If title is empty after editing
             alert("Sütun başlığı boş olamaz!");
             renderBoard(); // Re-render to revert to previous valid title
        }
    }

    function addColumn() {
        const newColumn = {
            id: `column-${Date.now()}`,
            title: 'Yeni Sütun',
            notes: []
        };
        notesData.push(newColumn);
        saveNotes();
        renderBoard();
    }

    // New: Function to delete a column
    function deleteColumn(columnId) {
        notesData = notesData.filter(column => column.id !== columnId);
        saveNotes();
        renderBoard();
    }

    // --- Drag and Drop Handlers ---
    function handleDragStart(e) {
        draggedNote = e.target;
        e.dataTransfer.setData('text/plain', draggedNote.dataset.noteId);
        e.dataTransfer.effectAllowed = 'move';
        draggedNote.classList.add('dragging');
    }

    function handleDragEnd(e) {
        draggedNote.classList.remove('dragging');
        draggedNote = null;
        document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const targetColumn = e.currentTarget;
        if (targetColumn && targetColumn.classList.contains('kanban-column')) {
            // Remove drag-over from previous columns to avoid multiple highlights
            document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
            targetColumn.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropTargetColumn = e.currentTarget;
        dropTargetColumn.classList.remove('drag-over');

        const noteId = e.dataTransfer.getData('text/plain');
        const sourceColumnId = draggedNote.dataset.columnId;

        if (!noteId || !sourceColumnId || !dropTargetColumn) return;

        const sourceColumn = notesData.find(col => col.id === sourceColumnId);
        const targetColumn = notesData.find(col => col.id === dropTargetColumn.dataset.columnId);

        if (!sourceColumn || !targetColumn) return;

        const noteToMoveIndex = sourceColumn.notes.findIndex(note => note.id === noteId);
        if (noteToMoveIndex === -1) return;

        const [noteToMove] = sourceColumn.notes.splice(noteToMoveIndex, 1);

        // Find the drop position within the target column
        const notesContainer = dropTargetColumn.querySelector('.notes-container');
        let dropIndex = -1;
        if (notesContainer) {
            const children = Array.from(notesContainer.children);
            for (let i = 0; i < children.length; i++) {
                const childRect = children[i].getBoundingClientRect();
                // If the drop is above the midpoint of the current note, insert before it
                if (e.clientY < childRect.top + childRect.height / 2) {
                    dropIndex = i;
                    break;
                }
            }
        }

        if (dropIndex === -1) {
            // If no specific position found (or no notes in target column), append to end
            targetColumn.notes.push(noteToMove);
        } else {
            targetColumn.notes.splice(dropIndex, 0, noteToMove);
        }

        // Update data-column-id attribute on the HTML element
        draggedNote.setAttribute('data-column-id', targetColumn.id);
        saveNotes();
        renderBoard(); // Re-render to update UI with new order/column
    }

    // --- Event Listeners ---
    addColumnButton.addEventListener('click', addColumn);
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addOrUpdateNote();
    });
    cancelNoteButton.addEventListener('click', closeNoteModal);
    noteModalOverlay.addEventListener('click', (e) => {
        if (e.target === noteModalOverlay) { // Close if clicking outside modal content
            closeNoteModal();
        }
    });

    // Initial load
    loadNotes();
});