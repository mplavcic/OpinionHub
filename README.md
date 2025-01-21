# OpinionHub

OpinionHub is a web application designed to simplify the creation, publication, and analysis of surveys. It allows users to design surveys with multiple question types, publish them for public access, collect responses, and view analytics.

## Features

- **Survey Creation**: Create surveys with multiple question types:
  - Multiple-choice questions
  - Rating questions
  - Text questions
- **Survey Management**:
  - Save surveys as drafts
  - Edit existing surveys
  - Delete surveys
- **Survey Publication**:
  - Publish surveys with a customizable expiration date
  - Share surveys via public URLs
  - Generate QR codes for easy access
- **Response Collection**:
  - Respondents can take surveys via a public link
  - Responses are saved and counted in real-time
- **Analytics Dashboard**:
  - View detailed survey results
  - Analyze multiple-choice question statistics
  - Calculate averages for rating questions
  - Display text responses

---

## Technology Stack

- **Backend**: Node.js, Express.js, Mongoose
- **Frontend**: Pug (template engine)
- **Database**: MongoDB (via MongoDB Atlas)

---

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mplavcic/OpinionHub.git
   cd OpinionHub
   ```

2. **Install dependecies**:
   ```bash
   npm install
   ```
3. Set up environment variables: Create a .env file in the root directory with the following keys:
   ```bash
   DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/OpinionHub?retryWrites=true&w=majority
   PORT=3000
   ```
4. Run the application
   ```bash
   npm run serverstart
   ```
## Visit the Hosted Application
   You can access the live version of OpinionHub at:
   https://opinionhub-ryem.onrender.com/


