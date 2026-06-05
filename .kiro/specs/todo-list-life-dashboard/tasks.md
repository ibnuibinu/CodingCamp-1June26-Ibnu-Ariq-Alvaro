# Implementation Plan: Todo List Life Dashboard

## Overview

Implement a single-page, client-side productivity dashboard using plain HTML, CSS, and Vanilla JavaScript. All state is persisted in `localStorage`. The implementation is broken into incremental steps: project scaffolding → StorageService → GreetingWidget → FocusTimer → TaskManager → QuickLinks → integration wiring. Each step builds directly on the previous one.

---

## Tasks

- [x] 1. Scaffold project structure and testing framework
  - Create the directory layout: `index.html`, `css/styles.css`, `js/app.js`, `tests/unit/`, `tests/property/`
  - Add `package.json` with Vitest and fast-check as dev-dependencies
  - Add `vitest.config.js` (or equivalent) pointing at the `tests/` directory
  - Create empty stub files for all test modules: `greeting.test.js`, `timer.test.js`, `tasks.test.js`, `links.test.js`, `storage.test.js`, `greeting.prop.test.js`, `tasks.prop.test.js`, `links.prop.test.js`, `storage.prop.test.js`
  - Write `index.html` with semantic `<section>` placeholders for each of the four widgets, a single `<link>` to `css/styles.css`, and a single `<script>` for `js/app.js`
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 2. Implement StorageService module
  - [-] 2.1 Write the `StorageService` module object inside `js/app.js`
    - Implement `isAvailable()`, `get(key)`, `set(key, value)`, `remove(key)`
    - `get` must catch JSON parse errors and return `null`; `set` must catch quota/security errors and return `false`
    - _Requirements: 6.2, 6.3, 6.5, 9.2_

  

- [ ] 3. Implement GreetingWidget module
  - [~] 3.1 Write the `GreetingWidget` module object in `js/app.js`
    - Implement `init()`, `_tick()`, `_getGreeting(hour)`, `_formatTime(date)`, `_formatDate(date)`
    - Use `setInterval` at 500 ms; only update DOM when the displayed minute changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

 

- [ ] 4. Implement FocusTimer module
  - [~] 4.1 Write the `FocusTimer` module object in `js/app.js`
    - Implement `init()`, `start()`, `stop()`, `reset()`, `_tick()`, `_setDisplay(remaining)`
    - Implement the IDLE → RUNNING → PAUSED → ENDED state machine exactly as specified
    - When `remaining` reaches 0, display "Session Complete"; guard `start()` against RUNNING and ENDED states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [~] 4.2 Write unit tests for FocusTimer
    - Test state transitions: idle → running → paused → running → ended → idle
    - Test `start()` is ignored when already RUNNING
    - Test `start()` is ignored when in ENDED state
    - Test `stop()` is a no-op when not RUNNING
    - Test display shows "Session Complete" when `_setDisplay(0)` is called
    - _Requirements: 2.1, 2.4, 2.5, 2.7, 2.8, 2.9_

- [~] 5. Checkpoint — Ensure all tests pass
  - Run the full test suite (`vitest --run`). Ensure all implemented tests pass. Ask the user if any questions arise before proceeding.

- [ ] 6. Implement TaskManager module
  - [~] 6.1 Write the `TaskManager` module object in `js/app.js`
    - Implement `init()`, `_render()`, `_addTask(description)`, `_editTask(id, description)`, `_toggleComplete(id)`, `_deleteTask(id)`, `_persistTasks()`, `_loadTasks()`, `_validateDescription(text)`
    - Render each task row from a `<template>` element (no `innerHTML` string injection)
    - On add: validate, push `{ id, text: trimmed, completed: false }`, persist, clear input
    - On whitespace-only submit: display inline error near input and keep focus
    - On `localStorage` write failure: display error banner, keep task in memory
    - On load: handle corrupted JSON (clear key, render empty) and missing fields (skip entry)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5_

  
- [~] 7. Checkpoint — Ensure all tests pass
  - Run the full test suite (`vitest --run`). Ensure all TaskManager tests pass. Ask the user if any questions arise before proceeding.

- [ ] 8. Implement QuickLinks module
  - [~] 8.1 Write the `QuickLinks` module object in `js/app.js`
    - Implement `init()`, `_render()`, `_addLink(label, url)`, `_deleteLink(id)`, `_openLink(url)`, `_persistLinks()`, `_loadLinks()`, `_validateLink(label, url)`
    - `_openLink` must use `window.open(url, '_blank', 'noopener,noreferrer')`
    - Validate: label non-empty and ≤100 chars, URL starts with `http://` or `https://`, host has a dot, URL ≤2048 chars
    - On validation failure: show per-field error messages and focus first invalid field
    - On load: handle corrupted JSON (clear key, render empty) and skip entries with missing fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_

  
- [ ] 9. Wire all modules together and style the dashboard
  - [~] 9.1 Add `init()` call for all four modules in `js/app.js` on `DOMContentLoaded`
    - Call `GreetingWidget.init()`, `FocusTimer.init()`, `TaskManager.init()`, `QuickLinks.init()`
    - Emit and handle `timerComplete`, `taskListChanged`, and `linkListChanged` `CustomEvent`s on `document`
    - _Requirements: 10.1, 10.3_

  - [~] 9.2 Write `css/styles.css` with layout and widget styles
    - Style the four-widget grid layout, timer display, task list items (including strikethrough for completed), link buttons, and inline error messages
    - Ensure the UI is readable and all interactive elements have visible focus styles (accessibility)
    - _Requirements: 10.2, 5.2_

- [~] 10. Final checkpoint — Ensure all tests pass
  - Run the full test suite (`vitest --run`). Ensure all tests pass. Ask the user if any questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Properties 1–12 from the design document each have a corresponding property-based test sub-task
- All property tests use **fast-check** with a minimum of 100 iterations per property
- Each property test must include the comment: `// Feature: todo-list-life-dashboard, Property <N>: <property_text>`
- StorageService must be initialized before any other module that uses it
- The `<template>` element pattern for task rendering avoids all `innerHTML` string injection (XSS safety)

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 4, "tasks": ["4.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "8.5", "9.1"] },
    { "id": 7, "tasks": ["9.2"] }
  ]
}
```
