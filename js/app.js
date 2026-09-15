/**
 * JEWELLERY RATE DISPLAY BOARD - 32" ANDROID TV ENGINE
 * Shop: ज्वेलर्स सूर्य कुमार एण्ड संस (Surya Kumar & Sons)
 * 100% Offline | Persistent LocalStorage | TV Remote D-Pad Navigation
 */

// Default rates (6 digits format, e.g., 140000, 000000)
const DEFAULT_RATES = {
  gold24_sale: "140000",
  gold24_purchase: "000000",
  gold22_sale: "128300",
  gold22_purchase: "000000",
  gold20_sale: "116700",
  gold20_purchase: "000000",
  gold18_sale: "105000",
  gold18_purchase: "000000",
  silver_sale: "206000",
  silver_purchase: "000000"
};

const STORAGE_KEY = "sks_jewellery_board_rates_v1";

// Segment definitions for 7-segment display (a: top, b: tr, c: br, d: btm, e: bl, f: tl, g: mid)
const SEGMENT_MAP = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  ' ': []
};

// Slanted 7-segment SVG generator
function createSegmentDigitSVG(char, hasDot = false, isClock = false) {
  const activeSegments = SEGMENT_MAP[char] || [];
  const className = isClock ? "led-digit-svg clock-led-digit" : "led-digit-svg";
  
  // High-precision slanted segment paths (6 degree standard LED slant)
  return `
    <svg class="${className}" viewBox="0 0 58 84" xmlns="http://www.w3.org/2000/svg">
      <!-- Segment a (top) -->
      <polygon points="12,10 17,5 41,5 46,10 40,15 18,15" class="${activeSegments.includes('a') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment b (top right) -->
      <polygon points="47,11 52,16 48,39 43,43 39,39 42,16" class="${activeSegments.includes('b') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment c (bottom right) -->
      <polygon points="42,47 47,51 43,74 38,79 34,74 37,51" class="${activeSegments.includes('c') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment d (bottom) -->
      <polygon points="6,79 11,74 33,74 38,79 33,84 11,84" class="${activeSegments.includes('d') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment e (bottom left) -->
      <polygon points="7,47 12,51 9,74 4,79 0,74 3,51" class="${activeSegments.includes('e') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment f (top left) -->
      <polygon points="12,11 16,16 13,39 8,43 4,39 7,16" class="${activeSegments.includes('f') ? 'seg-on' : 'seg-off'}" />
      <!-- Segment g (middle) -->
      <polygon points="10,45 15,41 37,41 42,45 37,49 15,49" class="${activeSegments.includes('g') ? 'seg-on' : 'seg-off'}" />
      <!-- Decimal Point (dp) -->
      <circle cx="50" cy="79" r="4" class="${hasDot ? 'seg-on' : 'seg-off'}" />
    </svg>
  `;
}

// Slanted LED Comma SVG generator (matches segment slant & neon glow)
function createSegmentCommaSVG(isLit = true) {
  const className = isLit ? "seg-on" : "seg-off";
  return `
    <svg class="led-digit-svg led-comma-svg" viewBox="0 0 16 84" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="74" r="3.5" class="${className}" />
      <path d="M 11.5,75 C 11.5,80.5 8,84.5 4,86 C 6.5,83.5 8.5,80.5 8.5,75.5 Z" class="${className}" />
    </svg>
  `;
}

