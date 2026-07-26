using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Naia's arc as the world tells it: a shape at the treeline,
    /// then a person at your fire, then a guide at the stair's foot, then a
    /// councilwoman in her own green.</summary>
    public class NaiaPlaceTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void TheWatching_StartsAfterTheFirstDaysAndEndsAtContact()
        {
            var s = GameState.NewGame();
            s.Day = 1;
            Assert.IsFalse(NaiaPlace.WatchingSeason(s)); // the watching starts with your first fire
            s.Day = 12;
            Assert.IsTrue(NaiaPlace.WatchingSeason(s));
            s.SetFlag("NAIA_MET");
            Assert.IsFalse(NaiaPlace.WatchingSeason(s)); // the watcher has a face now
        }

        [Test]
        public void TheWatching_StopsWhenTheRunDoes()
        {
            var s = GameState.NewGame();
            s.Day = 20;
            s.DeathCause = "coldfire";
            Assert.IsFalse(NaiaPlace.WatchingSeason(s));
        }

        [Test]
        public void TheGullet_GivesTheWatcherAFace()
        {
            var s = GameState.NewGame();
            s.Day = 66;
            Assert.IsTrue(NaiaPlace.WatchingSeason(s));
            Script.Get("ev5_deep3").OnEnter(s); // "Since the first fire on your beach, castaway."
            Assert.IsTrue(s.Is("NAIA_MET"));
            Assert.IsFalse(NaiaPlace.WatchingSeason(s));
        }

        [Test]
        public void TheInvitation_PutsHerAtTheStairsFoot()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(NaiaPlace.WalksWithYou(s));
            s.SetFlag("INNER_INVITED");
            Assert.IsTrue(NaiaPlace.WalksWithYou(s));
            s.SetFlag("CH6_DONE"); // the mountain is answered; the climb is over
            Assert.IsFalse(NaiaPlace.WalksWithYou(s));
        }

        [Test]
        public void AfterTheJudging_HerOwnCountryHoldsHer()
        {
            foreach (var verdict in new[] { "INNER_GREEN", "INNER_PROBATION" })
            {
                var s = GameState.NewGame();
                s.SetFlag(verdict);
                Assert.IsTrue(NaiaPlace.LivesInTheGreen(s), verdict);
            }
            var turnedBack = GameState.NewGame();
            turnedBack.SetFlag("RIM_ONLY"); // never admitted: she is not down there waiting
            Assert.IsFalse(NaiaPlace.LivesInTheGreen(turnedBack));
        }

        [Test]
        public void HerContactScene_BelongsToTheSeasonThatWentLooking()
        {
            // the season's finale answers the plan it was given: the sea gets
            // its horizon, the homesteaders get their table — and the route
            // that spent the rains going DOWN gets the watcher walking out of
            // the treeline with her hands open. Her offer is the Descent's.
            Assert.IsTrue(Script.Has("ch5_finale"));
            var finale = Script.Get("ch5_finale");

            var deep = GameState.NewGame();
            deep.Plan = "deep";
            StringAssert.Contains("walks out of the dusk treeline into your firelight",
                string.Join("\n", finale.Text(deep)));

            var sea = GameState.NewGame();
            sea.Plan = "sea";
            StringAssert.Contains("THE PROMISE OF THE HORIZON", string.Join("\n", finale.Text(sea)));

            var home = GameState.NewGame();
            home.Plan = "home";
            StringAssert.Contains("THE TABLE", string.Join("\n", finale.Text(home)));
        }
    }
}
