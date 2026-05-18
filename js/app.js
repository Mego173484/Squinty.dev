const LATEST_VIDEO_ID = "BBib-8NMGP8";
const DOS_VERSION = "173484";
const VISITOR_BASE = 173484;
const VISITOR_STORAGE_KEY = "squinky.dev.localVisits";
const GUESTBOOK_STORAGE_KEY = "squinky.dev.localGuestbook";
const GUESTBOOK_LOCAL_LIMIT = 20;
const SCREENSAVER_DELAY = 60000;
const SYSTEM_EVENT_DELAY = 18000;
const API_BASE = window.SQUINKY_API_BASE || "/api";
const SFX_PATHS = {
    dialup: "assets/sfx/dialup-short.mp3",
    blip: "assets/sfx/blip.mp3",
    happy: "assets/sfx/happy-beep.mp3",
    error: "assets/sfx/buzzer.mp3",
    keyboard: "assets/sfx/keyboard-noise.mp3"
};

// Boot and flavor text pools
const bootLinePool = [
    "MEMORY CHECK: OK",
    "OLD COMPUTER DETECTED",
    "LOADING PERSONAL WEB DISK",
    "MOUNTING SQUINKY.DEV",
    "CHECKING GREEN SIGNAL",
    "AUDIO DRIVER READY",
    "CRT FILTER READY",
    "TERMINAL READY",
    "MOD TRACKER: UNDER CONSTRUCTION",
    "VERSION 173484 CONFIRMED",
    "LOCAL FILES INDEXED",
    "STARTUP FANFARE QUEUED"
];

const webBootLinePool = [
    "NETSCAPE CACHE: READY",
    "LOADING SQUINKY WORLD",
    "TUNING SPACE SONG",
    "CHECKING GIF SPARKLES",
    "OPENING PERSONAL HOME PAGE",
    "RAINBOW DIVIDER: OK",
    "VISITOR COUNTER: BLINKING",
    "WEB PLANET ORBIT: STABLE"
];

const splashTexts = [
    "signal found",
    "running on old hardware",
    "personal web disk loaded",
    "green light detected",
    "iterator link unstable",
    "version 173484",
    "booted from mystery drive",
    "cold computer weather",
    "file system mostly okay",
    "welcome back",
    "squinky.dev online",
    "do not remove the green wire",
    "local disk humming",
    "web terminal active",
    "old monitor warmed up"
];

const systemEvents = [
    "BACKGROUND EVENT: GREEN SIGNAL PULSE.",
    "BACKGROUND EVENT: LOCAL DISK HUM NORMAL.",
    "BACKGROUND EVENT: CRT PHOSPHOR DRIFT.",
    "BACKGROUND EVENT: SIGNALS/ UPDATED TIMESTAMP.",
    "BACKGROUND EVENT: TINY STATIC BURST DETECTED.",
    "BACKGROUND EVENT: MUSIC BUFFER SLEEPING.",
    "BACKGROUND EVENT: PERSONAL WEB DISK STILL SPINNING."
];

const webEvents = [
    "WEB EVENT: SQUINKY WORLD PLANET DRIFT.",
    "WEB EVENT: SPACE SONG BUFFER TWINKLING.",
    "WEB EVENT: GUESTBOOK STARS ARE BLINKING.",
    "WEB EVENT: OLD INTERNET RAINBOW UPDATED.",
    "WEB EVENT: NETSCAPE TOUR GUIDE WAVES HELLO."
];

const blockedWords = [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "dick",
    "pussy",
    "bastard",
    "slut",
    "whore"
];

// Audio and animation state
let audioCtx;
let analyser;
let masterGain;
let musicTimer = null;
let animationFrame = null;
let borderTimer = null;
let step = 0;
let isPlaying = false;
let borderBoost = 32;
let themeIndex = 0;
let warpTimer = null;
let screensaverTimer = null;
let systemEventTimer = null;
let dynamicReadoutTimer = null;
let cachedBorderWidth = 0;
let cachedBorderHeight = 0;
let lastBorderDrawTime = 0;
let lastActivityResetTime = 0;
let screensaverActive = false;
let isTerminated = false;
let currentSplash = "";
let bootTimestamp = Date.now();
const sfxPlayers = {};

// Theme data
const themes = [
    { name: "GREEN-BLUE", green: "#2cff6a", blue: "#2d8cff", cyan: "#4dffdf", yellow: "#f7ff6b", wallA: "#164d3d", wallB: "#06211f", wallC: "#010807" },
    { name: "SAINT GLOW", green: "#9cff57", blue: "#25b6ff", cyan: "#bcfff7", yellow: "#fff4a8", wallA: "#2f6b3a", wallB: "#103b2d", wallC: "#03120d" },
    { name: "COLD TERMINAL", green: "#39ffb6", blue: "#245dff", cyan: "#00d5ff", yellow: "#dbff63", wallA: "#143d4d", wallB: "#071d32", wallC: "#020611" },
    { name: "ODD FILE", green: "#b6ff4d", blue: "#008cff", cyan: "#66ffcc", yellow: "#ffffff", wallA: "#4c5b1d", wallB: "#102d2e", wallC: "#060806" },
    { name: "COMMODORE 64", className: "theme-c64", green: "#7fffff", blue: "#4035c8", cyan: "#8fe8ff", yellow: "#fff35a", wallA: "#4035c8", wallB: "#1a1680", wallC: "#070042" },
    { name: "MS-DOS", className: "theme-msdos", green: "#c0c0c0", blue: "#0000aa", cyan: "#ffffff", yellow: "#ffff00", wallA: "#000000", wallB: "#000000", wallC: "#000000" },
    { name: "SYSTEM 1", className: "theme-system-one", green: "#111111", blue: "#777777", cyan: "#ffffff", yellow: "#000000", wallA: "#f5f5f5", wallB: "#bdbdbd", wallC: "#777777" },
    { name: "CONCORD", className: "theme-concord", green: "#ff3d3d", blue: "#244dff", cyan: "#f7fbff", yellow: "#ffd24a", wallA: "#5d1020", wallB: "#101a4e", wallC: "#050713" },
    { name: "EMOJI WEB 1.0", className: "theme-emoji-web", extraText: " ✨ 🌈 💾 🎵 ⭐", green: "#39ff14", blue: "#ff4df3", cyan: "#2fffff", yellow: "#fff200", wallA: "#ff7ac8", wallB: "#4c2dff", wallC: "#08002b" }
];

const themeClasses = themes
    .map(function(theme) { return theme.className; })
    .filter(Boolean);

