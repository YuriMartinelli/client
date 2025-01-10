const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const filterAll = document.getElementById('filterAll');
const filterDone = document.getElementById('filterDone');
const filterPending = document.getElementById('filterPending');
let tasks = [];

// Carrega tarefas do localStorage ao iniciar
function loadTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task.text, task.completed));
}

// Salva o array de tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Adiciona uma nova tarefa ao estado e ao DOM
function addTask(taskText, completed = false) {
    tasks.push({ text: taskText, completed });
    saveTasks();
    addTaskToDOM(taskText, completed);
}

// Adiciona uma tarefa ao DOM
function addTaskToDOM(taskText, completed = false) {
    const taskAtual = tasks.find(task => task.text === taskText);
    const li = document.createElement('li');

    const selectCategory = document.createElement('select');
    li.appendChild(selectCategory);

    handleSelectCategory(li, selectCategory, taskText);

    li.textContent = taskText + `(${taskAtual.category ? taskAtual.category : 'Sem categoria'})`;

    if (completed) {
        li.classList.add('completed');
    }

    const removeButton = createRemoveButton(li, taskText);
    li.appendChild(removeButton);

    li.addEventListener('click', () => toggleTaskCompletion(li, taskText));

    li.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        handleEditTask(li, input, taskText, removeButton);
    });

    handleDragEventsLi(li);

    taskList.appendChild(li);
}

function handleDragEventsLi(li) {
    li.draggable = true;
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

}

function handleSelectCategory(li, selectCategory, taskText) {
    selectCategory.append(new Option('Selecione uma categoria'), new Option('Trabalho'), new Option('Pessoal'), new Option('Urgente'));
    selectCategory.addEventListener('change', (event) => {
        const task = tasks.find(task => task.text === taskText);
        task.category = event.target.value;
        saveTasks();
    });
}

function toggleTaskCompletion(li, taskText) {
    li.classList.toggle('completed');
    const task = tasks.find(task => task.text === taskText);
    task.completed = !task.completed;
    saveTasks();
}

function createRemoveButton(li, taskText) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.classList.add('remove');
    removeButton.style.marginLeft = '10px';

    removeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        removeTask(taskText);
        li.remove();
    });

    return removeButton;
}

function removeTask(taskText) {
    tasks = tasks.filter(task => task.text !== taskText);
    saveTasks();
}

function handleEditTask(li, input, oldText, removeButton) {
    input.value = oldText;
    li.textContent = '';
    li.appendChild(input);
    input.focus();

    input.addEventListener('blur', () => {
        finalizeEdit(li, input.value, removeButton, oldText);
    });

    input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            finalizeEdit(li, input.value, removeButton, oldText);
        } else if (event.key === 'Escape') {
            cancelEdit(li, oldText, removeButton);
        }
    });
}

function finalizeEdit(li, newText, removeButton, oldText) {
    if (newText.trim() === '') {
        alert('A tarefa não pode ficar vazia!');
        li.textContent = oldText;
        li.appendChild(removeButton);
        return;
    }

    const task = tasks.find(task => task.text === oldText);
    task.text = newText;
    saveTasks();

    li.textContent = newText;
    li.appendChild(removeButton);
}

function cancelEdit(li, oldText, removeButton) {
    li.textContent = oldText;
    li.appendChild(removeButton);
}

addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        alert('Por favor, digite uma tarefa!');
        return;
    }
    addTask(taskText); // Adiciona tarefa
    taskInput.value = ''; // Limpa o campo de entrada
});

function filterTasks() {
    tasks = localStorage.getItem('tasks');
    if (tasks === null) {
        tasks = [];
    }
}

filterAll.addEventListener('click', () => {
    filterTasks("all");
});
filterDone.addEventListener('click', () => {
    filterTasks("done");
});
filterPending.addEventListener('click', () => {
    filterTasks("pending");
});
function filterTasks(filter) {
    let filteredTasks;
    if (filter === 'pending') {
        filteredTasks = tasks.filter((task) => !task.completed)

    } else if (filter === 'done') {
        filteredTasks = tasks.filter((task) => task.completed)
    } else {
        filteredTasks = tasks
    }
    taskList.innerHTML = '';
    filteredTasks.forEach(task => addTaskToDOM(task.text, task.completed));

}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault(); // Necessário para permitir o drop
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(taskList, event.clientY);
    if (afterElement == null) {
        taskList.appendChild(draggingItem);
    } else {
        taskList.insertBefore(draggingItem, afterElement);
    }
}

function handleDrop(event) {
    event.preventDefault();
    saveTasks(); // Atualiza a nova ordem no localStorage
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Carrega as tarefas salvas ao iniciar
loadTasks();
