const ENTRIES_KEY = "guestbook:entries";
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 32;
const MAX_MESSAGE_LENGTH = 240;
const RATE_LIMIT_SECONDS = 30;

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

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
};

export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const url = new URL(request.url);

        if (url.pathname !== "/api/guestbook") {
            return jsonResponse({ error: "Not found" }, 404);
        }

        if (!env.GUESTBOOK) {
            return jsonResponse({ error: "Guestbook storage is not configured" }, 500);
        }

        if (request.method === "GET") {
            const entries = await readEntries(env);
            return jsonResponse({ entries });
        }

        if (request.method === "POST") {
            return createEntry(request, env);
        }

        return jsonResponse({ error: "Method not allowed" }, 405);
    }
};

async function createEntry(request, env) {
    const clientId = getClientId(request);
    const rateKey = "guestbook:rate:" + clientId;
    const recentPost = await env.GUESTBOOK.get(rateKey);

    if (recentPost) {
        return jsonResponse({ error: "Please wait a moment before signing again" }, 429);
    }

    let body;

    try {
        body = await request.json();
    } catch (error) {
        return jsonResponse({ error: "Bad guestbook packet" }, 400);
    }

    const name = cleanText(body.name || "visitor", MAX_NAME_LENGTH) || "visitor";
    const message = cleanText(body.message || "", MAX_MESSAGE_LENGTH);

    if (message.length < 2) {
        return jsonResponse({ error: "Message too short" }, 400);
    }

    if (hasBlockedWords(name) || hasBlockedWords(message)) {
        return jsonResponse({ error: "Cursing filter tripped" }, 400);
    }

    const entries = await readEntries(env);
    const entry = {
        id: crypto.randomUUID(),
        name,
        message,
        createdAt: new Date().toISOString(),
        approved: true
    };

    entries.unshift(entry);
    await env.GUESTBOOK.put(ENTRIES_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    await env.GUESTBOOK.put(rateKey, "1", { expirationTtl: RATE_LIMIT_SECONDS });

    return jsonResponse({ entry }, 201);
}

async function readEntries(env) {
    const stored = await env.GUESTBOOK.get(ENTRIES_KEY, "json");

    if (!Array.isArray(stored)) {
        return [];
    }

    return stored
        .filter(function(entry) {
            return entry && entry.approved === true;
        })
        .slice(0, MAX_ENTRIES)
        .map(function(entry) {
            return {
                id: String(entry.id || ""),
                name: String(entry.name || "visitor"),
                message: String(entry.message || ""),
                createdAt: String(entry.createdAt || "")
            };
        });
}

function cleanText(value, maxLength) {
    return String(value)
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength);
}

function hasBlockedWords(text) {
    const normalized = text.toLowerCase();

    return blockedWords.some(function(word) {
        return new RegExp("(^|[^a-z])" + word + "([^a-z]|$)", "i").test(normalized);
    });
}

function getClientId(request) {
    return request.headers.get("CF-Connecting-IP")
        || request.headers.get("x-forwarded-for")
        || "local";
}

function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}
