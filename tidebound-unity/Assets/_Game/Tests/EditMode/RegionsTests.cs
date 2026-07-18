using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>The island's zones: footprints, canon effects, Nine's rule.</summary>
    public class RegionsTests
    {
        [Test]
        public void Footprints_PutTheLandmarksInTheRightZones()
        {
            Assert.AreEqual("bay", Regions.IdAt(0f, 15f));          // the camp
            Assert.AreEqual("bay", Regions.IdAt(-60f, 5f));         // the wrack line
            Assert.AreEqual("tidepools", Regions.IdAt(170f, 20f));  // the pool cities
            Assert.AreEqual("tidepools", Regions.IdAt(186f, 2f));   // the gallery
            Assert.AreEqual("fringe", Regions.IdAt(0f, 100f));      // the ecotone
            Assert.AreEqual("deepgreen", Regions.IdAt(60f, 230f));  // the fig tree
            Assert.AreEqual("deepgreen", Regions.IdAt(-30f, 210f)); // the glyph stone
        }

        [Test]
        public void EveryRegion_HasItsCanon()
        {
            Assert.AreEqual(4, Regions.All.Length); // the v1 island
            foreach (var r in Regions.All)
            {
                Assert.AreEqual(2, r.First.Length, r.Id);
                Assert.IsNotNull(r.FirstEffects, r.Id);
                Assert.GreaterOrEqual(r.Deck.Length, 2, r.Id);
                Assert.IsTrue(Regions.Get(r.Id) == r);
            }
        }

        [Test]
        public void FirstVisitEffects_PinnedToMapJs()
        {
            var bay = GameState.NewGame();
            Regions.Get("bay").FirstEffects(bay);
            Assert.AreEqual(2, bay.Route.Roots);
            Assert.AreEqual(59f, bay.Stats.Hope); // +4

            var pools = GameState.NewGame();
            Regions.Get("tidepools").FirstEffects(pools);
            Assert.AreEqual(1, pools.TidePoolVisits);
            Assert.AreEqual(2, pools.Route.Depth);

            var deep = GameState.NewGame();
            Regions.Get("deepgreen").FirstEffects(deep);
            Assert.AreEqual(2, deep.Route.Depth);
            Assert.AreEqual(1, deep.Route.Roots);
            Assert.AreEqual(81f, deep.Stats.Energy); // -4
        }

        [Test]
        public void WorkingThePools_PinnedToTheVN()
        {
            var s = GameState.NewGame();
            SurvivalActions.TidePools(s);
            Assert.AreEqual(79f, s.Stats.Energy);  // -6
            Assert.AreEqual(88f, s.Stats.Hunger);  // +8
            Assert.AreEqual(73f, s.Stats.Thirst);  // -2
            Assert.AreEqual(1, s.TidePoolVisits);
            Assert.AreEqual(1, s.Route.Depth);
        }

        [Test]
        public void Nine_ArrivesOnTheSecondVisit_IfUnmet()
        {
            var s = GameState.NewGame();
            s.TidePoolVisits = 1;
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s));
            s.TidePoolVisits = 2;
            Assert.IsTrue(Chapter1Encounters.NineIsDue(s));
            s.TidePoolVisits = 3;
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s)); // the moment passed
            s.TidePoolVisits = 2;
            s.Meet("nine", 1);
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s)); // already neighbors
        }

        [Test]
        public void Nine_BeingTeachable_PinnedEffects()
        {
            var s = GameState.NewGame();
            var script = Chapter1Encounters.Build();
            var c = script.Get("ev_nine").AvailableChoices(s)[0];
            c.Do(s);
            Assert.IsTrue(s.Met["nine"]);
            Assert.AreEqual(3, s.Interest["nine"]);
            Assert.AreEqual(86f, s.Stats.Hunger); // +6
            Assert.AreEqual(59f, s.Stats.Hope);   // +4
            Assert.AreEqual(2, s.Route.Depth);
            Assert.AreEqual("ev_nine2", c.Go);
        }

        [Test]
        public void DeckEffects_Apply()
        {
            var s = GameState.NewGame();
            var honeyHole = Regions.Get("bay").Deck.First(d => d.Text.Contains("honey-hole"));
            honeyHole.Fx(s);
            Assert.AreEqual(94f, s.Stats.Hunger); // +14
            Assert.AreEqual(1, s.Food);
        }

        [Test]
        public void SeenFlags_AreNamespaced()
        {
            Assert.AreEqual("REGION_SEEN_bay", Regions.SeenFlag("bay"));
            var s = GameState.NewGame();
            Assert.IsFalse(s.Is(Regions.SeenFlag("deepgreen")));
        }
    }
}
