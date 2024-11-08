fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
    .then(res => res.json())
    .then(data => {
        document.body.style.backgroundImage = `url(${data.urls.regular})`
         console.log(data);
    })
    .catch(err => {
        // Use a default background image/author
        document.body.style.backgroundImage = `url("https://images.unsplash.com/photo-1464800959563-472c0567132f?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxNDI0NzB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Mjc0MjYxNDJ8&ixlib=rb-4.0.3&q=85")`;
    })





// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js"; 


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

initializeData();

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"), 
}

let activeBoard = "";
let selectedTask = {};

// Extracts unique board names from tasks
// TASK: FIX BUGS: ternary operator fix
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

const columnTitles = {
  todo: "todo",
  doing: "doing",
  done: "done"
};


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const columnTitle = columnTitles[status];
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${columnTitle.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        selectedTask = task;
        openEditTaskModal();
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {

  filterAndDisplayTasksByBoard(activeBoard);

}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', ()=> toggleModal(false, elements.editTaskModal));


  // getEventListeners(document.getElementById('cancel-edit-btn'))

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  saveChangesBtn.removeEventListener('click', saveChangesHandler);
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  deleteTaskBtn.removeEventListener('click', onDeleteTaskClick);

  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object

  const titleInput = document.getElementById('title-input').value;
  const descriptionInput = document.getElementById('desc-input').value;
  const statusInput = document.getElementById('select-status').value;

  const boardName = elements.headerBoardName.textContent;

    const task = {

      "title": titleInput,
      "description": descriptionInput,
      "status": statusInput,
      "board": boardName
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      console.clear()
      const tasksString = localStorage.getItem('tasks');
      const tasksArray = JSON.parse(tasksString);
      console.log(tasksArray);
      console.log(`"${newTask.title}" added.`);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  if (show) {
    sidebar.style.display = 'block';
    elements.showSideBarBtn.style.display = 'none';
    localStorage.setItem('showSideBar', 'true'); // Store the state
  } else {
    sidebar.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block';
    localStorage.setItem('showSideBar', 'false'); // Store the state
  }
}


function toggleTheme() {
  // Check the current state of the theme switch
  const isLightTheme = elements.themeSwitch.checked;

  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');

  document.body.classList.toggle('light-theme', isLightTheme);
 
}

// Define the event listener function for saving changes
const saveChangesHandler = () => {
  saveTaskChanges(selectedTask.id);
  console.clear()
  const tasksString = localStorage.getItem('tasks');
  const tasksArray = JSON.parse(tasksString);
  console.log(tasksArray);
  console.log(`${selectedTask.title} edited.`);
};


function onDeleteTaskClick() {
  const userConfirmed = confirm(`Are you sure you want to delete "${selectedTask.title}"?`);

  if (!userConfirmed) {
    return; // Exit the function if the user cancels the deletion
  }

  // Proceed with deletion
  deleteTask(selectedTask.id);
  console.clear();
  const tasksString = localStorage.getItem('tasks');
  const tasksArray = JSON.parse(tasksString);
  console.log(tasksArray);
  console.log(`"${selectedTask.title}" deleted.`);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}
function openEditTaskModal() {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('edit-task-desc-input');
  const statusSelect = document.getElementById('edit-select-status');

  titleInput.value = selectedTask.title;
  descriptionInput.value = selectedTask.description;
  statusSelect.value = selectedTask.status;

  // Get the button elements for saving changes and deleting the task
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  // Remove previous event listeners to avoid duplicates
  deleteTaskBtn.removeEventListener("click", onDeleteTaskClick);
  saveChangesBtn.removeEventListener('click', saveChangesHandler);

  // Add event listeners to the Save Changes and Delete Task buttons
  saveChangesBtn.addEventListener('click', once(saveChangesHandler));
  deleteTaskBtn.addEventListener("click", once(onDeleteTaskClick));

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
  refreshTasksUI();

  // Helper function to ensure the save changes handler is only added once
  function once(handler) {
    let executed = false;
    return function () {
      if (!executed) {
        executed = true;
        handler();
      }
    };
  }
}

function saveTaskChanges(taskId) {

  // Get new user inputs
  const titleInput = document.getElementById('edit-task-title-input').value;
  const descriptionInput = document.getElementById('edit-task-desc-input').value;
  const statusInput = document.getElementById('edit-select-status').value;
  const boardName = elements.headerBoardName.textContent;

  // Create an object with the updated task details
  const updatedTask = {
    "id": taskId,
    "title": titleInput,
    "description": descriptionInput,
    "status": statusInput,
    "board": boardName
  };
  

  // Update task using a helper functoin
  patchTask(taskId, updatedTask);


  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
 
}


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'false'; // Retrieve stored value
  toggleSidebar(!showSidebar); // Set sidebar visibility based on stored value
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  elements.themeSwitch.checked = isLightTheme;
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}


console.clear()
const tasksString = localStorage.getItem('tasks');
const tasksArray = JSON.parse(tasksString);
console.log(tasksArray);

// localStorage.clear();