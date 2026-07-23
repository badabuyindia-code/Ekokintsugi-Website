import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing from .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define categories and their matching subdirectories
const CATEGORIES_MAPPING = [
  { name: "Belts", folder: "BELTS" },
  { name: "Clutches", folder: "CLUTCHES" },
  { name: "Handbag Collections", folder: "HANDBAG COLLECTIONS" },
  { name: "Jackets", folder: "JACKETS" },
  { name: "Keychains", folder: "KEYCHAINS" },
  { name: "Laptop Bags", folder: "LAPTOP BAGS" },
  { name: "Men's Footwear", folder: "MEN_S FOOTWEAR" },
  { name: "Wallets", folder: "WALLETS" },
  { name: "Women's Footwear", folder: "WOMEN_S FOOTWEAR" }
];

// Product listings with relative static URLs (to be converted to remote URLs)
const productsList = [
  // 1. Belts
  { name: "Classic Patchwork Belt", category: "Belts", description: "Premium circular leather belt crafted from dark oak mosaic strips.", base_price: 48, co2_factor: 1.2, waste_factor: 0.15, rel_path: "BELTS/1.png" },
  { name: "Agra Weave Belt", category: "Belts", description: "Interwoven light tan and chestnut reclaimed leather fibers.", base_price: 54, co2_factor: 1.4, waste_factor: 0.18, rel_path: "BELTS/2.png" },
  { name: "Sienna Edge Belt", category: "Belts", description: "Fine hand-finished stitching with double-ring zero-waste buckle.", base_price: 52, co2_factor: 1.3, waste_factor: 0.16, rel_path: "BELTS/3.png" },
  { name: "Forest Mosaic Belt", category: "Belts", description: "Unique moss green and deep tan patchwork detailing.", base_price: 56, co2_factor: 1.5, waste_factor: 0.19, rel_path: "BELTS/4.png" },
  { name: "Slate Utility Belt", category: "Belts", description: "Minimalist black and charcoal reclaimed leather strap.", base_price: 46, co2_factor: 1.1, waste_factor: 0.14, rel_path: "BELTS/5.png" },
  { name: "Carbon Zero Belt", category: "Belts", description: "Elegant midnight black double-ply offcut leather.", base_price: 50, co2_factor: 1.2, waste_factor: 0.15, rel_path: "BELTS/6.png" },
  { name: "Desert Hue Belt", category: "Belts", description: "Warm sand-toned nubuck and grain leather composite.", base_price: 58, co2_factor: 1.6, waste_factor: 0.20, rel_path: "BELTS/7.png" },

  // 2. Accessories (formerly Clutches & Keychains)
  { name: "Evening Mosaic Clutch", category: "Accessories", description: "Radiant geometric clutch with high-contrast triangular panels.", base_price: 84, co2_factor: 2.8, waste_factor: 0.45, rel_path: "CLUTCHES/1.png" },
  { name: "Terra Fold Clutch", category: "Accessories", description: "Elegant envelope fold style in soft ochre and tan leather.", base_price: 88, co2_factor: 3.0, waste_factor: 0.48, rel_path: "CLUTCHES/2.png" },
  { name: "Graphite Zip Wrap", category: "Accessories", description: "Modern charcoal zip-top clutch with dynamic hand-stitched detailing.", base_price: 82, co2_factor: 2.7, waste_factor: 0.42, rel_path: "CLUTCHES/3.png" },
  { name: "Emerald Wristlet", category: "Accessories", description: "Forest green mosaic wristlet with detachable organic cotton strap.", base_price: 86, co2_factor: 2.9, waste_factor: 0.46, rel_path: "CLUTCHES/4.png" },
  { name: "Pebbled Sienna Clutch", category: "Accessories", description: "Textured chestnut brown clutch with soft brass hardware.", base_price: 90, co2_factor: 3.1, waste_factor: 0.50, rel_path: "CLUTCHES/5.png" },
  { name: "Zero Waste Shell Wrap", category: "Accessories", description: "Sleek asymmetric flap clutch in contrasting cream and tan.", base_price: 92, co2_factor: 3.2, waste_factor: 0.52, rel_path: "CLUTCHES/6.png" },
  { name: "Orchid Bloom Clutch", category: "Accessories", description: "Delicate dusty pink and sand floral patchwork clutch.", base_price: 94, co2_factor: 3.3, waste_factor: 0.54, rel_path: "CLUTCHES/7.png" },

  // 3. Handbag Collections
  { name: "Signature Mosaic Tote", category: "Handbag Collections", description: "Spacious daily tote featuring a beautiful front panel of dynamic leather tiles.", base_price: 142, co2_factor: 4.8, waste_factor: 1.1, rel_path: "HANDBAG COLLECTIONS/1.png" },
  { name: "Agra Bucket Bag", category: "Handbag Collections", description: "Structured cylindrical shoulder bag with an open-top circular frame.", base_price: 138, co2_factor: 4.6, waste_factor: 1.0, rel_path: "HANDBAG COLLECTIONS/2.png" },
  { name: "Sienna Satchel", category: "Handbag Collections", description: "Classic double-handle satchel built with contrasting tan paneling.", base_price: 148, co2_factor: 5.0, waste_factor: 1.2, rel_path: "HANDBAG COLLECTIONS/3.png" },
  { name: "Urban Crossbody", category: "Handbag Collections", description: "Compact hands-free shoulder bag with custom geometric patchwork front pocket.", base_price: 118, co2_factor: 4.0, waste_factor: 0.85, rel_path: "HANDBAG COLLECTIONS/4.png" },
  { name: "Forest Hobo Bag", category: "Handbag Collections", description: "Relaxed slouchy silhouette in premium deep olive and brass details.", base_price: 154, co2_factor: 5.2, waste_factor: 1.3, rel_path: "HANDBAG COLLECTIONS/5.png" },
  { name: "Midnight Trapeze", category: "Handbag Collections", description: "Structured wing-style handbag in stark black carbon grain.", base_price: 162, co2_factor: 5.5, waste_factor: 1.4, rel_path: "HANDBAG COLLECTIONS/6.png" },
  { name: "Dune Shoulder Bag", category: "Handbag Collections", description: "Soft sand and cream multi-textured circular carryall.", base_price: 134, co2_factor: 4.5, waste_factor: 0.95, rel_path: "HANDBAG COLLECTIONS/7.png" },

  // 4. Jackets
  { name: "Heritage Patchwork Bomber", category: "Jackets", description: "Heavyweight premium bomber jacket with full-grain leather mosaic body.", base_price: 290, co2_factor: 9.8, waste_factor: 2.2, rel_path: "JACKETS/1.png" },
  { name: "Terra Rider Jacket", category: "Jackets", description: "Asymmetric zip moto jacket in warm chestnut and tan leather blocks.", base_price: 320, co2_factor: 10.5, waste_factor: 2.5, rel_path: "JACKETS/2.png" },
  { name: "Graphite Trench Vest", category: "Jackets", description: "Tailored long-line trench vest crafted from charcoal leather panels.", base_price: 260, co2_factor: 8.5, waste_factor: 1.8, rel_path: "JACKETS/3.png" },
  { name: "Forest Utility Jacket", category: "Jackets", description: "Multi-pocket field jacket in structured moss green and bronze hardware.", base_price: 310, co2_factor: 10.2, waste_factor: 2.4, rel_path: "JACKETS/4.png" },
  { name: "Sienna Crop Jacket", category: "Jackets", description: "Boxy crop-cut jacket in rich mahogany with circular lining.", base_price: 280, co2_factor: 9.2, waste_factor: 2.0, rel_path: "JACKETS/5.png" },
  { name: "Stark Carbon Blazer", category: "Jackets", description: "Architectural single-breasted blazer in textured matte black.", base_price: 340, co2_factor: 11.0, waste_factor: 2.6, rel_path: "JACKETS/6.png" },
  { name: "Desert Nomad Parka", category: "Jackets", description: "Hooded luxury parka featuring mixed texture cream and stone panels.", base_price: 330, co2_factor: 10.8, waste_factor: 2.5, rel_path: "JACKETS/7.png" },

  // 5. Accessories (Keychains subset)
  { name: "Braid Loop Keychain", category: "Accessories", description: "Beautiful braided leather lanyard with circular brass key loop.", base_price: 18, co2_factor: 0.2, waste_factor: 0.04, rel_path: "KEYCHAINS/1.png" },
  { name: "Hex Tassel Fob", category: "Accessories", description: "Geometric hexagon tile with hanging soft leather tassels.", base_price: 22, co2_factor: 0.25, waste_factor: 0.05, rel_path: "KEYCHAINS/2.png" },
  { name: "Mini Sneaker Charm", category: "Accessories", description: "Adorable miniature sneaker replica made entirely from microscopic offcuts.", base_price: 26, co2_factor: 0.3, waste_factor: 0.06, rel_path: "KEYCHAINS/3.png" },
  { name: "Agra Emblem Tag", category: "Accessories", description: "Embossed tree-motif circular tag in warm chestnut brown.", base_price: 20, co2_factor: 0.22, waste_factor: 0.04, rel_path: "KEYCHAINS/4.png" },
  { name: "Forest Leaf Charm", category: "Accessories", description: "Hand-cut stylized leaf shape in vibrant olive green leather.", base_price: 19, co2_factor: 0.21, waste_factor: 0.04, rel_path: "KEYCHAINS/5.png" },
  { name: "Stark Loop Fob", category: "Accessories", description: "Sleek matte black leather strap with gunmetal black ring.", base_price: 16, co2_factor: 0.18, waste_factor: 0.03, rel_path: "KEYCHAINS/6.png" },
  { name: "Dune Trio Charm", category: "Accessories", description: "Stacked three-tone leather pebbles on a reinforced steel cord.", base_price: 24, co2_factor: 0.28, waste_factor: 0.05, rel_path: "KEYCHAINS/7.png" },

  // 6. Laptop Bags
  { name: "Commuter Laptop Sleeve", category: "Laptop Bags", description: "Slim envelope sleeve with magnetic closure for 14-inch laptops.", base_price: 68, co2_factor: 2.2, waste_factor: 0.35, rel_path: "LAPTOP BAGS/1.png" },
  { name: "Executive Briefcase", category: "Laptop Bags", description: "Double-compartment laptop bag with luggage strap and organic lining.", base_price: 148, co2_factor: 5.0, waste_factor: 1.0, rel_path: "LAPTOP BAGS/2.png" },
  { name: "Terra Portfolio", category: "Laptop Bags", description: "Elegant carry-handle zip folio with integrated tablet slot.", base_price: 88, co2_factor: 2.8, waste_factor: 0.50, rel_path: "LAPTOP BAGS/3.png" },
  { name: "Graphite Slim Brief", category: "Laptop Bags", description: "Streamlined single-compartment brief in dark charcoal leather.", base_price: 128, co2_factor: 4.4, waste_factor: 0.90, rel_path: "LAPTOP BAGS/4.png" },
  { name: "Forest Tech Organizer", category: "Laptop Bags", description: "Compact folding case for chargers, cables, and hard drives.", base_price: 54, co2_factor: 1.6, waste_factor: 0.25, rel_path: "LAPTOP BAGS/5.png" },
  { name: "Carbon Zip Briefcase", category: "Laptop Bags", description: "Rugged professional case in water-resistant matte black.", base_price: 154, co2_factor: 5.2, waste_factor: 1.1, rel_path: "LAPTOP BAGS/6.png" },
  { name: "Desert Grain Folio", category: "Laptop Bags", description: "Warm sand-toned document portfolio with leather-covered snaps.", base_price: 82, co2_factor: 2.6, waste_factor: 0.45, rel_path: "LAPTOP BAGS/7.png" },

  // 7. Men's Footwear
  { name: "Apex Patchwork Runner", category: "Men's Footwear", description: "Dynamic athletic sneaker with contrasting mosaic side panels.", base_price: 122, co2_factor: 4.4, waste_factor: 0.90, rel_path: "MEN_S FOOTWEAR/1.png" },
  { name: "Agra Comfort Trainer", category: "Men's Footwear", description: "Everyday walking sneaker with extra cushioned organic sole.", base_price: 118, co2_factor: 4.3, waste_factor: 0.88, rel_path: "MEN_S FOOTWEAR/2.png" },
  { name: "Sienna Court Low", category: "Men's Footwear", description: "Flat-sole court sneaker in clean sienna paneling.", base_price: 124, co2_factor: 4.5, waste_factor: 0.92, rel_path: "MEN_S FOOTWEAR/3.png" },
  { name: "Graphite Knit Sneaker", category: "Men's Footwear", description: "Blended organic knit and charcoal leather hybrid sneaker.", base_price: 128, co2_factor: 4.6, waste_factor: 0.95, rel_path: "MEN_S FOOTWEAR/4.png" },
  { name: "Forest Trail Sneaker", category: "Men's Footwear", description: "All-terrain comfort runner in earthy green and dark sienna.", base_price: 132, co2_factor: 4.8, waste_factor: 1.0, rel_path: "MEN_S FOOTWEAR/5.png" },
  { name: "Stark Carbon Sneaker", category: "Men's Footwear", description: "Ultra-light smart-casual sneaker in matte black.", base_price: 126, co2_factor: 4.5, waste_factor: 0.92, rel_path: "MEN_S FOOTWEAR/6.png" },
  { name: "Dune Sand Trainer", category: "Men's Footwear", description: "Warm ivory and beige suede composite low-top.", base_price: 120, co2_factor: 4.3, waste_factor: 0.88, rel_path: "MEN_S FOOTWEAR/7.png" },

  // 8. Wallets
  { name: "Classic Patchwork Bifold", category: "Wallets", description: "Four-slot bifold wallet in sienna sienna mosaic.", base_price: 42, co2_factor: 1.1, waste_factor: 0.14, rel_path: "WALLETS/1.png" },
  { name: "Sienna Slim Cardholder", category: "Wallets", description: "Pocket-ready card sleeve in rich sienna red leather.", base_price: 28, co2_factor: 0.6, waste_factor: 0.08, rel_path: "WALLETS/2.png" },
  { name: "Terra Zip Wallet", category: "Wallets", description: "Wrap-around zippered wallet with central coin pocket.", base_price: 48, co2_factor: 1.3, waste_factor: 0.16, rel_path: "WALLETS/3.png" },
  { name: "Forest Card Wrap", category: "Wallets", description: "Minimalist single-wrap leather envelope with brass stud snap.", base_price: 32, co2_factor: 0.8, waste_factor: 0.10, rel_path: "WALLETS/4.png" },
  { name: "Midnight Passport Case", category: "Wallets", description: "Dual-fold travel cover in textured black grain.", base_price: 46, co2_factor: 1.2, waste_factor: 0.15, rel_path: "WALLETS/5.png" },
  { name: "Agra Billfold", category: "Wallets", description: "Traditional extra-capacity billfold with sienna sienna lining.", base_price: 44, co2_factor: 1.2, waste_factor: 0.14, rel_path: "WALLETS/6.png" },
  { name: "Desert Coin Purse", category: "Wallets", description: "Squeeze-open small leather coin pouch in sand tones.", base_price: 24, co2_factor: 0.5, waste_factor: 0.06, rel_path: "WALLETS/7.png" },

  // 9. Women's Footwear
  { name: "Rosebud Patchwork Flats", category: "Women's Footwear", description: "Soft rose floral flat with rounded toe and flexible slip-on fit.", base_price: 86, co2_factor: 3.1, waste_factor: 0.60, rel_path: "WOMEN_S FOOTWEAR/1.png" },
  { name: "Agra Floral Ballerina", category: "Women's Footwear", description: "Classic ballet flats finished with sienna and forest floral panels.", base_price: 88, co2_factor: 3.2, waste_factor: 0.62, rel_path: "WOMEN_S FOOTWEAR/2.png" },
  { name: "Sienna Loafer", category: "Women's Footwear", description: "Structured driving loafer in rich tan and mahogany leather offcuts.", base_price: 94, co2_factor: 3.4, waste_factor: 0.68, rel_path: "WOMEN_S FOOTWEAR/3.png" },
  { name: "Ebony Bloom Flats", category: "Women's Footwear", description: "Sleek black leather flat with contrasting white floral embroidery.", base_price: 84, co2_factor: 3.0, waste_factor: 0.58, rel_path: "WOMEN_S FOOTWEAR/4.png" },
  { name: "Meadow Slingback", category: "Women's Footwear", description: "Buckled heel-strap flats in dusty green and cream leather.", base_price: 92, co2_factor: 3.3, waste_factor: 0.66, rel_path: "WOMEN_S FOOTWEAR/5.png" },
  { name: "Orchid Pointed Flat", category: "Women's Footwear", description: "Sharp pointed-toe silhouette in soft sienna and tan patchwork.", base_price: 90, co2_factor: 3.2, waste_factor: 0.64, rel_path: "WOMEN_S FOOTWEAR/6.png" },
  { name: "Dune Ballet Flats", category: "Women's Footwear", description: "Classic round-toe slip-ons in warm sienna and nude tones.", base_price: 86, co2_factor: 3.1, waste_factor: 0.60, rel_path: "WOMEN_S FOOTWEAR/7.png" }
];


