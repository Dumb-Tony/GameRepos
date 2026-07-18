using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    public class JournalEntriesTests
    {
        static string Joined(GameState s) => string.Join("\n", JournalEntries.Build(s));

        [Test]
        public void FreshState_HasHeaderAndSurvivalKnowns()
        {
            var s = GameState.NewGame();
            s.Day = 1;
            var text = Joined(s);
            StringAssert.Contains("Day 1", text);
            StringAssert.Contains("You have no fire.", text);
            StringAssert.Contains("no shelter worth the word", text);
        }

        [Test]
        public void FireAndShelter_ChangeTheKnowns()
        {
            var s = GameState.NewGame();
            s.Fire = 1;
            s.Shelter = 1;
            var text = Joined(s);
            StringAssert.Contains("You have fire.", text);
            StringAssert.Contains("lean-to stands", text);
        }

        [Test]
        public void Background_GetsItsLine()
        {
            var s = GameState.NewGame();
            s.Background = "cook";
            StringAssert.Contains("line cook", Joined(s));
        }

        [Test]
        public void Deeds_AppearOnlyWhenEarned()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(Joined(s).Contains("What you've done"));
            s.SetFlag("SOS");
            var text = Joined(s);
            StringAssert.Contains("What you've done", text);
            StringAssert.Contains("anyone looking", text);
        }

        [Test]
        public void Salvage_AggregatesIntoOneSentence()
        {
            var s = GameState.NewGame();
            s.SetFlag("SALV_medkit");
            s.SetFlag("SALV_case");
            var text = Joined(s);
            StringAssert.Contains("From the sinking fuselage you saved", text);
            StringAssert.Contains("first-aid kit", text);
            StringAssert.Contains("bad conscience", text);
        }

        [Test]
        public void Inventory_ListsNamedItemsWithCounts()
        {
            var s = GameState.NewGame();
            s.AddItem("driftwood", 3);
            s.AddItem("photo");
            var text = Joined(s);
            StringAssert.Contains("Driftwood × 3", text);
            StringAssert.Contains("A stranger's photograph", text);
        }

        [Test]
        public void RouteNumbers_NeverLeakIntoTheLedger()
        {
            var s = GameState.NewGame();
            s.AddRoute(RouteAxis.Signal, 7);
            s.AddRoute(RouteAxis.Depth, 9);
            var text = Joined(s).ToLowerInvariant();
            Assert.IsFalse(text.Contains("signal"), "route axes are invisible by design");
            Assert.IsFalse(text.Contains("depth"));
            Assert.IsFalse(text.Contains("route"));
        }
    }
}