// DOM references
const startupScreen = document.getElementById("startupScreen");
const terminatedScreen = document.getElementById("terminatedScreen");
const screensaver = document.getElementById("screensaver");
const startupLogo = document.getElementById("startupLogo");
const startupSubtitle = document.getElementById("startupSubtitle");
const pressStartText = document.getElementById("pressStartText");
const terminatedTitle = document.getElementById("terminatedTitle");
const terminatedText = document.getElementById("terminatedText");
const screensaverLogo = document.getElementById("screensaverLogo");
const screensaverText = document.getElementById("screensaverText");
const saverSignalOne = document.getElementById("saverSignalOne");
const saverSignalTwo = document.getElementById("saverSignalTwo");
const saverSignalThree = document.getElementById("saverSignalThree");
const driverLoader = document.getElementById("driverLoader");
const driverTitle = document.getElementById("driverTitle");
const driverLine = document.getElementById("driverLine");
const homePage = document.getElementById("homePage");
const pageViews = document.querySelectorAll(".site-page");
const enterSiteButton = document.getElementById("enterSiteButton");
const rebootButton = document.getElementById("rebootButton");
const bootLines = document.getElementById("bootLines");
const logoText = "SQUINKY.DEV";
const logo = document.getElementById("logo");
const subtitle = document.querySelector(".subtitle");
const desktop = document.getElementById("desktop");
const borderCanvas = document.getElementById("waveBorder");
const borderCtx = borderCanvas.getContext("2d");
const wrap = document.querySelector(".desktop-wrap");
const terminalOutput = document.getElementById("terminalOutput");
const terminalInput = document.getElementById("terminalInput");
const terminalForm = document.getElementById("terminalForm");
const record = document.getElementById("record");
const osReadout = document.getElementById("osReadout");
const paletteReadout = document.getElementById("paletteReadout");
const splashReadout = document.getElementById("splashReadout");
const themeFlash = document.getElementById("themeFlash");
const themeTray = document.getElementById("themeTray");
const clockReadout = document.getElementById("clockReadout");
const uptimeReadout = document.getElementById("uptimeReadout");
const signalReadout = document.getElementById("signalReadout");
let visitorCount = document.getElementById("visitorCount");
let visitorToday = document.getElementById("visitorToday");
let counterMode = document.getElementById("counterMode");
const filePreview = document.getElementById("filePreview");
const guestbookForm = document.getElementById("guestbookForm");
const guestbookName = document.getElementById("guestbookName");
const guestbookMessage = document.getElementById("guestbookMessage");
const guestbookStatus = document.getElementById("guestbookStatus");
const guestbookList = document.getElementById("guestbookList");
const marqueeText = document.querySelector(".marquee span");
const trackTitle = document.getElementById("trackTitle");
const trackDetails = document.getElementById("trackDetails");
const musicWindowTitle = document.getElementById("musicWindowTitle");
const musicHeading = document.getElementById("musicHeading");

// Initial render
logoText.split("").forEach(function(letter) {
    const span = document.createElement("span");
    span.className = "logo-letter";
    span.textContent = letter;
    span.tabIndex = 0;
    span.setAttribute("role", "button");
    span.setAttribute("aria-label", "Play " + letter);
    logo.appendChild(span);
});

const themeExtra = document.createElement("span");
themeExtra.className = "theme-extra";
subtitle.appendChild(themeExtra);
const logoLetters = document.querySelectorAll(".logo-letter");
const notes = [392, 523, 659, 523, 440, 587, 740, 587, 349, 440, 523, 440, 330, 392, 494, 392];
const webNotes = [523, 659, 784, 988, 880, 784, 659, 587, 659, 784, 1047, 988, 784, 659, 587, 523];

themes.forEach(function(theme, index) {
    const button = document.createElement("button");
    button.className = "theme-chip";
    button.type = "button";
    button.textContent = theme.name;
    button.dataset.themeIndex = String(index);
    themeTray.appendChild(button);
});

document.getElementById("youtubeFrame").src = "https://www.youtube.com/embed/" + LATEST_VIDEO_ID;
document.getElementById("youtubeFramePage").src = "https://www.youtube.com/embed/" + LATEST_VIDEO_ID;
setTheme(themeIndex, false);
renderBootLines();
rerollSplash(false);
recordVisitorCount();
loadGuestbook();
updateDynamicReadouts();
dynamicReadoutTimer = setInterval(updateDynamicReadouts, 1000);

// Event listeners
enterSiteButton.addEventListener("click", enterSite);
rebootButton.addEventListener("click", resetOS);
document.addEventListener("keydown", function(event) {
    if (!startupScreen.classList.contains("hidden") && event.key === "Enter") enterSite();
});

document.addEventListener("keydown", function(event) {
    if (!startupScreen.classList.contains("hidden") || isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();
    const index = Array.from(logoLetters).findIndex(function(letter) {
        return letter.textContent.toLowerCase() === key;
    });

    if (index !== -1) {
        playLogoKey(index);
    }
});

document.getElementById("musicButton").addEventListener("click", toggleMusic);
document.getElementById("musicButton2").addEventListener("click", toggleMusic);
document.getElementById("warpButton").addEventListener("click", startRealityWarp);
document.getElementById("colorButton").addEventListener("click", cycleTheme);
document.getElementById("resetButton").addEventListener("click", resetOS);
document.getElementById("terminateButton").addEventListener("click", terminateOS);

logoLetters.forEach(function(letter, index) {
    letter.addEventListener("click", function() { playLogoKey(index); });
    letter.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            playLogoKey(index);
        }
    });
});

document.querySelectorAll("[data-window]").forEach(function(button) {
    button.addEventListener("click", function() { focusWindow(button.dataset.window); });
});

document.querySelectorAll("[data-page]").forEach(function(button) {
    button.addEventListener("click", function() { loadPage(button.dataset.page); });
});

document.querySelectorAll("[data-window-action]").forEach(function(button) {
    button.addEventListener("click", function(event) {
        event.stopPropagation();
        handleWindowAction(button.closest(".window"), button.dataset.windowAction);
    });
});

document.querySelectorAll("[data-command]").forEach(function(button) {
    button.addEventListener("click", function() { runCommand(button.dataset.command); });
});

document.querySelectorAll("[data-theme-index]").forEach(function(button) {
    button.addEventListener("click", function() { setTheme(Number(button.dataset.themeIndex), true); });
});

document.querySelectorAll("[data-file]").forEach(function(button) {
    button.addEventListener("click", function() { openFile(button.dataset.file); });
});

document.querySelector(".terminal-input-row").addEventListener("click", function() {
    terminalInput.focus();
});

terminalForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const command = terminalInput.value.trim();
    terminalInput.value = "";
    if (command.length > 0) runCommand(command);
});

guestbookForm.addEventListener("submit", submitGuestbookEntry);

document.addEventListener("click", makeClickSpark);
document.addEventListener("visibilitychange", handleVisibilityChange);
["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach(function(eventName) {
    document.addEventListener(eventName, noteUserActivity, { passive: true });
});
resetScreensaverTimer();

function handleVisibilityChange() {
    if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        clearTimeout(borderTimer);
        animationFrame = null;
        borderTimer = null;
    } else {
        startWaveBorder();
        updateDynamicReadouts();
    }
}