async function run() {
  console.log("🚀 Starting Cloud Storage Sync & Database SQL Generation...");
  console.log(`Connected to: ${supabaseUrl}`);

  const publicFolder = path.join(process.cwd(), 'public', 'Ekokintsugi-Products_categorywise');
  
  if (!fs.existsSync(publicFolder)) {
    console.error(`❌ Local directory not found: ${publicFolder}`);
    process.exit(1);
  }

  // 1. Programmatic storage uploads
  let uploadSuccessCount = 0;
  let uploadErrorCount = 0;

  for (const category of CATEGORIES_MAPPING) {
    const localDir = path.join(publicFolder, category.folder);
    if (!fs.existsSync(localDir)) {
      console.warn(`⚠️ Folder not found locally: ${localDir}`);
      continue;
    }

    const files = fs.readdirSync(localDir).filter(f => f.endsWith('.png'));
    console.log(`📂 Processing category '${category.name}' (${files.length} images)...`);

    for (const file of files) {
      const filePath = path.join(localDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const pathInBucket = `Ekokintsugi-Products_categorywise/${category.folder}/${file}`;

      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(pathInBucket, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (error) {
          uploadErrorCount++;
          console.warn(` ❌ Error uploading ${category.folder}/${file}:`, error.message);
        } else {
          uploadSuccessCount++;
          console.log(`  ✅ Successfully uploaded: ${pathInBucket}`);
        }
      } catch (err: any) {
        uploadErrorCount++;
        console.warn(` ❌ Exception uploading ${category.folder}/${file}:`, err.message || err);
      }
    }
  }

  console.log(`\n📊 Upload Summary: ${uploadSuccessCount} succeeded, ${uploadErrorCount} failed.`);
  if (uploadErrorCount > 0) {
    console.log("ℹ️ Some uploads failed. If storage write RLS is active on your anon key,");
    console.log("   please manually upload the 'Ekokintsugi-Products_categorywise' folder into your 'product-images' bucket.");
    console.log("   The generated SQL will still map to correct remote cloud URLs.\n");
  }

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

  // 2. Generate updated SQL migration file
  console.log("📝 Generating supabase_products_seed.sql with absolute remote URLs...");

  const remoteBaseUrl = `${supabaseUrl}/storage/v1/object/public/product-images/Ekokintsugi-Products_categorywise`;

  const sqlStatements: string[] = [];
  sqlStatements.push("BEGIN;\n");
  sqlStatements.push("-- 1. Clear transactional tables to satisfy FK constraint limits");
  sqlStatements.push("DELETE FROM public.esg_records;");
  sqlStatements.push("DELETE FROM public.carbon_ledger;");
  sqlStatements.push("DELETE FROM public.orders;\n");

  sqlStatements.push("-- 2. Delete all existing products");
  sqlStatements.push("DELETE FROM public.products;\n");

  sqlStatements.push("-- 4. Seed all 63 new cloud-hosted category-wise products");
  sqlStatements.push("INSERT INTO public.products (name, co2_factor, waste_factor, base_price, image_url, description, category, sizes)");
  sqlStatements.push("VALUES");

  const valueRows = productsList.map(p => {
    // URL encode only spaces to match clean storage routes
    const escapedRelPath = p.rel_path.replace(/ /g, "%20");
    const absoluteRemoteUrl = `${remoteBaseUrl}/${escapedRelPath}`;
    const escapedName = p.name.replace(/'/g, "''");
    const escapedDesc = p.description.replace(/'/g, "''");
    const escapedCat = p.category.replace(/'/g, "''");
    
    const sizes = getSizesForCategory(p.category);
    const sqlArray = `ARRAY[${sizes.map(s => `'${s}'`).join(',')}]::text[]`;
    
    return `  ('${escapedName}', ${p.co2_factor}, ${p.waste_factor}, ${p.base_price}, '${absoluteRemoteUrl}', '${escapedDesc}', '${escapedCat}', ${sqlArray})`;
  });

  sqlStatements.push(valueRows.join(",\n") + ";\n");
  sqlStatements.push("COMMIT;");

  const sqlFilePath = path.join(process.cwd(), 'supabase_products_seed.sql');
  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'));

  console.log(`✨ Successfully generated: ${sqlFilePath}`);
  console.log("\n--------------------------------------------------------------------------------");
  console.log(" 🎉 CLOUD SEEDING FILE COMPLETED SUCCESSFULLY!");
  console.log("--------------------------------------------------------------------------------");
  console.log("Please run the updated SQL script in your Supabase SQL Editor to finish the sync:");
  console.log(" 👉 https://supabase.com/dashboard/project/adykwrunnuwgwmbzfsxj");
  console.log("--------------------------------------------------------------------------------\n");
}

run();