// Render string of digits into container with Indian currency commas & trailing decimal dot
function renderLEDString(containerId, strValue, alwaysDot = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clean digits and pad to 6 digits (e.g. "074500", "149800", "220000")
  let cleanDigits = (strValue || "").replace(/[^0-9]/g, '');
  cleanDigits = cleanDigits.padStart(6, '0').slice(-6);
  
  // [0]=Lakhs, [1]=Ten-Thousands, [2]=Thousands, [3]=Hundreds, [4]=Tens, [5]=Ones
  let html = '<div class="led-digit-group">';
  
  // Digit 0: Lakhs
  html += createSegmentDigitSVG(cleanDigits[0], false);
  
  // Comma 1: Lakhs separator (after Digit 0)
  html += createSegmentCommaSVG(true);
  
  // Digits 1 & 2: Ten-Thousands & Thousands
  html += createSegmentDigitSVG(cleanDigits[1], false);
  html += createSegmentDigitSVG(cleanDigits[2], false);
  
  // Comma 2: Thousands separator (after Digit 2, separating Hundreds/Tens/Ones)
  html += createSegmentCommaSVG(true);
  
  // Digits 3 & 4: Hundreds & Tens
  html += createSegmentDigitSVG(cleanDigits[3], false);
  html += createSegmentDigitSVG(cleanDigits[4], false);
  
  // Digit 5: Ones with trailing decimal dot
  html += createSegmentDigitSVG(cleanDigits[5], alwaysDot);
  
  html += '</div>';
  container.innerHTML = html;
}

// Render clock or date (2 digits each)
function renderClockGroup(containerId, strPair, hasDot = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const d1 = strPair[0] || '0';
  const d2 = strPair[1] || '0';
  
  container.innerHTML = `
    <div class="led-digit-group">
      ${createSegmentDigitSVG(d1, false, true)}
      ${createSegmentDigitSVG(d2, hasDot, true)}
    </div>
  `;
}

// State management
let currentRates = { ...DEFAULT_RATES };

// Round to nearest 100
function roundTo100(val) {
  return Math.round(Number(val) / 100) * 100;
}

// Auto-calculate 22K, 20K, 18K from 24K using exact mathematical purity ratio
function computeDerivedGoldFrom24K(gold24Price) {
  const p = Number(gold24Price);
  if (!p || isNaN(p)) return {};
  return {
    gold22_sale: String(roundTo100(p * 22 / 24)).padStart(6, '0'),
    gold20_sale: String(roundTo100(p * 20 / 24)).padStart(6, '0'),
    gold18_sale: String(roundTo100(p * 18 / 24)).padStart(6, '0')
  };
}

// Silver sale rate formula: MCX Silver - 250, rounded to nearest 100
function computeSilverSaleRate(mcxSilver) {
  const s = Number(mcxSilver);
  if (!s || isNaN(s)) return "000000";
  return String(roundTo100(s - 250)).padStart(6, '0');
}

function loadRates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentRates = { ...DEFAULT_RATES, ...JSON.parse(saved) };
    }
    // Clean old dummy purchase rates so they default to 000000
    ['gold24', 'gold22', 'gold20', 'gold18', 'silver'].forEach(k => {
      const pKey = `${k}_purchase`;
      if (!currentRates[pKey] || ['072500', '066300', '060100', '053900', '087500'].includes(currentRates[pKey])) {
        currentRates[pKey] = "000000";
      }
    });
  } catch (e) {
    console.warn("Could not load from localStorage, using defaults", e);
  }
}

function saveRates(newRates) {
  try {
    currentRates = { ...currentRates, ...newRates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRates));
    renderAllRates();
    showToastNotification("Rates Updated Successfully!");
  } catch (e) {
    console.error("Failed to save rates", e);
  }
}

function renderAllRates() {
  renderLEDString("gold24_sale_led", currentRates.gold24_sale, true);
  renderLEDString("gold24_purchase_led", currentRates.gold24_purchase, true);
  
  renderLEDString("gold22_sale_led", currentRates.gold22_sale, true);
  renderLEDString("gold22_purchase_led", currentRates.gold22_purchase, true);
  
  renderLEDString("gold20_sale_led", currentRates.gold20_sale, true);
  renderLEDString("gold20_purchase_led", currentRates.gold20_purchase, true);
  
  renderLEDString("gold18_sale_led", currentRates.gold18_sale, true);
  renderLEDString("gold18_purchase_led", currentRates.gold18_purchase, true);
  
  renderLEDString("silver_sale_led", currentRates.silver_sale, true);
  renderLEDString("silver_purchase_led", currentRates.silver_purchase, true);
}

