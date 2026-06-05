# Requirements Document

## Introduction

The Todo List Life Dashboard is a client-side web application that serves as a personal productivity hub. It combines a real-time greeting with time/date display, a Pomodoro-style focus timer, a task management list, and a quick-links panel — all in a single, minimal web page. All data is persisted in the browser's Local Storage with no backend server required. The application is built with plain HTML, CSS, and Vanilla JavaScript and must work as a standalone web page or browser extension across all modern browsers.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section displaying the current time, date, and a time-of-day greeting message.
- **Focus_Timer**: The UI section providing a 25-minute countdown timer with start, stop, and reset controls.
- **Task_Manager**: The UI section allowing the user to create, edit, complete, and delete tasks.
- **Task**: A single to-do item that has a text description and a completion state.
- **Quick_Links_Panel**: The UI section displaying user-defined shortcut buttons that open external URLs.
- **Link**: A user-defined entry consisting of a label and a URL stored in the Quick Links Panel.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Session**: The period from when the Dashboard is opened until it is closed or refreshed.

---

## Requirements

---

### Requirement 1: Real-Time Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I feel oriented and welcomed at a glance.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current device local time in 24-hour HH:MM format immediately on Dashboard open and update the display on each new clock minute boundary.
2. THE Greeting_Widget SHALL display the current date in the format "DayOfWeek, D Month YYYY" (e.g., "Monday, 2 June 2025"), derived from the device local date.
3. WHEN the device local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the device local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the device local time is between 18:00 and 21:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the device local time is between 22:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display a countdown starting at 25:00 (minutes:seconds) when the Dashboard is first loaded or after a reset.
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time continuously at one-second intervals.
4. WHEN the user activates the Stop control while the Focus_Timer is actively counting down, THE Focus_Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user activates the Stop control while the Focus_Timer is not counting down, THE Focus_Timer SHALL take no action.
6. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and reset the displayed time to 25:00.
7. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop counting and SHALL display the text "Session Complete" in the timer display area; the Start, Stop, and Reset controls SHALL remain active.
8. IF the user activates the Start control while the Focus_Timer is already counting down, THEN THE Focus_Timer SHALL ignore the activation and continue the current countdown.
9. IF the user activates the Start control while the Focus_Timer is in the session-ended state (displaying "Session Complete"), THEN THE Focus_Timer SHALL ignore the activation; the user must activate Reset before starting a new session.

---

### Requirement 3: Task Management — Adding Tasks

**User Story:** As a user, I want to add new tasks to my to-do list, so that I can track what needs to be done.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a text input field for entering a new task description with a maximum length of 500 characters.
2. WHEN the user submits a task description containing at least one non-whitespace character, THE Task_Manager SHALL add the new Task to the list and clear the input field.
3. IF the user attempts to submit a task description that is empty or contains only whitespace characters, THEN THE Task_Manager SHALL reject the submission, display a visible error message near the input field, and keep the input field focused.
4. WHEN a new Task is added, THE Task_Manager SHALL persist all tasks to Local_Storage.
5. IF writing to Local_Storage fails when adding a Task, THEN THE Task_Manager SHALL display a visible error message and retain the Task in the current session list.

---

### Requirement 4: Task Management — Editing Tasks

**User Story:** As a user, I want to edit existing tasks, so that I can correct or update their descriptions.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide an edit control for each Task in the list.
2. WHEN the user activates the edit control for a Task, THE Task_Manager SHALL replace the Task's displayed text with an editable text input pre-filled with the current description.
3. WHEN the user confirms an edit by pressing Enter or activating a save button, and the description contains at least one non-whitespace character and does not exceed 500 characters, THE Task_Manager SHALL update the Task's description and return to the display view.
4. WHEN a Task description is updated, THE Task_Manager SHALL persist all tasks to Local_Storage.
5. IF the user confirms an edit with a description that is empty or contains only whitespace characters, THEN THE Task_Manager SHALL reject the update and retain the original description.
6. WHEN the user cancels an edit by pressing Escape or activating a cancel button, THE Task_Manager SHALL discard any changes and return to the display view with the original description unchanged.

---

### Requirement 5: Task Management — Completing and Deleting Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can maintain an accurate and clean task list.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a completion toggle control (e.g., checkbox) for each Task.
2. WHEN the user toggles the completion control on an incomplete Task, THE Task_Manager SHALL set the Task's completion state to complete and apply a strikethrough style to the Task's text; WHEN the user toggles the completion control on a complete Task, THE Task_Manager SHALL set the Task's completion state to incomplete and remove the strikethrough style.
3. WHEN a Task's completion state changes, THE Task_Manager SHALL persist all tasks to Local_Storage.
4. THE Task_Manager SHALL provide a delete control for each Task.
5. WHEN the user activates the delete control for a Task, THE Task_Manager SHALL immediately remove the Task from the list without requiring additional confirmation.
6. WHEN a Task is removed, THE Task_Manager SHALL persist the updated task list to Local_Storage.

