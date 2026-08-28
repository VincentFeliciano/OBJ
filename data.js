/* =========================================
   OBJ.52 — data.js

   HOW TO ADD A NEW PIECE:
   Copy an entry, paste before the closing ];
   Update all fields. Save. Done.

   STATUS: AVAILABLE | SOLD | ARCHIVED | COMMISSIONED
   ========================================= */

const PIECES = [
  {
    id: "001",
    designation: "52 / 001",
    name: "THE QUIET ONE",
    subtitle: "Danish Armchair · Oiled Oak",
    status: "AVAILABLE",
    type: "FOUND",
    era: "c. 2020",
    found: "Unknown Provenance",
    materials: ["Oiled Oak", "Sif 95 Cognac Leather", "Steel Fasteners"],
    dimensions: '26"W × 24"D × 30"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "4 hrs",
    price: "$1,200",

    story: "Found through a private sale with no history attached. Whoever owned it took care of it. The leather shows the kind of wear that only comes from years of actual use — nothing cosmetic, nothing hidden. A chair that has been lived with.",

    restorationDesc: "Minimal intervention was the right call here. The piece didn't need saving. It needed respect. Leather conditioned, frame cleaned, every joint inspected. Nothing touched that didn't need to be touched.",

    preserved: [
      "Original leather upholstery",
      "Oiled oak frame finish",
      "Steel joinery hardware",
      "Manufacturer stamps"
    ],
    rebuilt: [
      "Leather conditioning treatment",
      "Frame surface cleaning",
      "Joint inspection and tightening"
    ],

    makersNote: "I almost passed on this one. It seemed too good for what I paid. I still don't understand how it ended up where it did.",

    restorationMaterials: ["Leather conditioner", "Natural wood soap", "Food-grade mineral oil"],

    objectHistory: [
      { year: "c. 2020", event: "Manufactured — EOOS Studio, Denmark" },
      { year: "Unknown", event: "Original ownership — location unknown" },
      { year: "2026", event: "Acquired by OBJ.52" },
      { year: "2026", event: "Inspected, cleaned, conditioned" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "chair2",
    images: [
      "EOOS_E005-oak-oil-leather-sif95_front.webp",
      "EOOS_E005-oak-oil-leather-sif95_side.webp",
      "EOOS_E005-oak-oil-leather-sif95_back.webp"
    ]
  },

  {
    id: "002",
    designation: "52 / 002",
    name: "THE LONG TABLE",
    subtitle: "Dining Table · Solid Beech",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 2013",
    found: "Albany, NY",
    materials: ["Solid Beech", "Beech Dowel Joinery"],
    dimensions: '70"W × 33"D × 29"H · Seats 6',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "14 hrs",
    price: "$2,400",

    story: "Found at an estate sale in Albany. The family had used it as a dining table, then a workbench, then storage. The top had decades of damage on it. Beneath that damage was some of the cleanest grain we've seen on a piece this size.",

    restorationDesc: "The surface was stripped entirely and refinished over three sessions. All joints were reglued, reclamped and left for 48 hours before the legs were releveled. The final coat is a hand-rubbed oil that took four applications to get right.",

    preserved: [
      "Original beech frame",
      "Original dowel joinery",
      "Original leg profile",
      "Original proportions"
    ],
    rebuilt: [
      "Full surface strip and refinish",
      "All joint regluing and reclamping",
      "Leg releveling",
      "Three-coat hand-rubbed oil finish"
    ],

    makersNote: "This table has probably had a thousand meals on it. That's not a reason to sand it flat — it's a reason to be careful about what you take off.",

    restorationMaterials: ["Scandinavian oil finish", "Furniture stripper", "220 and 320 grit paper", "Tack cloth"],

    objectHistory: [
      { year: "c. 2013", event: "Manufactured — origin unknown" },
      { year: "2013–2025", event: "Family dining table, Albany, NY" },
      { year: "2026", event: "Acquired at estate sale — Albany, NY" },
      { year: "2026", event: "Full restoration" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "table",
    images: [
      "c35_6pers_natur_2013_3_aae56cf3-0fb9-4fee-8038-944451ec057a.webp",
      "c35_6pers_natur_2013_5_aa7adf3b-c0e1-46e5-a3c6-b215117b8e37.webp"
    ]
  },

  {
    id: "003",
    designation: "52 / 003",
    name: "THE PARSLEY",
    subtitle: "Modular Organiser · Steel",
    status: "AVAILABLE",
    type: "REFORMATTED",
    era: "Contemporary",
    found: "Saratoga Springs, NY",
    materials: ["Powder-coated Steel", "Custom 3D-printed Hardware", "Rubber Gaskets"],
    dimensions: '24"W × 12"D × 10"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "9 hrs",
    price: "$890",

    story: "Found in near-new condition at a warehouse clearance in Saratoga. The configuration was wrong for anyone's use — too narrow, mismatched modules. We took it apart and rebuilt it into something that actually makes sense to live with.",

    restorationDesc: "The piece was fully disassembled, cleaned, and reassembled in a custom configuration. New 3D-printed hardware was designed in-house to replace the proprietary fittings that had been lost. The result is more modular than the original.",

    preserved: [
      "All original steel panels",
      "Original powder coat finish",
      "Original drawer mechanisms",
      "Original rubber gaskets"
    ],
    rebuilt: [
      "Custom module configuration",
      "3D-printed replacement hardware",
      "Interior lining",
      "Drawer alignment"
    ],

    makersNote: "The color is called Parsley. Whoever named it was right. It's exactly the green that a room doesn't know it needs until it's there.",

    restorationMaterials: ["PLA filament", "Interior liner material", "Isopropyl alcohol", "Microfiber cloth"],

    objectHistory: [
      { year: "Contemporary", event: "Manufactured — Montana, Denmark" },
      { year: "Unknown", event: "Warehouse clearance — Saratoga Springs, NY" },
      { year: "2026", event: "Acquired by OBJ.52" },
      { year: "2026", event: "Disassembled, reconfigured, 3D hardware fabricated" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "chest",
    images: [
      "Montana_Selection_CLASSIFY_Organiser_Parsley_Perspective_83660474-fdbf-4148-a273-1f59a43dc167.webp"
    ]
  },

  {
    id: "004",
    designation: "52 / 004",
    name: "THE SABOTS",
    subtitle: "Coffee Table · Solid Walnut",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 1960",
    found: "Troy, NY",
    materials: ["Solid Walnut", "Steel Sabots", "Danish Oil"],
    dimensions: '48"W × 20"D × 15"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "11 hrs",
    price: "$1,450",

    story: "Found in a back room in Troy. The steel sabots — the pointed feet — were what made it. Someone in 1960 decided to put those legs on that top and got it exactly right. We just got it back to where it should be.",

    restorationDesc: "The walnut top was hand-rubbed with Danish oil over three coats across four days, allowing full penetration between applications. The steel sabots were cleaned, polished, and re-seated. The top was releveled.",

    preserved: [
      "Original solid walnut top",
      "Original steel sabot feet",
      "Original joinery",
      "Original proportions"
    ],
    rebuilt: [
      "Full surface refinish — three-coat Danish oil",
      "Steel foot cleaning and polishing",
      "Top releveling",
      "Surface scratch repair"
    ],

    makersNote: "The walnut on this piece has a figure in it that I kept trying to photograph and couldn't. It's the kind of thing you have to see in person. Whoever bought it knows what I mean.",

    restorationMaterials: ["Danish oil", "0000 steel wool", "Metal polish", "220 grit paper"],

    objectHistory: [
      { year: "c. 1960", event: "Manufactured — origin unknown" },
      { year: "1960–2025", event: "Private ownership — Troy, NY" },
      { year: "2026", event: "Acquired by OBJ.52 — Troy, NY" },
      { year: "2026", event: "Full restoration — 11 hours" },
      { year: "2026", event: "Sold — private collection" }
    ],

    folder: "coffeeTable",
    images: [
      "AK_2530_valn_d.webp"
    ]
  },

  {
    id: "005",
    designation: "52 / 005",
    name: "THE ZACH",
    subtitle: "Z-Chair · Walnut Frame",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 1950s",
    found: "Hudson, NY",
    materials: ["Hand-finished Walnut", "Olive Bouclé Upholstery", "Steel Springs"],
    dimensions: '28"W × 32"D × 33"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "22 hrs",
    price: "$1,800",

    story: "The Z-chair silhouette is one of the great designs of the 1950s. This one was found in Hudson in rough shape — the original upholstery was gone, the frame had been painted over at some point, and one arm had a crack through it. Under the paint was walnut.",

    restorationDesc: "The frame was stripped of paint, repaired at the arm crack with hide glue and hand-carved fill, restained, and finished with three coats of lacquer. New steel springs were installed. The cushions were reupholstered in a heavyweight olive bouclé.",

    preserved: [
      "Original walnut frame",
      "Original Z-profile geometry",
      "Original arm joinery",
      "Original base construction"
    ],
    rebuilt: [
      "Full paint strip and walnut restoration",
      "Arm crack repair — hide glue and carved fill",
      "New steel spring installation",
      "Full reupholstery — olive bouclé"
    ],

    makersNote: "Someone painted over walnut. I don't understand it. But I'm glad they did, because it preserved the wood underneath better than leaving it exposed would have.",

    restorationMaterials: ["Paint stripper", "Hide glue", "Walnut stain", "Lacquer", "Olive bouclé fabric", "Steel springs", "Upholstery tacks"],

    objectHistory: [
      { year: "c. 1955", event: "Manufactured — origin unknown" },
      { year: "Unknown", event: "Original ownership — painted over" },
      { year: "2026", event: "Acquired by OBJ.52 — Hudson, NY" },
      { year: "2026", event: "Full restoration — 22 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "chair",
    images: [
      "Zach_Chair_Green-Three_Qtr_2000x.webp",
      "Zach_Chair_Green-ZCH-1100-OG-Front_2000x.webp",
      "Zach_Chair_Green-Profile_2000x.webp",
      "Zach_Chair_Green-Rear_2000x.webp"
    ]
  },

  {
    id: "006",
    designation: "52 / 006",
    name: "THE GEORGE",
    subtitle: "Coffee Table · Live-Edge Walnut",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 2015",
    found: "Rhinebeck, NY",
    materials: ["Live-Edge Walnut Slab", "Welded Steel Base", "Matte Powder Coat"],
    dimensions: '54"W × 26"D × 16"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "8 hrs",
    price: "$2,100",

    story: "Found at a studio sale in Rhinebeck. The maker had built it for themselves and decided to part with it. The live edge was intact, the base was solid, but neither had been properly finished. The wood had dried unevenly and the base had surface oxidation.",

    restorationDesc: "The slab was sanded progressively from 80 to 400 grit, then finished with a matte penetrating oil that took three coats over three days to cure fully. The steel base was wire-brushed, primed, and powder-coated matte black in-house.",

    preserved: [
      "Original walnut slab",
      "Live edge — fully intact",
      "Natural slab split and figure",
      "Original base geometry"
    ],
    rebuilt: [
      "Full slab resurfacing — 80 to 400 grit",
      "Three-coat penetrating oil finish",
      "Steel base — wire brush, prime, powder coat",
      "Rubber foot replacement"
    ],

    makersNote: "The split down the center of the slab isn't a flaw. It's where the tree decided to be. I built the finish around it instead of filling it.",

    restorationMaterials: ["Penetrating matte oil", "Steel primer", "Matte black powder coat", "Sandpaper 80–400", "Rubber feet"],

    objectHistory: [
      { year: "c. 2015", event: "Built by independent maker — Rhinebeck, NY" },
      { year: "2015–2025", event: "Studio use — maker's personal piece" },
      { year: "2026", event: "Acquired at studio sale — Rhinebeck, NY" },
      { year: "2026", event: "Restoration — 8 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "table2",
    images: [
      "GeorgeCoffeeTable-Three_Qtr_2000x.webp",
      "GeorgeCoffeeTable-Face_400x.webp",
      "GeorgeCoffee_NW_Det_400x.webp"
    ]
  },

  {
    id: "007",
    designation: "52 / 007",
    name: "THE PAIR",
    subtitle: "Stacking Coffee Tables · Solid Walnut",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 1955",
    found: "Schenectady, NY",
    materials: ["Solid Walnut", "Forged Iron Hairpin Legs", "Shellac Finish"],
    dimensions: 'Large: 36"W × 24"D × 16"H  Small: 28"W × 18"D × 13"H',
    edition: "ONE OF ONE — SET OF 2",
    restored: "2026",
    restorationTime: "13 hrs",
    price: "$980",

    story: "Found together at a Schenectady estate sale, clearly original companions. The organic walnut tops with their softened edges are characteristic of mid-50s American craft — made at a time when someone still cared about the underside of a tabletop.",

    restorationDesc: "Both surfaces were cleaned, lightly abraded, and re-shellacked to match the original sheen. The iron hairpin legs were straightened by hand, rust-treated, and sealed. Sold only as a pair.",

    preserved: [
      "Both original walnut tops",
      "Organic edge profiles — both pieces",
      "Original hairpin leg iron",
      "Original proportional relationship between pieces"
    ],
    rebuilt: [
      "Surface clean and re-shellac — both tops",
      "Hairpin leg straightening",
      "Iron rust treatment and sealing",
      "Rubber foot tips"
    ],

    makersNote: "These were made to be together. I'm not separating them. If you buy them, they stay a set.",

    restorationMaterials: ["Shellac", "Denatured alcohol", "Rust converter", "Clear metal sealer", "Rubber tips"],

    objectHistory: [
      { year: "c. 1955", event: "Manufactured — American craft, origin unknown" },
      { year: "1955–2025", event: "Family ownership — Schenectady, NY" },
      { year: "2026", event: "Acquired at estate sale — Schenectady, NY" },
      { year: "2026", event: "Restoration — 13 hours total" },
      { year: "2026", event: "Entered archive — set of 2" }
    ],

    folder: "coffeetable2",
    images: [
      "GibsonStackingCoffeeTables_2000x.webp",
      "GIB-200-CW3_400x.jpg",
      "GIB-200-CW-A_400x.jpg",
      "GIB-200-CW-B_400x.jpg",
      "GIB-200-WN2_400x.jpg"
    ]
  },

  {
    id: "008",
    designation: "52 / 008",
    name: "THE LEWIS",
    subtitle: "Media Cabinet · Solid Walnut",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 1958",
    found: "Kingston, NY",
    materials: ["Solid Walnut", "Louvered Sliding Doors", "Brass Pulls", "Tapered Legs"],
    dimensions: '60"W × 18"D × 28"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "26 hrs",
    price: "$3,200",

    story: "Found in a Kingston basement in near-complete darkness. The walnut had oxidized to almost black, the louvered doors had swollen off their tracks, and someone had replaced two of the original brass pulls with mismatched hardware from the 1980s. Everything else was original.",

    restorationDesc: "The exterior was hand-sanded and finished with three coats of oil applied over six days. The louvered doors were removed, planed, re-fitted, and re-hung. Interior was cleaned and lined. Two replacement brass pulls were cast to match the originals.",

    preserved: [
      "Original solid walnut carcass",
      "Original louvered door construction",
      "Two original brass pulls",
      "Original tapered legs",
      "Original interior shelf configuration",
      "Original manufacturer label — rear panel"
    ],
    rebuilt: [
      "Full exterior refinish — hand oil, three coats",
      "Louvered doors — planed, re-fitted, re-hung",
      "Two cast brass pull replacements",
      "Interior clean and lining",
      "Door track replacement"
    ],

    makersNote: "26 hours. That's what it cost to bring this thing back. I priced it at $3,200 and felt like I was undercharging.",

    restorationMaterials: ["Scandinavian oil finish", "Sandpaper 80–400", "Brass casting resin", "Interior liner", "Door track hardware"],

    objectHistory: [
      { year: "c. 1958", event: "Manufactured — American, origin unknown" },
      { year: "1958–2025", event: "Private ownership — Kingston, NY" },
      { year: "2026", event: "Acquired by OBJ.52 — Kingston, NY" },
      { year: "2026", event: "Full restoration — 26 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "crdnza",
    images: [
      "LewisTV_MW_2_4542a32b-8988-4461-ae9f-747e873b19bd_2000x.webp",
      "LewisTV_MW_Det1_927ccc0c-bf3e-4979-88d0-463abf2e8c49_2000x.webp",
      "LewisTV_MW_Det2_1c38f2ab-cb9c-4a7b-a281-ee2523336c1c_2000x.webp",
      "LewisTVCabinet_6_449f2f97-c5ef-4ec7-965a-3897fe562ba0_2000x.webp"
    ]
  },

  {
    id: "009",
    designation: "52 / 009",
    name: "THE OSLO",
    subtitle: "Media Cabinet · Mixed Walnut",
    status: "AVAILABLE",
    type: "REFORMATTED",
    era: "c. 1962",
    found: "Catskill, NY",
    materials: ["Solid Walnut", "Open Shelving", "Louvered Center Panel", "Fabricated Legs"],
    dimensions: '72"W × 16"D × 26"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "31 hrs",
    price: "$2,750",

    story: "Found as a single-door closed cabinet in Catskill. The proportions were good. The original plinth base was not. We took it apart, made decisions about what it could become, and built it back differently than it was found.",

    restorationDesc: "The carcass was fully restored. The original plinth base was removed and replaced with custom fabricated angled legs built in-house. The doors were reconfigured — open shelving flanking a retained louvered center panel — to create a configuration that didn't exist in the original.",

    preserved: [
      "Original walnut carcass",
      "Original louvered center panel",
      "Original interior dimensions",
      "Original walnut finish — matched throughout"
    ],
    rebuilt: [
      "Full exterior refinish",
      "Custom angled leg fabrication — welded steel",
      "Door reconfiguration — open + louvered",
      "New shelf construction",
      "Plinth base removal"
    ],

    makersNote: "This isn't a restored piece. It's a reimagined one. I made choices about what it should be. The person who bought it understood that.",

    restorationMaterials: ["Walnut stain", "Oil finish", "Steel bar stock", "Welding supplies", "Sandpaper 80–400"],

    objectHistory: [
      { year: "c. 1962", event: "Manufactured — origin unknown" },
      { year: "1962–2025", event: "Private ownership — Catskill, NY" },
      { year: "2026", event: "Acquired by OBJ.52 — Catskill, NY" },
      { year: "2026", event: "Reimagined — 31 hours" },
      { year: "2026", event: "Sold — private collection" }
    ],

    folder: "crdnza2",
    images: [
      "OsloTV_2000x.webp",
      "OsloTV2_400x.webp",
      "OsloTVDetial_400x.webp",
      "OsloTVOpen_400x.webp"
    ]
  },

  {
    id: "010",
    designation: "52 / 010",
    name: "THE BENCH",
    subtitle: "Entry Bench · Solid Cherry",
    status: "AVAILABLE",
    type: "FOUND",
    era: "c. 2018",
    found: "Woodstock, NY",
    materials: ["Solid Cherry", "Through-Tenon Stretcher", "Natural Oil Finish"],
    dimensions: '60"W × 14"D × 18"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "5 hrs",
    price: "$760",

    story: "Found at a studio closeout in Woodstock. A craftsperson had built it for a client who backed out of the order. It sat in the studio for years. The cherry had already begun to darken toward its final color, which is where cherry wants to be anyway.",

    restorationDesc: "Minimal intervention. The piece was cleaned, lightly abraded, and re-oiled. The through-tenon joinery was inspected — it was tight. Nothing needed to be corrected, only maintained.",

    preserved: [
      "Original solid cherry frame",
      "Through-tenon stretcher — original",
      "A-frame leg geometry",
      "All original joinery",
      "Natural cherry patina"
    ],
    rebuilt: [
      "Surface cleaning and light abrasion",
      "Re-oiling — natural oil finish",
      "Rubber foot replacement"
    ],

    makersNote: "Cherry darkens with light. In five years this bench will be the color of old bourbon. Buy it now and watch it change.",

    restorationMaterials: ["Natural oil finish", "320 grit paper", "Tack cloth", "Rubber feet"],

    objectHistory: [
      { year: "c. 2018", event: "Handbuilt — independent craftsperson, Woodstock, NY" },
      { year: "2018–2025", event: "Studio storage — client order cancelled" },
      { year: "2026", event: "Acquired at studio closeout — Woodstock, NY" },
      { year: "2026", event: "Cleaned, oiled, maintained — 5 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "bench",
    images: [
      "KOB-BEN200-1_b1119344-dc80-407b-bc9c-c703cde7e038_2000x.webp",
      "KOB-BEN200-2_f0783850-ac7f-4ce1-ac1a-1a82542a2837_2000x.webp",
      "KOB-BEN200-3_a91c7dd1-46d6-4a18-8cf3-d6e7d53706b6_2000x.webp",
      "KOB-BEN200-4_51151ac8-4736-4dc9-b980-5fe88617e91e_2000x.webp"
    ]
  },

  {
    id: "011",
    designation: "52 / 011",
    name: "THE ASHTRAY",
    subtitle: "Mid-Century Floor Stand · Magazine Holder",
    status: "AVAILABLE",
    type: "FOUND",
    era: "c. 1960s",
    found: "Estate Sale, Unknown Region",
    materials: ["Spun Aluminum", "Turned Wood Post", "Cast Iron Base"],
    dimensions: '6"W × 6"D × 26"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "2 hrs",
    price: "$320",

    story: "A floor-standing ashtray from the era when smoking was still considered a design problem worth solving elegantly. The magazine holder below it suggests an office or waiting room — somewhere people sat and read and smoked and thought. Both functions are obsolete now. The object isn't.",

    restorationDesc: "Light cleaning throughout. The aluminum bowl was polished by hand to remove oxidation. The wood post was cleaned and waxed. The cast iron base was treated to halt surface rust without removing its patina. Restored to function, not to newness.",

    preserved: [
      "Original spun aluminum bowl",
      "Turned wood post — all original",
      "Cast iron weighted base",
      "Magazine rack arms",
      "Period surface patina"
    ],
    rebuilt: [
      "Aluminum bowl — hand polished",
      "Wood post — cleaned and waxed",
      "Base — rust treatment and preservation"
    ],

    makersNote: "The design logic here is impeccable. Heavy base so it doesn't tip. Magazine holder so you have something to do while you wait. Removable bowl for cleaning. Someone thought this through.",

    restorationMaterials: ["Aluminum polish", "Paste wax", "Rust converter", "Lint-free cloths"],

    objectHistory: [
      { year: "c. 1960s", event: "Manufactured — American or Scandinavian origin, unknown maker" },
      { year: "1960s–2020s", event: "In use — office or waiting room, unknown location" },
      { year: "2026", event: "Acquired at estate sale" },
      { year: "2026", event: "Cleaned, polished, preserved — 2 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "ashtray",
    images: [
      "mid-century-ashtray-with-magazine-holder-1960s.jpg"
    ]
  },

  {
    id: "012",
    designation: "52 / 012",
    name: "THE BOUNCE",
    subtitle: "Spring-Loaded Jump Shoes · George Pierce · c. 1965",
    status: "AVAILABLE",
    type: "FOUND",
    era: "c. 1965",
    found: "Unknown Provenance",
    materials: ["Enameled Steel Shell", "Coil Spring Base", "Aluminum Platform", "Canvas Web Strap", "Steel Buckle"],
    dimensions: '10"L × 5"W × 5"H (pair)',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "1 hr",
    price: "$240",

    story: "Spring-loaded exercise shoes from the era when fitness was still a novelty. You strapped them onto your feet and bounced. The idea was that the coil springs would absorb impact and let you jump longer, harder, and with less damage to your knees. Whether it worked is beside the point. Someone designed these very carefully — the dome foot cup, the buckle strap, the weighted platform. These are a pair of ideas that happened to also be shoes.",

    restorationDesc: "Minimal intervention. The red enamel paint was touched up where it had chipped. The canvas straps were cleaned. The springs were inspected — full compression and extension, no fatigue. The aluminum platforms were wiped and left as found. These are display-ready and functional.",

    preserved: [
      "Original red enamel shell — both shoes",
      "Coil spring assembly — original and functional",
      "Canvas web straps — original",
      "Steel buckles",
      "Aluminum platform base"
    ],
    rebuilt: [
      "Enamel touch-up — minor chips",
      "Canvas strap cleaning",
      "Spring inspection and cleaning"
    ],

    makersNote: "I don't know if anyone is going to bounce in these. But I didn't restore them for that. There is something about a pair of red coil-spring shoes from 1965 that doesn't need any explanation.",

    restorationMaterials: ["Red touch-up enamel", "Degreaser", "Lint-free cloth"],

    objectHistory: [
      { year: "c. 1965", event: "Manufactured — George Pierce, origin unknown" },
      { year: "1965–Unknown", event: "In use — unknown" },
      { year: "2026", event: "Acquired by OBJ.52" },
      { year: "2026", event: "Cleaned, inspected, minor touch-up — 1 hour" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "jumpshoesgeorgepierce",
    images: [
      "Screenshot 2026-08-26 093932.png"
    ]
  },

  {
    id: "013",
    designation: "52 / 013",
    name: "THE STANLEY",
    subtitle: "Machinist's Tool Chest · Industrial Steel",
    status: "AVAILABLE",
    type: "RESTORED",
    era: "c. 1970s",
    found: "Workshop Clearance, Unknown Region",
    materials: ["Industrial Steel Body", "Chrome Drawer Pulls", "Ball-Bearing Drawer Slides", "Original Factory Paint"],
    dimensions: '18"W × 9"D × 13"H',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "3 hrs",
    price: "$480",

    story: "A Stanley machinist's chest from the era when tool storage was considered part of the craft. Whoever owned this kept their tools the right way — organized, protected, serious. The drawers still slide on their original ball bearings. The Stanley name is stamped into the steel on the front. These things were built to last decades in working shops. This one did.",

    restorationDesc: "Surface cleaning throughout. The exterior paint was cleaned and touched up where the steel showed through. Drawer slides were cleaned and lubricated — all drawers open and close smoothly. Chrome pulls were polished. The interior drawer liners were replaced with new felt. The chest closes flush.",

    preserved: [
      "Original steel body construction",
      "Factory paint — original color",
      "Ball-bearing drawer slides",
      "Chrome drawer pulls — original",
      "Stanley manufacturer's stamp"
    ],
    rebuilt: [
      "Exterior paint — surface cleaning and touch-up",
      "Drawer slides — cleaned and lubricated",
      "Chrome pulls — polished",
      "Interior drawer liners — replaced with felt"
    ],

    makersNote: "Stanley made these to be used hard for a long time. That's exactly what happened. I just cleaned it up and put it back in service.",

    restorationMaterials: ["Industrial degreaser", "Touch-up paint", "Dry lubricant", "Metal polish", "Adhesive felt liner"],

    objectHistory: [
      { year: "c. 1970s", event: "Manufactured — Stanley Tools, USA" },
      { year: "1970s–2020s", event: "In working shop use — location unknown" },
      { year: "2026", event: "Acquired at workshop clearance" },
      { year: "2026", event: "Cleaned, lubricated, relined — 3 hours" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "stanleychest",
    images: [
      "174b44be-de97-40b9-a878-1248452de23f.avif",
      "27fab2fc-8f82-46a0-a4f0-999f21dd71db.avif",
      "6f2e8f9b-d03f-4401-b1cb-6ec217c0e175.avif",
      "6f91541d-dd11-47b5-b5ce-c2b8be288452.avif",
      "81aa075c-07eb-4e2a-820c-62b12152a60f.avif",
      "999ddb8f-88c5-40fe-9d42-fd9762bfd108.avif"
    ]
  },

  {
    id: "014",
    designation: "52 / 014",
    name: "THE JOCKEY",
    subtitle: "Cast Aluminum Lawn Jockey · Full Restoration · 4 ft",
    status: "SOLD",
    type: "RESTORED",
    era: "c. 1960s",
    found: "Saratoga Springs, NY",
    materials: ["Cast Aluminum Body", "Automotive Filler", "Primer", "Enamel Paint", "Lacquered Wood Base"],
    dimensions: '18"W × 12"D × 48"H · 40 lbs',
    edition: "ONE OF ONE",
    restored: "2026",
    restorationTime: "Est. 18 hrs",
    price: "$1,400",

    story: "Found in Saratoga Springs, which is the right place to find something like this. The Saratoga Race Course has been running since 1863 — the oldest sporting venue in the country. This is a four-foot, forty-pound cast aluminum lawn jockey in blue and white checkered silks, arm raised. It has weight to it. Literal and otherwise. These figures stood outside homes and estates for decades. This one is getting a second life.",

    restorationDesc: "Full surface restoration. The cast aluminum body was stripped, filled with automotive body filler where the surface had pitted and corroded, then block-sanded smooth in stages from 80 to 400 grit. Primed, finish-coated in enamel, and detailed by hand — silks, boots, face, and base. The lacquered wood base was cleaned and refinished. This is the most labor-intensive restoration in the archive.",

    preserved: [
      "Original cast aluminum body — structural integrity intact",
      "Original form and proportion — all detail preserved",
      "Lacquered wood base — original, refinished"
    ],
    rebuilt: [
      "Surface — stripped, filled, block-sanded 80–400 grit",
      "Primer coat — full body",
      "Enamel finish — full repaint",
      "Hand-detailed — silks, face, boots, base",
      "Base — cleaned and refinished"
    ],

    makersNote: "Forty pounds of aluminum. Four feet tall. Arm in the air like it just crossed the wire. Saratoga is horse country — this piece never left. It just needed someone to bring it back.",

    restorationMaterials: ["Automotive body filler", "Sandpaper 80–400 grit", "Tack cloth", "Self-etching primer", "Enamel paint — white, blue, black, brown, green", "Clear coat", "Wood stain", "Lacquer"],

    objectHistory: [
      { year: "c. 1960s", event: "Cast — American aluminum foundry, origin unknown" },
      { year: "1960s–2020s", event: "Lawn display — private estate, Saratoga Springs, NY" },
      { year: "2026", event: "Acquired by OBJ.52 — Saratoga Springs, NY" },
      { year: "2026", event: "Full surface restoration — strip, fill, sand, prime, paint" },
      { year: "2026", event: "Entered archive" }
    ],

    folder: "SARATOGAJOCKEY",
    images: [
      "IMG_3294.jpeg",
      "IMG_3295.jpeg",
      "IMG_3296.jpeg",
      "IMG_3297.jpeg",
      "IMG_3298.jpeg"
    ]
  }

  /* ── ADD NEW PIECES ABOVE THIS LINE ─── */
];
