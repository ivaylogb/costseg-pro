// Unit Cost Reference Data — derived from analysis of completed engineering-based
// cost segregation studies. Sources: RSMeans, Marshall & Swift, Craftsman National
// Building Cost Manual, and professional cost estimates.
// All costs are base (materials + labor) before indirect cost markup.

const INDIRECT_COST_RATE = 0.25;

const APPLIANCE_COSTS = {
  range:            { cost: 850, unit: "EA", desc: "Cooking range/oven, residential" },
  dishwasher:       { cost: 750, unit: "EA", desc: "Dishwasher, built-in" },
  garbage_disposal: { cost: 280, unit: "EA", desc: "Garbage disposal, sink type" },
  microwave:        { cost: 375, unit: "EA", desc: "Microwave, built-in/over-range" },
  refrigerator:     { cost: 1300, unit: "EA", desc: "Refrigerator, 18-20 CF" },
  washer:           { cost: 950, unit: "EA", desc: "Washing machine" },
  dryer:            { cost: 1100, unit: "EA", desc: "Dryer, residential" },
};

const FLOORING_COSTS = {
  lvt:      { cost: 9.50, unit: "SF", desc: "Luxury vinyl tile/plank" },
  hardwood: { cost: 17.75, unit: "SF", desc: "Wood plank flooring" },
  laminate: { cost: 7.50, unit: "SF", desc: "Laminate floating floor" },
  carpet:   { cost: 6.00, unit: "SF", desc: "Carpeting with padding" },
};

const OTHER_PP = {
  cabinet_base_std:  { cost: 140, unit: "LF", desc: "Base cabinets, standard" },
  cabinet_base_cust: { cost: 210, unit: "LF", desc: "Base cabinets, custom" },
  cabinet_wall_std:  { cost: 128, unit: "LF", desc: "Wall cabinets, standard" },
  cabinet_wall_cust: { cost: 185, unit: "LF", desc: "Wall cabinets, custom" },
  counter_standard:  { cost: 85, unit: "LF", desc: "Countertop, standard" },
  counter_quartz:    { cost: 155, unit: "LF", desc: "Countertop, quartz" },
  ceiling_fan:       { cost: 300, unit: "EA", desc: "Ceiling fan with light" },
  window_blind:      { cost: 155, unit: "EA", desc: "Window blinds/shades" },
  decorative_light:  { cost: 380, unit: "EA", desc: "Decorative light fixture" },
  closet_shelf:      { cost: 13, unit: "LF", desc: "Closet rod & shelving" },
  base_molding:      { cost: 3.00, unit: "LF", desc: "Wood base molding" },
  fireplace:         { cost: 2800, unit: "EA", desc: "Fireplace insert, prefab" },
  sink_kitchen:      { cost: 1600, unit: "EA", desc: "Kitchen sink w/ rough-in" },
  phone_data:        { cost: 85, unit: "EA", desc: "Phone/data outlet w/ wiring" },
  coax_tv:           { cost: 60, unit: "EA", desc: "TV receptacle w/ coax" },
  hot_tub:           { cost: 7300, unit: "EA", desc: "Hot tub system, 6' dia" },
  appl_outlet:       { cost: 185, unit: "EA", desc: "Dedicated appliance outlet" },
  fan_wiring:        { cost: 140, unit: "EA", desc: "Ceiling fan wiring/EMT" },
  gfci_outlet:       { cost: 295, unit: "EA", desc: "GFCI outlet" },
  washer_hookup:     { cost: 850, unit: "EA", desc: "Washer plumbing rough-in" },
  dryer_vent:        { cost: 75, unit: "EA", desc: "Dryer vent kit" },
  dw_hookup:         { cost: 195, unit: "EA", desc: "Dishwasher hookup" },
};

const FURNITURE = {
  bed_king:  { cost: 1550, unit: "EA", desc: "Bed, king" },
  bed_queen: { cost: 1300, unit: "EA", desc: "Bed, queen" },
  dresser:   { cost: 500, unit: "EA", desc: "Dresser" },
  sofa:      { cost: 2800, unit: "EA", desc: "Sofa" },
  chair:     { cost: 350, unit: "EA", desc: "Accent chair" },
  dining:    { cost: 800, unit: "EA", desc: "Dining table w/ chairs" },
  coffee:    { cost: 325, unit: "EA", desc: "Coffee table" },
  side:      { cost: 200, unit: "EA", desc: "Side table" },
  tv_lg:     { cost: 800, unit: "EA", desc: "TV, 50\"+" },
  tv_sm:     { cost: 400, unit: "EA", desc: "TV, 32-43\"" },
  rug:       { cost: 290, unit: "EA", desc: "Area rug" },
  art:       { cost: 115, unit: "EA", desc: "Art/wall decor" },
  mirror:    { cost: 185, unit: "EA", desc: "Mirror" },
  lamp:      { cost: 145, unit: "EA", desc: "Lamp" },
  sm_appl:   { cost: 125, unit: "EA", desc: "Small appliance" },
};

