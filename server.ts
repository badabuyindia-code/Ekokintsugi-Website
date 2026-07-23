import express, { type Request, type Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import dns from "dns";

dotenv.config();

// Globally override dns.lookup to strictly force IPv4 and prevent outbound IPv6 connection failures (e.g. ENETUNREACH)
const originalDnsLookup = dns.lookup;
// @ts-ignore
dns.lookup = function (hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const actualOptions = typeof options === "object" ? options : {};
  return originalDnsLookup(hostname, { ...actualOptions, family: 4 }, callback);
};

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Supabase (Server-side)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// --- DUAL-ENGINE EMAIL NOTIFICATION SYSTEM ---
// Shared target: the email address that receives the notifications
const sellerEmailAddress = process.env.SELLER_EMAIL || "admin@ekokintsugi.com";

// Engine A: Resend API Configuration (Primary for free hosting tiers)
const resendApiKey = process.env.RESEND_API_KEY || "";
const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes("your-resend-key"));
const emailSenderAddress = "EkoKintsugi <onboarding@resend.dev>";

// Engine B: Gmail SMTP Transporter (Fallback/Alternative for paid tiers/local testing)
const gmailUser = process.env.GMAIL_USER || "";
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "";
const isGmailConfigured = Boolean(gmailUser && gmailAppPassword && !gmailUser.includes("your-sender"));

const mailTransporter = isGmailConfigured
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Set to false for port 587 (upgrades automatically via STARTTLS)
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      lookup: (hostname, options, callback) => {
        const actualCallback = typeof options === "function" ? options : callback;
        const actualOptions = typeof options === "object" ? options : {};
        dns.lookup(hostname, { ...actualOptions, family: 4 }, actualCallback);
      }
    } as any)
  : null;

