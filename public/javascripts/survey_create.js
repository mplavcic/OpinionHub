// Add a new option for a specific question
function addOption(questionIndex) {
    const optionsContainer = document.getElementById(`options-${questionIndex}`);

    // Only count the actual option input elements, not the button
    const existingOptions = optionsContainer.querySelectorAll('.option-container');
    const optionIndex = existingOptions.length;  // This ensures we are counting only options and not the button

    // Check if the option already exists, to avoid adding duplicates
    if (existingOptions.length === optionIndex) {
        const newOptionHTML = `
            <div class="option-container">
                <input type="text" name="questions[${questionIndex}][options][${optionIndex}]" class="form-control mb-2" placeholder="Enter an option">
            </div>
        `;
        optionsContainer.insertAdjacentHTML("beforeend", newOptionHTML);
    }
}

// Add a new question dynamically
function addQuestion() {
    const questionsContainer = document.getElementById("questions-container");
    const questionIndex = questionsContainer.children.length;
    const newQuestionHTML = `
        <div class="question mb-3 border p-3" data-question-id="question-${questionIndex}" draggable="true" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)" ondragend="dragEnd(event)">
            <label for="questionText-${questionIndex}" class="form-label">Question:</label>
            <input type="text" name="questions[${questionIndex}][questionText]" id="questionText-${questionIndex}" class="form-control mb-2" required>

            <label for="questionType-${questionIndex}" class="form-label">Type:</label>
            <select name="questions[${questionIndex}][questionType]" id="questionType-${questionIndex}" class="form-select mb-2" onchange="toggleOptions(this, ${questionIndex})">
                <option value="text">Text</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="rating">Rating</option>
            </select>

            <div id="options-${questionIndex}" class="options-container mb-2" style="display:none;">
                <label>Options:</label>
                <button type="button" class="btn btn-secondary btn-sm mt-2" onclick="addOption(${questionIndex})">Add Option</button>
            </div>

            <button type="button" class="btn btn-danger btn-sm mt-2" onclick="removeQuestion(${questionIndex})">X</button>
        </div>
    `;
    questionsContainer.insertAdjacentHTML("beforeend", newQuestionHTML);

    // Re-attach event listeners for new question
    initializeDragAndDrop();
    reattachEventListeners();
}

// Remove a question
function removeQuestion(questionIndex) {
    const question = document.querySelector(`[data-question-id="question-${questionIndex}"]`);
    question.remove();
}

// Show or hide options for multiple choice
function toggleOptions(selectElement, questionIndex) {
    const optionsContainer = document.getElementById(`options-${questionIndex}`);
    if (selectElement.value === "multiple-choice") {
        optionsContainer.style.display = "block";
    } else {
        optionsContainer.style.display = "none";
    }
}

// Re-attach event listeners after dynamic content is added or re-rendered
function reattachEventListeners() {
    // Reattach event listeners for the "Remove Question" buttons
    document.querySelectorAll('.btn-danger').forEach((btn) => {
        btn.removeEventListener('click', handleRemoveQuestion);  // Clean up previous listeners
        btn.addEventListener('click', handleRemoveQuestion);  // Reattach listener
    });
}

// Handle removing a question
function handleRemoveQuestion(event) {
    const questionIndex = event.target.closest('.question').dataset.questionId.split('-')[1];
    removeQuestion(questionIndex);
}

// Initialize event listeners for dynamic content after the DOM has loaded
document.addEventListener("DOMContentLoaded", function () {
    reattachEventListeners();  // Reattach event listeners when the page loads

    // Initialize existing questions options visibility based on question type
    document.querySelectorAll('select[id^="questionType-"]').forEach((select, index) => {
        toggleOptions(select, index);
    });

    // Re-initialize drag-and-drop functionality
    initializeDragAndDrop();
});

// Initialize drag-and-drop for questions
function initializeDragAndDrop() {
    const draggableQuestions = document.querySelectorAll('.question');
    draggableQuestions.forEach(question => {
        question.setAttribute('draggable', true); // Ensure the question is draggable
        // Remove any previously attached listeners to prevent duplicates
        question.removeEventListener('dragstart', dragStart);
        question.removeEventListener('dragover', dragOver);
        question.removeEventListener('drop', drop);
        question.removeEventListener('dragend', dragEnd);
        
        // Attach the drag-and-drop event listeners
        question.addEventListener('dragstart', dragStart);
        question.addEventListener('dragover', dragOver);
        question.addEventListener('drop', drop);
        question.addEventListener('dragend', dragEnd);
    });
}

let draggedQuestion = null; // Store the dragged element

// When drag starts, store the element
function dragStart(event) {
    draggedQuestion = event.target;
    event.target.style.opacity = 0.5; // Optional: make the dragged element transparent
}

// When drag ends, reset the opacity
function dragEnd(event) {
    event.target.style.opacity = ""; // Reset the opacity of the element
    draggedQuestion = null;
}

// When dragging over a potential drop target, allow the drop
function dragOver(event) {
    event.preventDefault(); // Allow the drop
}

// When a question is dropped, reorder the questions
function drop(event) {
    event.preventDefault();
    const target = event.target;

    // Only allow the drop on the question container, not on the remove button or other buttons
    if (!target.classList.contains("question") || target === draggedQuestion) return;

    // Reorder the questions: move the dragged question before or after the target
    const questionsContainer = document.getElementById("questions-container");

    // Insert the dragged question at the correct place
    if (target && draggedQuestion) {
        const draggedIndex = [...questionsContainer.children].indexOf(draggedQuestion);
        const targetIndex = [...questionsContainer.children].indexOf(target);

        if (draggedIndex < targetIndex) {
            questionsContainer.insertBefore(draggedQuestion, target.nextSibling);
        } else {
            questionsContainer.insertBefore(draggedQuestion, target);
        }
    }

    // Update the indices of questions after reorder
    updateQuestionIndices();
    target.style.border = ""; // Reset the border style

    // Re-initialize drag-and-drop functionality
    initializeDragAndDrop();
}

// Update the question indices in the form to match their new order
function updateQuestionIndices() {
    const questions = document.querySelectorAll('#questions-container .question');

    questions.forEach((question, index) => {
        // Update data-question-id
        question.dataset.questionId = `question-${index}`;

        // Update input and select names
        const questionTextInput = question.querySelector('input[name^="questions"]');
        questionTextInput.name = `questions[${index}][questionText]`;
        questionTextInput.id = `questionText-${index}`;

        const questionTypeSelect = question.querySelector('select[name^="questions"]');
        questionTypeSelect.name = `questions[${index}][questionType]`;
        questionTypeSelect.id = `questionType-${index}`;

        // Update options if it's a multiple-choice question
        const optionsContainer = question.querySelector('.options-container');
        if (optionsContainer) {
            const optionInputs = optionsContainer.querySelectorAll('input[name^="questions"]');
            optionInputs.forEach((optionInput, optionIndex) => {
                optionInput.name = `questions[${index}][options][${optionIndex}]`;
            });
        }
    });
}