const SITE = {
  asphalt:       { cost: 2.75, unit: "SF", desc: "Asphalt paving" },
  concrete:      { cost: 7.00, unit: "SF", desc: "Concrete sidewalk" },
  wood_fence:    { cost: 15.50, unit: "LF", desc: "Wood fence, cedar" },
  chain_fence:   { cost: 18.00, unit: "LF", desc: "Chain link fence" },
  metal_fence:   { cost: 48.50, unit: "LF", desc: "Metal fence, tubular picket" },
  wood_deck:     { cost: 22.00, unit: "SF", desc: "Wood deck" },
  comp_deck:     { cost: 35.00, unit: "SF", desc: "Composite deck" },
  pool_conc:     { cost: 95.00, unit: "SF", desc: "Pool, concrete/gunite" },
  pool_vinyl:    { cost: 55.00, unit: "SF", desc: "Pool, vinyl liner" },
  pool_above:    { cost: 3500, unit: "EA", desc: "Above-ground pool" },
  landscape:     { cost: 4.50, unit: "SF", desc: "Landscaping & irrigation" },
  ext_light:     { cost: 350, unit: "EA", desc: "Exterior light fixture" },
  grill:         { cost: 165, unit: "EA", desc: "Outdoor grill" },
  // Apartment-specific (Cedar Ridge RSMeans 2024)
  carport:       { cost: 3972, unit: "Car", desc: "Carport, baked vinyl finish" },
  conc_curb:     { cost: 27.00, unit: "LF", desc: "Concrete curb & gutter" },
  monument_sign: { cost: 10400, unit: "EA", desc: "Monument sign, masonry" },
  lot_striping:  { cost: 13.50, unit: "Car", desc: "Parking lot striping" },
  wheel_stop:    { cost: 88.00, unit: "EA", desc: "Precast concrete wheel stop" },
  playground:    { cost: 12500, unit: "EA", desc: "Playground equipment set" },
  dog_park:      { cost: 13850, unit: "EA", desc: "Dog park / agility set" },
  storm_swale:   { cost: 14.85, unit: "LF", desc: "Concrete swale" },
  flagpole:      { cost: 3067, unit: "EA", desc: "Flagpole, aluminum, 30 ft" },
  tennis_court:  { cost: 34000, unit: "EA", desc: "Sport court w/ fence" },
  shed:          { cost: 40.00, unit: "SF", desc: "Storage shed, wood" },
};

