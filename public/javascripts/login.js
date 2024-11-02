document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent default form submission
            const name = document.getElementById("name").value;
            const password = document.getElementById("password").value;
            const errorMessageElement = document.getElementById("error-message");

            try {
            // Send POST request to the server with form data
                const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password })
                });

                if (!response.ok) {
                    // Display error message if login failed
                    const result = await response.json();
                    errorMessageElement.textContent = result.message;
                } else {
                    // Redirect if login succeeded
                    const result = await response.json();
                    window.location.href = result.redirectTo;
                }
            } 
            catch (error) {
                errorMessageElement.textContent = "An error occurred. Please try again.";
            }
        });
    } else {
        console.error("loginForm not found in DOM");
    }
});

