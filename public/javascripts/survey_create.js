function addQuestion() {
    const questionContainer = document.createElement("div");
    questionContainer.className = "question mb-3 border p-3";
    questionContainer.draggable = true; // Make the question draggable
    questionContainer.setAttribute("data-question-id", `question-${document.querySelectorAll(".question").length}`);
    questionContainer.addEventListener("dragstart", handleDragStart);
    questionContainer.addEventListener("dragover", handleDragOver);
    questionContainer.addEventListener("drop", handleDrop);

    const questionCount = document.querySelectorAll(".question").length;
    const questionId = `question-${questionCount}`;

    questionContainer.innerHTML = `
        <label for="${questionId}" class="form-label">Question:</label>
        <input type="text" name="questions[${questionCount}][questionText]" id="${questionId}" class="form-control mb-2" placeholder="Enter question" required>

        <label for="${questionId}-type" class="form-label">Type:</label>
        <select name="questions[${questionCount}][questionType]" id="${questionId}-type" class="form-select mb-2" onchange="toggleOptions(this, ${questionCount})">
            <option value="text">Text</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="rating">Rating</option>
        </select>

        <div id="options-${questionCount}" class="options-container mb-2" style="display:none;">
            <label class="form-label">Options:</label>
            <div class="options">
                <!-- Option inputs will only be added here if 'multiple-choice' is selected -->
            </div>
            <button type="button" class="btn btn-secondary btn-sm mt-2" onclick="addOption(${questionCount})" style="display:none;">Add Option</button>
        </div>

        <button type="button" class="btn btn-danger btn-sm mt-2" onclick="removeQuestion(this)">X</button>
    `;

    document.getElementById("questions-container").appendChild(questionContainer);
}

function toggleOptions(select, questionIndex) {
    const optionsContainer = document.getElementById(`options-${questionIndex}`);
    const addOptionButton = optionsContainer.querySelector("button");

    if (select.value === "multiple-choice") {
        optionsContainer.style.display = "block";
        addOptionButton.style.display = "inline";
    } else {
        optionsContainer.style.display = "none";
        addOptionButton.style.display = "none";

        const optionsDiv = optionsContainer.querySelector(".options");
        optionsDiv.innerHTML = ''; // Clear all option inputs
    }
}

function addOption(questionIndex) {
    const optionsDiv = document.querySelector(`#options-${questionIndex} .options`);
    const input = document.createElement("input");
    input.type = "text";
    input.name = `questions[${questionIndex}][options][]`;
    input.className = "form-control mb-2";
    input.placeholder = "Enter an option";
    optionsDiv.appendChild(input);
}

function removeQuestion(button) {
    const questionContainer = button.parentElement;
    questionContainer.remove();
}

// Drag and Drop Handlers
let draggedElement = null;

function handleDragStart(event) {
    draggedElement = event.currentTarget;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedElement.getAttribute("data-question-id"));
    draggedElement.classList.add("dragging");
}

function handleDragOver(event) {
    event.preventDefault(); // Allow the drop
    event.dataTransfer.dropEffect = "move";
}

function handleDrop(event) {
    event.preventDefault();
    const target = event.currentTarget;

    // Ensure the dragged element is dropped only on other question containers
    if (draggedElement !== target) {
        const container = document.getElementById("questions-container");
        const draggedIndex = Array.from(container.children).indexOf(draggedElement);
        const targetIndex = Array.from(container.children).indexOf(target);

        if (draggedIndex > targetIndex) {
            container.insertBefore(draggedElement, target);
        } else {
            container.insertBefore(draggedElement, target.nextSibling);
        }
    }

    draggedElement.classList.remove("dragging");
    draggedElement = null;
}

