// js/app.js — Todo List Life Dashboard
// Single JS file containing all widget modules.
// Requirements: 10.1, 10.2, 10.3

// =============================================================================
// StorageService — centralised localStorage access with error isolation
// Requirements: 6.2, 6.3, 6.5, 9.2
// =============================================================================
const StorageService = {
  /**
   * Returns true if localStorage is available and writable.
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (_e) {
      return false;
    }
  },

  /**
   * Reads the value stored under `key` and parses it as JSON.
   * Returns null when the key does not exist, storage is unavailable,
   * or the stored string is not valid JSON.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  },

  /**
   * Serialises `value` to JSON and writes it under `key`.
   * Returns true on success, false on any error.
   * @param {string} key
   * @param {any} value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_e) {
      return false;
    }
  },

  /**
   * Removes the entry stored under `key`. Silently no-ops on error.
   * @param {string} key
   * @returns {void}
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_e) {
      // Silently ignore
    }
  },
};

// =============================================================================
// GreetingWidget — live clock, date, and time-of-day greeting
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
// =============================================================================
const GreetingWidget = {
  _intervalId: null,
  _lastSecond: -1,
  _lastMinute: -1,

  /**
   * Binds DOM elements and starts the 500ms tick interval.
   */
  init() {
    this._tick();
    this._intervalId = setInterval(() => this._tick(), 500);
  },

  /**
   * Called every 500ms. Updates time every second, date/greeting every minute.
   */
  _tick() {
    const now = new Date();
    const second = now.getSeconds();
    if (second === this._lastSecond) return;
    this._lastSecond = second;

    const timeEl = document.getElementById('greeting-time');
    if (timeEl) {
      const timeStr = this._formatTime(now);
      timeEl.textContent = timeStr;
      timeEl.setAttribute('datetime', timeStr);
    }

    // Only update greeting and date when minute changes
    if (now.getMinutes() !== this._lastMinute) {
      this._lastMinute = now.getMinutes();
      const greetingEl = document.getElementById('greeting-message');
      const dateEl = document.getElementById('greeting-date');
      if (greetingEl) greetingEl.textContent = this._getGreeting(now.getHours());
      if (dateEl) dateEl.textContent = this._formatDate(now);
    }
  },

  /**
   * Returns the greeting string for the given hour (0-23).
   * @param {number} hour
   * @returns {string}
   */
  _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 21) return 'Good Evening';
    return 'Good Night'; // 22-23, 0-4
  },

  /**
   * Formats a Date as "HH:MM:SS" in 24-hour time (with seconds).
   * @param {Date} date
   * @returns {string}
   */
  _formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  },

  /**
   * Formats a Date as "DayOfWeek, D Month YYYY".
   * @param {Date} date
   * @returns {string}
   */
  _formatDate(date) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dayName = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  },
};

// =============================================================================
// FocusTimer — 25-minute Pomodoro countdown with state machine
// Requirements: 2.1 – 2.9
// =============================================================================
const FocusTimer = {
  DURATION: 25 * 60, // seconds
  _state: 'IDLE',    // IDLE | RUNNING | PAUSED | ENDED
  _remaining: 25 * 60,
  _intervalId: null,

  /**
   * Binds DOM buttons and sets initial display.
   */
  init() {
    this._remaining = this.DURATION;
    this._state = 'IDLE';

    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    this._setDisplay(this._remaining);
  },

  /**
   * Starts the countdown if IDLE or PAUSED; ignored when RUNNING or ENDED.
   */
  start() {
    if (this._state === 'RUNNING' || this._state === 'ENDED') return;
    this._state = 'RUNNING';
    this._intervalId = setInterval(() => this._tick(), 1000);
  },

  /**
   * Pauses the countdown if RUNNING; no-op otherwise.
   */
  stop() {
    if (this._state !== 'RUNNING') return;
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._state = 'PAUSED';
  },

  /**
   * Stops any active countdown and resets to 25:00.
   */
  reset() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._remaining = this.DURATION;
    this._state = 'IDLE';
    this._setDisplay(this._remaining);
  },

  /**
   * Called every 1000ms while running. Decrements remaining and checks for end.
   */
  _tick() {
    this._remaining -= 1;
    this._setDisplay(this._remaining);
    if (this._remaining <= 0) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      this._state = 'ENDED';
      // Emit timerComplete event
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('timerComplete'));
      }
    }
  },

  /**
   * Updates the timer display element.
   * @param {number} remaining — seconds remaining
   */
  _setDisplay(remaining) {
    const el = typeof document !== 'undefined'
      ? document.getElementById('timer-display')
      : null;

    if (remaining <= 0) {
      if (el) el.textContent = 'Session Complete';
      return;
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const text = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (el) el.textContent = text;
  },
};

