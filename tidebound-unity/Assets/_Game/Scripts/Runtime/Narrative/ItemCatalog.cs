using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>One carried thing, as the pack shows it.</summary>
    public class ItemRow
    {
        public string Id;
        public string Name;
        public int Count;
        public string Flavor;
        /// <summary>
        /// The use-from-the-pack hook (owner's roadmap: "drink from a
        /// canteen"). Null means the item is carried, not used — v1 for
        /// everything; uses light up per-item as their actions land.
        /// </summary>
        public string UseLabel;
        public System.Action<GameManager> Use;
    }

    /// <summary>
    /// Everything you're carrying, named and flavored. Item ids are the
    /// VN's inventory keys (a VN-save import must stay possible); unknown
    /// keys still show, plainly, so nothing carried is ever invisible.
    /// </summary>
    public static class ItemCatalog
    {
        static readonly Dictionary<string, (string Name, string Flavor)> Known =
            new Dictionary<string, (string, string)>
            {
                ["rations"] = ("Sealed rations", "Tins with true seams. The gentlest arithmetic you own."),
                ["tarp"] = ("Tarpaulin", "A sheet of sky-proof plastic. The first week's best friend."),
                ["flaregun"] = ("Flare gun", "One flare. One argument with the horizon. You will only get to make it once."),
                ["medkit"] = ("First-aid kit", "Bandages, antiseptic, painkillers — real treatments between you and infection."),
                ["toolbox"] = ("Pilot's toolbox", "Pliers, saw blade, wire, tape. Every camp job easier; some possible."),
                ["case"] = ("The courier's case", "Locked. Heavy. Chained to nothing now. It isn't food."),
                ["photo"] = ("The courier's photograph", "Soft at the corners, folded and refolded. A shoreline. A broken crown."),
                ["driftwood"] = ("Driftwood", "Wood buys hours. The fire is a possession, not a button."),
                ["water"] = ("Carried water", "Every vessel you own, filled. The first law, obeyed in advance."),
                ["feverbark"] = ("Stripped feverbark", "Edda's paper of bark. Three more doses, and move your camp off that fringe at dusk, fool."),
                ["gems"] = ("The cut stones", "A dozen gems that hold your lamplight a half-beat too long. Kept wrapped, lead-side in."),
                ["spur"] = ("The heartglass spur", "Forearm-long, fallen clean, pulsing seven beats. A kept promise — or a debt."),
            };

        /// <summary>The pack's rows, in a stable, human order.</summary>
        public static List<ItemRow> Rows(GameState s)
        {
            var rows = new List<ItemRow>();
            // stable order: the knowns in catalog order first, then strangers
            foreach (var kv in Known)
            {
                int n = s.Count(kv.Key);
                if (n <= 0) continue;
                var row = new ItemRow
                {
                    Id = kv.Key,
                    Name = kv.Value.Name,
                    Count = n,
                    Flavor = kv.Value.Flavor,
                };
                // the first pack-usable: carried water answers thirst on the spot
                if (kv.Key == "water")
                {
                    row.UseLabel = "Drink";
                    row.Use = gm => gm.DrinkFromPack();
                }
                rows.Add(row);
            }
            foreach (var kv in s.Inventory)
            {
                if (Known.ContainsKey(kv.Key) || kv.Value <= 0) continue;
                rows.Add(new ItemRow
                {
                    Id = kv.Key,
                    Name = kv.Key, // unknown keys still show, plainly
                    Count = kv.Value,
                    Flavor = "Carried. The island will explain it eventually.",
                });
            }
            return rows;
        }

        /// <summary>The pack sheet's text (the InventoryUI renders this).</summary>
        public static List<string> Build(GameState s)
        {
            var t = new List<string> { "<b>THE PACK</b>", "" };
            var rows = Rows(s);
            if (rows.Count == 0)
            {
                t.Add("Empty hands, the clothes you nearly died in, and whatever the island lends next.");
                return t;
            }
            foreach (var row in rows)
            {
                t.Add("<b>" + row.Name + (row.Count > 1 ? "  ×" + row.Count : "") + "</b>");
                t.Add("<i>" + row.Flavor + "</i>");
                t.Add("");
            }
            t.Add("<i>Carried things are laid out here; in time, some will be usable straight from the pack.</i>");
            return t;
        }
    }
}