// Audio setup and OS entry
function ensureAudio() {
    if (!window.AudioContext && !window.webkitAudioContext) return false;
    if (!audioCtx) setupAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return true;
}

function enterSite() {
    if (isTerminated) return;
    noteUserActivity();
    if (ensureAudio()) playStartupFanfare();
    playAssetSound("happy", 0.28);
    playTimedAssetSound("dialup", 0.16, 1400);
    startupScreen.classList.add("hidden");
    startupScreen.classList.remove("visible");
    startWaveBorder();
    addLine(isEmojiWebTheme() ? "SQUINKY WORLD PAGE LOADED." : "SQUINKYDOS FANFARE COMPLETE.");
    addLine(isEmojiWebTheme() ? "WELCOME, WEB TRAVELER." : "SYSTEM ONLINE.");
    scheduleSystemEvent();
}

function addLine(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function playAssetSound(name, volume) {
    if (!SFX_PATHS[name]) return;

    try {
        if (!sfxPlayers[name]) {
            sfxPlayers[name] = new Audio(SFX_PATHS[name]);
            sfxPlayers[name].preload = "auto";
        }

        const player = sfxPlayers[name];
        player.pause();
        player.currentTime = 0;
        player.volume = volume;
        player.play().catch(function() {});
    } catch (error) {}
}

function playTimedAssetSound(name, volume, duration) {
    playAssetSound(name, volume);

    setTimeout(function() {
        const player = sfxPlayers[name];
        if (!player) return;
        player.pause();
        player.currentTime = 0;
    }, duration);
}

// Screensaver and activity tracking
function noteUserActivity() {
    if (screensaverActive) {
        hideScreensaver();
        resetScreensaverTimer();
        return;
    }

    const now = Date.now();
    if (now - lastActivityResetTime < 1000) return;
    lastActivityResetTime = now;
    resetScreensaverTimer();
}

function resetScreensaverTimer() {
    clearTimeout(screensaverTimer);

    if (isTerminated) return;

    screensaverTimer = setTimeout(showScreensaver, SCREENSAVER_DELAY);
}

function showScreensaver() {
    if (isTerminated || !startupScreen.classList.contains("hidden")) return;

    screensaverActive = true;
    screensaver.classList.add("visible");
}

function hideScreensaver() {
    screensaverActive = false;
    screensaver.classList.remove("visible");
}

// Live desktop readouts and small dynamic effects
function updateDynamicReadouts() {
    const now = new Date();
    const uptimeSeconds = Math.max(0, Math.floor((Date.now() - bootTimestamp) / 1000));
    const minutes = Math.floor(uptimeSeconds / 60);
    const seconds = uptimeSeconds % 60;
    const signal = 72 + Math.floor(Math.sin(Date.now() / 1400) * 12) + Math.floor(Math.random() * 5);

    if (isEmojiWebTheme()) {
        clockReadout.textContent = "LOCAL TIME " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        uptimeReadout.textContent = "WEB TOUR " + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
        signalReadout.textContent = "SPARKLES " + Math.max(44, Math.min(99, signal)) + "%";
        return;
    }

    clockReadout.textContent = "TIME " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    uptimeReadout.textContent = "UPTIME " + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    signalReadout.textContent = "SIGNAL " + Math.max(44, Math.min(99, signal)) + "%";
}

function scheduleSystemEvent() {
    clearTimeout(systemEventTimer);
    systemEventTimer = setTimeout(function() {
        if (!isTerminated && startupScreen.classList.contains("hidden") && !screensaverActive) {
            const events = isEmojiWebTheme() ? webEvents : systemEvents;
            addLine(events[Math.floor(Math.random() * events.length)]);
        }

        scheduleSystemEvent();
    }, SYSTEM_EVENT_DELAY + Math.floor(Math.random() * 7000));
}

function makeClickSpark(event) {
    if (!startupScreen.classList.contains("hidden") || isTerminated) return;

    const spark = document.createElement("div");
    spark.className = "click-spark";
    spark.style.left = event.clientX + "px";
    spark.style.top = event.clientY + "px";
    document.body.appendChild(spark);

    setTimeout(function() {
        spark.remove();
    }, 760);
}

// Startup, splash, and local visit counter
function renderBootLines() {
    const count = randomInt(4, 6);
    const chosenLines = shuffleArray(isEmojiWebTheme() ? webBootLinePool : bootLinePool).slice(0, count);
    bootLines.innerHTML = chosenLines.join("<br>");
}

function rerollSplash(announce) {
    let nextSplash = splashTexts[Math.floor(Math.random() * splashTexts.length)];

    if (splashTexts.length > 1) {
        while (nextSplash === currentSplash) {
            nextSplash = splashTexts[Math.floor(Math.random() * splashTexts.length)];
        }
    }

    currentSplash = nextSplash;
    splashReadout.textContent = isEmojiWebTheme() ? "WEB PAGE: SPACE SONG LOADED" : "SPLASH: " + currentSplash;

    if (announce) {
        addLine("SPLASH TEXT: " + currentSplash.toUpperCase() + ".");
    }
}

function recordVisitorCount() {
    if (!visitorCount || !visitorToday || !counterMode) return;

    fetch("https://visitor.6developer.com/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            domain: "squinky.dev",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page_path: window.location.pathname,
            page_title: document.title,
            referrer: document.referrer
        })
    })
    .then(function(response) {
        if (!response.ok) throw new Error("Counter unavailable");
        return response.json();
    })
    .then(function(data) {
        visitorCount.textContent = formatCounterNumber(data.totalCount);
        visitorToday.textContent = formatTodayNumber(data.todayCount);
        counterMode.textContent = "LIVE";
        addLine("REAL VISITOR COUNTER ONLINE: " + formatCounterNumber(data.totalCount) + " TOTAL.");
    })
    .catch(function() {
        const fallbackCount = recordFallbackVisit();
        visitorCount.textContent = formatCounterNumber(fallbackCount);
        visitorToday.textContent = "LOCAL";
        counterMode.textContent = "OFFLINE CACHE";
        addLine("REAL VISITOR COUNTER OFFLINE. LOCAL CACHE DISPLAYED.");
    });
}

function formatCounterNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "000173484";
    return String(Math.floor(number)).padStart(8, "0");
}

function formatTodayNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return String(Math.floor(number)).padStart(3, "0");
}

function recordFallbackVisit() {
    let nextCount = VISITOR_BASE + 1;

    try {
        const storedCount = Number(localStorage.getItem(VISITOR_STORAGE_KEY));
        const previousCount = Number.isFinite(storedCount) && storedCount >= VISITOR_BASE
            ? storedCount
            : VISITOR_BASE;

        nextCount = previousCount + 1;
        localStorage.setItem(VISITOR_STORAGE_KEY, String(nextCount));
    } catch (error) {
        nextCount = VISITOR_BASE;
    }

    return nextCount;
}