// Live MCX Fetcher with dual-strategy (Netlify Function + Direct Fallback)
async function fetchLiveMCXRates(showToast = false) {
  const syncBtn = document.getElementById("syncMcxBtn");
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.textContent = "⏳ SYNCING...";
  }

  try {
    let data = null;
    try {
      const res = await fetch('/api/mcx-rates');
      if (res.ok) data = await res.json();
    } catch (e) {}

    if (!data || !data.gold24) {
      try {
        const res2 = await fetch('/.netlify/functions/mcx-rates');
        if (res2.ok) data = await res2.json();
      } catch (e) {}
    }

    // Direct client fallback if running offline or standalone
    if (!data || !data.gold24) {
      const [goldRes, inrRes, silverRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU'),
        fetch('https://open.er-api.com/v6/latest/USD'),
        fetch('https://api.gold-api.com/price/XAG')
      ]);
      const goldData = await goldRes.json();
      const inrData = await inrRes.json();
      const silverData = await silverRes.json();
      const usdinr = inrData?.rates?.INR || 95.91;
      const goldUsd = goldData?.price || 4330;
      const silverUsd = silverData?.price || 63.5;
      const gold24 = roundTo100((goldUsd / 31.1034768) * 10 * usdinr * 1.06);
      const silver = roundTo100((silverUsd / 31.1034768) * 1000 * usdinr * 1.06);
      data = { gold24, silver };
    }

    if (data && data.gold24) {
      const gold24Str = String(roundTo100(data.gold24)).padStart(6, '0');
      const derived = computeDerivedGoldFrom24K(gold24Str);
      const silverSaleStr = computeSilverSaleRate(data.silver || 206200);

      currentRates.gold24_sale = gold24Str;
      currentRates.gold22_sale = derived.gold22_sale;
      currentRates.gold20_sale = derived.gold20_sale;
      currentRates.gold18_sale = derived.gold18_sale;
      currentRates.silver_sale = silverSaleStr;

      // Purchase rates remain manual / default to 000000
      ['gold24', 'gold22', 'gold20', 'gold18', 'silver'].forEach(k => {
        if (!currentRates[`${k}_purchase`]) currentRates[`${k}_purchase`] = "000000";
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRates));
      renderAllRates();
      updateModalInputs();

      if (showToast) {
        showToastNotification("Live MCX Rates Applied!");
      }
      console.log("[MCX API] Live rates applied:", currentRates);
    }
  } catch (err) {
    console.warn("[MCX API] Could not fetch live rates:", err);
    if (showToast) {
      showToastNotification("Offline: Using Stored Rates");
    }
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.textContent = "🔄 SYNC LIVE MCX";
    }
  }
}

// Live Clock & Calendar Ticker
function updateClockAndDate() {
  const now = new Date();
  
  // TIME: HH:MM:SS (clean colon separated)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  renderClockGroup("time_hr_led", hours, false);
  renderClockGroup("time_min_led", minutes, false);
  renderClockGroup("time_sec_led", seconds, false);
  
  // DATE: DD.MM.YY (matching photo 09.12.25)
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  
  renderClockGroup("date_day_led", day, true);
  renderClockGroup("date_month_led", month, true);
  renderClockGroup("date_year_led", year, false);
}

// TV Remote Friendly Admin Modal Controls
const modalBackdrop = document.getElementById("adminModal");
const openAdminBtn = document.getElementById("openAdminBtn");
const saveRatesBtn = document.getElementById("saveRatesBtn");
const cancelRatesBtn = document.getElementById("cancelRatesBtn");

function updateModalInputs() {
  for (const [key, val] of Object.entries(currentRates)) {
    const input = document.getElementById(`input_${key}`);
    if (input) {
      input.value = val;
    }
  }
}

function openModal() {
  updateModalInputs();
  modalBackdrop.classList.add("active");
  // Focus on first input for remote control
  const firstInput = document.getElementById("input_gold24_sale");
  if (firstInput) {
    firstInput.focus();
    firstInput.select();
  }
}