// =============================================================================
// TaskManager — CRUD task list with localStorage persistence
// Requirements: 3.1 – 6.5
// =============================================================================
const TaskManager = {
  _tasks: [],
  STORAGE_KEY: 'tasks',

  /**
   * Initialises the TaskManager: loads persisted tasks, renders, and binds form.
   */
  init() {
    this._tasks = this._loadTasks();

    const form = document.getElementById('task-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('task-input');
        if (input) this._addTask(input.value);
      });
    }

    this._render();
  },

  /**
   * Re-renders the complete task list from internal state.
   */
  _render() {
    const list = document.getElementById('task-list');
    const template = document.getElementById('task-template');
    if (!list || !template) return;

    list.innerHTML = '';
    for (const task of this._tasks) {
      const clone = template.content.cloneNode(true);
      const li = clone.querySelector('.task-item');
      const checkbox = clone.querySelector('.task-checkbox');
      const textEl = clone.querySelector('.task-text');
      const editBtn = clone.querySelector('.task-edit-btn');
      const deleteBtn = clone.querySelector('.task-delete-btn');

      li.dataset.id = task.id;
      checkbox.checked = task.completed;
      textEl.textContent = task.text;
      if (task.completed) textEl.classList.add('completed');

      checkbox.addEventListener('change', () => this._toggleComplete(task.id));
      editBtn.addEventListener('click', () => this._startEdit(task.id));
      deleteBtn.addEventListener('click', () => this._deleteTask(task.id));

      list.appendChild(clone);
    }
  },

  /**
   * Adds a new task. Rejects empty/whitespace-only descriptions.
   * @param {string} description
   */
  _addTask(description) {
    const validation = this._validateDescription(description);
    const errorEl = document.getElementById('task-input-error');
    const input = document.getElementById('task-input');

    if (!validation.valid) {
      if (errorEl) errorEl.textContent = validation.error;
      if (input) input.focus();
      return;
    }

    if (errorEl) errorEl.textContent = '';

    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      text: description.trim(),
      completed: false,
    };

    this._tasks.push(task);
    if (input) input.value = '';

    const ok = this._persistTasks();
    if (!ok) {
      const bannerEl = document.getElementById('task-storage-error');
      if (bannerEl) bannerEl.textContent = 'Warning: Could not save tasks. Changes are in memory only.';
    }

    this._render();
    document.dispatchEvent(new CustomEvent('taskListChanged'));
  },

  /**
   * Replaces a task's text. Rejects invalid descriptions.
   * @param {string} id
   * @param {string} description
   * @returns {boolean} true if updated, false if rejected
   */
  _editTask(id, description) {
    const validation = this._validateDescription(description);
    if (!validation.valid) return false;

    const task = this._tasks.find((t) => t.id === id);
    if (!task) return false;

    task.text = description.trim();
    this._persistTasks();
    this._render();
    document.dispatchEvent(new CustomEvent('taskListChanged'));
    return true;
  },

  /**
   * Switches a task row into edit mode.
   * @param {string} id
   */
  _startEdit(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;

    const list = document.getElementById('task-list');
    if (!list) return;
    const li = list.querySelector(`[data-id="${id}"]`);
    if (!li) return;

    const textEl = li.querySelector('.task-text');
    const editBtn = li.querySelector('.task-edit-btn');

    // Replace text with input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;
    editInput.maxLength = 500;
    editInput.setAttribute('aria-label', 'Edit task description');
    textEl.replaceWith(editInput);

    // Replace edit button with save button
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'task-save-btn';
    saveBtn.textContent = 'Save';
    editBtn.replaceWith(saveBtn);

    editInput.focus();

    const cancelEdit = () => {
      this._render();
    };

    const confirmEdit = () => {
      const ok = this._editTask(id, editInput.value);
      if (!ok) {
        editInput.setAttribute('aria-invalid', 'true');
        editInput.focus();
      }
    };

    saveBtn.addEventListener('click', confirmEdit);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmEdit();
      if (e.key === 'Escape') cancelEdit();
    });
  },

  /**
   * Toggles the completed state of a task.
   * @param {string} id
   */
  _toggleComplete(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this._persistTasks();
    this._render();
    document.dispatchEvent(new CustomEvent('taskListChanged'));
  },

  /**
   * Removes a task immediately.
   * @param {string} id
   */
  _deleteTask(id) {
    this._tasks = this._tasks.filter((t) => t.id !== id);
    this._persistTasks();
    this._render();
    document.dispatchEvent(new CustomEvent('taskListChanged'));
  },

  /**
   * Writes the current task list to localStorage.
   * @returns {boolean}
   */
  _persistTasks() {
    return StorageService.set(this.STORAGE_KEY, this._tasks);
  },

  /**
   * Reads tasks from localStorage. Returns empty array on any error.
   * @returns {Array}
   */
  _loadTasks() {
    const data = StorageService.get(this.STORAGE_KEY);
    if (!Array.isArray(data)) {
      // Corrupted or missing — clear and return empty
      if (data !== null) StorageService.remove(this.STORAGE_KEY);
      return [];
    }
    // Skip entries with missing required fields
    return data.filter(
      (t) => t && typeof t.text === 'string' && typeof t.completed === 'boolean',
    );
  },

  /**
   * Validates a task description.
   * @param {string} text
   * @returns {{ valid: boolean, error?: string }}
   */
  _validateDescription(text) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      return { valid: false, error: 'Task description cannot be empty.' };
    }
    if (text.trim().length > 500) {
      return { valid: false, error: 'Task description must be 500 characters or fewer.' };
    }
    return { valid: true };
  },
};