// Guestbook API and profanity guard
function hasBlockedWords(text) {
    const normalized = text.toLowerCase();
    return blockedWords.some(function(word) {
        return new RegExp("(^|[^a-z])" + word + "([^a-z]|$)", "i").test(normalized);
    });
}

function setGuestbookStatus(message) {
    if (!guestbookStatus) return;
    guestbookStatus.textContent = message;
}

function loadGuestbook() {
    if (!guestbookList) return;

    setGuestbookStatus("READING GUESTBOOK DISK...");

    fetch(API_BASE + "/guestbook")
        .then(function(response) {
            if (!response.ok) throw new Error("Guestbook unavailable");
            return response.json();
        })
        .then(function(data) {
            renderGuestbookEntries(data.entries || []);
            setGuestbookStatus("GUESTBOOK DRIVER ONLINE.");
        })
        .catch(function() {
            const fallbackEntries = readLocalGuestbookEntries();
            renderGuestbookEntries(fallbackEntries);
            setGuestbookStatus(fallbackEntries.length
                ? "GUESTBOOK API OFFLINE. SHOWING LOCAL SIGNALS."
                : "GUESTBOOK API OFFLINE. LOCAL SIGNAL CACHE READY.");
        });
}

function renderGuestbookEntries(entries) {
    if (!entries.length) {
        guestbookList.innerHTML = '<div class="guestbook-empty">NO SIGNALS SAVED YET.</div>';
        return;
    }

    guestbookList.innerHTML = "";
    entries.forEach(function(entry) {
        const item = document.createElement("div");
        item.className = "guestbook-entry";

        const name = document.createElement("div");
        name.className = "guestbook-entry-name";
        name.textContent = entry.name || "visitor";

        const date = document.createElement("div");
        date.className = "guestbook-entry-date";
        date.textContent = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "unknown time";

        const message = document.createElement("div");
        message.className = "guestbook-entry-message";
        message.textContent = entry.message || "";

        item.appendChild(name);
        item.appendChild(date);
        item.appendChild(message);
        guestbookList.appendChild(item);
    });
}

function submitGuestbookEntry(event) {
    event.preventDefault();

    const name = guestbookName.value.trim() || "visitor";
    const message = guestbookMessage.value.trim();

    if (message.length < 2) {
        playAssetSound("error", 0.22);
        setGuestbookStatus("MESSAGE TOO SHORT.");
        return;
    }

    if (hasBlockedWords(name) || hasBlockedWords(message)) {
        playAssetSound("error", 0.22);
        setGuestbookStatus("SIGNAL REJECTED: CURSING FILTER TRIPPED.");
        return;
    }

    setGuestbookStatus("TRANSMITTING SIGNAL...");

    fetch(API_BASE + "/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, message: message })
    })
    .then(function(response) {
        return readGuestbookResponse(response).then(function(data) {
            if (!response.ok) {
                throw new Error(data.error || "Guestbook rejected signal");
            }
            return data;
        });
    })
    .then(function() {
        guestbookMessage.value = "";
        playAssetSound("happy", 0.24);
        setGuestbookStatus("SIGNAL SAVED.");
        loadGuestbook();
        addLine("GUESTBOOK SIGNAL SAVED.");
    })
    .catch(function(error) {
        if (saveLocalGuestbookEntry(name, message)) {
            guestbookMessage.value = "";
            playAssetSound("happy", 0.24);
            renderGuestbookEntries(readLocalGuestbookEntries());
            setGuestbookStatus("API OFFLINE. SIGNAL SAVED TO LOCAL CACHE.");
            addLine("GUESTBOOK API OFFLINE. SIGNAL SAVED LOCALLY.");
            return;
        }

        playAssetSound("error", 0.22);
        setGuestbookStatus("SIGNAL FAILED: " + getGuestbookErrorMessage(error).toUpperCase() + ".");
    });
}

function readLocalGuestbookEntries() {
    try {
        const entries = JSON.parse(localStorage.getItem(GUESTBOOK_STORAGE_KEY) || "[]");
        return Array.isArray(entries) ? entries.slice(0, GUESTBOOK_LOCAL_LIMIT) : [];
    } catch (error) {
        return [];
    }
}

function saveLocalGuestbookEntry(name, message) {
    try {
        const entries = readLocalGuestbookEntries();
        entries.unshift({
            id: "local-" + Date.now(),
            name: name,
            message: message,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(entries.slice(0, GUESTBOOK_LOCAL_LIMIT)));
        return true;
    } catch (error) {
        return false;
    }
}

function readGuestbookResponse(response) {
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.indexOf("application/json") !== -1) {
        return response.json();
    }

    if (!response.ok) {
        return Promise.resolve({ error: "Guestbook API unavailable" });
    }

    return response.json().catch(function() {
        return {};
    });
}