---

### Requirement 6: Task Persistence Across Sessions

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is still available when I reopen the Dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded, THE Task_Manager SHALL read any previously saved tasks from Local_Storage and render them in the list, preserving each Task's text description and completion state.
2. WHEN any task mutation occurs (add, edit, complete/uncomplete, delete), THE Task_Manager SHALL immediately write the full current task list to Local_Storage.
3. IF Local_Storage contains data stored under the tasks key that is not valid JSON or does not parse as an array, THEN THE Task_Manager SHALL render an empty list, clear the corrupted key in Local_Storage, and not display an error to the user.
4. IF Local_Storage contains a parseable tasks array but one or more entries are missing required fields (text or completed), THEN THE Task_Manager SHALL silently skip those invalid entries and render only the valid tasks.
5. IF Local_Storage is unavailable when the Dashboard loads, THEN THE Task_Manager SHALL render an empty list and display a non-blocking notice informing the user that persistence is unavailable.

---

### Requirement 7: Quick Links Management — Adding Links

**User Story:** As a user, I want to add custom shortcut buttons with labels and URLs, so that I can quickly navigate to my favorite websites.

#### Acceptance Criteria

1. THE Quick_Links_Panel SHALL provide an input field for entering a link label (maximum 100 characters) and an input field for entering a URL (maximum 2048 characters).
2. WHEN the user submits a non-empty label and a URL that is non-empty, starts with "http://" or "https://", and contains at least one dot in the host portion, THE Quick_Links_Panel SHALL add a new Link button to the panel and clear both input fields.
3. IF the user submits an empty label, a label exceeding 100 characters, an empty URL, or a URL that does not start with "http://" or "https://" or lacks a dot in the host, THEN THE Quick_Links_Panel SHALL reject the submission, display a visible error message identifying each invalid field, and focus the first invalid field.
4. WHEN the link list changes for any reason, THE Quick_Links_Panel SHALL persist all links to Local_Storage.

---

### Requirement 8: Quick Links Management — Opening and Deleting Links

**User Story:** As a user, I want to open my saved links in a new tab and remove ones I no longer need, so that I can keep my shortcuts up to date.

#### Acceptance Criteria

1. WHEN the user activates a Link button, THE Quick_Links_Panel SHALL open the associated URL in a new browser tab using `target="_blank"` with `rel="noopener noreferrer"`.
2. THE Quick_Links_Panel SHALL provide a delete control visually associated with each Link button.
3. WHEN the user activates the delete control for a Link, THE Quick_Links_Panel SHALL immediately remove that Link from the panel without requiring additional confirmation.
4. WHEN a Link is removed, THE Quick_Links_Panel SHALL persist the updated link list to Local_Storage.
---

### Requirement 9: Quick Links Persistence Across Sessions

**User Story:** As a user, I want my saved links to be available when I reopen the Dashboard, so that I do not have to re-enter them every session.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded and Local_Storage contains a valid links array, THE Quick_Links_Panel SHALL render each saved Link as a button displaying the Link's saved label.
2. IF Local_Storage contains data stored under the links key that is not valid JSON or does not parse as an array, THEN THE Quick_Links_Panel SHALL render an empty panel without displaying an error.
3. IF Local_Storage contains a parseable links array but one or more entries are missing required fields (label or url), THEN THE Quick_Links_Panel SHALL silently skip those invalid entries and render only the valid links.

---

### Requirement 10: Technical Constraints

**User Story:** As a developer, I want the Dashboard built with plain HTML, CSS, and Vanilla JavaScript stored in a defined folder structure, so that the application is simple to maintain and deploy without a build pipeline.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript; no external frameworks, libraries, or CDN-hosted scripts or stylesheets SHALL be loaded at runtime.
2. THE Dashboard SHALL contain exactly one CSS file located in the `css/` directory.
3. THE Dashboard SHALL contain exactly one JavaScript file located in the `js/` directory.
4. THE Dashboard SHALL require no backend server and SHALL operate entirely in the browser using Local_Storage for persistence.
5. THE Dashboard SHALL function correctly in the latest stable release versions of Chrome, Firefox, Edge, and Safari available as of the date of implementation.
6. THE Dashboard SHALL complete initial load and render all visible content within 2 seconds on a device with a standard consumer-grade CPU and a broadband or local file connection.