// Helper to coordinate dispatch with fallbacks
async function sendNotificationEmail(
  subject: string, 
  plainTextBody: string, 
  htmlBody: string, 
  replyTo?: string
): Promise<{ success: boolean; method: "Resend API" | "Gmail SMTP" | "Local Simulation"; error?: string }> {
  
  // 1. Try Resend Primary
  if (isResendConfigured) {
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: emailSenderAddress,
          to: sellerEmailAddress,
          replyTo: replyTo,
          subject: subject,
          text: plainTextBody,
          html: htmlBody
        })
      });

      if (resendResponse.ok) {
        return { success: true, method: "Resend API" };
      }
      
      const errorData: any = await resendResponse.json();
      console.warn(`⚠️ Resend dispatch failed (status ${resendResponse.status}): ${errorData.message || "Unknown error"}. Trying Gmail SMTP fallback...`);
    } catch (err: any) {
      console.warn(`⚠️ Resend dispatch failed: ${err.message}. Trying Gmail SMTP fallback...`);
    }
  }

  // 2. Try Gmail SMTP Fallback
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"EkoKintsugi" <${gmailUser}>`,
        to: sellerEmailAddress,
        replyTo: replyTo,
        subject: subject,
        text: plainTextBody,
        html: htmlBody
      });
      return { success: true, method: "Gmail SMTP" };
    } catch (err: any) {
      console.error(`❌ Gmail SMTP fallback failed: ${err.message}`);
      return { success: false, method: "Gmail SMTP", error: err.message };
    }
  }

  // 3. Both unconfigured or failed, return simulation state
  return { success: false, method: "Local Simulation", error: "No email dispatch service is configured or all configured services failed." };
}



// Persistent Local Database Fallback (for Guest and Local-mode visits)
const DB_FILE_PATH = path.join(process.cwd(), "server_db.json");

interface LocalDbSchema {
  orders: Array<{
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    total_price: number;
    size?: string;
    created_at: string;
  }>;
  esg_records: Array<{
    id: string;
    order_id: string;
    user_id: string;
    co2_saved_kg: number;
    waste_diverted_kg: number;
    tree_id: string | null;
    created_at: string;
  }>;
  trees: Array<{
    id: string;
    user_id: string;
    location: string;
    status: "seed" | "sapling" | "grown";
    planted_at: string;
  }>;
  carbon_ledger: Array<{
    id: string;
    user_id: string;
    credits_earned: number;
    credits_used: number;
    source_order_id: string;
    created_at: string;
  }>;
}

function loadLocalDb(): LocalDbSchema {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialDb: LocalDbSchema = {
      orders: [],
      esg_records: [],
      trees: [],
      carbon_ledger: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { orders: [], esg_records: [], trees: [], carbon_ledger: [] };
  }
}

function saveLocalDb(data: LocalDbSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write persistent local DB:", err);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.use(cors());
app.use(express.json());

type ImpactRecord = {
  id: string;
  created_at: string;
  co2_saved_kg: number;
  waste_diverted_kg: number;
  tree_id: string | null;
};

type ImpactStats = {
  totalCo2: number;
  totalWaste: number;
  treeCount: number;
  credits: number;
  records: ImpactRecord[];
};

const emptyStats: ImpactStats = {
  totalCo2: 0,
  totalWaste: 0,
  treeCount: 0,
  credits: 0,
  records: []
};

const demoRecords: ImpactRecord[] = [
  { id: "mock-record-1", created_at: "2026-04-18T09:00:00.000Z", co2_saved_kg: 7.6, waste_diverted_kg: 2.3, tree_id: "tree-1" },
  { id: "mock-record-2", created_at: "2026-04-15T09:00:00.000Z", co2_saved_kg: 5.9, waste_diverted_kg: 1.9, tree_id: null },
  { id: "mock-record-3", created_at: "2026-04-12T09:00:00.000Z", co2_saved_kg: 8.2, waste_diverted_kg: 2.8, tree_id: "tree-2" },
  { id: "mock-record-4", created_at: "2026-04-09T09:00:00.000Z", co2_saved_kg: 6.4, waste_diverted_kg: 2.1, tree_id: null },
  { id: "mock-record-5", created_at: "2026-04-06T09:00:00.000Z", co2_saved_kg: 9.1, waste_diverted_kg: 3.0, tree_id: "tree-3" }
];

const demoStats: ImpactStats = {
  totalCo2: demoRecords.reduce((sum, record) => sum + record.co2_saved_kg, 0),
  totalWaste: demoRecords.reduce((sum, record) => sum + record.waste_diverted_kg, 0),
  treeCount: demoRecords.filter((record) => Boolean(record.tree_id)).length,
  credits: demoRecords.reduce((sum, record) => sum + record.co2_saved_kg, 0) / 10,
  records: demoRecords
};

const loggedNotices = new Set<string>();

function logNoticeOnce(key: string, message: string) {
  if (loggedNotices.has(key)) return;
  loggedNotices.add(key);
  console.log(message);
}

function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;

  const normalizedMessage = JSON.stringify(error).toLowerCase();

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    normalizedMessage.includes("schema cache") ||
    normalizedMessage.includes("could not find the table") ||
    normalizedMessage.includes("relation") && normalizedMessage.includes("does not exist") ||
    normalizedMessage.includes("esg_records")
  );
}

function getAccessToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

async function getAuthenticatedUserId(req: Request) {
  const customMockId = req.headers["x-mock-user-id"] as string;
  if (customMockId) return customMockId;

  if (!supabase) return "00000000-0000-0000-0000-000000000000";

  const accessToken = getAccessToken(req);
  if (!accessToken) return "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return "00000000-0000-0000-0000-000000000000";

  return data.user.id;
}

async function getImpactStatsForUser(userId: string): Promise<ImpactStats> {
  const localDb = loadLocalDb();
  const localRecords = localDb.esg_records.filter(r => r.user_id === userId);
  const localLedger = localDb.carbon_ledger.filter(l => l.user_id === userId);
  const localTrees = localDb.trees.filter(t => t.user_id === userId);

  let dbRecords: any[] = [];
  let dbLedger: any[] = [];
  let dbTreesCount = 0;

  if (supabase) {
    try {
      const [{ data: records }, { data: ledger }, { data: trees }] = await Promise.all([
        supabase.from("esg_records").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("carbon_ledger").select("credits_earned, credits_used").eq("user_id", userId),
        supabase.from("trees").select("id").eq("user_id", userId)
      ]);
      dbRecords = Array.isArray(records) ? records : [];
      dbLedger = Array.isArray(ledger) ? ledger : [];
      dbTreesCount = Array.isArray(trees) ? trees.length : 0;
    } catch {
      // Offline fallback silent skip
    }
  }

  const allRecords = [
    ...localRecords,
    ...dbRecords.map(r => ({
      id: r.id,
      created_at: r.created_at,
      co2_saved_kg: Number(r.co2_saved_kg || 0),
      waste_diverted_kg: Number(r.waste_diverted_kg || 0),
      tree_id: r.tree_id
    }))
  ];

  allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalEarned = localLedger.reduce((sum, entry) => sum + Number(entry.credits_earned || 0), 0) +
                      dbLedger.reduce((sum, entry) => sum + Number(entry.credits_earned || 0), 0);
  const totalUsed = localLedger.reduce((sum, entry) => sum + Number(entry.credits_used || 0), 0) +
                    dbLedger.reduce((sum, entry) => sum + Number(entry.credits_used || 0), 0);
  
  const creditsBalance = Math.max(0, totalEarned - totalUsed);

  return {
    totalCo2: allRecords.reduce((sum, r) => sum + r.co2_saved_kg, 0),
    totalWaste: allRecords.reduce((sum, r) => sum + r.waste_diverted_kg, 0),
    treeCount: localTrees.length + dbTreesCount,
    credits: creditsBalance,
    records: allRecords,
    trees: [
      ...localTrees.map(t => ({ id: t.id, location: t.location, status: t.status, planted_at: t.planted_at }))
    ]
  } as any;
}

// API Routes: Production ESG Engine
// Create Order & Impact Logic
app.post("/api/orders/create", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured on the server yet." });
  }

  const authenticatedUserId = await getAuthenticatedUserId(req);
  const { productId, quantity, size } = req.body ?? {};

  if (!authenticatedUserId) {
    return res.status(401).json({ error: "Please sign in to create an order." });
  }

  const normalizedQuantity = Number(quantity);
  if (!productId || !Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    return res.status(400).json({ error: "A valid product and quantity are required." });
  }

  try {
    // 1. Get Product CO2 Factors
    const { data: product, error: pError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (pError || !product) throw new Error("Product not found");

    const totalPrice = Number(product.base_price) * normalizedQuantity;
    const co2Saved = Number(product.co2_factor) * normalizedQuantity;
    const wasteDiverted = Number(product.waste_factor) * normalizedQuantity;
    const selectedSize = size || "One Size";

    // 2. Create Order
    const { data: order, error: oError } = await supabase
      .from("orders")
      .insert({
        user_id: authenticatedUserId,
        product_id: productId,
        quantity: normalizedQuantity,
        total_price: totalPrice,
        size: selectedSize
      })
      .select()
      .single();

    if (oError) throw oError;

    // 3. Assign Tree
    const { data: tree, error: tError } = await supabase
      .from("trees")
      .insert({
        user_id: authenticatedUserId,
        location: "Agra Reforest Zone B-12",
        status: "seed"
      })
      .select()
      .single();

    if (tError) throw tError;

    // 4. Record ESG Impact
    const { error: eError } = await supabase
      .from("esg_records")
      .insert({
        order_id: order.id,
        user_id: authenticatedUserId,
        co2_saved_kg: co2Saved,
        waste_diverted_kg: wasteDiverted,
        tree_id: tree.id
      });

    if (eError) throw eError;

    // 5. Update Carbon Ledger (1 credit = 1000kg)
    const creditsEarned = co2Saved / 1000;
    const { error: lError } = await supabase
      .from("carbon_ledger")
      .insert({
        user_id: authenticatedUserId,
        credits_earned: creditsEarned,
        source_order_id: order.id
      });

    if (lError) throw lError;

    res.json({ success: true, orderId: order.id, impact: { co2Saved, creditsEarned } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real-Time Email Order Checkout & Carbon Discount Engine
app.post("/api/orders/checkout", async (req, res) => {
  const authenticatedUserId = await getAuthenticatedUserId(req);
  const { items, shippingDetails, appliedCredits } = req.body ?? {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your circular selection is empty." });
  }

  if (!shippingDetails || !shippingDetails.name || !shippingDetails.email || !shippingDetails.address) {
    return res.status(400).json({ error: "Delivery name, email, and shipping address are required." });
  }

  try {
    const localDb = loadLocalDb();
    const orderIds: string[] = [];
    let totalCo2Saved = 0;
    let totalWasteReclaimed = 0;
    let firstDbOrderId: string | undefined;

    for (const item of items) {
      const prod = item.product;
      const qty = item.quantity;
      const selectedSize = item.selectedSize || "One Size";
      const co2Val = Number(prod.co2_factor || 0) * qty;
      const wasteVal = Number(prod.waste_factor || 0) * qty;

      totalCo2Saved += co2Val;
      totalWasteReclaimed += wasteVal;

      const orderId = `ord-${Math.random().toString(36).substring(2, 11)}`;
      orderIds.push(orderId);

      // Create Order
      const newOrder = {
        id: orderId,
        user_id: authenticatedUserId,
        product_id: String(prod.id),
        quantity: qty,
        total_price: Number(prod.base_price || 0) * qty,
        size: selectedSize,
        created_at: new Date().toISOString()
      };
      localDb.orders.push(newOrder);

      // Create ESG Record
      const newEsg = {
        id: `esg-${Math.random().toString(36).substring(2, 11)}`,
        order_id: orderId,
        user_id: authenticatedUserId,
        co2_saved_kg: co2Val,
        waste_diverted_kg: wasteVal,
        tree_id: null as string | null,
        created_at: new Date().toISOString()
      };

      // Assign trees dynamically
      for (let t = 0; t < Math.ceil(qty); t++) {
        const treeId = `tree-${Math.random().toString(36).substring(2, 11)}`;
        const treeZone = `Agra Bio-Site Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 20) + 1}`;
        const newTree = {
          id: treeId,
          user_id: authenticatedUserId,
          location: treeZone,
          status: "seed" as const,
          planted_at: new Date().toISOString()
        };
        localDb.trees.push(newTree);
        newEsg.tree_id = treeId;
      }

      localDb.esg_records.push(newEsg);

      // Supabase Parallel Sync
      if (supabase) {
        try {
          const { data: dbOrder } = await supabase.from("orders").insert({
            user_id: authenticatedUserId,
            product_id: prod.id,
            quantity: qty,
            total_price: Number(prod.base_price || 0) * qty,
            size: selectedSize
          }).select().single();

          if (dbOrder) {
            if (!firstDbOrderId) {
              firstDbOrderId = dbOrder.id;
            }

            const { data: dbTree } = await supabase.from("trees").insert({
              user_id: authenticatedUserId,
              location: "Agra Reforest Zone B-12",
              status: "seed"
            }).select().single();

            await supabase.from("esg_records").insert({
              order_id: dbOrder.id,
              user_id: authenticatedUserId,
              co2_saved_kg: co2Val,
              waste_diverted_kg: wasteVal,
              tree_id: dbTree?.id
            });
          }
        } catch {
          // silent bypass
        }
      }
    }

    // Update carbon ledger
    const creditsEarned = parseFloat(totalCo2Saved.toFixed(3));
    localDb.carbon_ledger.push({
      id: `led-earn-${Math.random().toString(36).substring(2, 11)}`,
      user_id: authenticatedUserId,
      credits_earned: creditsEarned,
      credits_used: 0,
      source_order_id: orderIds[0],
      created_at: new Date().toISOString()
    });

    const creditsToDeduct = Number(appliedCredits || 0);
    if (creditsToDeduct > 0) {
      localDb.carbon_ledger.push({
        id: `led-use-${Math.random().toString(36).substring(2, 11)}`,
        user_id: authenticatedUserId,
        credits_earned: 0,
        credits_used: creditsToDeduct,
        source_order_id: orderIds[0],
        created_at: new Date().toISOString()
      });
    }

    saveLocalDb(localDb);

    // Supabase Parallel Sync for Carbon Ledger
    if (supabase) {
      try {
        await supabase.from("carbon_ledger").insert({
          user_id: authenticatedUserId,
          credits_earned: creditsEarned,
          credits_used: 0,
          source_order_id: firstDbOrderId || null
        });

        if (creditsToDeduct > 0) {
          await supabase.from("carbon_ledger").insert({
            user_id: authenticatedUserId,
            credits_earned: 0,
            credits_used: creditsToDeduct,
            source_order_id: firstDbOrderId || null
          });
        }
      } catch {
        // silent bypass
      }
    }

    // ─── Email Dispatch ─────────────────────────────────────────────
    const senderAddr = emailSenderAddress;
    const recipientAddr = sellerEmailAddress;
    const timestamp = new Date().toLocaleString();
    const trackingNumber = `EK-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemsSummaryList = items
      .map(item => `• ${item.product.name} (Size: ${item.selectedSize || "One Size"}) (Qty: ${item.quantity}) - Category: ${item.product.category || "General"}`)
      .join("\n");

    const itemsHtmlList = items
      .map(item => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-family:monospace">${item.product.name} <span style="font-size:11px;color:#888">(Size: ${item.selectedSize || "One Size"})</span></td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5">${item.product.category || "General"}</td></tr>`)
      .join("");

    const plainTextBody = `
======================================================================
NEW CIRCULAR ORDER DISPATCH REQUEST
======================================================================
DATE/TIME: ${timestamp}
ORDER REF : ${orderIds.join(", ")}
TRACKING  : ${trackingNumber}

CLIENT INFORMATION:
-------------------
Name   : ${shippingDetails.name}
Email  : ${shippingDetails.email}
Address: ${shippingDetails.address}
Notes  : ${shippingDetails.notes || "None"}

ORDER SELECTION:
----------------
${itemsSummaryList}

ENVIRONMENTAL DIVIDEND:
-----------------------
• CO2 Diverted  : ${totalCo2Saved.toFixed(1)} kg
• Waste Reclaimed: ${totalWasteReclaimed.toFixed(1)} kg
• Saplings Allocated in Agra: ${Math.ceil(totalCo2Saved / 2)} sapling(s)
• Applied Carbon Discount: ${creditsToDeduct.toFixed(3)} CC

----------------------------------------------------------------------
This order request has been generated dynamically by the EkoKintsugi app.
======================================================================
`;

    const htmlBody = `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf9f7;border:2px solid #1B4332;border-radius:16px;overflow:hidden">
  <div style="background:#1B4332;padding:24px 32px;text-align:center">
    <h1 style="color:#C5A880;font-size:14px;letter-spacing:4px;text-transform:uppercase;margin:0">New Circular Order</h1>
    <p style="color:#fff;font-size:22px;font-family:Georgia,serif;margin:8px 0 0">${trackingNumber}</p>
  </div>

  <div style="padding:28px 32px">
    <h2 style="font-size:13px;color:#C5A880;letter-spacing:3px;text-transform:uppercase;border-bottom:1px solid #e5e5e5;padding-bottom:8px">Client Details</h2>
    <table style="width:100%;font-size:14px;color:#333;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#888;width:80px">Name</td><td style="padding:6px 0;font-weight:600">${shippingDetails.name}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${shippingDetails.email}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Address</td><td style="padding:6px 0">${shippingDetails.address}</td></tr>
      ${shippingDetails.notes ? `<tr><td style="padding:6px 0;color:#888">Notes</td><td style="padding:6px 0;font-style:italic">${shippingDetails.notes}</td></tr>` : ""}
    </table>

    <h2 style="font-size:13px;color:#C5A880;letter-spacing:3px;text-transform:uppercase;border-bottom:1px solid #e5e5e5;padding-bottom:8px">Order Items</h2>
    <table style="width:100%;font-size:14px;color:#333;margin-bottom:24px;border-collapse:collapse">
      <thead><tr style="background:#f0efe9"><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Product</th><th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Qty</th><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Category</th></tr></thead>
      <tbody>${itemsHtmlList}</tbody>
    </table>

    <h2 style="font-size:13px;color:#C5A880;letter-spacing:3px;text-transform:uppercase;border-bottom:1px solid #e5e5e5;padding-bottom:8px">Environmental Impact</h2>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px">
      <div style="flex:1;min-width:120px;background:#1B4332;color:#fff;padding:16px;border-radius:12px;text-align:center">
        <div style="font-size:24px;font-weight:800;font-family:Georgia,serif">${totalCo2Saved.toFixed(1)}</div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C5A880;margin-top:4px">KG CO2 SAVED</div>
      </div>
      <div style="flex:1;min-width:120px;background:#1B4332;color:#fff;padding:16px;border-radius:12px;text-align:center">
        <div style="font-size:24px;font-weight:800;font-family:Georgia,serif">${totalWasteReclaimed.toFixed(1)}</div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C5A880;margin-top:4px">KG WASTE DIVERTED</div>
      </div>
      <div style="flex:1;min-width:120px;background:#C5A880;color:#1B4332;padding:16px;border-radius:12px;text-align:center">
        <div style="font-size:24px;font-weight:800;font-family:Georgia,serif">${Math.ceil(totalCo2Saved / 2)}</div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">TREES PLANTED</div>
      </div>
    </div>
    ${creditsToDeduct > 0 ? `<p style="font-size:12px;color:#888;font-style:italic">Carbon discount applied: ${creditsToDeduct.toFixed(3)} CC</p>` : ""}
  </div>

  <div style="background:#1B4332;padding:16px 32px;text-align:center">
    <p style="color:#C5A880;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0">EkoKintsugi Circular Economy Platform</p>
  </div>
</div>
`;

    const isHostedInProduction = Boolean(process.env.RENDER || process.env.RAILWAY_STATIC_URL || process.env.NODE_ENV === "production");

    let emailSent = false;
    let dispatchMethod: "Resend API" | "Gmail SMTP" | "Local Simulation" = "Local Simulation";
    let dispatchError: string | undefined;

    if (isResendConfigured || mailTransporter) {
      const result = await sendNotificationEmail(
        `🌿 New Circular Order [${trackingNumber}] — ${shippingDetails.name}`,
        plainTextBody,
        htmlBody
      );
      emailSent = result.success;
      dispatchMethod = result.method;
      dispatchError = result.error;

      if (emailSent) {
        console.log(`✅ Order email successfully sent via ${dispatchMethod} to ${recipientAddr}`);
      } else {
        console.error(`❌ Order recorded locally, but email dispatch failed via all configured channels.`);
      }
    }

    if (!emailSent) {
      if (isHostedInProduction) {
        console.warn(`⚠️ Checkout completed but email dispatch failed: ${dispatchError || "No email provider configured."}`);
        if (isResendConfigured || mailTransporter) {
          return res.status(500).json({
            error: `Order recorded locally, but email dispatch failed: ${dispatchError || "All configured services failed to send"}. Please verify your credentials.`
          });
        } else {
          return res.status(503).json({
            error: "No email service (Resend or Gmail SMTP) is configured in production settings."
          });
        }
      } else {
        // Local fallback: print styled box to terminal
        const terminalEmailBox = `
┌─────────────────────────── EMAIL OUTBOX ───────────────────────────┐
│ FROM: ${senderAddr.padEnd(52)} │
│ TO: ${recipientAddr.padEnd(54)} │
│ SUBJECT: New Circular Dispatch Request [${orderIds[0]}]            │
├────────────────────────────────────────────────────────────────────┤
${plainTextBody.split("\n").map(line => `│ ${line.padEnd(66)} │`).join("\n")}
└────────────────────────────────────────────────────────────────────┘
`;
        console.log(terminalEmailBox);
      }
    }

    // Always log to file for audit trail
    const outboxLogPath = path.join(process.cwd(), "email_outbox_logs.txt");
    const formattedLog = `\n--- ${emailSent ? "EMAIL SENT" : "OUTBOX LOG"} [${timestamp}] ---\nFROM: ${senderAddr}\nTO: ${recipientAddr}\nVIA: ${dispatchMethod}\n${plainTextBody}\n`;
    fs.appendFileSync(outboxLogPath, formattedLog, "utf8");

    res.json({
      success: true,
      trackingNumber,
      co2Saved: totalCo2Saved,
      wasteReclaimed: totalWasteReclaimed,
      treesPlanted: Math.ceil(totalCo2Saved / 2),
      creditsEarned
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/contact/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Please complete all contact form fields." });
    }

    if (!isResendConfigured && !mailTransporter) {
      return res.status(503).json({ error: "Email service is not configured." });
    }

    const submittedAt = new Date().toLocaleString();
    const safeName = String(name).trim();
    const safeEmail = String(email).trim();
    const safeSubject = String(subject).trim();
    const safeMessage = String(message).trim();
    const htmlName = escapeHtml(safeName);
    const htmlEmail = escapeHtml(safeEmail);
    const htmlSubject = escapeHtml(safeSubject);
    const htmlMessage = escapeHtml(safeMessage);

    const plainTextBody = `
======================================================================
NEW EKOKINTSUGI CONTACT INQUIRY
======================================================================
DATE/TIME: ${submittedAt}

CONTACT INFORMATION:
--------------------
Name   : ${safeName}
Email  : ${safeEmail}
Subject: ${safeSubject}

MESSAGE:
--------
${safeMessage}

======================================================================
`;

    const htmlBody = `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf9f7;border:2px solid #1B4332;border-radius:16px;overflow:hidden">
  <div style="background:#1B4332;padding:24px 32px;text-align:center">
    <h1 style="color:#C5A880;font-size:14px;letter-spacing:4px;text-transform:uppercase;margin:0">New Contact Inquiry</h1>
    <p style="color:#fff;font-size:20px;font-family:Georgia,serif;margin:8px 0 0">${htmlSubject}</p>
  </div>
  <div style="padding:28px 32px;color:#333">
    <h2 style="font-size:13px;color:#C5A880;letter-spacing:3px;text-transform:uppercase;border-bottom:1px solid #e5e5e5;padding-bottom:8px">Contact Details</h2>
    <table style="width:100%;font-size:14px;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#888;width:80px">Name</td><td style="padding:6px 0;font-weight:600">${htmlName}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${htmlEmail}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Subject</td><td style="padding:6px 0">${htmlSubject}</td></tr>
    </table>
    <h2 style="font-size:13px;color:#C5A880;letter-spacing:3px;text-transform:uppercase;border-bottom:1px solid #e5e5e5;padding-bottom:8px">Message</h2>
    <p style="white-space:pre-wrap;font-size:15px;line-height:1.7">${htmlMessage}</p>
  </div>
  <div style="background:#1B4332;padding:16px 32px;text-align:center">
    <p style="color:#C5A880;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0">EkoKintsugi Contact Form</p>
  </div>
</div>
`;

    const result = await sendNotificationEmail(
      `New Contact Inquiry - ${safeSubject}`,
      plainTextBody,
      htmlBody,
      safeEmail
    );

    if (!result.success) {
      throw new Error(result.error || "All configured email services failed to send");
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(`Contact email send failed: ${error.message}`);
    res.status(500).json({ error: "Unable to send your message right now." });
  }
});