function getGuestbookErrorMessage(error) {
    if (!error || !error.message || error.message === "Failed to fetch") {
        return "Guestbook API unavailable";
    }

    return error.message;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(items) {
    const copy = items.slice();

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}

// Terminal commands
function runCommand(rawCommand) {
    const command = rawCommand.toLowerCase().replace(/\s+/g, " ").trim();
    playTimedAssetSound("keyboard", 0.1, 520);
    addLine("SQUINK> " + rawCommand.toUpperCase());

    if (command === "help") {
        addLine("COMMANDS: HELP, VIDEO, VIDEOS, GALLERY, GUESTBOOK, HOME, MOD, MUSIC, ABOUT, FILES, SQUINK, COLOR, WAVE, SPLASH, STATUS, DIR, OPEN README, OPEN SIGNALS, VERSION, SITE, SCAN, GLOW, DANCE, SAVER, RESET, REBOOT, TERMINATE, SHUTDOWN, CLEAR");
    } else if (command === "video") {
        focusWindow("videoWindow");
        addLine("OPENED LATEST_VIDEO.URL.");
    } else if (command === "videos") {
        loadPage("videosPage");
    } else if (command === "gallery") {
        loadPage("galleryPage");
    } else if (command === "guestbook") {
        loadPage("guestbookPage");
    } else if (command === "home") {
        loadPage("homePage");
    } else if (command === "mod") {
        focusWindow("modWindow");
        addLine("OPENED FALLEN_GRACE_MOD_TRACKER.EXE.");
    } else if (command === "music") {
        focusWindow("musicWindow");
        addLine("OPENED MUSIC_PLAYER.EXE.");
    } else if (command === "about") {
        focusWindow("aboutWindow");
        addLine("OPENED ABOUT_THIS_PLACE.TXT.");
    } else if (command === "files" || command === "disk") {
        focusWindow("fileWindow");
        addLine("OPENED LOCAL_DISK_A.DAT.");
    } else if (command === "squink") {
        startRealityWarp();
    } else if (command === "color") {
        cycleTheme();
    } else if (command === "splash") {
        rerollSplash(true);
    } else if (command === "status") {
        printStatus();
    } else if (command === "dir") {
        printDirectory();
    } else if (command === "open readme") {
        focusWindow("fileWindow");
        openFile("README");
    } else if (command === "open signals") {
        focusWindow("fileWindow");
        openFile("SIGNALS");
    } else if (command === "version") {
        addLine("squinkyDOS VERSION " + DOS_VERSION + ".");
    } else if (command === "site") {
        addLine("squinky.dev");
    } else if (command === "scan") {
        runSignalScan();
    } else if (command === "glow") {
        triggerGlowBurst();
    } else if (command === "dance" || command === "party") {
        startDanceParty();
    } else if (command === "saver" || command === "screensaver") {
        addLine("SCREENSAVER ARMED.");
        showScreensaver();
    } else if (command === "wave") {
        borderBoost = 54;
        addLine("WAVE BORDER AMPLIFIER: HIGH.");
        setTimeout(function() {
            borderBoost = 32;
            addLine("WAVE BORDER AMPLIFIER: NORMAL.");
        }, 3000);
    } else if (command === "reset" || command === "reboot") {
        resetOS();
    } else if (command === "terminate" || command === "shutdown") {
        terminateOS();
    } else if (command === "clear") {
        terminalOutput.innerHTML = "";
        addLine("TERMINAL CLEARED.");
    } else {
        playAssetSound("error", 0.2);
        addLine("UNKNOWN COMMAND. TRY HELP.");
    }
}

function printStatus() {
    const theme = themes[themeIndex];
    addLine("squinkyDOS STATUS: RUNNING.");
    addLine("VERSION: " + DOS_VERSION + ".");
    addLine("PALETTE: " + theme.name + ".");
    addLine("MUSIC: " + (isPlaying ? "PLAYING." : "MUTED."));
    addLine("MOD TRACKER: UNDER CONSTRUCTION, 0%.");
}

function printDirectory() {
    addLine("A:/");
    addLine("SYSTEM/");
    addLine("MOD/");
    addLine("VIDEO/");
    addLine("MUSIC/");
    addLine("SIGNALS/");
    addLine("GUESTBOOK.TXT");
    addLine("README.TXT");
}

function runSignalScan() {
    addLine("SCAN STARTED...");
    setTimeout(function() { addLine("A:/SYSTEM OK."); }, 250);
    setTimeout(function() { addLine("A:/SIGNALS GREEN CHANNEL FOUND."); }, 520);
    setTimeout(function() { addLine("A:/MOD UNDER CONSTRUCTION, 0%."); }, 790);
    setTimeout(function() { addLine("SCAN COMPLETE: PERSONAL WEB DISK STABLE."); }, 1080);
}

function triggerGlowBurst() {
    showThemeFlash("GLOW BURST");
    borderBoost = 68;
    document.body.style.filter = "saturate(1.55) brightness(1.14)";
    addLine("GLOW BURST SENT TO DISPLAY.");

    setTimeout(function() {
        borderBoost = 32;
        document.body.style.filter = "";
    }, 1300);
}

function startDanceParty() {
    document.body.classList.add("dance-party");
    borderBoost = 72;
    addLine("DANCE MODE: TEMPORARY.");

    setTimeout(function() {
        document.body.classList.remove("dance-party");
        borderBoost = 32;
        addLine("DANCE MODE COMPLETE.");
    }, 3600);
}

function openFile(fileName) {
    const actions = {
        SYSTEM: function() {
            setFilePreview("SYSTEM/: squinkyDOS core files loaded. CRT filter, audio driver, and terminal hooks are active.");
            addLine("A:/SYSTEM OPENED. CRT FILTER ACTIVE.");
        },
        MOD: function() {
            setFilePreview("MOD/: Fallen Grace tracker found. Status remains under construction at 0%.");
            focusWindow("modWindow");
            addLine("A:/MOD OPENED. TRACKER STATUS: 0%.");
        },
        VIDEO: function() {
            setFilePreview("VIDEO/: latest upload shortcut points to LATEST_VIDEO.URL.");
            focusWindow("videoWindow");
            addLine("A:/VIDEO OPENED. LATEST_VIDEO.URL FOCUSED.");
        },
        MUSIC: function() {
            setFilePreview("MUSIC/: square synth loop and vinyl animation are ready.");
            focusWindow("musicWindow");
            addLine("A:/MUSIC OPENED. MUSIC_PLAYER.EXE FOCUSED.");
        },
        SIGNALS: function() {
            setFilePreview("SIGNALS/: green signal steady. Iterator link unstable, harmless, and slightly warm.");
            addLine("A:/SIGNALS OPENED. GREEN SIGNAL STEADY.");
        },
        GUESTBOOK: function() {
            setFilePreview("GUESTBOOK.TXT: visitor signals are routed through the no-cursing filter before they are saved.");
            loadPage("guestbookPage");
            addLine("GUESTBOOK.TXT OPENED. FILTER STATUS: ACTIVE.");
        },
        README: function() {
            setFilePreview("README.TXT: squinky.dev is a personal web disk for videos, mod notes, music, and experiments.");
            addLine("README.TXT OPENED.");
        }
    };

    if (actions[fileName]) {
        setFilePreview("READING SECTOR " + fileName + "...");
        filePreview.classList.add("reading");

        setTimeout(function() {
            filePreview.classList.remove("reading");
            actions[fileName]();
        }, 420);
    }
}

function setFilePreview(text) {
    filePreview.textContent = text;
}

// Page driver loading
function loadPage(pageId) {
    noteUserActivity();
    hideScreensaver();
    playDriverBootSound();
    playTimedAssetSound("dialup", 0.2, 1800);

    const labels = {
        homePage: "DESKTOP DRIVER",
        videosPage: "VIDEO DRIVER",
        galleryPage: "GALLERY DRIVER",
        guestbookPage: "GUESTBOOK DRIVER"
    };

    driverTitle.textContent = "LOADING " + (labels[pageId] || "PAGE DRIVER");
    driverLine.textContent = "MOUNTING " + pageId.toUpperCase() + "...";
    driverLoader.classList.add("visible");

    setTimeout(function() {
        homePage.classList.toggle("hidden-view", pageId !== "homePage");

        pageViews.forEach(function(page) {
            page.classList.toggle("active", page.id === pageId);
        });

        driverLoader.classList.remove("visible");
        if (pageId === "guestbookPage") loadGuestbook();
        if (pageId === "homePage") {
            resizeBorderCanvas();
            startWaveBorder();
        }
        addLine("PAGE DRIVER LOADED: " + (labels[pageId] || pageId).toUpperCase() + ".");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1120);
}

function showHomeImmediately() {
    homePage.classList.remove("hidden-view");
    pageViews.forEach(function(page) {
        page.classList.remove("active");
    });
    driverLoader.classList.remove("visible");
}

// Window focus and theme controls
function handleWindowAction(windowElement, action) {
    if (!windowElement) return;
    playAssetSound(action === "close" ? "error" : "blip", 0.16);

    if (action === "focus") {
        focusWindow(windowElement.id);
        windowElement.classList.remove("minimized");
        addLine("WINDOW FOCUSED: " + windowElement.id.toUpperCase() + ".");
    } else if (action === "minimize") {
        windowElement.classList.toggle("minimized");
        windowElement.classList.remove("hidden-window");
        windowElement.classList.add("active");
        addLine("WINDOW " + (windowElement.classList.contains("minimized") ? "COLLAPSED" : "EXPANDED") + ": " + windowElement.id.toUpperCase() + ".");
    } else if (action === "close") {
        windowElement.classList.add("hidden-window");
        windowElement.classList.remove("active");
        addLine("WINDOW CLOSED: " + windowElement.id.toUpperCase() + ".");
    }
}

function focusWindow(id) {
    const target = document.getElementById(id);
    if (!target) return;
    document.querySelectorAll(".window").forEach(function(win) { win.classList.remove("active"); });
    target.classList.remove("hidden-window", "minimized");
    target.classList.add("active");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cycleTheme() {
    setTheme((themeIndex + 1) % themes.length, true);
}

function isEmojiWebTheme() {
    return themes[themeIndex] && themes[themeIndex].className === "theme-emoji-web";
}

function setMarqueeHtml(html) {
    marqueeText.innerHTML = html;
    visitorCount = document.getElementById("visitorCount");
    visitorToday = document.getElementById("visitorToday");
    counterMode = document.getElementById("counterMode");
}

function syncThemeCopy() {
    if (isEmojiWebTheme()) {
        subtitle.firstChild.nodeValue = "Welcome to Squinky World, a handmade web planet on squinky.dev.";
        osReadout.textContent = "WELCOME TO SQUINKY WORLD";
        splashReadout.textContent = "WEB PAGE: SPACE SONG LOADED";
        setMarqueeHtml("WELCOME TO SQUINKY WORLD :: REAL VISITS <b id=\"visitorCount\">----</b> :: TODAY <b id=\"visitorToday\">--</b> :: <b id=\"counterMode\">SYNCING</b> :: GIFS :: SPACE SONG :: MOD LINKS :: OLD INTERNET");
        trackTitle.textContent = "Squinky World space song";
        trackDetails.textContent = "sparkle arps / web drums / browser audio";
        musicWindowTitle.textContent = "REAL_AUDIO_SPACE_SONG.RAM";
        musicHeading.textContent = "Web Audio Player";
        startupLogo.textContent = "Squinky World";
        startupSubtitle.textContent = "NETSCAPE PAGE LOADER";
        pressStartText.textContent = "ENTER SQUINKY WORLD";
        terminatedTitle.textContent = "squinky world closed";
        terminatedText.innerHTML = "BROWSER WINDOW CLOSED<br>Thanks for visiting this tiny web planet.";
        screensaverLogo.textContent = "SQUINKY WORLD";
        saverSignalOne.textContent = "PLANET TOUR";
        saverSignalTwo.textContent = "GIF ZONE";
        saverSignalThree.textContent = "SPACE SONG";
        screensaverText.innerHTML = "web screensaver active<br>move / tap / press any key to return";
        document.getElementById("musicButton").innerText = isPlaying ? "STOP SPACE SONG" : "PLAY SPACE SONG";
        document.getElementById("warpButton").innerText = "SURF WARP";
        document.getElementById("colorButton").innerText = "NEXT WEB LOOK";
        document.getElementById("resetButton").innerText = "HOME PAGE";
        document.getElementById("terminateButton").innerText = "CLOSE PAGE";
    } else {
        subtitle.firstChild.nodeValue = "Running squinkyDOS from an old personal web computer.";
        osReadout.textContent = "squinkyDOS VERSION " + DOS_VERSION;
        setMarqueeHtml("squinkyDOS 173484 :: REAL VISITS <b id=\"visitorCount\">----</b> :: TODAY <b id=\"visitorToday\">--</b> :: <b id=\"counterMode\">SYNCING</b> :: VIDEOS :: MOD NOTES :: MUSIC PLAYER :: OLD COMPUTER MODE");
        trackTitle.textContent = "Squinky loop";
        trackDetails.textContent = "square synth / snare / browser audio";
        musicWindowTitle.textContent = "MUSIC_PLAYER.EXE";
        musicHeading.textContent = "Music Player";
        startupLogo.textContent = "squinkyDOS";
        startupSubtitle.textContent = "VERSION " + DOS_VERSION;
        pressStartText.textContent = "BOOT SQUINKYDOS";
        terminatedTitle.textContent = "squinkyDOS terminated";
        terminatedText.innerHTML = "SYSTEM HALTED<br>It is now safe to restart the old computer.";
        screensaverLogo.textContent = "SQUINKY.DEV";
        saverSignalOne.textContent = "SIGNAL FOUND";
        saverSignalTwo.textContent = DOS_VERSION;
        saverSignalThree.textContent = "GREEN CHANNEL";
        screensaverText.innerHTML = "screensaver active<br>move / tap / press any key to return";
        splashReadout.textContent = "SPLASH: " + currentSplash;
        document.getElementById("musicButton").innerText = isPlaying ? "MUTE MUSIC" : "START MUSIC";
        document.getElementById("warpButton").innerText = "SQUINK WARP";
        document.getElementById("colorButton").innerText = "COLOR SHIFT";
        document.getElementById("resetButton").innerText = "RESET OS";
        document.getElementById("terminateButton").innerText = "TERMINATE OS";
    }
}

function setTheme(index, announce) {
    themeIndex = index;
    const theme = themes[themeIndex];
    document.body.classList.remove.apply(document.body.classList, themeClasses);
    if (theme.className) document.body.classList.add(theme.className);
    document.documentElement.style.setProperty("--green", theme.green);
    document.documentElement.style.setProperty("--blue", theme.blue);
    document.documentElement.style.setProperty("--cyan", theme.cyan);
    document.documentElement.style.setProperty("--accent-yellow", theme.yellow);
    document.documentElement.style.setProperty("--wall-a", theme.wallA);
    document.documentElement.style.setProperty("--wall-b", theme.wallB);
    document.documentElement.style.setProperty("--wall-c", theme.wallC);
    themeExtra.textContent = theme.extraText || "";
    document.querySelectorAll("[data-theme-index]").forEach(function(button) {
        button.classList.toggle("active", Number(button.dataset.themeIndex) === themeIndex);
    });
    paletteReadout.textContent = "PALETTE: " + theme.name + " [" + (themeIndex + 1) + "/" + themes.length + "]";
    syncThemeCopy();
    updateDynamicReadouts();
    recordVisitorCount();
    if (announce) {
        playAssetSound("blip", 0.18);
        showThemeFlash(isEmojiWebTheme() ? "ENTERING SQUINKY WORLD" : "COLOR SHIFT: " + theme.name);
        addLine(isEmojiWebTheme() ? "WEB PAGE OPENED: SQUINKY WORLD." : "COLOR SHIFT: " + theme.name + ".");
    }
    document.body.style.filter = "saturate(1.45) brightness(1.08)";
    setTimeout(function() { document.body.style.filter = ""; }, 250);
}

function showThemeFlash(message) {
    themeFlash.textContent = message;
    themeFlash.classList.add("visible");

    setTimeout(function() {
        themeFlash.classList.remove("visible");
    }, 900);
}

// OS lifecycle controls
function resetOS() {
    if (ensureAudio()) playResetSound();
    stopMusic();
    hideScreensaver();
    clearTimeout(systemEventTimer);
    showHomeImmediately();
    document.body.classList.remove("music-playing", "warping");
    terminatedScreen.classList.remove("visible");
    startupScreen.classList.remove("hidden");
    startupScreen.classList.add("visible");
    renderBootLines();
    rerollSplash(false);
    isTerminated = false;
    borderBoost = 32;
    bootTimestamp = Date.now();
    updateDynamicReadouts();
    document.getElementById("musicButton").innerText = isEmojiWebTheme() ? "PLAY SPACE SONG" : "START MUSIC";
    document.getElementById("musicButton2").innerText = "PLAY / MUTE";
    syncThemeCopy();
    terminalOutput.innerHTML = "";
    addLine("RESETTING SQUINKYDOS...");
    addLine("VERSION 173484 WAITING FOR START.");
    resetScreensaverTimer();
}

function terminateOS() {
    if (ensureAudio()) playTerminateSound();
    stopMusic();
    hideScreensaver();
    clearTimeout(screensaverTimer);
    clearTimeout(systemEventTimer);
    showHomeImmediately();
    document.body.classList.remove("music-playing", "warping");
    startupScreen.classList.add("hidden");
    terminatedScreen.classList.add("visible");
    isTerminated = true;
    addLine("TERMINATE REQUEST ACCEPTED.");
    addLine("SQUINKYDOS HALTED.");
}

// Squink Warp effect
function startRealityWarp() {
    clearTimeout(warpTimer);
    if (ensureAudio()) playWarpSound();
    document.body.classList.add("warping");
    borderBoost = 62;
    addLine("SQUINK WARP STARTED.");
    addLine("TIME-WARP AUDIO ACTIVE.");
    addLine("DISPLAY SHIFT ACTIVE.");
    for (let i = 0; i < 8; i++) setTimeout(makeSquinkNote, i * 150);
    warpTimer = setTimeout(function() {
        document.body.classList.remove("warping");
        borderBoost = 32;
        addLine("SQUINK WARP COMPLETE.");
    }, 4200);
}

function makeSquinkNote() {
    const note = document.createElement("div");
    note.className = "squink-note";
    const texts = ["signal", "file", "green", "saved", "sync", "shift", "loop", "time"];
    note.textContent = texts[Math.floor(Math.random() * texts.length)];
    const rect = desktop.getBoundingClientRect();
    note.style.left = Math.floor(Math.random() * Math.max(100, rect.width - 120) + 25) + "px";
    note.style.top = Math.floor(Math.random() * 260 + 90) + "px";
    desktop.appendChild(note);
    setTimeout(function() { note.remove(); }, 1900);
}

// Music player loop
function toggleMusic() {
    if (!ensureAudio()) {
        addLine("AUDIO DRIVER UNAVAILABLE.");
        return;
    }

    if (!isPlaying) {
        startMusic();
        isPlaying = true;
        document.body.classList.add("music-playing");
        document.getElementById("musicButton").innerText = isEmojiWebTheme() ? "STOP SPACE SONG" : "MUTE MUSIC";
        document.getElementById("musicButton2").innerText = "PLAYING";
        addLine(isEmojiWebTheme() ? "SPACE SONG PLAYING ON SQUINKY WORLD." : "MUSIC SYSTEM ONLINE.");
    } else {
        stopMusic();
        isPlaying = false;
        document.body.classList.remove("music-playing");
        document.getElementById("musicButton").innerText = isEmojiWebTheme() ? "PLAY SPACE SONG" : "START MUSIC";
        document.getElementById("musicButton2").innerText = "PLAY / MUTE";
        addLine(isEmojiWebTheme() ? "SPACE SONG STOPPED." : "MUSIC SYSTEM MUTED.");
    }
}

// Audio synthesis
function setupAudio() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextConstructor();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.25;
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
}

function playStartupFanfare() {
    const now = audioCtx.currentTime;
    const melody = [
        { f: 261.63, t: 0.00, d: 0.14 },
        { f: 329.63, t: 0.13, d: 0.14 },
        { f: 392.00, t: 0.26, d: 0.17 },
        { f: 523.25, t: 0.43, d: 0.28 },
        { f: 659.25, t: 0.70, d: 0.32 },
        { f: 783.99, t: 0.95, d: 0.45 }
    ];
    melody.forEach(function(note) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.value = note.f;
        gain.gain.setValueAtTime(0.0001, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.12, now + note.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.02);
    });
    const bass = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bass.type = "triangle";
    bass.frequency.setValueAtTime(65.41, now);
    bass.frequency.setValueAtTime(98.00, now + 0.48);
    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
    bass.connect(bassGain);
    bassGain.connect(masterGain);
    bass.start(now);
    bass.stop(now + 1.4);
}

function playResetSound() {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.value = 440 - i * 55;
        const start = now + i * 0.08;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.09, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.12);
    }
}

