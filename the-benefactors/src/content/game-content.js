export const GAME_CONTENT = Object.freeze({
  title: "The Benefactors",
  subtitle: "Every good lie leaves paperwork.",
  chapter: "Prologue · The Renovation",
  locations: {
    home_office: {
      id: "home_office",
      name: "Home Office",
      eyebrow: "Greyhaven · 9:14 PM",
      description:
        "A rented apartment, a secondhand desk, and one empty evidence board waiting for the wrong story.",
    },
    ledger_newsroom: {
      id: "ledger_newsroom",
      name: "The Greyhaven Ledger",
      eyebrow: "Tomorrow's news, yesterday's computers",
      description:
        "The night desk glows beneath tired fluorescent lights. Mara is waiting with an assignment that should be simple.",
    },
  },
  officeHotspots: [
    {
      id: "evidence-board",
      label: "Evidence board",
      className: "hotspot-board",
      title: "Nothing connected. Yet.",
      text: "A clean corkboard is an optimistic thing. Soon it will hold names, receipts, photographs, and decisions you cannot take back.",
    },
    {
      id: "city-map",
      label: "Greyhaven map",
      className: "hotspot-map",
      title: "Greyhaven",
      text: "City Hall. The Ledger. Mayor Vale's house. For now, the city still fits on one wall.",
    },
    {
      id: "laptop",
      label: "Laptop",
      className: "hotspot-laptop",
      title: "Inbox: quiet",
      text: "No anonymous leaks. No impossible attachments. Just invoices, newsletters, and a reminder that your rent is late.",
    },
    {
      id: "answering-machine",
      label: "Answering machine",
      className: "hotspot-phone",
      title: "No new messages",
      text: "The red light is dark. Silence feels ordinary tonight.",
    },
    {
      id: "window",
      label: "Window",
      className: "hotspot-window",
      title: "Greyhaven after dark",
      text: "Rain varnishes the street. Across the road, a parked sedan keeps its lights off.",
    },
  ],
});

