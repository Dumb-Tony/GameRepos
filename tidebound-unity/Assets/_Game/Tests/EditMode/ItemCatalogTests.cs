using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>The pack: everything carried shows, named and flavored.</summary>
    public class ItemCatalogTests
    {
        [Test]
        public void ThePack_ShowsTheSalvageByName()
        {
            var s = GameState.NewGame();
            s.AddItem("rations", 4);
            s.AddItem("tarp", 1);
            s.AddItem("case", 1);
            s.AddItem("photo", 1);
            var rows = ItemCatalog.Rows(s);
            Assert.AreEqual(4, rows.Count);
            Assert.AreEqual("Sealed rations", rows[0].Name);
            Assert.AreEqual(4, rows[0].Count);

            var text = string.Join("\n", ItemCatalog.Build(s));
            StringAssert.Contains("THE PACK", text);
            StringAssert.Contains("Sealed rations", text);
            StringAssert.Contains("×4", text);
            StringAssert.Contains("The courier's case", text);
        }

        [Test]
        public void NothingCarried_IsEverInvisible()
        {
            var s = GameState.NewGame();
            s.AddItem("mystery_key", 2); // an unknown id still shows, plainly
            var rows = ItemCatalog.Rows(s);
            Assert.AreEqual(1, rows.Count);
            Assert.AreEqual("mystery_key", rows[0].Name);
            Assert.AreEqual(2, rows[0].Count);
        }

        [Test]
        public void EmptyHands_SaySo()
        {
            var text = string.Join("\n", ItemCatalog.Build(GameState.NewGame()));
            StringAssert.Contains("Empty hands", text);
        }

        [Test]
        public void UseHook_IsDormantButPresent()
        {
            var s = GameState.NewGame();
            s.AddItem("medkit", 1);
            var row = ItemCatalog.Rows(s)[0];
            Assert.IsNull(row.Use); // v1: carried, not used — the seam awaits the canteen
            Assert.IsNull(row.UseLabel);
        }
    }
}
