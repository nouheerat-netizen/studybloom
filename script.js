
// ===== 1. Get HTML Elements =====

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");
const todayDate = document.getElementById("todayDate");

const filterButtons = document.querySelectorAll(".filter");


// ===== 2. Show Today's Date =====

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});


// ===== 3. Load Saved Tasks =====

let tasks = [];

try {
  const savedTasks = localStorage.getItem("studyBloomTasks");

  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks.filter(task =>
        task &&
        typeof task.id === "number" &&
        typeof task.title === "string" &&
        typeof task.subject === "string" &&
        typeof task.completed === "boolean"
      );
    }
  }
} catch (error) {
  console.warn("Saved tasks could not be loaded.");
}

let currentFilter = "all";


// ===== 4. Save Tasks in Browser =====

function saveTasks() {
  try {
    localStorage.setItem("studyBloomTasks", JSON.stringify(tasks));
  } catch (error) {
    console.warn("Tasks could not be saved in this browser.");
  }
}


// ===== 5. Display Tasks =====

function displayTasks() {
  taskList.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  emptyMessage.hidden = filteredTasks.length > 0;

  if (filteredTasks.length === 0) {
    if (tasks.length > 0) {
      emptyMessage.textContent = "🌷 No tasks in this filter.";
    } else {
      emptyMessage.textContent =
        "🌸 Your task list is empty. Add your first task!";
    }
  }

  filteredTasks.forEach(task => {
    // Create the task row
    const li = document.createElement("li");
    li.className = "task-item";

    if (task.completed) {
      li.classList.add("completed");
    }

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Complete " + task.title);

    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    // Create task information
    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const subject = document.createElement("span");
    subject.className = "task-subject";
    subject.textContent = task.subject;

    details.append(title, subject);

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "🗑️";
    deleteButton.setAttribute("aria-label", "Delete " + task.title);

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    // Add everything to the task row
    li.append(checkbox, details, deleteButton);
    taskList.appendChild(li);
  });

  updateProgress();
}


// ===== 6. Add a New Task =====

taskForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const subject = subjectInput.value;

  if (title === "") {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    title: title,
    subject: subject,
    completed: false
  };

  tasks.push(newTask);

  saveTasks();

  currentFilter = "all";
  updateFilterButtons();
  displayTasks();

  taskForm.reset();
  taskInput.focus();
});


// ===== 7. Complete or Uncomplete a Task =====

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  displayTasks();
}


// ===== 8. Delete a Task =====

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  displayTasks();
}


// ===== 9. Filter Tasks =====

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    updateFilterButtons();
    displayTasks();
  });
});

function updateFilterButtons() {
  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
  });
}


// ===== 10. Update Statistics and Progress =====

function updateProgress() {
  const total = tasks.length;

  const completed = tasks.filter(task => {
    return task.completed;
  }).length;

  const remaining = total - completed;

  // Update summary cards
  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  remainingTasks.textContent = remaining;

  // Calculate percentage
  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  progressText.textContent = percentage + "%";
  progressBar.style.width = percentage + "%";

  // Update encouragement message
  if (total === 0) {
    progressMessage.textContent =
      "Add a task and start your study journey! 🌱";
  } else if (percentage === 100) {
    progressMessage.textContent =
      "Amazing! You completed every task! 🎉";
  } else if (percentage >= 50) {
    progressMessage.textContent =
      "You're doing wonderfully. Keep blooming! 🌸";
  } else {
    progressMessage.textContent =
      "Every little effort counts. Keep going! 💕";
  }
}


// ===== 11. Show the Initial Task List =====

displayTasks();
