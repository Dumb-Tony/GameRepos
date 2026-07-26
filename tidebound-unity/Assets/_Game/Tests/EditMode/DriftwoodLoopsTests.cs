using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Driftwood Loops: what one finished life leaves in the bones
    /// of the next. Knowledge crosses, objects mostly don't, and the island
    /// counts every life exactly once.</summary>
    public class DriftwoodLoopsTests
    {
        static StoryScript Script => Chapter1Encounters.Build();
        // the crossing precedes the crash, so it lives with the prologue
        static StoryScript Prologue => PrologueScript.Build();

        [Test]
        public void AFirstLife_LeavesNothingToInherit()
        {
            var fresh = GameState.NewGame();
            DriftwoodLoops.ApplyNew(fresh, new LoopData());
            Assert.IsFalse(fresh.Is("NGPLUS")); // no loops yet: the crossing is empty
        }

        [Test]
        public void KnowledgeCrosses_ButOnlyWhatWasTrulyLearned()
        {
            var lived = GameState.NewGame();
            lived.SetFlag("EDDA_MET");
            lived.SetFlag("GULLET1");
            lived.EndingId = "HOME";

            var data = new LoopData();
            DriftwoodLoops.Bank(data, lived);

            Assert.IsTrue(data.Knows("KNOW_EDDA"));
            Assert.IsTrue(data.Knows("KNOW_GULLET"));
            Assert.IsFalse(data.Knows("KNOW_GRIN"));      // never met the landlord
            Assert.IsFalse(data.Knows("KNOW_SUNDERING")); // never saw the mountain break

            var next = GameState.NewGame();
            DriftwoodLoops.ApplyNew(next, data);
            Assert.IsTrue(next.Is("NGPLUS"));
            Assert.IsTrue(next.Is("KNOW_EDDA"));
            Assert.IsTrue(next.Is("KNOW_GULLET"));
            Assert.IsFalse(next.Is("KNOW_GRIN"));
        }

        [Test]
        public void MeetingNine_IsItsOwnKindOfKnowing()
        {
            var lived = GameState.NewGame();
            lived.Meet("nine", 2); // most players never learn she exists
            var data = new LoopData();
            DriftwoodLoops.Bank(data, lived);
            Assert.IsTrue(data.Knows("KNOW_NINE"));
        }

        [Test]
        public void EachLifeIsCountedExactlyOnce()
        {
            var lived = GameState.NewGame();
            lived.DeathCause = "coldfire";
            var data = new LoopData();

            DriftwoodLoops.Bank(data, lived);
            Assert.AreEqual(1, data.Loops);
            Assert.IsTrue(lived.Is("LOOP_BANKED"));

            DriftwoodLoops.Bank(data, lived); // the card re-renders, the disk re-reads
            DriftwoodLoops.Bank(data, lived);
            Assert.AreEqual(1, data.Loops);   // still one life
        }

        [Test]
        public void ADeathBanksAsHonestlyAsAnEnding()
        {
            var drowned = GameState.NewGame();
            drowned.SetFlag("GRIN_MET");
            drowned.DeathCause = "grin";
            var data = new LoopData();
            DriftwoodLoops.Bank(data, drowned);
            Assert.AreEqual(1, data.Loops);
            Assert.IsTrue(data.Knows("KNOW_GRIN")); // the landlord taught you something
        }

        [Test]
        public void TheKeepsake_MustBeEarned()
        {
            var plain = GameState.NewGame();
            var offered = DriftwoodLoops.AvailableKeepsakes(plain);
            Assert.AreEqual(1, offered.Count);          // the rope is every castaway's first wealth
            Assert.AreEqual("rope", offered[0].Id);

            var deep = GameState.NewGame();
            deep.SetFlag("EDDA_MET");
            deep.SetFlag("GULLET_MAP");
            deep.SetFlag("TIDEWELL_WITNESS");
            var richer = DriftwoodLoops.AvailableKeepsakes(deep);
            Assert.AreEqual(4, richer.Count); // rope, tin, chart, lamp
        }

        [Test]
        public void TheKeepsake_ArrivesInTheNextStrangersPack()
        {
            var lived = GameState.NewGame();
            lived.SetFlag("GULLET_MAP");
            var data = new LoopData();
            DriftwoodLoops.Bank(data, lived, "chart");
            Assert.AreEqual("chart", data.Keepsake);

            var next = GameState.NewGame();
            int depthBefore = next.Route.Depth;
            DriftwoodLoops.ApplyNew(next, data);
            Assert.IsTrue(next.Is("GULLET_MAP"));            // the under-island, pre-known
            Assert.AreEqual(depthBefore + 4, next.Route.Depth);
            Assert.IsTrue(next.Is("KEEPSAKE_CHART"));
        }

        [Test]
        public void AnUnchosenKeepsake_LeavesTheLastOneStanding()
        {
            var data = new LoopData { Keepsake = "rope" };
            var lived = GameState.NewGame();
            DriftwoodLoops.Bank(data, lived);          // banked with no choice made
            Assert.AreEqual("rope", data.Keepsake);    // the old heirloom keeps its place
            DriftwoodLoops.Bank(data, lived, "nonsense-id");
            Assert.AreEqual("rope", data.Keepsake);    // and junk never replaces it
        }

        [Test]
        public void TheCrossing_NamesWhatCarried()
        {
            var s = GameState.NewGame();
            s.SetFlag("KNOW_EDDA");
            s.SetFlag("KNOW_NINE");
            var carried = DriftwoodLoops.CarriedLines(s);
            Assert.AreEqual(2, carried.Count);
            StringAssert.Contains("woman on the mountain", string.Join("\n", carried));
            StringAssert.Contains("sorts shells", string.Join("\n", carried));

            var arrival = string.Join("\n", Prologue.Get("loop_arrival").Text(s));
            StringAssert.Contains("WHAT CARRIES", arrival);
            StringAssert.Contains("woman on the mountain", arrival);
        }

        [Test]
        public void AnEmptyCrossing_StillSaysSomething()
        {
            var s = GameState.NewGame();
            var crossing = Prologue.Get("loop_arrival");
            StringAssert.Contains("nearly empty", string.Join("\n", crossing.Text(s)));
            // and then you fall again — into the prologue this script owns
            Assert.AreEqual(PrologueScript.Start, crossing.Next);
            Assert.IsTrue(Prologue.Has(crossing.Next));
        }

        [Test]
        public void TheKeepsakeScene_OffersOnlyWhatThisLifeEarned()
        {
            var plain = GameState.NewGame();
            var choices = Script.Get("keepsake").AvailableChoices(plain);
            Assert.AreEqual(2, choices.Count); // the rope, and letting the sea have it
            StringAssert.Contains("Nothing", choices[choices.Count - 1].Label);
        }
    }
}