function playTerminateSound() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.2);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.3);
}

function playDriverBootSound() {
    if (!ensureAudio()) return;

    const now = audioCtx.currentTime;
    const tones = [
        { f: 130.81, t: 0.00, d: 0.18 },
        { f: 196.00, t: 0.16, d: 0.16 },
        { f: 261.63, t: 0.31, d: 0.18 },
        { f: 392.00, t: 0.50, d: 0.24 }
    ];

    tones.forEach(function(tone) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "square";
        osc.frequency.value = tone.f;
        gain.gain.setValueAtTime(0.0001, now + tone.t);
        gain.gain.exponentialRampToValueAtTime(0.09, now + tone.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + tone.t);
        osc.stop(now + tone.t + tone.d + 0.02);
    });
}

function bounceLetter() {
    const primaryIndex = step % logoLetters.length;
    bounceLogoLetter(primaryIndex, "bounce");

    if (step % 2 === 0) {
        bounceLogoLetter((primaryIndex + 3) % logoLetters.length, "bounce-soft");
    }

    if (step % 4 === 0) {
        bounceLogoLetter((primaryIndex + 7) % logoLetters.length, "bounce-wide");
    }
}

function bounceLogoLetter(index, className) {
    const letter = logoLetters[index];
    if (!letter) return;

    letter.classList.remove("bounce", "bounce-soft", "bounce-wide");
    void letter.offsetWidth;
    letter.classList.add(className);

    setTimeout(function() {
        letter.classList.remove(className);
    }, 220);
}