export function estimateQuantities(data) {
  const sqft = parseFloat(data.sqft) || 1500;
  const br = parseInt(data.bedrooms) || 3;
  const ba = parseFloat(data.bathrooms) || 2;
  const isFurn = data.isFurnished || false;
  const grade = data.buildingGrade || "standard";
  const cust = ["custom", "luxury"].includes(grade);
  const isApartment = data.propertyType === "apartment";

  // For apartments, bedrooms represents unit count; for SFR it's actual bedrooms
  const unitCount = isApartment ? Math.max(br, 5) : 1;
  const perUnitSqft = isApartment ? Math.round(sqft / unitCount) : sqft;

  // Kitchen/cabinet quantities scale by unit count for apartments
  const kitBaseLF = isApartment
    ? Math.round(unitCount * 14)   // Cedar Ridge: 2324 LF / 166 units ≈ 14 LF/unit
    : (sqft < 1200 ? 12 : sqft < 2500 ? 18 : 24);
  const kitWallLF = isApartment
    ? Math.round(unitCount * 16)   // Cedar Ridge: 2656 LF / 166 units ≈ 16 LF/unit
    : (sqft < 1200 ? 8 : sqft < 2500 ? 14 : 18);
  const counterLF = isApartment
    ? Math.round(unitCount * 14)   // Cedar Ridge: 2324 LF / 166 units ≈ 14 LF/unit
    : kitBaseLF + Math.round(ba * 3);
  const floorSF = Math.round(sqft * 0.80);
  const winCount = isApartment
    ? Math.round(unitCount * 5)    // Cedar Ridge: 830 / 166 ≈ 5/unit
    : Math.max(Math.round(sqft / 90), 6);
  const perimLF = isApartment
    ? Math.round(unitCount * 191)  // Cedar Ridge: 31734 LF / 166 ≈ 191 LF/unit
    : Math.round(Math.sqrt(sqft) * 4 * 1.8);
  const closetLF = isApartment
    ? Math.round(unitCount * 28)   // Cedar Ridge: 4648 LF / 166 ≈ 28 LF/unit
    : br * 8 + 6;
  const fans = isApartment ? 0 : Math.min(Math.max(Math.round(sqft / 350), 2), br + 2);
  const dataOut = isApartment
    ? Math.round(unitCount * 2)    // Cedar Ridge: 332 / 166 = 2/unit
    : Math.max(br + 2, 4);
  const tvOut = isApartment
    ? Math.round(unitCount * 3)    // Cedar Ridge: 498 / 166 = 3/unit
    : Math.max(br + 1, 3);
  const gfci = isApartment ? 0 : Math.round(ba * 2) + 2;
  // Apartments have shared laundry (roughly 1 per 2 units)
  const washerQty = isApartment
    ? Math.max(1, Math.round(unitCount / 2))
    : Math.max(1, Math.floor(sqft / 3000) + 1);
  const dwQty = isApartment ? unitCount : washerQty;

  const items = [];
  const add = (cat, ref, qty) => { if (qty > 0) items.push({ category: cat, ...ref, qty }); };

  // Appliances — apartments scale per unit
  const applQty = isApartment ? unitCount : 1;
  add("Appliances", APPLIANCE_COSTS.range, applQty);
  add("Appliances", APPLIANCE_COSTS.dishwasher, isApartment ? unitCount : dwQty);
  add("Appliances", APPLIANCE_COSTS.garbage_disposal, applQty);
  add("Appliances", APPLIANCE_COSTS.microwave, applQty);
  add("Appliances", APPLIANCE_COSTS.refrigerator, applQty);
  add("Appliances", APPLIANCE_COSTS.washer, washerQty);
  add("Appliances", APPLIANCE_COSTS.dryer, washerQty);

  // Cabinetry
  add("Kitchen Cabinetry", cust ? OTHER_PP.cabinet_base_cust : OTHER_PP.cabinet_base_std, kitBaseLF);
  add("Kitchen Cabinetry", cust ? OTHER_PP.cabinet_wall_cust : OTHER_PP.cabinet_wall_std, kitWallLF);

  // Countertops
  add("Kitchen Countertops", cust ? OTHER_PP.counter_quartz : OTHER_PP.counter_standard, counterLF);

  // Flooring
  if (data.flooringType !== "mostly_tile") {
    const fc = data.flooringType === "mostly_removable" ? FLOORING_COSTS.lvt : FLOORING_COSTS.lvt;
    add("Removable Floor Coverings", fc, floorSF);
  }

  // Other PP
  if (!isApartment) {
    add("Ceiling Fans", OTHER_PP.ceiling_fan, fans);
  }
  add("Window Treatments", OTHER_PP.window_blind, winCount);
  add("Decorative Lighting", OTHER_PP.decorative_light, isApartment
    ? Math.round(unitCount * 2.5)  // Cedar Ridge: 415 / 166 ≈ 2.5/unit
    : Math.max(2, Math.round(sqft / 600)));
  add("Closet Shelving", OTHER_PP.closet_shelf, closetLF);
  add("Wood Base Moldings", OTHER_PP.base_molding, perimLF);
  add("Kitchen Sink & Rough-in", OTHER_PP.sink_kitchen, isApartment ? unitCount : 1);

  // Electrical
  const elecApplQty = isApartment ? Math.round(unitCount * 7) : 7;
  add("Special Purpose Electrical", OTHER_PP.appl_outlet, elecApplQty);
  if (!isApartment) add("Special Purpose Electrical", OTHER_PP.fan_wiring, fans);
  if (!isApartment) add("Special Purpose Electrical", OTHER_PP.gfci_outlet, gfci);
  add("Special Purpose Electrical", OTHER_PP.phone_data, dataOut);
  add("Special Purpose Electrical", OTHER_PP.coax_tv, tvOut);

  // Plumbing
  add("Special Purpose Plumbing", OTHER_PP.washer_hookup, washerQty);
  add("Special Purpose Plumbing", OTHER_PP.dryer_vent, isApartment ? unitCount : washerQty);
  add("Special Purpose Plumbing", OTHER_PP.dw_hookup, isApartment ? unitCount : dwQty);

  // Apartment-specific items
  if (isApartment) {
    add("Mirror", { cost: 131, unit: "EA", desc: "Furniture mirror, framed" }, Math.round(unitCount * 2));
    add("Millwork", { cost: 7.90, unit: "LF", desc: "Crown & chair rail molding" }, Math.round(unitCount * 24));
    add("Mailboxes", { cost: 70, unit: "EA", desc: "Residential letter slot" }, unitCount);
    add("Interior Signage", { cost: 47, unit: "EA", desc: "Room signage per unit" }, unitCount);
    add("Peephole / Knocker", { cost: 24, unit: "EA", desc: "Door peephole, wide view" }, unitCount);
    add("Emergency Lighting", { cost: 231, unit: "EA", desc: "Battery-pack emergency light" }, Math.max(4, Math.round(sqft / 7500)));
    add("Building Flood Lighting", { cost: 430, unit: "EA", desc: "Exterior LED wall pack" }, Math.max(8, Math.round(sqft / 3500)));
    add("Fitness Equipment", { cost: 5330, unit: "EA", desc: "Fitness center equipment set" }, 1);
    add("Cable TV System", { cost: 43, unit: "EA", desc: "TV receptacle w/ coax" }, Math.round(unitCount * 3));
  }

  // Fireplaces
  if (data.hasFireplace) {
    const n = Math.min(parseInt(data.numFireplaces) || 1, 4);
    add("Fireplace Inserts", OTHER_PP.fireplace, n);
    add("Fireplace Inserts", { ...OTHER_PP.appl_outlet, desc: "Fireplace electrical" }, n);
  }

  // Hot tub
  if (data.hasHotTub) {
    add("Hot Tub / Jacuzzi", OTHER_PP.hot_tub, 1);
    add("Hot Tub / Jacuzzi", { ...OTHER_PP.appl_outlet, desc: "Hot tub electrical" }, 1);
  }

  // Game room
  if (data.hasGameRoom) {
    add("Game Room Equipment", { cost: 2500, unit: "EA", desc: "Game table/equipment" }, 1);
    add("Game Room Equipment", { cost: 1200, unit: "EA", desc: "AV equipment" }, 1);
  }

  // Furniture
  if (isFurn && !isApartment) {
    const kings = Math.min(Math.ceil(br / 3), br);
    add("Furniture & FF&E", FURNITURE.bed_king, kings);
    if (br > kings) add("Furniture & FF&E", FURNITURE.bed_queen, br - kings);
    add("Furniture & FF&E", FURNITURE.dresser, br);
    add("Furniture & FF&E", FURNITURE.sofa, Math.max(1, Math.round(sqft / 1200)));
    add("Furniture & FF&E", FURNITURE.chair, Math.max(2, br));
    add("Furniture & FF&E", FURNITURE.dining, 1);
    add("Furniture & FF&E", FURNITURE.coffee, 1);
    add("Furniture & FF&E", FURNITURE.side, br);
    add("Furniture & FF&E", FURNITURE.tv_lg, Math.max(1, Math.round(sqft / 1500)));
    add("Furniture & FF&E", FURNITURE.tv_sm, Math.max(br - 1, 1));
    add("Furniture & FF&E", FURNITURE.rug, Math.max(2, Math.round(sqft / 500)));
    add("Furniture & FF&E", FURNITURE.art, Math.max(4, br * 2));
    add("Furniture & FF&E", FURNITURE.mirror, Math.round(ba));
    add("Furniture & FF&E", FURNITURE.lamp, Math.max(2, br));
    add("Furniture & FF&E", FURNITURE.sm_appl, 3);
  }

  // Land improvements
  if (isApartment) {
    // Apartment complex: large paved areas, carports, landscaping per Cedar Ridge
    const parkingSpaces = Math.max(Math.round(unitCount * 1.5), 20);
    const pavingSF = Math.round(parkingSpaces * 180);  // ~180 SF per space
    add("Land Improvements", SITE.asphalt, pavingSF);
    add("Land Improvements", SITE.concrete, Math.round(sqft * 0.25));  // sidewalks
    add("Land Improvements", SITE.conc_curb, Math.round(pavingSF / 100));
    add("Land Improvements", SITE.metal_fence, Math.round(Math.sqrt(sqft) * 6));
    add("Land Improvements", SITE.carport, Math.round(unitCount * 1.0));
    add("Land Improvements", SITE.landscape, Math.round(sqft * 0.6));
    add("Land Improvements", SITE.monument_sign, 1);
    add("Land Improvements", SITE.lot_striping, parkingSpaces);
    add("Land Improvements", SITE.wheel_stop, parkingSpaces);
    add("Land Improvements", SITE.playground, 1);
    add("Land Improvements", SITE.ext_light, Math.max(8, Math.round(sqft / 4000)));
    add("Land Improvements", SITE.grill, Math.max(2, Math.round(unitCount / 50)));
    add("Land Improvements", SITE.flagpole, Math.min(5, Math.max(1, Math.round(unitCount / 40))));
    add("Land Improvements", SITE.storm_swale, Math.round(sqft / 600));
  } else {
    if (["single_family", "multifamily"].includes(data.propertyType)) {
      add("Land Improvements", { ...SITE.asphalt, desc: "Driveway, asphalt" }, 400);
    }
    const fenceLF = sqft < 1500 ? 80 : sqft < 3000 ? 120 : 180;
    add("Land Improvements", SITE.wood_fence, fenceLF);
    add("Land Improvements", SITE.ext_light, Math.max(2, Math.round(sqft / 500)));
    add("Land Improvements", SITE.grill, 1);
  }

  if (data.hasPool) {
    const pt = data.poolType || "inground_concrete";
    if (pt === "above_ground") add("Land Improvements", SITE.pool_above, 1);
    else add("Land Improvements", pt === "inground_concrete" ? SITE.pool_conc : SITE.pool_vinyl,
      isApartment ? Math.max(600, Math.round(unitCount * 8)) : 450);
  }
  if (data.hasDeck) {
    const ds = { small: 200, medium: 500, large: 960 }[data.deckSize] || 500;
    add("Land Improvements", SITE.wood_deck, ds);
  }
  if (!isApartment && !["single_family", "condo"].includes(data.propertyType) || data.hasPool) {
    if (!isApartment) add("Land Improvements", SITE.landscape, Math.round(sqft * 0.3));
  }

  return items;
}

