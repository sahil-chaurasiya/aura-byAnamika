/**
 * ONE-TIME, NON-DESTRUCTIVE patch for the LIVE header Menu document
 * already sitting in your database.
 *
 * This does NOT reseed, delete, or recreate the menu. It does NOT touch
 * products, orders, or anything else. It loads the existing "header"
 * Menu document exactly as it is right now (including any edits you've
 * made yourself in the admin Menu Builder) and only rewrites the `url`
 * field on nodes where it finds the bug described below -- everything
 * else (labels, order, badges, images, active/inactive flags, your own
 * custom links) is left completely untouched.
 *
 * THE BUG:
 * Category/sub-category links were built as `/shop?search=<label>`.
 * The storefront's `/api/products` endpoint only matches a product's
 * categories.label / categories.group when the URL uses `?category=`.
 * `?search=` instead runs a MongoDB text search over the product's
 * name/description/tags -- completely unrelated to what category a
 * product is tagged with. That's why a product tagged "Trending Now" /
 * "Banarasi Sarees" / "Organza Dupattas" never shows up when clicking
 * those items in the nav dropdown, on the homepage, or via
 * /shop?search=trending -- the category tag was never being checked.
 *
 * THE FIX:
 * For every node in the menu tree (top-level item, category, or
 * sub-category) and every mega-menu promo box, if its `url` is of the
 * form `/shop?search=<value>` and <value> matches that node's own
 * label (or, for promo boxes, matches some label found elsewhere in
 * the tree -- e.g. "Bridal Edit" promo pointing at "Bridal Lehengas"),
 * it rewrites the link to `/shop?category=<the real label>`. Any other
 * query params already on the link (e.g. &sort=newest) are preserved.
 * Links that were never category links to begin with (e.g.
 * ?onSale=true&search=30) are left alone -- they aren't part of this bug.
 *
 * Safe to run multiple times -- once fixed, a link no longer matches
 * the "?search=<own label>" pattern, so re-running finds nothing left
 * to change.
 *
 * Run with:   node utils/fixMenuCategoryLinks.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { Menu } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

// "Trending Now" was seeded with the mismatched literal `search=trending`
// (not even matching its own label's text) -- special-case it alongside
// the generic label-match rule below.
const ALIASES = {
  trending: 'Trending Now',
};

function collectAllLabels(items, out = []) {
  for (const item of items || []) {
    out.push(item.label);
    if (item.children?.length) collectAllLabels(item.children, out);
  }
  return out;
}

// Rewrites a single `/shop?...` url if it matches either broken pattern:
//   1. `/shop?search=<value>` where <value> matches one of candidateValues
//      (the original bug -- text search instead of category filter)
//   2. `/shop?category=undefined` (or any &category=undefined mixed in
//      with other params) -- left behind if an earlier, buggy version of
//      THIS script ran and forgot to pass the real label in
// `canonicalLabel` is the real label to write into `category=` in either
// case. Returns the new url, or null if nothing needed changing.
function fixUrl(url, candidateValues, canonicalLabel) {
  if (!url || !url.startsWith('/shop?')) return null;
  let parsed;
  try {
    parsed = new URL(url, 'http://x');
  } catch {
    return null;
  }

  const categoryVal = parsed.searchParams.get('category');
  if (categoryVal === 'undefined') {
    parsed.searchParams.set('category', canonicalLabel);
    return `/shop?${parsed.searchParams.toString()}`;
  }

  const searchVal = parsed.searchParams.get('search');
  if (searchVal === null) return null;

  const isMatch = candidateValues.some(
    v => v && v.toLowerCase() === searchVal.toLowerCase()
  );
  if (!isMatch) return null;

  parsed.searchParams.delete('search');
  parsed.searchParams.set('category', canonicalLabel);
  return `/shop?${parsed.searchParams.toString()}`;
}

const run = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const menu = await Menu.findOne({ location: 'header' });
  if (!menu) {
    console.log('⚠️  No header menu document found -- nothing to patch.');
    process.exit(0);
  }

  const allLabels = collectAllLabels(menu.items);
  let changed = 0;

  const visit = (node) => {
    const ownAliases = Object.entries(ALIASES)
      .filter(([, real]) => real === node.label)
      .map(([alias]) => alias);
    const candidates = [node.label, ...ownAliases];

    // BUG WAS HERE: canonicalLabel was never passed, so every fixed link
    // became `/shop?category=undefined` instead of the real label --
    // which explains why NOTHING loaded via the nav dropdown even after
    // a previous run of this script (a category literally named
    // "undefined" matches zero products, same as the original ?search=
    // bug, just a different kind of nothing).
    const newUrl = fixUrl(node.url, candidates, node.label);
    if (newUrl) {
      console.log(`✏️  "${node.label}": ${node.url}  →  ${newUrl}`);
      node.url = newUrl;
      changed++;
    }

    if (node.promo?.url) {
      // Promo boxes link to a label elsewhere in the tree (e.g. "Bridal
      // Edit" -> "Bridal Lehengas"), not their own node's label, so find
      // whichever label in the whole tree actually matches the broken
      // link's search value and use THAT as the canonical replacement.
      const parsedPromo = (() => {
        try { return new URL(node.promo.url, 'http://x'); } catch { return null; }
      })();
      const promoSearchVal = parsedPromo?.searchParams.get('search');
      const promoCategoryVal = parsedPromo?.searchParams.get('category');

      if (promoCategoryVal === 'undefined') {
        // An earlier buggy run already destroyed the original search
        // value, so we can't safely guess which label this promo box was
        // meant to point at -- flag it instead of writing a wrong guess.
        console.log(`⚠️  "${node.label}" promo url is "/shop?category=undefined" and the original target can't be recovered -- please re-set it manually in Admin > Menu Builder.`);
      } else {
        const matchedLabel = promoSearchVal
          ? allLabels.find(l => l.toLowerCase() === promoSearchVal.toLowerCase())
          : null;
        if (matchedLabel) {
          const newPromoUrl = fixUrl(node.promo.url, [matchedLabel], matchedLabel);
          if (newPromoUrl) {
            console.log(`✏️  "${node.label}" promo: ${node.promo.url}  →  ${newPromoUrl}`);
            node.promo.url = newPromoUrl;
            changed++;
          }
        }
      }
    }

    (node.children || []).forEach(visit);
  };

  menu.items.forEach(visit);

  if (changed === 0) {
    console.log('✅ Nothing to patch -- no broken search->category links found.');
    process.exit(0);
  }

  menu.markModified('items');
  await menu.save();
  console.log(`\n✅ Done. Patched ${changed} link(s) on the live header menu. Nothing else was touched.`);
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Patch failed:', err);
  process.exit(1);
});