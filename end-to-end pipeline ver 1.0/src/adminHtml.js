"use strict";

// Admin page for the slot-management UI.
// Three resource sections (opening hours, closed periods, bookings) + a calendar
// view that paints opening hours as the background, closed periods as red tint,
// and bookings as filled blocks. All client-side; talks to /admin/* endpoints.

function adminSlotsHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Slot Admin</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #17191f;
      --muted: #626b7a;
      --line: #d8dde7;
      --accent: #0b65d8;
      --accent-text: #ffffff;
      --danger: #c0392b;
      --ok: #137c46;
      --warn: #8a5b00;
      --closed-bg: rgba(192,57,43,0.10);
      --open-bg: rgba(11,101,216,0.04);
      --outside-bg: rgba(120,120,140,0.10);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #101317;
        --panel: #181c22;
        --text: #f3f5f8;
        --muted: #a9b1bf;
        --line: #303743;
        --accent: #78a9ff;
        --accent-text: #101317;
        --danger: #ef6b5b;
        --ok: #5fd29a;
        --warn: #ffc267;
        --closed-bg: rgba(239,107,91,0.18);
        --open-bg: rgba(120,169,255,0.10);
        --outside-bg: rgba(120,120,140,0.18);
      }
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0; }
    header { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; margin-bottom: 16px; }
    h1 { margin: 0 0 6px; font-size: 26px; line-height: 1.15; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p { margin: 0; color: var(--muted); line-height: 1.45; }
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .toolbar label { font-size: 13px; color: var(--muted); font-weight: 700; }
    select, input, button {
      border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); font: inherit;
    }
    select, input { padding: 8px 10px; }
    input[type="checkbox"] { width: 18px; height: 18px; }
    button { padding: 8px 14px; cursor: pointer; font-weight: 700; }
    button.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }
    button.danger { background: transparent; border-color: var(--danger); color: var(--danger); }
    button.subtle { background: transparent; border-color: var(--line); color: var(--text); font-weight: 600; padding: 6px 10px; font-size: 13px; }
    .card { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 16px; margin-bottom: 16px; }
    .status-bar { padding: 10px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel); margin-bottom: 14px; min-height: 40px; display: flex; align-items: center; gap: 12px; }
    .status-bar.ok { border-color: var(--ok); color: var(--ok); }
    .status-bar.err { border-color: var(--danger); color: var(--danger); }
    .small { font-size: 12px; color: var(--muted); }
    .view-toggle-group { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    .view-toggle { padding: 6px 14px; border: 0; background: transparent; color: var(--muted); font-weight: 700; cursor: pointer; border-radius: 0; }
    .view-toggle.active { background: var(--accent); color: var(--accent-text); }

    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; font-size: 14px; }
    th { color: var(--muted); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    tr:last-child td { border-bottom: 0; }
    td.actions { text-align: right; white-space: nowrap; }
    td input, td select { width: 100%; padding: 6px 8px; }
    .empty { color: var(--muted); padding: 18px; text-align: center; }

    /* Opening hours editor */
    .day-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; align-items: start; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .day-row:last-child { border-bottom: 0; }
    .day-row .day-name { font-weight: 700; padding-top: 6px; }
    .day-row .windows { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .window-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--open-bg); }
    .window-pill input { width: 60px; padding: 2px 4px; font-size: 13px; }
    .window-pill button { padding: 2px 6px; background: transparent; border: 0; color: var(--danger); cursor: pointer; font-weight: 700; }
    .day-row .closed { color: var(--muted); font-style: italic; padding-top: 6px; }

    /* Add forms (closed period + booking) */
    .add-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; align-items: end; }
    .add-fields label { display: block; font-size: 12px; color: var(--muted); font-weight: 700; margin-bottom: 4px; }
    .add-actions { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; }
    .add-actions button { width: auto; min-width: 120px; }

    /* Calendar */
    .cal-grid { border-collapse: collapse; min-width: 720px; width: 100%; }
    .cal-grid th, .cal-grid td { border: 1px solid var(--line); padding: 0; min-width: 110px; }
    .cal-grid th { background: var(--bg); padding: 6px 8px; font-size: 12px; color: var(--muted); font-weight: 700; }
    .cal-grid th.time-col, .cal-grid td.time-cell { width: 56px; min-width: 56px; }
    .cal-grid td.time-cell { background: var(--bg); padding: 4px 8px; font-size: 11px; color: var(--muted); text-align: right; vertical-align: top; }
    .cal-grid td.slot-cell { height: 38px; vertical-align: top; padding: 2px; position: relative; }
    .cal-grid td.slot-cell.is-open { background: var(--open-bg); cursor: pointer; }
    .cal-grid td.slot-cell.is-open:hover { background: rgba(11,101,216,0.12); }
    .cal-grid td.slot-cell.is-closed { background: var(--outside-bg); cursor: not-allowed; }
    .cal-grid td.slot-cell.is-blocked { background: var(--closed-bg); cursor: not-allowed; }
    .cal-grid td.slot-cell.has-booking { cursor: default; }
    .cal-grid td.cal-day-today { box-shadow: inset 3px 0 0 var(--accent); }
    .booking-pill { display: block; padding: 4px 6px; margin: 1px 0; border-radius: 4px; font-size: 11px; line-height: 1.3; cursor: pointer; background: var(--accent); color: var(--accent-text); }
    .booking-pill .pill-time { font-weight: 700; }
    .booking-pill .pill-sub { display: block; opacity: 0.85; }

    #cal-popover { position: absolute; z-index: 1000; min-width: 280px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.18); }
    #cal-popover label { display: block; font-size: 12px; color: var(--muted); font-weight: 700; margin-bottom: 6px; }
    #cal-popover input { width: 100%; margin-top: 4px; }

    /* Pending staff reviews */
    .inbox-card { border-left: 3px solid var(--warn); }
    .inbox-item { border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: var(--bg); }
    .inbox-item.priority-high { border-left: 3px solid var(--danger); }
    .inbox-item.priority-medium { border-left: 3px solid var(--warn); }
    .inbox-item.priority-low { border-left: 3px solid var(--muted); }
    .inbox-item.priority-critical { border-left: 3px solid var(--danger); background: rgba(192,57,43,0.06); }
    .inbox-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; flex-wrap: wrap; }
    .inbox-meta { font-size: 12px; color: var(--muted); }
    .inbox-meta .pill { display: inline-block; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--line); margin-right: 6px; font-weight: 700; }
    .inbox-customer-text { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; margin: 8px 0; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
    .inbox-draft-text { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; margin: 8px 0; font-size: 13px; white-space: pre-wrap; word-break: break-word; color: var(--muted); }
    .inbox-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin: 10px 0; }
    .inbox-fields label { display: block; font-size: 11px; color: var(--muted); font-weight: 700; margin-bottom: 3px; }
    .inbox-fields input { width: 100%; padding: 5px 8px; }
    .inbox-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .inbox-err { color: var(--danger); font-size: 12px; margin-top: 6px; }

    /* Resources card */
    .resource-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--line); }
    .resource-row:last-child { border-bottom: 0; }
    .resource-row .name-edit { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .resource-row .name-edit input { width: 220px; padding: 4px 8px; }
    .resource-row.inactive .name-edit input { opacity: 0.55; text-decoration: line-through; }
    .resource-row .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .resource-row .pill-inactive { font-size: 11px; padding: 1px 8px; border: 1px solid var(--muted); color: var(--muted); border-radius: 10px; }

    @media (max-width: 720px) {
      .day-row { grid-template-columns: 56px 1fr; }
      .day-row .actions { grid-column: 1 / -1; text-align: right; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Slot Admin</h1>
        <p>Set opening hours, close periods (lunch breaks, holidays), and manage bookings. Everything outside a booking that's inside opening hours is bookable by customers automatically.</p>
      </div>
      <div class="small">
        Admin token: <input id="admin-token" type="password" placeholder="(blank in local dev)" style="width: 180px;">
      </div>
    </header>

    <div class="status-bar" id="status">Ready.</div>

    <div class="toolbar">
      <label for="businessId">Business:</label>
      <select id="businessId">
        <option value="beauty_demo">beauty_demo (Solara Beauty)</option>
        <option value="restaurant_demo">restaurant_demo</option>
        <option value="edu_demo">edu_demo</option>
        <option value="prince_snooker">prince_snooker (王子桌球)</option>
      </select>
      <button id="refresh" class="subtle">Refresh</button>
      <label for="resource-filter" style="margin-left: 8px;">Resource:</label>
      <select id="resource-filter"><option value="">(all)</option></select>
      <span style="flex: 1;"></span>
      <div class="view-toggle-group" role="tablist" aria-label="View">
        <button type="button" class="view-toggle active" data-view="list">List</button>
        <button type="button" class="view-toggle" data-view="calendar">Calendar</button>
      </div>
    </div>

    <!-- Calendar pane -->
    <section class="view-pane" data-view="calendar" hidden>
      <section class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
          <h2 style="margin: 0;">Week of <span id="week-label">…</span></h2>
          <div style="display: flex; gap: 8px;">
            <button type="button" id="cal-prev" class="subtle">← Prev</button>
            <button type="button" id="cal-today" class="subtle">This week</button>
            <button type="button" id="cal-next" class="subtle">Next →</button>
          </div>
        </div>
        <div id="cal-grid-wrap" style="overflow-x: auto;">
          <table class="cal-grid">
            <thead id="cal-head"></thead>
            <tbody id="cal-body"></tbody>
          </table>
        </div>
        <p class="small" style="margin-top: 10px;">
          Blue cells are open. Grey cells are outside opening hours. Pink cells are inside a closed period. Click any open cell to add a booking; click a booking to edit it.
        </p>
      </section>
    </section>

    <div id="cal-popover" hidden></div>

    <!-- Pending staff reviews (always visible) -->
    <section class="card inbox-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 10px; flex-wrap: wrap;">
        <h2 style="margin: 0;">Pending staff reviews <span id="inbox-count" class="small" style="margin-left: 6px;"></span></h2>
        <button type="button" id="inbox-refresh" class="subtle">Refresh inbox</button>
      </div>
      <p class="small" style="margin-bottom: 12px;">Items the bot routed to staff. For booking-shaped items, edit the fields and click Approve to write them to the calendar. Click Reject with a reason to dismiss.</p>
      <div id="inbox-list"></div>
      <div id="inbox-empty" class="empty" hidden>No pending items.</div>
    </section>

    <!-- List pane (sections) -->
    <section class="view-pane" data-view="list">

      <section class="card">
        <h2>Resources <span id="resources-count" class="small" style="margin-left: 6px;"></span></h2>
        <p class="small" style="margin-bottom: 12px;">Stylists, tables, classrooms, or any bookable unit. With one or more active resources, every booking must pin to one (any-available stays the default in the chat flow). Leave this empty to keep the legacy single-pool behavior.</p>
        <form id="resource-add-form">
          <div class="add-fields">
            <div style="grid-column: span 2;"><label>Add resource<input id="resource-add-name" required placeholder="Amy / 1號枱 / Room A"></label></div>
          </div>
          <div class="add-actions"><button class="primary" type="submit">Add resource</button></div>
        </form>
        <div id="resources-list" style="margin-top: 14px;"></div>
        <div id="resources-empty" class="empty" hidden>No resources yet — chat flow runs in legacy single-pool mode.</div>
      </section>

      <section class="card">
        <h2>Opening hours</h2>
        <p class="small" style="margin-bottom: 12px;">Set the recurring hours per day. Each day can have multiple windows (e.g. 11:00–13:00 + 14:00–21:00 for a lunch-break split).</p>
        <div id="hours-grid"></div>
        <div class="add-actions">
          <button type="button" id="hours-save" class="primary">Save opening hours</button>
        </div>
      </section>

      <section class="card">
        <h2>Closed periods</h2>
        <p class="small" style="margin-bottom: 12px;">One-off blocks (holidays, training days, late opening). Closes are subtracted from opening hours.</p>
        <form id="closed-add-form">
          <div class="add-fields">
            <div><label>Date<input id="closed-date" required placeholder="2026-05-25"></label></div>
            <div><label>From<input id="closed-start" required placeholder="13:00"></label></div>
            <div><label>To<input id="closed-end" required placeholder="14:00"></label></div>
            <div><label>Reason<input id="closed-reason" placeholder="lunch / holiday"></label></div>
          </div>
          <div class="add-actions"><button class="primary" type="submit">Add closed period</button></div>
        </form>
        <table style="margin-top: 14px;">
          <thead><tr><th>Date</th><th>From</th><th>To</th><th>Reason</th><th></th></tr></thead>
          <tbody id="closed-body"></tbody>
        </table>
        <div id="closed-empty" class="empty" hidden>No closed periods.</div>
      </section>

      <section class="card">
        <h2>Bookings</h2>
        <p class="small" style="margin-bottom: 12px;">Existing booked appointments. Everything else inside opening hours is bookable by customers.</p>
        <form id="book-add-form">
          <div class="add-fields">
            <div><label>Date<input id="book-date" required placeholder="2026-05-25"></label></div>
            <div><label>Start time<input id="book-time" required placeholder="14:00"></label></div>
            <div id="book-service-wrap"><label>Service<input id="book-service" placeholder="facial / laser / assessment"></label></div>
            <div id="book-party-wrap" hidden><label>Party size<input id="book-partySize" type="number" min="1" max="20" placeholder="2"></label></div>
            <div id="book-resource-wrap" hidden><label>Resource<select id="book-resource"></select></label></div>
            <div><label>End time<input id="book-endTime" placeholder="HH:MM"></label></div>
            <div><label>Customer<input id="book-customer" placeholder="(optional)"></label></div>
            <div><label>Notes<input id="book-notes" placeholder="(optional)"></label></div>
          </div>
          <div class="add-actions"><button class="primary" type="submit">Add booking</button></div>
        </form>
        <table style="margin-top: 14px;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th id="th-service">Service</th>
              <th id="th-party" hidden>Party</th>
              <th id="th-resource" hidden>Resource</th>
              <th>Customer</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="book-body"></tbody>
        </table>
        <div id="book-empty" class="empty" hidden>No bookings yet.</div>
      </section>

    </section>
  </main>

  <script>
    // --- DOM refs ---
    const businessSelect = document.getElementById("businessId");
    const refreshBtn = document.getElementById("refresh");
    const tokenInput = document.getElementById("admin-token");
    const statusBar = document.getElementById("status");

    const hoursGrid = document.getElementById("hours-grid");
    const hoursSaveBtn = document.getElementById("hours-save");

    const closedAddForm = document.getElementById("closed-add-form");
    const closedBody = document.getElementById("closed-body");
    const closedEmpty = document.getElementById("closed-empty");

    const bookAddForm = document.getElementById("book-add-form");
    const bookBody = document.getElementById("book-body");
    const bookEmpty = document.getElementById("book-empty");
    const bookServiceWrap = document.getElementById("book-service-wrap");
    const bookPartyWrap = document.getElementById("book-party-wrap");
    const thService = document.getElementById("th-service");
    const thParty = document.getElementById("th-party");

    const calHead = document.getElementById("cal-head");
    const calBody = document.getElementById("cal-body");
    const weekLabel = document.getElementById("week-label");
    const popover = document.getElementById("cal-popover");

    const resourceFilter = document.getElementById("resource-filter");
    const resourceAddForm = document.getElementById("resource-add-form");
    const resourcesList = document.getElementById("resources-list");
    const resourcesEmpty = document.getElementById("resources-empty");
    const resourcesCount = document.getElementById("resources-count");
    const bookResourceWrap = document.getElementById("book-resource-wrap");
    const bookResourceSelect = document.getElementById("book-resource");
    const thResource = document.getElementById("th-resource");

    // --- State ---
    let currentBusiness = businessSelect.value;
    let openingHours = {};
    let closedPeriods = [];
    let bookings = [];
    let resources = [];
    let weekAnchor = todayDateStr();
    let activeResourceFilter = "";

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const SERVICE_DURATIONS = { facial: 75, laser: 30, assessment: 20, p3_english: 45 };
    const TIME_ROWS = (() => {
      const out = [];
      for (let h = 8; h <= 21; h++) {
        for (const m of ["00", "30"]) out.push(String(h).padStart(2, "0") + ":" + m);
      }
      return out;
    })();

    tokenInput.value = localStorage.getItem("admin-token") || "";
    tokenInput.addEventListener("change", () => localStorage.setItem("admin-token", tokenInput.value));

    function setStatus(text, level) {
      statusBar.textContent = text;
      statusBar.className = "status-bar" + (level ? " " + level : "");
    }

    function syncBusinessFields() {
      const isRestaurant = currentBusiness === "restaurant_demo";
      const isSnooker = currentBusiness === "prince_snooker";
      bookServiceWrap.hidden = isRestaurant || isSnooker;
      bookPartyWrap.hidden = !isRestaurant;
      thService.hidden = isRestaurant || isSnooker;
      thParty.hidden = !isRestaurant;
    }

    function activeResources() {
      return resources.filter((r) => r.active !== false);
    }

    function resourceNameFor(id) {
      if (!id) return "";
      const r = resources.find((x) => x.id === id);
      return r ? r.name : id;
    }

    function syncResourceUI() {
      const actives = activeResources();
      const hasResources = actives.length > 0;

      // Filter dropdown
      const prior = resourceFilter.value;
      resourceFilter.innerHTML = "<option value=''>(all)</option>" + actives.map((r) => "<option value='" + escapeAttr(r.id) + "'>" + escapeHtml(r.name) + "</option>").join("");
      if (prior && actives.some((r) => r.id === prior)) {
        resourceFilter.value = prior;
        activeResourceFilter = prior;
      } else {
        activeResourceFilter = "";
      }
      resourceFilter.disabled = !hasResources;

      // Booking form resource picker
      bookResourceWrap.hidden = !hasResources;
      thResource.hidden = !hasResources;
      bookResourceSelect.innerHTML = (hasResources ? "<option value=''>(any)</option>" : "") + actives.map((r) => "<option value='" + escapeAttr(r.id) + "'>" + escapeHtml(r.name) + "</option>").join("");
    }

    async function adminFetch(path, options = {}) {
      const headers = Object.assign({ "content-type": "application/json" }, options.headers || {});
      if (tokenInput.value) headers["x-admin-token"] = tokenInput.value;
      const response = await fetch(path, Object.assign({}, options, { headers }));
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || ("HTTP " + response.status));
      return body;
    }

    async function loadAll() {
      try {
        setStatus("Loading…");
        currentBusiness = businessSelect.value;
        syncBusinessFields();
        const [h, c, b, rs] = await Promise.all([
          adminFetch("/admin/opening-hours/" + encodeURIComponent(currentBusiness)),
          adminFetch("/admin/closed-periods/" + encodeURIComponent(currentBusiness)),
          adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness)),
          adminFetch("/admin/resources/" + encodeURIComponent(currentBusiness))
        ]);
        openingHours = h.openingHours || {};
        closedPeriods = c.closedPeriods || [];
        bookings = b.bookings || [];
        resources = rs.resources || [];
        syncResourceUI();
        renderResources();
        renderHours();
        renderClosed();
        renderBookings();
        renderCalendar();
        // Inbox load is independent — don't fail the whole page if it 503s
        loadInbox().catch(() => {});
        setStatus("Loaded " + bookings.length + " booking(s), " + closedPeriods.length + " closed period(s), " + activeResources().length + " active resource(s).", "ok");
      } catch (error) {
        setStatus("Load failed: " + error.message, "err");
      }
    }

    // ---- Resources ----
    function renderResources() {
      resourcesList.innerHTML = "";
      resourcesCount.textContent = resources.length === 0 ? "" : "(" + activeResources().length + " active, " + resources.length + " total)";
      if (resources.length === 0) { resourcesEmpty.hidden = false; return; }
      resourcesEmpty.hidden = true;
      const sorted = [...resources].sort((a, b) => {
        if ((a.active === false) !== (b.active === false)) return a.active === false ? 1 : -1;
        return String(a.name).localeCompare(String(b.name));
      });
      for (const r of sorted) {
        const row = document.createElement("div");
        row.className = "resource-row" + (r.active === false ? " inactive" : "");
        const inactivePill = r.active === false ? "<span class='pill-inactive'>inactive</span>" : "";
        row.innerHTML =
          "<div class='name-edit'>"
            + "<input type='text' value='" + escapeAttr(r.name) + "' data-id='" + escapeAttr(r.id) + "'>"
            + inactivePill
            + "<button type='button' class='subtle' data-action='rename'>Save</button>"
          + "</div>"
          + "<div class='row-actions'>"
            + (r.active === false
                ? "<button type='button' class='subtle' data-action='reactivate'>Re-activate</button>"
                : "<button type='button' class='danger' data-action='deactivate'>Deactivate</button>")
          + "</div>";

        row.querySelector("[data-action='rename']").addEventListener("click", async () => {
          const next = row.querySelector("input").value.trim();
          if (!next) { setStatus("Name cannot be empty.", "err"); return; }
          try {
            await adminFetch("/admin/resources/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(r.id), {
              method: "PATCH",
              body: JSON.stringify({ name: next })
            });
            await loadAll();
            setStatus("Resource renamed.", "ok");
          } catch (e) { setStatus("Rename failed: " + e.message, "err"); }
        });

        const deactivate = row.querySelector("[data-action='deactivate']");
        if (deactivate) deactivate.addEventListener("click", async () => {
          if (!confirm("Deactivate " + r.name + "? Existing bookings keep their reference, but customers will not see this resource as available.")) return;
          try {
            await adminFetch("/admin/resources/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(r.id), { method: "DELETE" });
            await loadAll();
            setStatus("Resource deactivated.", "ok");
          } catch (e) { setStatus("Deactivate failed: " + e.message, "err"); }
        });

        const reactivate = row.querySelector("[data-action='reactivate']");
        if (reactivate) reactivate.addEventListener("click", async () => {
          try {
            await adminFetch("/admin/resources/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(r.id), {
              method: "PATCH",
              body: JSON.stringify({ active: true })
            });
            await loadAll();
            setStatus("Resource re-activated.", "ok");
          } catch (e) { setStatus("Re-activate failed: " + e.message, "err"); }
        });

        resourcesList.appendChild(row);
      }
    }

    resourceAddForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("resource-add-name").value.trim();
      if (!name) return;
      try {
        await adminFetch("/admin/resources/" + encodeURIComponent(currentBusiness), {
          method: "POST",
          body: JSON.stringify({ name })
        });
        resourceAddForm.reset();
        await loadAll();
        setStatus("Resource added.", "ok");
      } catch (e) { setStatus("Add failed: " + e.message, "err"); }
    });

    resourceFilter.addEventListener("change", () => {
      activeResourceFilter = resourceFilter.value || "";
      renderBookings();
      renderCalendar();
    });

    // ---- Pending staff reviews ----
    const inboxList = document.getElementById("inbox-list");
    const inboxEmpty = document.getElementById("inbox-empty");
    const inboxCount = document.getElementById("inbox-count");
    const inboxRefreshBtn = document.getElementById("inbox-refresh");

    async function loadInbox() {
      try {
        const res = await adminFetch("/admin/inbox/" + encodeURIComponent(currentBusiness));
        const items = (res.items || []).filter((it) => it.status === "open");
        renderInbox(items);
      } catch (error) {
        inboxList.innerHTML = "";
        inboxEmpty.hidden = true;
        inboxCount.textContent = "(" + error.message + ")";
      }
    }

    function renderInbox(items) {
      inboxList.innerHTML = "";
      inboxCount.textContent = items.length === 0 ? "" : "(" + items.length + ")";
      inboxEmpty.hidden = items.length > 0;
      for (const item of items) inboxList.appendChild(buildInboxItem(item));
    }

    function buildInboxItem(item) {
      const card = document.createElement("div");
      card.className = "inbox-item priority-" + (item.priority || "low");
      const bd = item.bookingDraft || null;
      const reasons = Array.isArray(item.reasons) && item.reasons.length > 0 ? item.reasons.join(", ") : "";

      const head = document.createElement("div");
      head.className = "inbox-head";
      head.innerHTML =
        "<div class='inbox-meta'>"
        + "<span class='pill'>" + escapeHtml(item.action || "?") + "</span>"
        + "<span class='pill'>" + escapeHtml(item.priority || "low") + "</span>"
        + "<span>" + escapeHtml(item.channel || "?") + " · " + escapeHtml(item.senderId || "?") + "</span>"
        + "</div>"
        + "<div class='small'>" + escapeHtml(item.createdAt || "") + "</div>";
      card.appendChild(head);

      if (item.customerText) {
        const ct = document.createElement("div");
        ct.className = "inbox-customer-text";
        ct.textContent = "Customer: " + item.customerText;
        card.appendChild(ct);
      }
      if (item.draftText) {
        const dt = document.createElement("div");
        dt.className = "inbox-draft-text";
        dt.textContent = "Bot draft: " + item.draftText;
        card.appendChild(dt);
      }
      if (reasons) {
        const r = document.createElement("div");
        r.className = "small";
        r.style.marginBottom = "8px";
        r.textContent = "Reasons: " + reasons;
        card.appendChild(r);
      }

      if (bd) {
        const fields = document.createElement("div");
        fields.className = "inbox-fields";
        const isResto = bd.businessId === "restaurant_demo";
        const partySizeOrService = isResto
          ? "<label>Party size<input data-k='partySize' type='number' min='1' max='20' value='" + (bd.partySize ?? "") + "'></label>"
          : "<label>Service<input data-k='service' value='" + escapeAttr(bd.service || "") + "'></label>";
        const actives = activeResources();
        const resourceField = actives.length > 0
          ? "<label>Resource<select data-k='resourceId'>"
              + "<option value=''>(any)</option>"
              + actives.map((r) => "<option value='" + escapeAttr(r.id) + "'" + (r.id === bd.resourceId ? " selected" : "") + ">" + escapeHtml(r.name) + "</option>").join("")
              + "</select></label>"
          : "";
        fields.innerHTML =
          "<label>Date<input data-k='date' value='" + escapeAttr(bd.date || "") + "'></label>"
          + "<label>Time<input data-k='time' value='" + escapeAttr(bd.time || "") + "'></label>"
          + partySizeOrService
          + resourceField
          + "<label>Duration (min)<input data-k='durationMinutes' type='number' min='5' max='240' value='" + (bd.durationMinutes ?? "") + "' placeholder='auto'></label>"
          + "<label>Customer<input data-k='customer' value='" + escapeAttr(bd.customer || "") + "'></label>"
          + "<label>Notes<input data-k='notes' value=''></label>";
        card.appendChild(fields);
      } else {
        const note = document.createElement("div");
        note.className = "small";
        note.style.marginBottom = "8px";
        note.textContent = "No booking draft attached. Approving will just clear the item from the queue.";
        card.appendChild(note);
      }

      const err = document.createElement("div");
      err.className = "inbox-err";
      err.hidden = true;
      card.appendChild(err);

      const actions = document.createElement("div");
      actions.className = "inbox-actions";
      const rejectBtn = document.createElement("button");
      rejectBtn.type = "button";
      rejectBtn.className = "danger";
      rejectBtn.textContent = "Reject";
      const approveBtn = document.createElement("button");
      approveBtn.type = "button";
      approveBtn.className = "primary";
      approveBtn.textContent = bd ? "Approve + add to calendar" : "Approve";
      actions.appendChild(rejectBtn);
      actions.appendChild(approveBtn);
      card.appendChild(actions);

      approveBtn.addEventListener("click", async () => {
        err.hidden = true;
        const overrides = {};
        card.querySelectorAll(".inbox-fields input, .inbox-fields select").forEach((inp) => {
          const k = inp.dataset.k;
          const v = String(inp.value || "").trim();
          if (v === "") return;
          overrides[k] = (k === "partySize" || k === "durationMinutes") ? Number(v) : v;
        });
        approveBtn.disabled = true; rejectBtn.disabled = true;
        try {
          await adminFetch("/admin/inbox/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(item.id) + "/approve", {
            method: "POST",
            body: JSON.stringify(overrides)
          });
          await loadAll();
          setStatus("Booking approved and added to calendar.", "ok");
        } catch (error) {
          err.hidden = false;
          err.textContent = "Approve failed: " + error.message;
          approveBtn.disabled = false; rejectBtn.disabled = false;
        }
      });

      rejectBtn.addEventListener("click", async () => {
        const reason = window.prompt("Reason for rejection (optional):", "") || "";
        approveBtn.disabled = true; rejectBtn.disabled = true;
        try {
          await adminFetch("/admin/inbox/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(item.id) + "/reject", {
            method: "POST",
            body: JSON.stringify({ reason })
          });
          await loadInbox();
          setStatus("Item rejected.", "ok");
        } catch (error) {
          err.hidden = false;
          err.textContent = "Reject failed: " + error.message;
          approveBtn.disabled = false; rejectBtn.disabled = false;
        }
      });

      return card;
    }

    inboxRefreshBtn.addEventListener("click", () => loadInbox());

    // ---- Opening hours editor ----
    function renderHours() {
      hoursGrid.innerHTML = "";
      for (let d = 0; d < 7; d++) {
        const key = String(d);
        const windows = Array.isArray(openingHours[key]) ? openingHours[key] : [];
        const row = document.createElement("div");
        row.className = "day-row";
        row.innerHTML = "<div class='day-name'>" + DAY_NAMES[d] + "</div><div class='windows' data-day='" + key + "'></div><div><button type='button' class='subtle' data-add-day='" + key + "'>+ window</button></div>";
        const winContainer = row.querySelector(".windows");
        if (windows.length === 0) {
          const closed = document.createElement("span");
          closed.className = "closed";
          closed.textContent = "Closed";
          winContainer.appendChild(closed);
        } else {
          for (const w of windows) winContainer.appendChild(buildWindowPill(key, w.open, w.close));
        }
        hoursGrid.appendChild(row);
      }
      hoursGrid.querySelectorAll("[data-add-day]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.addDay;
          if (!Array.isArray(openingHours[key])) openingHours[key] = [];
          openingHours[key].push({ open: "09:00", close: "17:00" });
          renderHours();
        });
      });
    }

    function buildWindowPill(dayKey, open, close) {
      const pill = document.createElement("span");
      pill.className = "window-pill";
      pill.innerHTML = "<input type='text' class='win-open' placeholder='HH:MM' value='" + escapeAttr(open) + "'>–<input type='text' class='win-close' placeholder='HH:MM' value='" + escapeAttr(close) + "'><button type='button' title='Remove'>✕</button>";
      pill.querySelector("button").addEventListener("click", () => {
        readHoursFromForm();
        openingHours[dayKey].splice(openingHours[dayKey].findIndex((w) => w.open === open && w.close === close), 1);
        renderHours();
      });
      return pill;
    }

    function readHoursFromForm() {
      const next = { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
      hoursGrid.querySelectorAll(".windows").forEach((container) => {
        const key = container.dataset.day;
        container.querySelectorAll(".window-pill").forEach((pill) => {
          const open = pill.querySelector(".win-open").value.trim();
          const close = pill.querySelector(".win-close").value.trim();
          if (open && close) next[key].push({ open, close });
        });
      });
      openingHours = next;
      return next;
    }

    hoursSaveBtn.addEventListener("click", async () => {
      try {
        const next = readHoursFromForm();
        setStatus("Saving opening hours…");
        await adminFetch("/admin/opening-hours/" + encodeURIComponent(currentBusiness), {
          method: "PUT",
          body: JSON.stringify({ openingHours: next })
        });
        await loadAll();
        setStatus("Opening hours saved.", "ok");
      } catch (error) {
        setStatus("Save failed: " + error.message, "err");
      }
    });

    // ---- Closed periods ----
    function renderClosed() {
      closedBody.innerHTML = "";
      if (closedPeriods.length === 0) { closedEmpty.hidden = false; return; }
      closedEmpty.hidden = true;
      const sorted = [...closedPeriods].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
      for (const p of sorted) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + escapeHtml(p.date) + "</td><td>" + escapeHtml(p.start) + "</td><td>" + escapeHtml(p.end) + "</td><td>" + escapeHtml(p.reason || "") + "</td><td class='actions'><button class='danger' type='button'>Delete</button></td>";
        tr.querySelector("button").addEventListener("click", async () => {
          if (!confirm("Delete this closed period?")) return;
          try {
            await adminFetch("/admin/closed-periods/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(p.id), { method: "DELETE" });
            await loadAll();
            setStatus("Closed period deleted.", "ok");
          } catch (e) { setStatus("Delete failed: " + e.message, "err"); }
        });
        closedBody.appendChild(tr);
      }
    }

    closedAddForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = {
          date: document.getElementById("closed-date").value.trim(),
          start: document.getElementById("closed-start").value.trim(),
          end: document.getElementById("closed-end").value.trim(),
          reason: document.getElementById("closed-reason").value.trim()
        };
        await adminFetch("/admin/closed-periods/" + encodeURIComponent(currentBusiness), {
          method: "POST", body: JSON.stringify(payload)
        });
        closedAddForm.reset();
        await loadAll();
        setStatus("Closed period added.", "ok");
      } catch (e) { setStatus("Add failed: " + e.message, "err"); }
    });

    // ---- Bookings ----
    function visibleBookings() {
      if (!activeResourceFilter) return bookings;
      return bookings.filter((b) => b.resourceId === activeResourceFilter);
    }

    function renderBookings() {
      bookBody.innerHTML = "";
      const visible = visibleBookings();
      if (visible.length === 0) { bookEmpty.hidden = false; return; }
      bookEmpty.hidden = true;
      const isRestaurant = currentBusiness === "restaurant_demo";
      const showResource = !thResource.hidden;
      const sorted = [...visible].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      for (const bk of sorted) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + escapeHtml(bk.date) + "</td><td>" + escapeHtml(bk.time) + "</td><td>" + escapeHtml(addMinutesToTime(bk.time, bk.durationMinutes) || "") + "</td>" +
          (isRestaurant
            ? "<td>" + escapeHtml(bk.partySize ? bk.partySize + "p" : "") + "</td>"
            : "<td>" + escapeHtml(bk.service || "") + "</td>") +
          (showResource ? "<td>" + escapeHtml(resourceNameFor(bk.resourceId)) + "</td>" : "") +
          "<td>" + escapeHtml(bk.customer || "") + "</td><td>" + escapeHtml(bk.notes || "") + "</td>" +
          "<td class='actions'><button class='subtle' type='button' data-action='edit'>Edit</button> <button class='danger' type='button' data-action='delete'>Delete</button></td>";
        tr.querySelector("[data-action='delete']").addEventListener("click", async () => {
          if (!confirm("Delete this booking?")) return;
          try {
            await adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(bk.id), { method: "DELETE" });
            await loadAll();
            setStatus("Booking deleted.", "ok");
          } catch (e) { setStatus("Delete failed: " + e.message, "err"); }
        });
        tr.querySelector("[data-action='edit']").addEventListener("click", () => openBookingPopover(bk, tr));
        bookBody.appendChild(tr);
      }
    }

    bookAddForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = {
          date: document.getElementById("book-date").value.trim(),
          time: document.getElementById("book-time").value.trim()
        };
        const isRestaurant = currentBusiness === "restaurant_demo";
        if (isRestaurant) {
          payload.partySize = Number(document.getElementById("book-partySize").value);
        } else {
          payload.service = document.getElementById("book-service").value.trim();
        }
        if (!bookResourceWrap.hidden) {
          const resourceId = bookResourceSelect.value || "";
          if (resourceId) payload.resourceId = resourceId;
        }
        const endStr = document.getElementById("book-endTime").value.trim();
        if (endStr) {
          const minutes = minutesBetween(payload.time, endStr);
          if (minutes == null) throw new Error("End time must be HH:MM and after start time.");
          payload.durationMinutes = minutes;
        }
        const customer = document.getElementById("book-customer").value.trim();
        const notes = document.getElementById("book-notes").value.trim();
        if (customer) payload.customer = customer;
        if (notes) payload.notes = notes;
        await adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness), {
          method: "POST", body: JSON.stringify(payload)
        });
        bookAddForm.reset();
        await loadAll();
        setStatus("Booking added.", "ok");
      } catch (e) { setStatus("Add failed: " + e.message, "err"); }
    });

    document.getElementById("book-service").addEventListener("input", suggestBookEndTime);
    document.getElementById("book-time").addEventListener("input", suggestBookEndTime);
    function suggestBookEndTime() {
      if (currentBusiness !== "beauty_demo") return;
      const endField = document.getElementById("book-endTime");
      const start = document.getElementById("book-time").value.trim();
      const service = document.getElementById("book-service").value.trim();
      if (!start) return;
      const suggested = addMinutesToTime(start, defaultDurationForService(service));
      if (suggested) endField.placeholder = suggested;
      if (!endField.value) endField.value = suggested || "";
    }

    // ---- Calendar ----
    function renderCalendar() {
      const start = startOfWeek(weekAnchor);
      const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
      const today = todayDateStr();
      const dayKeys = days.map(isoDateOf);
      weekLabel.textContent = dayKeys[0] + "  →  " + dayKeys[6];

      calHead.innerHTML = "<tr><th class='time-col'></th>" + days.map((d, i) => {
        const todayClass = dayKeys[i] === today ? " class='cal-day-today'" : "";
        return "<th" + todayClass + ">" + DAY_NAMES[d.getDay()] + " " + (d.getMonth() + 1) + "/" + d.getDate() + "</th>";
      }).join("") + "</tr>";

      // For each column, compute open ranges (minute pairs) for the day, and closed pairs.
      const openByCol = dayKeys.map((date, i) => {
        const dow = days[i].getDay();
        const windows = (openingHours[String(dow)] || []).map((w) => [toMinutes(w.open), toMinutes(w.close)]);
        return windows;
      });
      const closedByCol = dayKeys.map((date) => {
        return closedPeriods.filter((p) => p.date === date).map((p) => [toMinutes(p.start), toMinutes(p.end)]);
      });

      // Index of bookings: which slots starting here, and which rows are consumed by rowspan
      const visible = visibleBookings();
      const bookingsByCol = dayKeys.map((date) => visible.filter((b) => b.date === date));
      const slotsAt = TIME_ROWS.map(() => Array.from({ length: 7 }, () => []));
      const occupied = TIME_ROWS.map(() => Array(7).fill(false));
      for (let col = 0; col < 7; col++) {
        for (const bk of bookingsByCol[col]) {
          const startIdx = TIME_ROWS.indexOf(bk.time);
          if (startIdx === -1) continue;
          const span = Math.max(1, Math.ceil((Number(bk.durationMinutes) || 30) / 30));
          slotsAt[startIdx][col].push({ booking: bk, span });
          for (let r = 1; r < span && startIdx + r < TIME_ROWS.length; r++) occupied[startIdx + r][col] = true;
        }
      }

      const rows = TIME_ROWS.map((time, rowIdx) => {
        const timeMin = toMinutes(time);
        let html = "<tr><td class='time-cell'>" + time + "</td>";
        for (let col = 0; col < 7; col++) {
          if (occupied[rowIdx][col]) continue;
          const here = slotsAt[rowIdx][col];
          const date = dayKeys[col];
          const isToday = date === today;
          const insideOpen = openByCol[col].some(([s, e]) => timeMin >= s && timeMin + 30 <= e);
          const insideClosed = insideOpen && closedByCol[col].some(([s, e]) => timeMin < e && timeMin + 30 > s);
          const classes = ["slot-cell"];
          if (here.length) classes.push("has-booking");
          if (insideClosed) classes.push("is-blocked");
          else if (insideOpen) classes.push("is-open");
          else classes.push("is-closed");
          if (isToday) classes.push("cal-day-today");
          const span = here.length ? Math.max(...here.map((x) => x.span)) : 1;
          const pillsHtml = here.map(({ booking }) => bookingPillHtml(booking)).join("");
          html += "<td class='" + classes.join(" ") + "' data-date='" + date + "' data-time='" + time + "'" +
                  (span > 1 ? " rowspan='" + span + "'" : "") + ">" + pillsHtml + "</td>";
        }
        html += "</tr>";
        return html;
      });
      calBody.innerHTML = rows.join("");
    }

    function bookingPillHtml(bk) {
      const end = addMinutesToTime(bk.time, bk.durationMinutes) || "";
      const head = currentBusiness === "restaurant_demo"
        ? (bk.partySize ? bk.partySize + "p" : "")
        : (bk.service || "");
      const resourceLabel = bk.resourceId ? resourceNameFor(bk.resourceId) : "";
      const subParts = [head, resourceLabel, bk.customer || ""].filter(Boolean);
      const sub = subParts.join(" · ");
      return "<span class='booking-pill' data-booking-id='" + escapeAttr(bk.id) + "'><span class='pill-time'>" + escapeHtml(bk.time) + "–" + escapeHtml(end) + "</span><span class='pill-sub'>" + escapeHtml(sub) + "</span></span>";
    }

    calBody.addEventListener("click", (event) => {
      const pill = event.target.closest(".booking-pill");
      if (pill) {
        event.stopPropagation();
        const bk = bookings.find((b) => b.id === pill.dataset.bookingId);
        if (bk) openBookingPopover(bk, pill);
        return;
      }
      const cell = event.target.closest(".slot-cell");
      if (!cell) return;
      if (cell.classList.contains("is-closed") || cell.classList.contains("is-blocked")) return;
      openBookingPopover({ date: cell.dataset.date, time: cell.dataset.time, service: "", partySize: null, customer: "", notes: "" }, cell);
    });

    document.addEventListener("click", (event) => {
      if (popover.hidden) return;
      if (popover.contains(event.target)) return;
      if (event.target.closest(".booking-pill")) return;
      if (event.target.closest(".slot-cell")) return;
      popover.hidden = true;
    });

    function openBookingPopover(bk, anchor) {
      const isNew = !bk.id;
      const isRestaurant = currentBusiness === "restaurant_demo";
      const isBeauty = currentBusiness === "beauty_demo";
      const isSnooker = currentBusiness === "prince_snooker";
      const endTime = addMinutesToTime(bk.time, bk.durationMinutes) || "";
      const actives = activeResources();
      const showResource = actives.length > 0;
      const presetResource = isNew && activeResourceFilter ? activeResourceFilter : (bk.resourceId || "");
      const resourceOptions = "<option value=''>(any)</option>" + actives.map((r) => {
        const selected = r.id === presetResource ? " selected" : "";
        return "<option value='" + escapeAttr(r.id) + "'" + selected + ">" + escapeHtml(r.name) + "</option>";
      }).join("");
      const lines = [
        "<div style='font-weight: 700; margin-bottom: 8px;'>" + (isNew ? "New booking" : "Edit booking") + "</div>",
        "<div style='display: grid; gap: 8px;'>",
        "<label>Date<input id='pop-date' value='" + escapeAttr(bk.date || "") + "'></label>",
        "<label>Start time<input id='pop-time' value='" + escapeAttr(bk.time || "") + "'></label>",
        isRestaurant
          ? "<label>Party size<input id='pop-partySize' type='number' min='1' max='20' value='" + escapeAttr(bk.partySize == null ? "" : bk.partySize) + "'></label>"
          : (isSnooker ? "" : "<label>Service<input id='pop-service' value='" + escapeAttr(bk.service || "") + "'></label>"),
        showResource ? "<label>Resource<select id='pop-resourceId'>" + resourceOptions + "</select></label>" : "",
        isBeauty
          ? "<label>End time<input id='pop-endTime' value='" + escapeAttr(endTime) + "' placeholder='" + escapeAttr(addMinutesToTime(bk.time, defaultDurationForService(bk.service)) || "HH:MM") + "'></label>"
          : "<label>End time<input id='pop-endTime' value='" + escapeAttr(endTime) + "' placeholder='HH:MM'></label>",
        "<label>Customer<input id='pop-customer' value='" + escapeAttr(bk.customer || "") + "'></label>",
        "<label>Notes<input id='pop-notes' value='" + escapeAttr(bk.notes || "") + "'></label>",
        "</div>",
        "<div style='display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end;'>",
        "<button type='button' id='pop-close' class='subtle'>Cancel</button>",
        isNew ? "" : "<button type='button' id='pop-del' class='danger'>Delete</button>",
        "<button type='button' id='pop-save' class='primary'>" + (isNew ? "Add booking" : "Save") + "</button>",
        "</div>"
      ];
      popover.innerHTML = lines.join("");
      placePopoverNear(anchor);
      popover.hidden = false;

      document.getElementById("pop-close").addEventListener("click", () => { popover.hidden = true; });
      document.getElementById("pop-save").addEventListener("click", async () => {
        try {
          const payload = {
            date: document.getElementById("pop-date").value.trim(),
            time: document.getElementById("pop-time").value.trim()
          };
          if (isRestaurant) payload.partySize = Number(document.getElementById("pop-partySize").value);
          else if (!isSnooker) payload.service = document.getElementById("pop-service").value.trim();
          if (showResource) {
            const resourceId = document.getElementById("pop-resourceId").value || "";
            if (resourceId) payload.resourceId = resourceId;
          }
          const endStr = document.getElementById("pop-endTime").value.trim();
          if (endStr) {
            const minutes = minutesBetween(payload.time, endStr);
            if (minutes == null) throw new Error("End time must be HH:MM and after start time.");
            payload.durationMinutes = minutes;
          }
          const customer = document.getElementById("pop-customer").value.trim();
          const notes = document.getElementById("pop-notes").value.trim();
          if (customer) payload.customer = customer;
          if (notes) payload.notes = notes;

          if (isNew) {
            setStatus("Adding booking…");
            await adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness), { method: "POST", body: JSON.stringify(payload) });
          } else {
            setStatus("Saving booking…");
            await adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(bk.id), { method: "PATCH", body: JSON.stringify(payload) });
          }
          popover.hidden = true;
          await loadAll();
          setStatus(isNew ? "Booking added." : "Booking saved.", "ok");
        } catch (e) { setStatus("Save failed: " + e.message, "err"); }
      });
      if (!isNew) {
        document.getElementById("pop-del").addEventListener("click", async () => {
          if (!confirm("Delete this booking?")) return;
          try {
            setStatus("Deleting booking…");
            await adminFetch("/admin/bookings/" + encodeURIComponent(currentBusiness) + "/" + encodeURIComponent(bk.id), { method: "DELETE" });
            popover.hidden = true;
            await loadAll();
            setStatus("Booking deleted.", "ok");
          } catch (e) { setStatus("Delete failed: " + e.message, "err"); }
        });
      }
    }

    function placePopoverNear(anchor) {
      const rect = anchor.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;
      if (left + 300 > window.innerWidth) left = Math.max(8, window.innerWidth - 320);
      popover.style.top = top + "px";
      popover.style.left = left + "px";
    }

    // ---- Time helpers ----
    function defaultDurationForService(service) {
      return SERVICE_DURATIONS[String(service || "").trim()] || 30;
    }
    function addMinutesToTime(timeStr, minutes) {
      const parts = String(timeStr || "").split(":");
      const h = Number(parts[0]); const m = Number(parts[1]);
      if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(Number(minutes))) return null;
      const total = h * 60 + m + Number(minutes);
      const eh = Math.floor(total / 60) % 24;
      const em = ((total % 60) + 60) % 60;
      return String(eh).padStart(2, "0") + ":" + String(em).padStart(2, "0");
    }
    function minutesBetween(startStr, endStr) {
      const sp = String(startStr || "").split(":").map(Number);
      const ep = String(endStr || "").split(":").map(Number);
      if (sp.length !== 2 || ep.length !== 2 || sp.some(Number.isNaN) || ep.some(Number.isNaN)) return null;
      const start = sp[0] * 60 + sp[1];
      const end = ep[0] * 60 + ep[1];
      if (end <= start) return null;
      return end - start;
    }
    function toMinutes(s) {
      const p = String(s || "").split(":").map(Number);
      return p.length === 2 && !p.some(Number.isNaN) ? p[0] * 60 + p[1] : 0;
    }
    function todayDateStr() {
      const d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    function startOfWeek(dateStr) {
      const d = new Date(dateStr + "T00:00:00");
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      return d;
    }
    function shiftDateStr(dateStr, days) {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    function isoDateOf(d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    function escapeHtml(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function escapeAttr(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    // ---- Navigation + view toggle ----
    document.getElementById("cal-prev").addEventListener("click", () => { weekAnchor = shiftDateStr(weekAnchor, -7); renderCalendar(); });
    document.getElementById("cal-next").addEventListener("click", () => { weekAnchor = shiftDateStr(weekAnchor, 7); renderCalendar(); });
    document.getElementById("cal-today").addEventListener("click", () => { weekAnchor = todayDateStr(); renderCalendar(); });

    document.querySelectorAll(".view-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-toggle").forEach((b) => b.classList.toggle("active", b === btn));
        const view = btn.dataset.view;
        document.querySelectorAll(".view-pane").forEach((pane) => {
          pane.hidden = pane.dataset.view !== view;
        });
        if (view === "calendar") renderCalendar();
      });
    });

    businessSelect.addEventListener("change", loadAll);
    refreshBtn.addEventListener("click", loadAll);

    loadAll();
  </script>
</body>
</html>`;
}

module.exports = { adminSlotsHtml };
