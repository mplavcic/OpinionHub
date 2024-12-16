// public/javascripts/survey_saved_detail.js

document.querySelectorAll(".save-question-btn").forEach(button => {
  button.addEventListener("click", async (event) => {
    const listItem = event.target.closest("li");
    const questionId = listItem.getAttribute("data-id");
    const textArea = listItem.querySelector(".question-text");
    const updatedText = textArea.value;

    try {
      const response = await fetch(`/survey/${surveyId}/edit-question/${questionId}`, { // surveyId will be passed dynamically
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question_text: updatedText })
      });

      if (response.ok) {
        alert("Question updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Failed to update question:", err);
      alert("An error occurred while updating the question.");
    }
  });
});