// =============================================================================
// QuickLinks — user-defined URL shortcut buttons with localStorage persistence
// Requirements: 7.1 – 9.3
// =============================================================================
const QuickLinks = {
  _links: [],
  STORAGE_KEY: 'links',

  /**
   * Initialises the QuickLinks module: loads persisted links, renders, and binds form.
   */
  init() {
    this._links = this._loadLinks();

    const form = document.getElementById('link-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('link-label-input');
        const urlInput = document.getElementById('link-url-input');
        if (labelInput && urlInput) {
          this._addLink(labelInput.value, urlInput.value);
        }
      });
    }

    this._render();
  },

  /**
   * Re-renders all link items from internal state.
   */
  _render() {
    const container = document.getElementById('link-list');
    const template = document.getElementById('link-template');
    if (!container || !template) return;

    container.innerHTML = '';
    for (const link of this._links) {
      const clone = template.content.cloneNode(true);
      const item = clone.querySelector('.link-item');
      const anchor = clone.querySelector('.link-btn');
      const deleteBtn = clone.querySelector('.link-delete-btn');

      item.dataset.id = link.id;
      anchor.textContent = link.label;
      anchor.href = link.url;
      // Prevent default navigation; use window.open instead
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        this._openLink(link.url);
      });

      deleteBtn.addEventListener('click', () => this._deleteLink(link.id));
      container.appendChild(clone);
    }
  },

  /**
   * Validates and adds a new link. Shows per-field errors on failure.
   * @param {string} label
   * @param {string} url
   */
  _addLink(label, url) {
    const validation = this._validateLink(label, url);
    const labelErrorEl = document.getElementById('link-label-error');
    const urlErrorEl = document.getElementById('link-url-error');
    const labelInput = document.getElementById('link-label-input');
    const urlInput = document.getElementById('link-url-input');

    if (labelErrorEl) labelErrorEl.textContent = '';
    if (urlErrorEl) urlErrorEl.textContent = '';

    if (!validation.valid) {
      if (validation.labelError && labelErrorEl) {
        labelErrorEl.textContent = validation.labelError;
      }
      if (validation.urlError && urlErrorEl) {
        urlErrorEl.textContent = validation.urlError;
      }
      // Focus first invalid field
      if (validation.labelError && labelInput) {
        labelInput.focus();
      } else if (validation.urlError && urlInput) {
        urlInput.focus();
      }
      return;
    }

    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: label.trim(),
      url: url.trim(),
    };

    this._links.push(link);
    if (labelInput) labelInput.value = '';
    if (urlInput) urlInput.value = '';

    const ok = this._persistLinks();
    if (!ok) {
      const bannerEl = document.getElementById('link-storage-error');
      if (bannerEl) bannerEl.textContent = 'Warning: Could not save links. Changes are in memory only.';
    }

    this._render();
    document.dispatchEvent(new CustomEvent('linkListChanged'));
  },

  /**
   * Removes a link immediately.
   * @param {string} id
   */
  _deleteLink(id) {
    this._links = this._links.filter((l) => l.id !== id);
    this._persistLinks();
    this._render();
    document.dispatchEvent(new CustomEvent('linkListChanged'));
  },

  /**
   * Opens a URL in a new tab with security attributes.
   * @param {string} url
   */
  _openLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  /**
   * Writes the current link list to localStorage.
   * @returns {boolean}
   */
  _persistLinks() {
    return StorageService.set(this.STORAGE_KEY, this._links);
  },

  /**
   * Reads links from localStorage. Returns empty array on any error.
   * @returns {Array}
   */
  _loadLinks() {
    const data = StorageService.get(this.STORAGE_KEY);
    if (!Array.isArray(data)) {
      if (data !== null) StorageService.remove(this.STORAGE_KEY);
      return [];
    }
    return data.filter(
      (l) => l && typeof l.label === 'string' && typeof l.url === 'string',
    );
  },

  /**
   * Validates a (label, url) pair.
   * @param {string} label
   * @param {string} url
   * @returns {{ valid: boolean, labelError?: string, urlError?: string }}
   */
  _validateLink(label, url) {
    let labelError = null;
    let urlError = null;

    const trimmedLabel = typeof label === 'string' ? label.trim() : '';
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';

    if (trimmedLabel.length === 0) {
      labelError = 'Label cannot be empty.';
    } else if (trimmedLabel.length > 100) {
      labelError = 'Label must be 100 characters or fewer.';
    }

    if (trimmedUrl.length === 0) {
      urlError = 'URL cannot be empty.';
    } else if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      urlError = 'URL must start with http:// or https://';
    } else if (trimmedUrl.length > 2048) {
      urlError = 'URL must be 2048 characters or fewer.';
    } else {
      // Check that host portion contains at least one dot
      try {
        const parsed = new URL(trimmedUrl);
        if (!parsed.hostname.includes('.')) {
          urlError = 'URL must contain a valid host (e.g. example.com).';
        }
      } catch (_e) {
        urlError = 'URL is not valid.';
      }
    }

    if (labelError || urlError) {
      return { valid: false, labelError, urlError };
    }
    return { valid: true };
  },
};