export function computeUnitCostBreakdown(data, depreciableBasis) {
  const raw = estimateQuantities(data);
  const pp5Items = raw.filter(i => i.category !== "Land Improvements").map(i => ({
    ...i,
    baseCost: Math.round(i.qty * i.cost),
    withIndirect: Math.round(i.qty * i.cost * (1 + INDIRECT_COST_RATE)),
    life: 5,
  }));
  const li15Items = raw.filter(i => i.category === "Land Improvements").map(i => ({
    ...i,
    baseCost: Math.round(i.qty * i.cost),
    withIndirect: Math.round(i.qty * i.cost * (1 + INDIRECT_COST_RATE)),
    life: 15,
  }));

  const rawPP5 = pp5Items.reduce((s, i) => s + i.withIndirect, 0);
  const rawLI15 = li15Items.reduce((s, i) => s + i.withIndirect, 0);
  const estBuildingRaw = depreciableBasis * 0.70;
  const totalRCNLD = rawPP5 + rawLI15 + estBuildingRaw;
  const allocFactor = totalRCNLD > 0 ? depreciableBasis / totalRCNLD : 1.0;

  const finalize = (items) => items.map(i => ({ ...i, allocatedCost: Math.round(i.withIndirect * allocFactor) }));
  const pp5Final = finalize(pp5Items);
  const li15Final = finalize(li15Items);

  // Group by category for display
  const groupBy = (items) => {
    const groups = {};
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  };

  return {
    pp5Items: pp5Final,
    li15Items: li15Final,
    pp5Groups: groupBy(pp5Final),
    li15Groups: groupBy(li15Final),
    pp5Total: pp5Final.reduce((s, i) => s + i.allocatedCost, 0),
    li15Total: li15Final.reduce((s, i) => s + i.allocatedCost, 0),
    allocFactor: Math.round(allocFactor * 1000) / 1000,
    indirectRate: INDIRECT_COST_RATE,
    totalRCNLD: Math.round(totalRCNLD),
  };
}
