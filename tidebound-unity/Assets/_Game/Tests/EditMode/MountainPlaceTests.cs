using NUnit.Framework;
using Tidebound.Narrative;
using UnityEngine;

namespace Tidebound.Tests
{
    /// <summary>The mountain's country as a place: the ascent's gate, the
    /// markers that only read once you've stood in them, and the seven-beat
    /// curve the Tidewell breathes on — the lagoon's own.</summary>
    public class MountainPlaceTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void EveryMountainBeat_HasItsScene()
        {
            foreach (var id in new[]
                     {
                         "ch6_open", "ch6_terrace", "ch6_temple", "ch6_tremor",
                         "ch6_inner", "ch6_threshold", "ch6_end",
                     })
                Assert.IsTrue(Script.Has(id), id);
        }

        [Test]
        public void TheAscent_WaitsForTheRainsToBreak()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(MountainPlace.AscentOpen(s));
            s.SetFlag("CH5_DONE"); // the season closes; the mountain stands clear
            Assert.IsTrue(MountainPlace.AscentOpen(s));
        }

        [Test]
        public void TheAscent_ClosesBehindYou()
        {
            var s = GameState.NewGame();
            s.SetFlag("CH5_DONE");
            s.SetFlag("CH6_DONE"); // the Tidewell has been answered
            Assert.IsFalse(MountainPlace.AscentOpen(s));
        }

        [Test]
        public void TheAscent_IsClosedToTheDead()
        {
            var s = GameState.NewGame();
            s.SetFlag("CH5_DONE");
            s.DeathCause = "ash";
            Assert.IsFalse(MountainPlace.AscentOpen(s));
        }

        [Test]
        public void ThePlaceMarkers_OnlyReadOnceYouHaveStoodThere()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(MountainPlace.TempleReached(s));
            Assert.IsFalse(MountainPlace.RimReached(s));

            Script.Get("ch6_temple").OnEnter(s);
            Assert.IsTrue(MountainPlace.TempleReached(s)); // TEMPLE_SEEN, set by the nave itself

            foreach (var verdict in new[] { "INNER_GREEN", "INNER_PROBATION", "RIM_ONLY" })
            {
                var judged = GameState.NewGame();
                judged.SetFlag(verdict);
                Assert.IsTrue(MountainPlace.RimReached(judged), verdict);
            }
        }

        [Test]
        public void TheTidewell_BreathesTheLagoonsOwnRhythm()
        {
            // the pool and the bay read the same curve: silence at the cycle's
            // edges, the seven beats riding one slow swell in between
            Assert.AreEqual(0f, SevenBeat.Evaluate(0f), 1e-4f);
            Assert.AreEqual(0f, SevenBeat.Evaluate(1f), 1e-4f);
            Assert.Greater(SevenBeat.Evaluate(0.5f), 0f);

            float peak = 0f;
            for (int i = 0; i <= 2000; i++)
                peak = Mathf.Max(peak, SevenBeat.Evaluate(i / 2000f));
            Assert.LessOrEqual(peak, 1f);
            Assert.Greater(peak, 0.5f);

            // and it repeats: the same phase, one cycle on, is the same water
            Assert.AreEqual(SevenBeat.Evaluate(0.31f), SevenBeat.Evaluate(3.31f), 1e-4f);
        }
    }
}