// =============================================================================
// ThemeManager — light/dark mode toggle with localStorage persistence
// =============================================================================
const ThemeManager = {
  STORAGE_KEY: 'theme',
  _current: 'light',

  /**
   * Loads saved theme, applies it, and binds the toggle button.
   */
  init() {
    const saved = StorageService.get(this.STORAGE_KEY);
    this._current = saved === 'dark' ? 'dark' : 'light';
    this._apply();

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },

  /**
   * Switches between light and dark and persists the choice.
   */
  toggle() {
    this._current = this._current === 'light' ? 'dark' : 'light';
    this._apply();
    StorageService.set(this.STORAGE_KEY, this._current);
  },

  /**
   * Applies the current theme to the <html> element and updates the button label.
   */
  _apply() {
    document.documentElement.setAttribute('data-theme', this._current);
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('.theme-icon');
    const label = btn.querySelector('.theme-label');
    if (this._current === 'dark') {
      if (icon) icon.textContent = '☀️';
      if (label) label.textContent = 'Light Mode';
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = 'Dark Mode';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  },
};

// =============================================================================
// FocusTimer extension — custom duration (added to FocusTimer module)
// =============================================================================
FocusTimer._bindDurationControl = function () {
  const setBtn = document.getElementById('timer-set-duration');
  const input = document.getElementById('timer-duration-input');
  const errorEl = document.getElementById('timer-duration-error');

  if (!setBtn || !input) return;

  // Restore saved duration
  const saved = StorageService.get('timerDuration');
  if (typeof saved === 'number' && saved >= 1 && saved <= 120) {
    this.DURATION = saved * 60;
    this._remaining = this.DURATION;
    input.value = saved;
    this._setDisplay(this._remaining);
  }

  setBtn.addEventListener('click', () => {
    const minutes = parseInt(input.value, 10);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
      if (errorEl) errorEl.textContent = 'Duration must be between 1 and 120 minutes.';
      input.focus();
      return;
    }
    if (errorEl) errorEl.textContent = '';
    // Only allow change when not running
    if (this._state === 'RUNNING') {
      if (errorEl) errorEl.textContent = 'Stop the timer before changing the duration.';
      return;
    }
    this.DURATION = minutes * 60;
    this._remaining = this.DURATION;
    this._state = 'IDLE';
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._setDisplay(this._remaining);
    StorageService.set('timerDuration', minutes);
  });

  // Also allow pressing Enter in the input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setBtn.click();
  });
};