function closeModal() {
  modalBackdrop.classList.remove("active");
  // Return focus to the trigger button
  if (openAdminBtn) openAdminBtn.focus();
}

function handleSaveForm() {
  const updated = {};
  for (const key of Object.keys(DEFAULT_RATES)) {
    const input = document.getElementById(`input_${key}`);
    if (input && input.value) {
      // Pad to 6 digits
      let val = input.value.replace(/[^0-9]/g, '');
      val = val.padStart(6, '0').slice(-6);
      updated[key] = val;
    }
  }
  saveRates(updated);
  closeModal();
}

// TV Remote Key Handling (D-Pad & Shortcuts)
window.addEventListener("keydown", (e) => {
  const isModalOpen = modalBackdrop.classList.contains("active");
  
  // Android TV remote Back / Escape codes: 27, 8, 4, 10009, 461
  if (e.key === "Escape" || e.keyCode === 27 || e.keyCode === 10009 || e.keyCode === 461) {
    if (isModalOpen) {
      e.preventDefault();
      closeModal();
    }
    return;
  }
  
  // Open modal with Enter or 'm' (Menu) when modal is closed
  if (!isModalOpen) {
    if (e.key === "Enter" || e.key === "m" || e.key === "M" || e.keyCode === 13) {
      // If not already focused on interactive element
      if (document.activeElement === document.body || document.activeElement === openAdminBtn) {
        e.preventDefault();
        openModal();
      }
    }
  } else {
    // When modal is open, navigate between input grid
    handleModalNavigation(e);
  }
});

// Grid navigation for Android TV remote D-Pad
function handleModalNavigation(e) {
  const inputs = Array.from(document.querySelectorAll(".tv-focusable"));
  const currentIndex = inputs.indexOf(document.activeElement);
  
  if (currentIndex === -1) return;
  
  let targetIndex = -1;
  
  if (e.key === "ArrowDown") {
    e.preventDefault();
    // Move down 2 columns in the grid, or to buttons at bottom
    if (currentIndex < 8) {
      targetIndex = currentIndex + 2;
    } else if (currentIndex === 8 || currentIndex === 9) {
      targetIndex = 10; // Save button
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (currentIndex >= 10) {
      targetIndex = 8;
    } else if (currentIndex >= 2) {
      targetIndex = currentIndex - 2;
    }
  } else if (e.key === "ArrowRight") {
    if (currentIndex % 2 === 0 && currentIndex < 10) {
      e.preventDefault();
      targetIndex = currentIndex + 1;
    } else if (currentIndex === 10) {
      e.preventDefault();
      targetIndex = 11; // Cancel button
    }
  } else if (e.key === "ArrowLeft") {
    if (currentIndex % 2 === 1 && currentIndex < 10) {
      e.preventDefault();
      targetIndex = currentIndex - 1;
    } else if (currentIndex === 11) {
      e.preventDefault();
      targetIndex = 10; // Save button
    }
  }
  
  if (targetIndex >= 0 && targetIndex < inputs.length) {
    inputs[targetIndex].focus();
    if (inputs[targetIndex].select) {
      inputs[targetIndex].select();
    }
  }
}

// Toast notification
function showToastNotification(msg) {
  let toast = document.getElementById("tvToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "tvToast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(22, 163, 74, 0.95)";
    toast.style.color = "#ffffff";
    toast.style.padding = "12px 28px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "1.3rem";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    toast.style.zIndex = "999";
    toast.style.transition = "opacity 0.4s ease";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// Android TV Wake Lock (prevents TV from sleeping)
async function requestScreenWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock active');
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
          await navigator.wakeLock.request('screen');
        }
      });
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  }
}

// ===================================================================
// BURN-IN PROTECTION (LED / OLED TV PANEL SAFEGUARD)
// Imperceptible micro-pixel shifting every 20 minutes across 8 orbital points
// ===================================================================
const BURN_IN_ORBIT = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 }
];
let burnInCycleIndex = 0;