async function handleImpactRequest(req: Request, res: Response) {
  const useDemoFallback = req.query.demo === "true";
  const authenticatedUserId = await getAuthenticatedUserId(req);
  const requestedUserId = req.params.userId;

  try {
    if (!authenticatedUserId) {
      return res.json(useDemoFallback ? demoStats : emptyStats);
    }

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({ error: "You can only view your own impact data." });
    }

    const stats = await getImpactStatsForUser(authenticatedUserId);
    return res.json(stats);
  } catch (error: any) {
    if (isMissingTableError(error)) {
      logNoticeOnce("missing-impact-tables", "Notice: Supabase impact tables are not set up yet. Falling back to demo or empty dashboard data.");
      return res.json(useDemoFallback ? demoStats : emptyStats);
    }

    if (useDemoFallback) {
      return res.json(demoStats);
    }

    console.error("Impact API error:", error.message);
    return res.json(emptyStats);
  }
}

// Fetch Comprehensive Impact Stats
app.get("/api/impact", handleImpactRequest);
app.get("/api/impact/:userId", handleImpactRequest);

// Fetch All User Orders (Local Fallback & Supabase Enriched)
app.get("/api/orders", async (req, res) => {
  const authenticatedUserId = await getAuthenticatedUserId(req);
  if (!authenticatedUserId) {
    return res.status(401).json({ error: "Please sign in to view your orders." });
  }

  try {
    const localDb = loadLocalDb();
    const userOrders = localDb.orders.filter(o => o.user_id === authenticatedUserId);

    let dbOrders: any[] = [];
    if (supabase) {
      try {
        const { data } = await supabase
          .from("orders")
          .select("*, products(*)")
          .eq("user_id", authenticatedUserId)
          .order("created_at", { ascending: false });
        dbOrders = data || [];
      } catch {
        // silent bypass
      }
    }

    // Enrich local orders with product info from sampleProducts
    const enrichedLocalOrders = userOrders.map(order => {
      const product = sampleProducts.find(p => p.name === order.product_id || p.name.toLowerCase().replace(/\s+/g, "-") === order.product_id);
      return {
        id: order.id,
        user_id: order.user_id,
        product_id: order.product_id,
        quantity: order.quantity,
        total_price: order.total_price,
        created_at: order.created_at,
        size: order.size,
        product: product || { name: "Circular Product", base_price: order.total_price / order.quantity }
      };
    });

    // Format DB orders to match enriched structure
    const formattedDbOrders = dbOrders.map(order => ({
      id: order.id,
      user_id: order.user_id,
      product_id: order.product_id,
      quantity: order.quantity,
      total_price: order.total_price,
      created_at: order.created_at,
      size: order.size,
      product: order.products || { name: "Circular Product", base_price: order.total_price / order.quantity }
    }));

    // Merge both and sort by newest first
    const allOrders = [...enrichedLocalOrders, ...formattedDbOrders];
    allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(allOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Data Endpoint (Utility)
app.post("/api/admin/seed", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured on the server yet." });
  }

  const userId = "00000000-0000-0000-0000-000000000000";
  
  try {
    // 1. Get a product ID
    const { data: product } = await supabase.from("products").select("id").limit(1).single();
    if (!product) throw new Error("Please run the SQL schema first to add products.");

    // 2. Generate 10 entries
    for (let i = 0; i < 10; i++) {
      const co2 = (Math.random() * 10 + 2).toFixed(1);
      const waste = (Math.random() * 5 + 1).toFixed(1);
      
      // Create Order
      const { data: order } = await supabase.from("orders").insert({
        user_id: userId,
        product_id: product.id,
        quantity: 1,
        total_price: 5000
      }).select().single();

      if (order) {
        // Create Tree
        const { data: tree } = await supabase.from("trees").insert({
          user_id: userId,
          location: `Agra Zone ${String.fromCharCode(65 + i)}-${i}`,
          status: i > 5 ? "sapling" : "seed"
        }).select().single();

        // Create ESG Record
        await supabase.from("esg_records").insert({
          order_id: order.id,
          user_id: userId,
          co2_saved_kg: parseFloat(co2),
          waste_diverted_kg: parseFloat(waste),
          tree_id: tree?.id
        });

        // Update Ledger
        await supabase.from("carbon_ledger").insert({
          user_id: userId,
          credits_earned: parseFloat(co2) / 1000,
          source_order_id: order.id
        });
      }
    }

    res.json({ success: true, message: "10 impact records seeded for dummy user." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const sampleProducts = [
  // 1. Belts
  { name: "Classic Patchwork Belt", category: "Belts", description: "Premium circular leather belt crafted from dark oak mosaic strips.", base_price: 48, co2_factor: 1.2, waste_factor: 0.15, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/1.png" },
  { name: "Agra Weave Belt", category: "Belts", description: "Interwoven light tan and chestnut reclaimed leather fibers.", base_price: 54, co2_factor: 1.4, waste_factor: 0.18, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/2.png" },
  { name: "Sienna Edge Belt", category: "Belts", description: "Fine hand-finished stitching with double-ring zero-waste buckle.", base_price: 52, co2_factor: 1.3, waste_factor: 0.16, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/3.png" },
  { name: "Forest Mosaic Belt", category: "Belts", description: "Unique moss green and deep tan patchwork detailing.", base_price: 56, co2_factor: 1.5, waste_factor: 0.19, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/4.png" },
  { name: "Slate Utility Belt", category: "Belts", description: "Minimalist black and charcoal reclaimed leather strap.", base_price: 46, co2_factor: 1.1, waste_factor: 0.14, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/5.png" },
  { name: "Carbon Zero Belt", category: "Belts", description: "Elegant midnight black double-ply offcut leather.", base_price: 50, co2_factor: 1.2, waste_factor: 0.15, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/6.png" },
  { name: "Desert Hue Belt", category: "Belts", description: "Warm sand-toned nubuck and grain leather composite.", base_price: 58, co2_factor: 1.6, waste_factor: 0.20, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/BELTS/7.png" },

  // 2. Accessories (formerly Clutches & Keychains)
  { name: "Evening Mosaic Clutch", category: "Accessories", description: "Radiant geometric clutch with high-contrast triangular panels.", base_price: 84, co2_factor: 2.8, waste_factor: 0.45, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/1.png" },
  { name: "Terra Fold Clutch", category: "Accessories", description: "Elegant envelope fold style in soft ochre and tan leather.", base_price: 88, co2_factor: 3.0, waste_factor: 0.48, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/2.png" },
  { name: "Graphite Zip Wrap", category: "Accessories", description: "Modern charcoal zip-top clutch with dynamic hand-stitched detailing.", base_price: 82, co2_factor: 2.7, waste_factor: 0.42, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/3.png" },
  { name: "Emerald Wristlet", category: "Accessories", description: "Forest green mosaic wristlet with detachable organic cotton strap.", base_price: 86, co2_factor: 2.9, waste_factor: 0.46, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/4.png" },
  { name: "Pebbled Sienna Clutch", category: "Accessories", description: "Textured chestnut brown clutch with soft brass hardware.", base_price: 90, co2_factor: 3.1, waste_factor: 0.50, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/5.png" },
  { name: "Zero Waste Shell Wrap", category: "Accessories", description: "Sleek asymmetric flap clutch in contrasting cream and tan.", base_price: 92, co2_factor: 3.2, waste_factor: 0.52, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/6.png" },
  { name: "Orchid Bloom Clutch", category: "Accessories", description: "Delicate dusty pink and sand floral patchwork clutch.", base_price: 94, co2_factor: 3.3, waste_factor: 0.54, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/CLUTCHES/7.png" },

  // 3. Handbag Collections
  { name: "Signature Mosaic Tote", category: "Handbag Collections", description: "Spacious daily tote featuring a beautiful front panel of dynamic leather tiles.", base_price: 142, co2_factor: 4.8, waste_factor: 1.1, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/1.png" },
  { name: "Agra Bucket Bag", category: "Handbag Collections", description: "Structured cylindrical shoulder bag with an open-top circular frame.", base_price: 138, co2_factor: 4.6, waste_factor: 1.0, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/2.png" },
  { name: "Sienna Satchel", category: "Handbag Collections", description: "Classic double-handle satchel built with contrasting tan paneling.", base_price: 148, co2_factor: 5.0, waste_factor: 1.2, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/3.png" },
  { name: "Urban Crossbody", category: "Handbag Collections", description: "Compact hands-free shoulder bag with custom geometric patchwork front pocket.", base_price: 118, co2_factor: 4.0, waste_factor: 0.85, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/4.png" },
  { name: "Forest Hobo Bag", category: "Handbag Collections", description: "Relaxed slouchy silhouette in premium deep olive and brass details.", base_price: 154, co2_factor: 5.2, waste_factor: 1.3, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/5.png" },
  { name: "Midnight Trapeze", category: "Handbag Collections", description: "Structured wing-style handbag in stark black carbon grain.", base_price: 162, co2_factor: 5.5, waste_factor: 1.4, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/6.png" },
  { name: "Dune Shoulder Bag", category: "Handbag Collections", description: "Soft sand and cream multi-textured circular carryall.", base_price: 134, co2_factor: 4.5, waste_factor: 0.95, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/HANDBAG%20COLLECTIONS/7.png" },

  // 4. Jackets
  { name: "Heritage Patchwork Bomber", category: "Jackets", description: "Heavyweight premium bomber jacket with full-grain leather mosaic body.", base_price: 290, co2_factor: 9.8, waste_factor: 2.2, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/1.png" },
  { name: "Terra Rider Jacket", category: "Jackets", description: "Asymmetric zip moto jacket in warm chestnut and tan leather blocks.", base_price: 320, co2_factor: 10.5, waste_factor: 2.5, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/2.png" },
  { name: "Graphite Trench Vest", category: "Jackets", description: "Tailored long-line trench vest crafted from charcoal leather panels.", base_price: 260, co2_factor: 8.5, waste_factor: 1.8, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/3.png" },
  { name: "Forest Utility Jacket", category: "Jackets", description: "Multi-pocket field jacket in structured moss green and bronze hardware.", base_price: 310, co2_factor: 10.2, waste_factor: 2.4, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/4.png" },
  { name: "Sienna Crop Jacket", category: "Jackets", description: "Boxy crop-cut jacket in rich mahogany with circular lining.", base_price: 280, co2_factor: 9.2, waste_factor: 2.0, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/5.png" },
  { name: "Stark Carbon Blazer", category: "Jackets", description: "Architectural single-breasted blazer in textured matte black.", base_price: 340, co2_factor: 11.0, waste_factor: 2.6, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/6.png" },
  { name: "Desert Nomad Parka", category: "Jackets", description: "Hooded luxury parka featuring mixed texture cream and stone panels.", base_price: 330, co2_factor: 10.8, waste_factor: 2.5, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/JACKETS/7.png" },

  // 5. Accessories (Keychains subset)
  { name: "Braid Loop Keychain", category: "Accessories", description: "Beautiful braided leather lanyard with circular brass key loop.", base_price: 18, co2_factor: 0.2, waste_factor: 0.04, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/1.png" },
  { name: "Hex Tassel Fob", category: "Accessories", description: "Geometric hexagon tile with hanging soft leather tassels.", base_price: 22, co2_factor: 0.25, waste_factor: 0.05, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/2.png" },
  { name: "Mini Sneaker Charm", category: "Accessories", description: "Adorable miniature sneaker replica made entirely from microscopic offcuts.", base_price: 26, co2_factor: 0.3, waste_factor: 0.06, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/3.png" },
  { name: "Agra Emblem Tag", category: "Accessories", description: "Embossed tree-motif circular tag in warm chestnut brown.", base_price: 20, co2_factor: 0.22, waste_factor: 0.04, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/4.png" },
  { name: "Forest Leaf Charm", category: "Accessories", description: "Hand-cut stylized leaf shape in vibrant olive green leather.", base_price: 19, co2_factor: 0.21, waste_factor: 0.04, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/5.png" },
  { name: "Stark Loop Fob", category: "Accessories", description: "Sleek matte black leather strap with gunmetal black ring.", base_price: 16, co2_factor: 0.18, waste_factor: 0.03, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/6.png" },
  { name: "Dune Trio Charm", category: "Accessories", description: "Stacked three-tone leather pebbles on a reinforced steel cord.", base_price: 24, co2_factor: 0.28, waste_factor: 0.05, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/KEYCHAINS/7.png" },

  // 6. Laptop Bags
  { name: "Commuter Laptop Sleeve", category: "Laptop Bags", description: "Slim envelope sleeve with magnetic closure for 14-inch laptops.", base_price: 68, co2_factor: 2.2, waste_factor: 0.35, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/1.png" },
  { name: "Executive Briefcase", category: "Laptop Bags", description: "Double-compartment laptop bag with luggage strap and organic lining.", base_price: 148, co2_factor: 5.0, waste_factor: 1.0, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/2.png" },
  { name: "Terra Portfolio", category: "Laptop Bags", description: "Elegant carry-handle zip folio with integrated tablet slot.", base_price: 88, co2_factor: 2.8, waste_factor: 0.50, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/3.png" },
  { name: "Graphite Slim Brief", category: "Laptop Bags", description: "Streamlined single-compartment brief in dark charcoal leather.", base_price: 128, co2_factor: 4.4, waste_factor: 0.90, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/4.png" },
  { name: "Forest Tech Organizer", category: "Laptop Bags", description: "Compact folding case for chargers, cables, and hard drives.", base_price: 54, co2_factor: 1.6, waste_factor: 0.25, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/5.png" },
  { name: "Carbon Zip Briefcase", category: "Laptop Bags", description: "Rugged professional case in water-resistant matte black.", base_price: 154, co2_factor: 5.2, waste_factor: 1.1, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/6.png" },
  { name: "Desert Grain Folio", category: "Laptop Bags", description: "Warm sand-toned document portfolio with leather-covered snaps.", base_price: 82, co2_factor: 2.6, waste_factor: 0.45, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/LAPTOP%20BAGS/7.png" },

  // 7. Men's Footwear
  { name: "Apex Patchwork Runner", category: "Men's Footwear", description: "Dynamic athletic sneaker with contrasting mosaic side panels.", base_price: 122, co2_factor: 4.4, waste_factor: 0.90, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/1.png" },
  { name: "Agra Comfort Trainer", category: "Men's Footwear", description: "Everyday walking sneaker with extra cushioned organic sole.", base_price: 118, co2_factor: 4.3, waste_factor: 0.88, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/2.png" },
  { name: "Sienna Court Low", category: "Men's Footwear", description: "Flat-sole court sneaker in clean sienna paneling.", base_price: 124, co2_factor: 4.5, waste_factor: 0.92, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/3.png" },
  { name: "Graphite Knit Sneaker", category: "Men's Footwear", description: "Blended organic knit and charcoal leather hybrid sneaker.", base_price: 128, co2_factor: 4.6, waste_factor: 0.95, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/4.png" },
  { name: "Forest Trail Sneaker", category: "Men's Footwear", description: "All-terrain comfort runner in earthy green and dark sienna.", base_price: 132, co2_factor: 4.8, waste_factor: 1.0, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/5.png" },
  { name: "Stark Carbon Sneaker", category: "Men's Footwear", description: "Ultra-light smart-casual sneaker in matte black.", base_price: 126, co2_factor: 4.5, waste_factor: 0.92, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/6.png" },
  { name: "Dune Sand Trainer", category: "Men's Footwear", description: "Warm ivory and beige suede composite low-top.", base_price: 120, co2_factor: 4.3, waste_factor: 0.88, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/MEN_S%20FOOTWEAR/7.png" },

  // 8. Wallets
  { name: "Classic Patchwork Bifold", category: "Wallets", description: "Four-slot bifold wallet in sienna sienna mosaic.", base_price: 42, co2_factor: 1.1, waste_factor: 0.14, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/1.png" },
  { name: "Sienna Slim Cardholder", category: "Wallets", description: "Pocket-ready card sleeve in rich sienna red leather.", base_price: 28, co2_factor: 0.6, waste_factor: 0.08, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/2.png" },
  { name: "Terra Zip Wallet", category: "Wallets", description: "Wrap-around zippered wallet with central coin pocket.", base_price: 48, co2_factor: 1.3, waste_factor: 0.16, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/3.png" },
  { name: "Forest Card Wrap", category: "Wallets", description: "Minimalist single-wrap leather envelope with brass stud snap.", base_price: 32, co2_factor: 0.8, waste_factor: 0.10, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/4.png" },
  { name: "Midnight Passport Case", category: "Wallets", description: "Dual-fold travel cover in textured black grain.", base_price: 46, co2_factor: 1.2, waste_factor: 0.15, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/5.png" },
  { name: "Agra Billfold", category: "Wallets", description: "Traditional extra-capacity billfold with sienna sienna lining.", base_price: 44, co2_factor: 1.2, waste_factor: 0.14, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/6.png" },
  { name: "Desert Coin Purse", category: "Wallets", description: "Squeeze-open small leather coin pouch in sand tones.", base_price: 24, co2_factor: 0.5, waste_factor: 0.06, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WALLETS/7.png" },

  // 9. Women's Footwear
  { name: "Rosebud Patchwork Flats", category: "Women's Footwear", description: "Soft rose floral flat with rounded toe and flexible slip-on fit.", base_price: 86, co2_factor: 3.1, waste_factor: 0.60, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/1.png" },
  { name: "Agra Floral Ballerina", category: "Women's Footwear", description: "Classic ballet flats finished with sienna and forest floral panels.", base_price: 88, co2_factor: 3.2, waste_factor: 0.62, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/2.png" },
  { name: "Sienna Loafer", category: "Women's Footwear", description: "Structured driving loafer in rich tan and mahogany leather offcuts.", base_price: 94, co2_factor: 3.4, waste_factor: 0.68, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/3.png" },
  { name: "Ebony Bloom Flats", category: "Women's Footwear", description: "Sleek black leather flat with contrasting white floral embroidery.", base_price: 84, co2_factor: 3.0, waste_factor: 0.58, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/4.png" },
  { name: "Meadow Slingback", category: "Women's Footwear", description: "Buckled heel-strap flats in dusty green and cream leather.", base_price: 92, co2_factor: 3.3, waste_factor: 0.66, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/5.png" },
  { name: "Orchid Pointed Flat", category: "Women's Footwear", description: "Sharp pointed-toe silhouette in soft sienna and tan patchwork.", base_price: 90, co2_factor: 3.2, waste_factor: 0.64, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/6.png" },
  { name: "Dune Ballet Flats", category: "Women's Footwear", description: "Classic round-toe slip-ons in warm sienna and nude tones.", base_price: 86, co2_factor: 3.1, waste_factor: 0.60, image_url: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise/WOMEN_S%20FOOTWEAR/7.png" }
];

function getSizesForCategory(category: string): string[] {
  const cat = category.toLowerCase();
  if (cat.includes("men's footwear") || cat.includes("mens footwear")) {
    return ["40", "41", "42", "43", "44", "45", "46", "47"];
  }
  if (cat.includes("women's footwear") || cat.includes("womens footwear")) {
    return ["35", "36", "37", "38", "39", "40"];
  }
  if (cat.includes("jackets")) {
    return ["S", "M", "L", "XL"];
  }
  if (cat.includes("laptop bags")) {
    return ["13-inch", "14-inch", "15-inch", "16-inch"];
  }
  if (cat.includes("belts")) {
    return ["32", "34", "36", "38", "40"];
  }
  return ["One Size"];
}

sampleProducts.forEach((p: any) => {
  p.sizes = getSizesForCategory(p.category);
});

app.get("/api/catalog", async (req, res) => {
  if (!supabase) {
    return res.json(sampleProducts);
  }

  try {
    const { data: existing, error } = await supabase.from("products").select("*");
    
    if (error || !existing || existing.length < 5) {
      if (!error) {
        // Attempt to insert the sample products into the database if missing
        await supabase.from("products").insert(sampleProducts);
      }
      return res.json(sampleProducts); // Fallback
    }

    res.json(existing);
  } catch (err) {
    res.json(sampleProducts); // Error Fallback guarantee
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", supabase: supabaseUrl ? "configured" : "pending" });
});

async function startServer() {
  // Expose customer-interaction static pages at /interactive
  app.use("/interactive", express.static(path.join(process.cwd(), "customer-interaction")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`EkoKintsugi Backend running on http://0.0.0.0:${PORT}`);
    if (isResendConfigured) {
      console.log(`✅ Primary Resend API active — orders will email ${sellerEmailAddress} via Resend Sandbox`);
    }
    if (mailTransporter) {
      console.log(`✅ Fallback Gmail SMTP active — orders will email ${sellerEmailAddress} from ${gmailUser}`);
    }
    if (!isResendConfigured && !mailTransporter) {
      console.log(`📧 No email dispatch services configured — order emails logged to terminal & email_outbox_logs.txt`);
    }
    if (!supabase) {
      console.log("Notice: Supabase environment variables are missing. API features that require Supabase will stay in fallback mode.");
      return;
    }
    
    // Background Auto-Seeder
    const dummyId = "00000000-0000-0000-0000-000000000000";
    try {
      const { count, error: countErr } = await supabase.from("esg_records").select("*", { count: "exact", head: true });
      if (countErr) {
        if (isMissingTableError(countErr)) {
          logNoticeOnce("missing-seed-tables", "Notice: Supabase tables pending setup. Auto-seeder paused until you run supabase_schema.sql.");
          return;
        }
        console.log("Notice: Auto-seeder paused due to a Supabase error.");
        return;
      }
      
      if (count === 0 || count === null) {
        console.log("ESG Database empty. Running auto-seeder...");
        const { data: product, error: pErr } = await supabase.from("products").select("id").limit(1).single();
        if (pErr) return;
        
        if (product) {
          for (let i = 0; i < 10; i++) {
            const co2 = (Math.random() * 8 + 3).toFixed(1);
            const waste = (Math.random() * 4 + 1).toFixed(1);
            
            const { data: order, error: oErr } = await supabase.from("orders").insert({
              user_id: dummyId, product_id: product.id, quantity: 1, total_price: 3500 + (i * 100)
            }).select().single();
            if (oErr) return;
            
            if (order) {
              const { data: tree, error: tErr } = await supabase.from("trees").insert({
                user_id: dummyId, location: `Agra Bio-Site ${i}`, status: i%2 === 0 ? "sapling" : "seed"
              }).select().single();
              if (tErr) return;
              
              const { error: eErr } = await supabase.from("esg_records").insert({
                order_id: order.id, user_id: dummyId, co2_saved_kg: parseFloat(co2), waste_diverted_kg: parseFloat(waste), tree_id: tree?.id
              });
              if (eErr) return;
              
              const { error: lErr } = await supabase.from("carbon_ledger").insert({
                user_id: dummyId, credits_earned: parseFloat(co2) / 1000, source_order_id: order.id
              });
              if (lErr) return;
            }
          }
          console.log("Auto-seeding complete.");
        }
      }
    } catch (err) {
      // Sliently skip if tables are not initialized
    }
  });
}

startServer();
