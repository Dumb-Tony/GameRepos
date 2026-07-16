using System.IO;
using NUnit.Framework;

namespace Tidebound.Tests
{
    public class SaveSystemTests
    {
        static GameState RichState()
        {
            var s = GameState.NewGame();
            s.CurrentScene = "camp";
            s.Day = 12;
            s.Seg = Segment.Dusk;
            s.Chapter = 2;
            s.Background = "medic";
            s.Companion = "kavi";
            s.Bond(62);
            s.Stats.Hunger = 76.4f; // fractional (Kind Tide) must survive
            s.SetFlag("BOAR_TREATY");
            s.SetFlag("SIGNAL_FIRE_LIT", false);
            s.AddItem("cordage", 3);
            s.AddRoute(RouteAxis.Roots, 4);
            s.Meet("kavi", 2);
            s.Interest["moa"] = 1;
            s.FiredEvents["ev_howls"] = true;
            s.Site = "overhang";
            s.Fire = 1;
            s.Shelter = 2;
            s.Food = 3;
            s.Injury = "laceration";
            s.TidePoolVisits = 2;
            s.RunModifier = "kind";
            s.CompanionInjured = new CompanionInjury { Day = 9 };
            return s;
        }

        [Test]
        public void RoundTrip_PreservesEverything()
        {
            var a = RichState();
            var b = SaveSystem.FromJson(SaveSystem.ToJson(a));

            Assert.AreEqual(a.CurrentScene, b.CurrentScene);
            Assert.AreEqual(a.Day, b.Day);
            Assert.AreEqual(a.Seg, b.Seg);
            Assert.AreEqual(a.Chapter, b.Chapter);
            Assert.AreEqual(a.Background, b.Background);
            Assert.AreEqual(a.Companion, b.Companion);
            Assert.AreEqual(a.Trust, b.Trust);
            Assert.AreEqual(a.Tier, b.Tier);
            Assert.AreEqual(76.4f, b.Stats.Hunger, 0.001f);
            Assert.IsTrue(b.Is("BOAR_TREATY"));
            Assert.IsFalse(b.Is("SIGNAL_FIRE_LIT"));
            Assert.IsTrue(b.Flags.ContainsKey("SIGNAL_FIRE_LIT"));
            Assert.AreEqual(3, b.Count("cordage"));
            Assert.AreEqual(4, b.Route.Roots);
            Assert.IsTrue(b.Met["kavi"]);
            Assert.AreEqual(2, b.Interest["kavi"]);
            Assert.AreEqual(1, b.Interest["moa"]);
            Assert.IsTrue(b.FiredEvents["ev_howls"]);
            Assert.AreEqual("overhang", b.Site);
            Assert.AreEqual(1, b.Fire);
            Assert.AreEqual(2, b.Shelter);
            Assert.AreEqual(3, b.Food);
            Assert.AreEqual("laceration", b.Injury);
            Assert.AreEqual(2, b.TidePoolVisits);
            Assert.AreEqual("kind", b.RunModifier);
            Assert.AreEqual(9, b.CompanionInjured.Day);
            Assert.IsNull(b.DeathCause);
        }

        [Test]
        public void Json_UsesTheVnsKeyNames()
        {
            var json = SaveSystem.ToJson(RichState());
            StringAssert.Contains("\"stats\"", json);
            StringAssert.Contains("\"flags\"", json);
            StringAssert.Contains("\"seg\"", json);
            StringAssert.Contains("\"route\"", json);
            StringAssert.Contains("\"companion\"", json);
        }

        [Test]
        public void FileRoundTrip_SaveAndLoad()
        {
            var dir = Path.Combine(Path.GetTempPath(), "tidebound-tests");
            var path = Path.Combine(dir, "slot-test.json");
            try
            {
                var a = RichState();
                SaveSystem.Save(a, path);
                Assert.IsTrue(SaveSystem.HasSave(path));
                var b = SaveSystem.Load(path);
                Assert.AreEqual(a.Day, b.Day);
                Assert.AreEqual(a.Companion, b.Companion);
            }
            finally
            {
                if (Directory.Exists(dir)) Directory.Delete(dir, true);
            }
        }

        [Test]
        public void Load_MissingFileReturnsNull()
        {
            Assert.IsNull(SaveSystem.Load(Path.Combine(Path.GetTempPath(), "tidebound-no-such-save.json")));
        }
    }
}