function playLogoKey(index) {
    if (!ensureAudio()) return;

    const activeNotes = isEmojiWebTheme() ? webNotes : notes;
    const note = activeNotes[index % activeNotes.length];
    playNote(note, 0.16);
    bounceLogoLetter(index, "bounce-wide");

    if (!isPlaying) {
        addLine("LOGO KEY: " + logoLetters[index].textContent + " " + Math.round(note) + "HZ.");
    }
}

function isTypingTarget(target) {
    if (!target) return false;

    const tagName = target.tagName;
    return tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable;
}

function pulseRecord() {
    record.classList.add("beat");
    setTimeout(function() { record.classList.remove("beat"); }, 110);
}

function pulseInterface() {
    document.body.classList.add("music-beat");
    clearTimeout(pulseInterface.timer);
    pulseInterface.timer = setTimeout(function() {
        document.body.classList.remove("music-beat");
    }, 120);
}

function playNote(freq, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.075, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSnare() {
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.24, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    noise.stop(audioCtx.currentTime + 0.12);
}

function playWarpSound() {
    const now = audioCtx.currentTime;
    const lowOsc = audioCtx.createOscillator();
    const lowGain = audioCtx.createGain();
    const lowFilter = audioCtx.createBiquadFilter();
    lowOsc.type = "sawtooth";
    lowOsc.frequency.setValueAtTime(70, now);
    lowOsc.frequency.exponentialRampToValueAtTime(42, now + 1.2);
    lowOsc.frequency.exponentialRampToValueAtTime(88, now + 2.4);
    lowOsc.frequency.exponentialRampToValueAtTime(55, now + 4.0);
    lowFilter.type = "lowpass";
    lowFilter.frequency.setValueAtTime(900, now);
    lowFilter.frequency.exponentialRampToValueAtTime(180, now + 4.0);
    lowGain.gain.setValueAtTime(0.0001, now);
    lowGain.gain.exponentialRampToValueAtTime(0.14, now + 0.15);
    lowGain.gain.setValueAtTime(0.14, now + 2.2);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
    lowOsc.connect(lowFilter);
    lowFilter.connect(lowGain);
    lowGain.connect(masterGain);
    lowOsc.start(now);
    lowOsc.stop(now + 4.3);
}

function startMusic() {
    if (musicTimer) return;
    musicTimer = setInterval(function() {
        const activeNotes = isEmojiWebTheme() ? webNotes : notes;
        const activeDuration = isEmojiWebTheme() ? 0.11 : 0.14;
        playNote(activeNotes[step % activeNotes.length], activeDuration);
        if (isEmojiWebTheme() && step % 4 === 0) {
            playNote(activeNotes[(step + 4) % activeNotes.length] * 2, 0.08);
        }
        bounceLetter();
        pulseRecord();
        pulseInterface();
        if (step % 4 === 2) playSnare();
        step++;
    }, 200);
}

function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
    isPlaying = false;
}

