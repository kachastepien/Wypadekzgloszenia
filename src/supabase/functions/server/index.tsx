import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { processChatRequest } from "./openai_logic.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1ba4d8f6/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Report Endpoints ---

// Create or Update Report
app.post("/make-server-1ba4d8f6/report", async (c) => {
  try {
    const body = await c.req.json();
    if (!body) {
      return c.json({ error: "Missing request body" }, 400);
    }

    // Generate ID if not provided
    const id = body.id || crypto.randomUUID();
    const key = `report:${id}`;

    const dataToStore = {
      ...body,
      id,
      updatedAt: new Date().toISOString(),
      // Preserve creation date if exists, else set new
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await kv.set(key, dataToStore);
    return c.json({ success: true, id, data: dataToStore });
  } catch (err) {
    console.error("Error saving report:", err);
    return c.json({ error: "Failed to save report" }, 500);
  }
});

// Get single report
app.get("/make-server-1ba4d8f6/report/:id", async (c) => {
  const id = c.req.param("id");
  const key = `report:${id}`;
  try {
    const report = await kv.get(key);
    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }
    return c.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

// List all reports
app.get("/make-server-1ba4d8f6/reports", async (c) => {
  try {
    // Returns array of values
    const reports = await kv.getByPrefix("report:");
    return c.json(reports);
  } catch (err) {
    console.error("Error listing reports:", err);
    return c.json({ error: "Failed to list reports" }, 500);
  }
});

// --- Chat Endpoint ---
app.post("/make-server-1ba4d8f6/chat", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.messages) {
      return c.json({ error: "Missing messages in body" }, 400);
    }

    const response = await processChatRequest(body);
    return c.json(response);
  } catch (err) {
    console.error("Error processing chat:", err);
    return c.json({ error: "Failed to process chat request" }, 500);
  }
});

// --- CEIDG Lookup Endpoint ---
app.post("/make-server-1ba4d8f6/ceidg-lookup", async (c) => {
  try {
    const { nip } = await c.req.json();
    if (!nip) {
      return c.json({ error: "NIP is required" }, 400);
    }

    // Remove dashes AND spaces to ensure matching against keys
    const cleanNip = nip.replace(/[^0-9]/g, '');
    let result = null;

    // 1. Check CEIDG API (The Official Source)
    // Requires CEIDG_API_KEY env var
    const ceidgKey = Deno.env.get("CEIDG_API_KEY");
    if (ceidgKey) {
        try {
            console.log(`Querying Official CEIDG API for NIP: ${cleanNip}`);
            const response = await fetch(`https://dane.biznes.gov.pl/api/ceidg/v2/firmy?nip=${cleanNip}`, {
                headers: {
                    "Authorization": `Bearer ${ceidgKey}`,
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.firmy && data.firmy.length > 0) {
                    const firma = data.firmy[0];
                    console.log("CEIDG Data found:", firma.nazwa);
                    
                    // Map main PKD
                    let mainPkd = firma.pkdGlowny || "";
                    
                    // Construct address from CEIDG parts
                    const adr = firma.adresDzialalnosci;
                    const addressStr = adr ? 
                        `${adr.ulica || ''} ${adr.budynek || ''}${adr.lokal ? '/' + adr.lokal : ''}, ${adr.kodPocztowy || ''} ${adr.miasto || ''}`.trim() 
                        : "";

                    result = {
                        name: `${firma.imie || ''} ${firma.nazwisko || ''} ${firma.nazwa || ''}`.trim(),
                        address: addressStr,
                        pkd: mainPkd,
                        pkdDesc: "Dane pobrane z CEIDG" 
                    };
                }
            }
        } catch (e) {
            console.error("CEIDG request failed:", e);
        }
    }

    // 2. Mock DB (Only for specific demo cases)
    if (!result) {
        const mockDB: Record<string, any> = {
            // Tylko prawdziwe firmy do demo
            '7010435677': { name: "CD PROJEKT S.A.", address: "ul. Jagiellońska 74, 03-301 Warszawa", pkd: "58.21.Z", pkdDesc: "Działalność wydawnicza w zakresie gier komputerowych" },
            '5252344078': { name: "SKLEP SPOŻYWCZY \"U BASI\" Barbara Nowak", address: "ul. Wiejska 5, 05-800 Pruszków", pkd: "47.11.Z", pkdDesc: "Sprzedaż detaliczna z przewagą żywności" },
            // Twój przypadek testowy
            '8381709833': { name: "Bartłomiej TOBER", address: "ul. Owocowa 14 lok. 1, 05-800 Pruszków", pkd: "64.99.Z", pkdDesc: "Pozostała finansowa działalność usługowa" }
        };
        result = mockDB[cleanNip];
    }

    // 3. VIES API (EU VAT Registry) - Fallback
    // Provides REAL name and address for VAT payers.
    // It's free, public, and requires no API key.
    if (!result) {
        try {
            console.log(`Checking VIES for NIP: ${cleanNip}`);
            const viesResponse = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/PL/vat/${cleanNip}`);
            if (viesResponse.ok) {
                const viesData = await viesResponse.json();
                if (viesData.isValid && viesData.name) {
                    console.log("VIES Data found:", viesData);
                    
                    // VIES returns valid Name and Address.
                    // It DOES NOT return PKD. We leave PKD empty for manual entry.
                    result = {
                        name: viesData.name,
                        address: viesData.address,
                        pkd: "",     // User must fill this
                        pkdDesc: ""  // User must fill this
                    };
                }
            }
        } catch (e) {
            console.error("VIES lookup failed", e);
        }
    }

    // 4. Fallback: Empty fields if everything failed
    if (!result) {
         console.log(`NIP ${cleanNip} not found. Returning empty fields.`);
         result = {
             name: "", 
             address: "",
             pkd: "",
             pkdDesc: ""
         };
    }

    return c.json(result);

  } catch (err) {
    console.error("Error in CEIDG lookup:", err);
    return c.json({ error: "Failed to lookup company" }, 500);
  }
});

Deno.serve(app.fetch);