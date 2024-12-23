// public/javascripts/survey_edit.js

// Add a new question
function addQuestion() {
    const questionContainer = document.createElement("div");
    questionContainer.className = "question mb-3";
    questionContainer.setAttribute("draggable", "true");
    const questionCount = document.querySelectorAll(".question").length;

    questionContainer.dataset.id = "";
    questionContainer.innerHTML = `
        <label for="question-${questionCount}" class="form-label">Question ${questionCount + 1}:</label>
        <input type="text" name="questions[${questionCount}][questionText]" id="question-${questionCount}" class="form-control" required placeholder="Enter question">

        <label for="question-${questionCount}-type" class="form-label mt-2">Type:</label>
        <select name="questions[${questionCount}][questionType]" id="question-${questionCount}-type" class="form-select" onchange="toggleOptions(this, ${questionCount})">
            <option value="text" selected>Text</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="rating">Rating</option>
        </select>

        <div id="options-${questionCount}" class="options-container mt-2" style="display:none;">
            <label class="form-label">Options:</label>
            <div class="options"></div>
            <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="addOption(${questionCount})">Add Option</button>
        </div>

        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="deleteQuestion(this)">Delete Question</button>
    `;
    document.getElementById("questions-container").appendChild(questionContainer);

    updateQuestionOrder();
    attachDragEvents(questionContainer);
}

// Toggle options visibility based on question type
function toggleOptions(select, questionIndex) {
    const optionsContainer = document.getElementById(`options-${questionIndex}`);
    const addOptionButton = optionsContainer.querySelector("button");

    if (select.value === "multiple-choice") {
        optionsContainer.style.display = "block";
        addOptionButton.style.display = "inline";
    } else {
        optionsContainer.style.display = "none";
        optionsContainer.querySelector(".options").innerHTML = ""; // Clear options for other types
    }
}

// Add an option to a multiple-choice question
function addOption(questionIndex) {
    const optionsDiv = document.querySelector(`#options-${questionIndex} .options`);
    const input = document.createElement("input");
    input.type = "text";
    input.name = `questions[${questionIndex}][options][]`;
    input.className = "form-control mb-2";
    input.placeholder = "Enter an option";
    optionsDiv.appendChild(input);
}

// Delete a question
function deleteQuestion(button) {
    const questionDiv = button.closest(".question");
    questionDiv.remove();
    updateQuestionOrder();
}

// Update question order after drag-and-drop or deletion
function updateQuestionOrder() {
    document.querySelectorAll(".question").forEach((question, index) => {
        question.querySelector("label").textContent = `Question ${index + 1}:`;
        question.querySelector("input").name = `questions[${index}][questionText]`;
        question.querySelector("select").name = `questions[${index}][questionType]`;
        const options = question.querySelectorAll(".options input");
        options.forEach((option, optIndex) => {
            option.name = `questions[${index}][options][${optIndex}]`;
        });
    });
}

// Attach drag-and-drop events to question elements
function attachDragEvents(element) {
    element.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.dataset.id);
        e.target.classList.add("dragging");
    });

    element.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
    });

    const container = document.getElementById("questions-container");

    container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}

// Helper function to determine drop position
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".question:not(.dragging)")];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

// Initialize drag-and-drop and attach events
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".question").forEach(attachDragEvents);
});

