function addQuestion() {
    const questionContainer = document.createElement("div");
    questionContainer.className = "question";

    const questionCount = document.querySelectorAll(".question").length;
    const questionId = `question-${questionCount}`;

    questionContainer.innerHTML = `
        <label for="${questionId}">Question:</label>
        <input type="text" name="questions[${questionCount}][questionText]" id="${questionId}" placeholder="Enter question" required>

        <label for="${questionId}-type">Type:</label>
        <select name="questions[${questionCount}][questionType]" id="${questionId}-type" onchange="toggleOptions(this, ${questionCount})">
            <option value="text">Text</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="rating">Rating</option>
        </select>

        <div id="options-${questionCount}" class="options-container" style="display:none;">
            <label>Options:</label>
            <div class="options">
                <!-- Option inputs will only be added here if 'multiple-choice' is selected -->
            </div>
            <button type="button" onclick="addOption(${questionCount})" style="display:none;">Add Option</button>
        </div>
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
        // Hide the options container and remove any existing options input fields
        optionsContainer.style.display = "none";
        addOptionButton.style.display = "none";

        // Remove all option inputs for non-multiple-choice questions
        const optionsDiv = optionsContainer.querySelector(".options");
        optionsDiv.innerHTML = '';  // Clear all option inputs
    }
}

function addOption(questionIndex) {
    const optionsDiv = document.querySelector(`#options-${questionIndex} .options`);
    const input = document.createElement("input");
    input.type = "text";
    input.name = `questions[${questionIndex}][options][]`;
    input.placeholder = "Enter an option";
    optionsDiv.appendChild(input);
}

