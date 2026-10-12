# Learnexa Companion

Create a complete modern EdTech web application called Learnexa – AI-Powered Multimodal Learning Assistant.

Build the frontend first. Do NOT replace or create a new backend.

The existing backend will be Flask + Python + MongoDB + Ollama, and the frontend will later connect to it through REST APIs.

Create a professional, colorful, responsive and slightly futuristic EdTech UI.

Do NOT make it look like a ChatGPT clone.

Main Design

Use:

Modern Poppins-style typography

Clean light interface

Professional accent colors

Rounded cards

Soft shadows

Subtle gradients

Smooth micro animations

Lucide icons

Responsive desktop/tablet/mobile layouts

The product should feel like a real AI education startup.

Brand:

Learnexa

Tagline:

"Learn Smarter. Understand Deeper. Grow Faster."

The main learning workflow should communicate:

UPLOAD → UNDERSTAND → PRACTICE → REVISE → TRACK

Pages to create

Public

Landing Page

Role Selection

Login

Learner Registration

Institution Registration

Learner

Dashboard

AI Tutor

Documents

PDF Chat

Summary

Notes

Flashcards

Quiz

Voice Tutor

Image Question

Study Planner

Revision Scheduler

Analytics

Recommendations

Chat History

Profile

Settings

Institution

Institution Dashboard

Students

Teachers

Courses

Learning Materials

Student Progress

Institution Analytics

Settings

Landing Page

Create a premium hero section.

Heading:

"Your AI-Powered Learning Companion"

Description:

"Learnexa understands your documents, questions, voice and images to create a personalized learning experience."

Buttons:

"Get Started"
"Explore Features"

Show a beautiful dashboard preview in the hero.

Add sections:

Multimodal Learning

AI Tutor

Smart PDF Learning

Voice Tutor

Image Learning

AI Quiz

Flashcards

Notes

Study Planner

Learning Analytics

Personalized Recommendations

Add a "How It Works" section:

Upload or Ask

AI Understands

Learn Interactively

Track Your Progress

Role Selection

Show two large options:

Individual Learner

"Learn independently with your personal AI learning assistant."

Institutional User

"Manage students, teachers, courses and learning progress."

Institution students must NOT have public self-registration.

Learner Dashboard

Create a highly polished dashboard.

Header:

"Good Morning, Gopika 👋"

Subtitle:

"Ready to continue learning?"

Create dynamic-looking statistics:

Learning Time

AI Chats

Completed Topics

Quiz Score

Study Progress

Do not permanently hardcode these values in the architecture. Use mock data only for the initial UI and isolate it so it can later be replaced by API data.

Dashboard sections:

Continue Learning

Recent Documents

AI Recommendations

Weekly Learning Activity

Progress Overview

Today's Study Plan

Create a floating AI Tutor button that opens a compact chat panel.

AI Tutor

Create a modern AI chat interface with:

Text input

Voice button

Image upload

File upload

Language selector

Copy response

Clear chat

Chat history

Typing animation

Do not create fake AI functionality as the final architecture. Keep it ready for REST API integration.

Documents

Create a document management page with:

Drag and drop upload

PDF

DOCX

Image

Search

Filter

Sort

Delete

Open

Chat with document

Generate summary

Generate notes

Generate flashcards

Generate quiz

PDF Chat

Create a two-column interface.

Left:
Document preview.

Right:
AI conversation.

Add suggested questions:

"Explain this chapter simply"
"What are the important points?"
"Create 5 quiz questions"
"Give me revision notes"

Notes

Create searchable notes with:

Create

Edit

Delete

AI-generated notes

Manual notes

Flashcards

Create interactive flip cards.

Include:

Previous

Next

Shuffle

Mark difficult

Mark mastered

Progress indicator

Quiz

Create:

Multiple choice questions

Timer

Progress indicator

Question navigation

Submit

Result page:

Score

Percentage

Correct answers

Incorrect answers

Strong topics

Weak topics

AI recommendations

Voice Tutor

Create a polished voice tutor screen.

Large microphone button.

States:

AI Ready

Listening

Processing

AI Speaking

Controls:

Start/Stop

Auto Speak

Speech Speed

Language

Copy

Clear

Languages:

English
Tamil
Hindi
Malayalam
Telugu
Kannada

Image Question

Create an image learning page.

Allow:

Drag and drop

Image upload

Image preview

Question input

Examples:

"Explain this diagram"
"Solve this problem"
"Explain this chart"

Study Planner

Create:

Subject

Topics

Exam Date

Available Study Hours

Difficulty

Preferred Study Time

Button:

"Generate Study Plan"

Display daily tasks with:

Topic

Duration

Priority

Completion checkbox

Revision Scheduler

Create:

Today's Revision

Upcoming Revision

Overdue Topics

Use clear priority indicators.

Analytics

Create an attractive analytics dashboard with:

Learning Time

Quiz Average

Topics Completed

Study Streak

Documents Studied

AI Interactions

Charts:

Weekly Study Activity

Quiz Performance

Topic Progress

Learning Trend

Also show:

Strong Topics
Weak Topics
Recommended Topics

Recommendations

Create AI recommendation cards.

Examples:

"Revise Python Functions"
"Practice SQL Queries"
"Review Machine Learning Basics"

Show:

Reason

Difficulty

Estimated Time

Start button

Institutional Dashboard

Create a separate professional dashboard for institutional users.

Statistics:

Total Students

Active Students

Courses

Average Progress

Average Quiz Score

Pages:

Students
Teachers
Courses
Learning Materials
Student Progress
Analytics

Students can be:

Added

Removed

Blocked

Unblocked

Searched

Viewed

Navigation

Learner sidebar:

Dashboard
AI Tutor
Documents
PDF Chat
Notes
Flashcards
Quiz
Voice Tutor
Image Question
Study Planner
Revision
Analytics
Recommendations
Chat History
Profile
Settings

Institution sidebar:

Dashboard
Students
Teachers
Courses
Materials
Progress
Analytics
Settings

Include:

Learnexa logo

Profile

Notifications

Sidebar collapse

Logout

UX Requirements

Every page must have:

Loading states

Empty states

Error states

Toast notifications

Confirmation dialogs for delete actions

Responsive design

Accessible controls

Use realistic mock data only where necessary for visual development.

Keep all mock data isolated.

Build reusable components.

Create clean routing.

Create a centralized API service structure ready for:

VITE_API_URL

Do NOT build a new backend.

Do NOT use Streamlit.

Do NOT expose API keys.

Focus on making the frontend polished, consistent and production-quality.

Start by implementing the complete frontend shell, routing, landing page, authentication pages, learner dashboard, sidebar navigation and core learning pages.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3a798e7-7913-4a9b-8ea7-5ce1aacc824d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