// Wave border visualizer
function resizeBorderCanvas() {
    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const displayWidth = Math.round(rect.width + 68);
    const displayHeight = Math.round(rect.height + 68);

    cachedBorderWidth = Math.round(displayWidth * pixelRatio);
    cachedBorderHeight = Math.round(displayHeight * pixelRatio);
    borderCanvas.width = cachedBorderWidth;
    borderCanvas.height = cachedBorderHeight;
    borderCanvas.style.width = displayWidth + "px";
    borderCanvas.style.height = displayHeight + "px";
    borderCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

window.addEventListener("resize", resizeBorderCanvas);
resizeBorderCanvas();

function startWaveBorder() {
    if (animationFrame || borderTimer) return;
    lastBorderDrawTime = 0;
    scheduleWaveBorder(0);
}

function scheduleWaveBorder(delay) {
    clearTimeout(borderTimer);
    borderTimer = setTimeout(function() {
        borderTimer = null;
        animationFrame = requestAnimationFrame(drawWaveBorder);
    }, delay);
}

function drawWaveLine(startX, startY, endX, endY, outwardX, outwardY, dataArray, offset, force) {
    const points = window.innerWidth <= 820 ? 42 : 72;
    borderCtx.beginPath();
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const baseX = startX + (endX - startX) * t;
        const baseY = startY + (endY - startY) * t;
        const dataIndex = Math.floor((t * dataArray.length + offset) % dataArray.length);
        const audioValue = (dataArray[dataIndex] - 128) / 128;
        const waveAmount = audioValue * force;
        const x = baseX + outwardX * waveAmount;
        const y = baseY + outwardY * waveAmount;
        if (i === 0) borderCtx.moveTo(x, y);
        else borderCtx.lineTo(x, y);
    }
    borderCtx.stroke();
}

function drawWaveBorder() {
    animationFrame = null;

    if (
        document.hidden ||
        isTerminated ||
        !startupScreen.classList.contains("hidden") ||
        homePage.classList.contains("hidden-view")
    ) {
        animationFrame = null;
        return;
    }

    const now = performance.now();
    const targetFrameMs = isPlaying ? 50 : 250;

    if (now - lastBorderDrawTime < targetFrameMs) {
        scheduleWaveBorder(targetFrameMs - (now - lastBorderDrawTime));
        return;
    }

    lastBorderDrawTime = now;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = (cachedBorderWidth || borderCanvas.width) / pixelRatio;
    const height = (cachedBorderHeight || borderCanvas.height) / pixelRatio;
    const padding = 28;
    borderCtx.clearRect(0, 0, width, height);

    if (!analyser || !isPlaying) {
        borderCtx.strokeStyle = "rgba(77,255,223,0.75)";
        borderCtx.lineWidth = 4;
        borderCtx.shadowBlur = 16;
        borderCtx.shadowColor = "#2cff6a";
        borderCtx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
        borderCtx.shadowBlur = 0;
        scheduleWaveBorder(targetFrameMs);
        return;
    }

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    borderCtx.lineWidth = 4;
    borderCtx.strokeStyle = "#4dffdf";
    borderCtx.shadowBlur = document.body.classList.contains("warping") ? 36 : 24;
    borderCtx.shadowColor = "#2cff6a";
    borderCtx.lineCap = "round";
    borderCtx.lineJoin = "round";
    drawWaveLine(padding, padding, width - padding, padding, 0, -1, dataArray, 0, borderBoost);
    drawWaveLine(width - padding, padding, width - padding, height - padding, 1, 0, dataArray, 128, borderBoost);
    drawWaveLine(width - padding, height - padding, padding, height - padding, 0, 1, dataArray, 256, borderBoost);
    drawWaveLine(padding, height - padding, padding, padding, -1, 0, dataArray, 384, borderBoost);
    borderCtx.shadowBlur = 0;
    scheduleWaveBorder(targetFrameMs);
}