function applyMicroPixelShift() {
  burnInCycleIndex = (burnInCycleIndex + 1) % BURN_IN_ORBIT.length;
  const offset = BURN_IN_ORBIT[burnInCycleIndex];
  const chassis = document.querySelector(".board-chassis");
  if (chassis) {
    chassis.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    console.log(`[Burn-In Protection] ??? Micro-pixel shift cycle #${burnInCycleIndex}: applied offset (${offset.x}px, ${offset.y}px) to protect TV panel.`);
  }
}

function initBurnInProtection() {
  // Exact 20-minute interval (20 * 60 * 1000 = 1,200,000 ms)
  const INTERVAL_MS = 20 * 60 * 1000;
  setInterval(applyMicroPixelShift, INTERVAL_MS);
  console.log('[Burn-In Protection] ??? Active: shifting micro-pixels every 20 minutes (8-point orbital cycle).');
}

// Global test helper to verify shift immediately from console
window.triggerBurnInShiftTest = function() {
  applyMicroPixelShift();
  return `Current offset: ${JSON.stringify(BURN_IN_ORBIT[burnInCycleIndex])}`;
};

// Initialize everything on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  loadRates();
  renderAllRates();
  updateClockAndDate();
  setInterval(updateClockAndDate, 1000);
  
  if (openAdminBtn) openAdminBtn.addEventListener("click", openModal);
  if (saveRatesBtn) saveRatesBtn.addEventListener("click", handleSaveForm);
  if (cancelRatesBtn) cancelRatesBtn.addEventListener("click", closeModal);
  
  // Hook up live MCX Sync button
  const syncBtn = document.getElementById("syncMcxBtn");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => fetchLiveMCXRates(true));
  }

  // Auto-calculate 22K, 20K, 18K live when typing 24K in modal
  const input24 = document.getElementById("input_gold24_sale");
  if (input24) {
    input24.addEventListener("input", (e) => {
      const val = e.target.value;
      if (val && val.length >= 5) {
        const derived = computeDerivedGoldFrom24K(val);
        const in22 = document.getElementById("input_gold22_sale");
        const in20 = document.getElementById("input_gold20_sale");
        const in18 = document.getElementById("input_gold18_sale");
        if (in22 && derived.gold22_sale) in22.value = derived.gold22_sale;
        if (in20 && derived.gold20_sale) in20.value = derived.gold20_sale;
        if (in18 && derived.gold18_sale) in18.value = derived.gold18_sale;
      }
    });
  }

  // Double-click anywhere on the board also opens the rate updater
  document.querySelector(".board-surface").addEventListener("dblclick", openModal);
  
  requestScreenWakeLock();
  initBurnInProtection();

  // Fetch live MCX rates on startup & auto-refresh every 10 minutes
  fetchLiveMCXRates(false);
  setInterval(() => fetchLiveMCXRates(false), 10 * 60 * 1000);
  
  if (window.location.hash === '#admin') {
    setTimeout(openModal, 150);
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') openModal();
    else closeModal();
  });
});

// Continuously eradicate Netlify Drawer / Feedback Widget
function purgeNetlifyToolbar() {
  const targets = [
    '#netlify-drawer',
    '[data-netlify-drawer]',
    '[class*="netlify-drawer"]',
    '[id*="netlify-drawer"]',
    '[class*="netlify-feedback"]',
    '[id*="netlify-feedback"]',
    'iframe[src*="netlify"]',
    'netlify-drawer',
    '.netlify-badge'
  ];
  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      try { el.remove(); } catch(e) {}
    });
  });
}
purgeNetlifyToolbar();
window.addEventListener('load', purgeNetlifyToolbar);
try {
  const netlifyPurgeObserver = new MutationObserver(purgeNetlifyToolbar);
  netlifyPurgeObserver.observe(document.documentElement, { childList: true, subtree: true });
} catch(e) {}
