import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "./worker.mjs";

const PORT = 8787;
const dataFile = join(dirname(fileURLToPath(import.meta.url)), ".guestbook-local.json");

const env = {
    GUESTBOOK: {
        async get(key, type) {
            const data = await readStore();
            const value = await readValue(data, key);

            if (type === "json" && value) {
                return JSON.parse(value);
            }

            return value;
        },
        async put(key, value, options = {}) {
            const data = await readStore();
            data[key] = {
                value,
                expiresAt: options.expirationTtl
                    ? Date.now() + options.expirationTtl * 1000
                    : null
            };
            await writeStore(data);
        }
    }
};

http.createServer(async function(req, res) {
    const chunks = [];

    req.on("data", function(chunk) {
        chunks.push(chunk);
    });

    req.on("end", async function() {
        try {
            const body = chunks.length ? Buffer.concat(chunks) : undefined;
            const request = new Request("http://127.0.0.1:" + PORT + req.url, {
                method: req.method,
                headers: req.headers,
                body
            });
            const response = await worker.fetch(request, env);
            const responseBody = Buffer.from(await response.arrayBuffer());

            res.writeHead(response.status, Object.fromEntries(response.headers));
            res.end(responseBody);
        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
}).listen(PORT, function() {
    console.log("squinky guestbook API listening on http://127.0.0.1:" + PORT + "/api/guestbook");
});

async function readStore() {
    try {
        return JSON.parse(await readFile(dataFile, "utf8"));
    } catch (error) {
        return {};
    }
}

async function writeStore(data) {
    await mkdir(dirname(dataFile), { recursive: true });
    await writeFile(dataFile, JSON.stringify(data, null, 2));
}

async function readValue(data, key) {
    const record = data[key];

    if (!record) return null;

    if (typeof record === "object" && Object.prototype.hasOwnProperty.call(record, "value")) {
        if (record.expiresAt && record.expiresAt <= Date.now()) {
            delete data[key];
            await writeStore(data);
            return null;
        }

        return record.value;
    }

    if (key.startsWith("guestbook:rate:")) {
        delete data[key];
        await writeStore(data);
        return null;
    }

    return record;
}
