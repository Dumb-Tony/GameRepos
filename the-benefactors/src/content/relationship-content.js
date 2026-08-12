const source = (id, name, role, help, options = {}) => ({
  id,
  name,
  role,
  alignment: options.alignment || "source",
  help,
  nodeEffects: options.nodeEffects || {},
  choiceEffects: options.choiceEffects || {},
});

export const CHARACTER_PROFILES = Object.freeze({
  lionel_records: source("lionel", "Lionel Price", "City records clerk", "Quiet access to sealed municipal filings", {
    nodeEffects: { defensive: { trust: 1, risk: 1, note: "Named the E. Marsh credential" } },
    choiceEffects: {
      protect: { trust: 2, promise: "Keep Lionel out of the story", note: "Promised source protection" },
      challenge: { trust: -2, risk: 1, note: "Blamed him for staying silent" },
    },
  }),
  june_window: source("june", "June Bell", "Vale's neighbor", "Street-level memory and an unbroken view of Bellweather Lane", {
    nodeEffects: { construction: { trust: 1, risk: 1, note: "Gave an eyewitness account" } },
    choiceEffects: { finish: { trust: 1, promise: "Quote June accurately", note: "Asked permission to quote her" } },
  }),
  harrow_manager: source("oren", "Oren Pike", "Harrow Street manager", "Building access, tenant history, and courier records", {
    nodeEffects: { northstar: { trust: 2, risk: 1, note: "Exposed Northstar's mail route" } },
  }),
  foundation_receptionist: source("celia", "Celia Orr", "Foundation receptionist", "Access logs and internal administrative habits", {
    alignment: "gatekeeper",
    nodeEffects: { marsh: { trust: 1, risk: 2, note: "Pointed to the public access extract" } },
    choiceEffects: { finish: { trust: -1, note: "Pressed her after the disclosure" } },
  }),
  gala_attendant: source("imani-kade", "Imani Kade", "Calder Grand attendant", "Guest movements, service access, and what the cameras miss", {
    nodeEffects: { wren: { trust: 2, risk: 2, note: "Identified Silas Wren" } },
    choiceEffects: { finish: { trust: 1, promise: "Do not identify Imani as the source", note: "Did not force her to acknowledge the pass" } },
  }),
  cassian_rook_gala: source("rook", "Cassian Rook", "Brighter Horizon chair", "A direct line into the public face of the Benefactors", {
    alignment: "adversary",
    nodeEffects: { northstar: { trust: -1, risk: 2, note: "Made Rook aware of the Northstar evidence" } },
  }),
  mina_harcourt: source("mina", "Mina Harcourt", "Former foundation accountant", "The private program ledger and its matching city contracts", {
    nodeEffects: {
      "room-b": { trust: 2, risk: 2, note: "Confirmed the shell-contractor system" },
      proof: { trust: 2, risk: 1, promise: "Keep Mina's name out of the first story", note: "Entrusted the surviving index" },
    },
  }),
  rina_mercer: source("rina", "Rina Mercer", "Bellwether organizer", "Community witnesses, samples, and a chain of custody", {
    nodeEffects: { timeline: { trust: 2, risk: 1, note: "Put the relief operation in the correct order" }, tap: { trust: 1, note: "Offered to sign the sample custody" } },
  }),
  elian_voss: source("elian", "Dr. Elian Voss", "University researcher", "Independent laboratory analysis and scientific context", {
    nodeEffects: { analysis: { trust: 2, risk: 2, note: "Identified the engineered VA-9 marker" }, proof: { trust: 1, note: "Opened the surviving research file" } },
  }),
  tess_arlen: source("tess", "Tess Arlen", "Verdant field scientist", "Parcel Six records and the original test-range history", {
    nodeEffects: { truth: { trust: 2, risk: 2, note: "Named Parcel Six as a controlled stress test" }, proof: { trust: 1, note: "Revealed the telemetry route" } },
  }),
  nia_kade: source("nia", "Nia Kade", "Crownline analyst", "Crisis models, priority protocols, and live telemetry", {
    nodeEffects: { truth: { trust: 2, risk: 2, note: "Explained Crownline's governance score" }, proof: { trust: 1, note: "Directed the search of Crownline" } },
  }),
  ellis_ward: source("ellis", "Ellis Ward", "Airfield dispatcher", "Flight windows, manifests, and protected departures", {
    nodeEffects: { truth: { trust: 2, risk: 2, note: "Named Orpheus as Redoubt's destination" } },
    choiceEffects: { finish: { trust: 1, promise: "Keep Ellis out of the airfield account", note: "Promised discretion on the apron" } },
  }),
  tamsin_pike: source("tamsin", "Tamsin Pike", "Blackwater harbormaster", "Tide windows, cargo records, and island access", {
    nodeEffects: { truth: { trust: 2, risk: 2, note: "Exposed Orpheus's clinic supply route" }, proof: { trust: 1, note: "Offered the maintenance badge" } },
  }),
  adrian_moss: source("adrian", "Adrian Moss", "Orpheus arrival controller", "Internal routes and the truth about the First Circle", {
    nodeEffects: { truth: { trust: 2, risk: 3, note: "Named the Benefactors and their Assembly" }, proof: { trust: 1, note: "Kept the maintenance badge active" } },
  }),
  mara_field_editor: source("mara", "Mara Venn", "Editor and confidante", "Source protection, secure copies, and editorial judgment", {
    alignment: "ally",
    nodeEffects: { support: { trust: 2, note: "Committed the Ledger to the investigation" }, islands: { trust: 1, risk: 1, note: "Received the Sanctuary Chain evidence" } },
  }),
  port_prosper_engineer: source("imani-cross", "Imani Cross", "Signal Exchange engineer", "Infrastructure expertise and the surviving relay trace", {
    alignment: "ally",
    nodeEffects: { relay: { trust: 2, risk: 1, note: "Shared Relay Seven's surviving trace" }, destination: { trust: 1, note: "Pointed to the nautical time source" } },
  }),
  terminal_dispatcher: source("aya", "Aya Sorn", "Eastern-terminal dispatcher", "Ferry schedules, locker custody, and the habits of false auditors", {
    nodeEffects: { courier: { trust: 2, risk: 2, note: "Identified the Vesper courier's cover routine" }, warning: { trust: 1, note: "Kept the terminal camera loop open" } },
    choiceEffects: { protect: { trust: 1, promise: "Keep Aya out of the terminal account", note: "Promised to protect the dispatcher" } },
  }),
  vesper_archive_controller: source("noor", "Noor Aven", "Vesper archive controller", "Suppressed warnings, disclosure controls, and remote access to Shepherd", {
    nodeEffects: { truth: { trust: 2, risk: 3, note: "Confirmed that Vesper withholds public warnings" }, access: { trust: 1, risk: 1, note: "Opened the lower disclosure buffer" } },
    choiceEffects: {
      protect: { trust: 2, promise: "Seal Noor's identity in the Vesper file", note: "Promised source protection on the island" },
      challenge: { trust: -2, risk: 1, note: "Held Noor responsible for Shepherd's silence" },
    },
  }),
});