// =============================================================================
// TaskManager extension — sort tasks
// =============================================================================
TaskManager._sortOrder = 'default';

TaskManager._getSortedTasks = function () {
  const tasks = [...this._tasks];
  switch (this._sortOrder) {
    case 'az':
      return tasks.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':
      return tasks.sort((a, b) => b.text.localeCompare(a.text));
    case 'active':
      return tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    case 'done':
      return tasks.sort((a, b) => Number(b.completed) - Number(a.completed));
    default:
      return tasks; // insertion order
  }
};

// Override _render to use sorted view
TaskManager._render = function () {
  const list = document.getElementById('task-list');
  const template = document.getElementById('task-template');
  if (!list || !template) return;

  list.innerHTML = '';
  const sorted = this._getSortedTasks();
  for (const task of sorted) {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector('.task-item');
    const checkbox = clone.querySelector('.task-checkbox');
    const textEl = clone.querySelector('.task-text');
    const editBtn = clone.querySelector('.task-edit-btn');
    const deleteBtn = clone.querySelector('.task-delete-btn');

    li.dataset.id = task.id;
    checkbox.checked = task.completed;
    textEl.textContent = task.text;
    if (task.completed) textEl.classList.add('completed');

    checkbox.addEventListener('change', () => this._toggleComplete(task.id));
    editBtn.addEventListener('click', () => this._startEdit(task.id));
    deleteBtn.addEventListener('click', () => this._deleteTask(task.id));

    list.appendChild(clone);
  }
};

TaskManager._bindSortControl = function () {
  const select = document.getElementById('task-sort');
  if (!select) return;

  // Restore saved sort preference
  const saved = StorageService.get('taskSort');
  if (saved && ['default', 'az', 'za', 'active', 'done'].includes(saved)) {
    this._sortOrder = saved;
    select.value = saved;
  }

  select.addEventListener('change', () => {
    this._sortOrder = select.value;
    StorageService.set('taskSort', this._sortOrder);
    this._render();
  });
};

// =============================================================================
// DOMContentLoaded — module initialisation
// Requirements: 10.1, 10.3
// =============================================================================
// Guard against non-browser environments (e.g. Vitest running in Node)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    // Check storage availability and warn user if unavailable
    if (!StorageService.isAvailable()) {
      const bannerEl = document.getElementById('task-storage-error');
      if (bannerEl) bannerEl.textContent = 'localStorage is unavailable. Your data will not be saved.';
    }

    ThemeManager.init();
    GreetingWidget.init();
    FocusTimer.init();
    FocusTimer._bindDurationControl();
    TaskManager.init();
    TaskManager._bindSortControl();
    QuickLinks.init();
  });
}

// Expose to window for browser usage (plain <script> tag, no module system)
if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
  window.GreetingWidget = GreetingWidget;
  window.FocusTimer = FocusTimer;
  window.TaskManager = TaskManager;
  window.QuickLinks = QuickLinks;
}
