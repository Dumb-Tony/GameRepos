using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Six — Ashes and Stairs: the ascent, the judgment, the Tidewell, pinned to scenes-chapter6.js.</summary>
    public class Chapter6Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        /// <summary>A run the island would admit: regard 4 from four honored ledger lines.</summary>
        static GameState RegardedRun()
        {
            var s = GameState.NewGame();
            s.SetFlag("KING_FED");
            s.SetFlag("EAST_OPEN");
            s.SetFlag("FILES_TO_EDDA");
            s.SetFlag("EDDA_WINTER");
            return s;
        }

        [Test]
        public void ChapterFiveCard_ContinuesIntoAshesAndStairs()
        {
            Assert.AreEqual("ch6_open", Script.Get("ch5_end").Next);
        }

        [Test]
        public void Regard_CountsTheHonoredLedger()
        {
            Assert.AreEqual(0, Chapter6Events.Regard(GameState.NewGame()));
            Assert.AreEqual(4, Chapter6Events.Regard(RegardedRun()));

            var bloody = RegardedRun();
            bloody.SetFlag("GRIN_FOUGHT"); // blood in the landlord's water spoils the east line
            Assert.AreEqual(3, Chapter6Events.Regard(bloody));
        }

        [Test]
        public void TheClimb_PacksAndChains()
        {
            var s = GameState.NewGame();
            s.Chapter = 5;
            var open = Script.Get("ch6_open");
            open.OnEnter(s);
            Assert.AreEqual(6, s.Chapter);

            var heavy = open.AvailableChoices(s)[0];
            s.Food = 3;
            float energy = s.Stats.Energy;
            heavy.Do(s);
            Assert.IsTrue(s.Is("PACK_HEAVY"));
            Assert.AreEqual(1, s.Food);
            Assert.AreEqual(energy - 10, s.Stats.Energy);
            Assert.AreEqual("ch6_terrace", heavy.Go);
            Assert.AreEqual("ch6_temple", Script.Get("ch6_terrace").Next);
        }

        [Test]
        public void TheTemple_RoutesGlyphCompletersThroughTheVision()
        {
            var plain = GameState.NewGame();
            Script.Get("ch6_temple").OnEnter(plain);
            Assert.IsTrue(plain.Is("TEMPLE_SEEN"));
            var go = Script.Get("ch6_temple").AvailableChoices(plain)[0].GoDynamic;
            Assert.AreEqual("ch6_tremor", go(plain));

            var scholar = GameState.NewGame();
            scholar.SetFlag("GLYPH1");
            scholar.SetFlag("GLYPH2");
            scholar.SetFlag("GLYPH3");
            Assert.AreEqual("ch6_vision", go(scholar));
            Script.Get("ch6_vision").OnEnter(scholar);
            Assert.IsTrue(scholar.Is("VISION_SEEN"));
            Assert.AreEqual("ch6_tremor", Script.Get("ch6_vision").Next);
        }

        [Test]
        public void TheTremorLadder_CollectsTheImpatient()
        {
            var s = GameState.NewGame();
            Script.Get("ch6_tremor").OnEnter(s);
            Assert.IsTrue(s.Is("TREMORS"));

            var push = Script.Get("ch6_tremor").AvailableChoices(s)[1];
            push.Do(s);
            Assert.AreEqual("ash", s.DeathCause); // MOTHER ASH, warned in the subtext
            Assert.IsNull(push.GoDynamic(s));
        }

        [Test]
        public void TheInnerGreen_JudgesOnRegard()
        {
            var admitted = RegardedRun();
            admitted.SetFlag("INNER_INVITED");
            Script.Get("ch6_inner").OnEnter(admitted);
            Assert.IsTrue(admitted.Is("INNER_GREEN")); // guests eat first

            var probation = GameState.NewGame();
            probation.SetFlag("INNER_INVITED"); // invited, but the scales don't settle
            Script.Get("ch6_inner").OnEnter(probation);
            Assert.IsTrue(probation.Is("INNER_PROBATION"));
            Assert.IsFalse(probation.Is("INNER_GREEN"));

            var stranger = GameState.NewGame(); // never invited: the rim only
            Script.Get("ch6_inner").OnEnter(stranger);
            Assert.IsTrue(stranger.Is("RIM_ONLY"));
        }

        [Test]
        public void TheTidewell_GatesItsDoors()
        {
            var blind = GameState.NewGame(); // no wound knowledge, no regard
            var options = Script.Get("ch6_threshold").AvailableChoices(blind);
            Assert.AreEqual(2, options.Count); // feed, witness

            var full = RegardedRun();
            full.SetFlag("WOUND_SEEN");
            options = Script.Get("ch6_threshold").AvailableChoices(full);
            Assert.AreEqual(4, options.Count); // silence, feed, keep, witness

            options[2].Do(full); // the covenant
            Assert.IsTrue(full.Is("TIDEWELL_KEEP"));
            Assert.IsTrue(full.Is("CH6_DONE"));
            Assert.AreEqual("ch6_keep", options[2].Go);
            Assert.AreEqual("ch6_end", Script.Get("ch6_keep").Next);
        }

        [Test]
        public void TheTidewell_SilenceAndWitness()
        {
            var silence = GameState.NewGame();
            silence.SetFlag("INCIDENT_FILES");
            var doors = Script.Get("ch6_threshold").AvailableChoices(silence);
            doors[0].Do(silence);
            Assert.IsTrue(silence.Is("TIDEWELL_SILENCE"));

            var witness = GameState.NewGame();
            var last = Script.Get("ch6_threshold").AvailableChoices(witness);
            last[last.Count - 1].Do(witness);
            Assert.IsTrue(witness.Is("TIDEWELL_WITNESS"));
            Assert.AreEqual(1, witness.Route.Roots);
        }
    }
}
