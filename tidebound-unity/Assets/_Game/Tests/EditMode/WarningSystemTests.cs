using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>
    /// Design law #1: the island always warns once. These tests prove the
    /// warning fires before the harm, fires exactly once per decline, and
    /// re-arms after a real recovery.
    /// </summary>
    public class WarningSystemTests
    {
        [Test]
        public void CrossingTheThreshold_FiresOnce()
        {
            var w = new WarningSystem();
            var m = new Meters { Hunger = 24f };
            Assert.IsTrue(w.Check(m).Any(x => x.Id == "hunger_low"));
            Assert.IsFalse(w.Check(m).Any(x => x.Id == "hunger_low")); // no nagging
        }

        [Test]
        public void ASmallRecovery_DoesNotRearm()
        {
            var w = new WarningSystem();
            w.Check(new Meters { Hunger = 24f });
            w.Check(new Meters { Hunger = 30f }); // above threshold, below re-arm
            Assert.IsFalse(w.Check(new Meters { Hunger = 24f }).Any(x => x.Id == "hunger_low"));
        }

        [Test]
        public void ARealRecovery_RearmsTheWarning()
        {
            var w = new WarningSystem();
            w.Check(new Meters { Hunger = 24f });
            w.Check(new Meters { Hunger = 60f });
            Assert.IsTrue(w.Check(new Meters { Hunger = 24f }).Any(x => x.Id == "hunger_low"));
        }

        [Test]
        public void Zero_IsItsOwnSevereWarning()
        {
            var w = new WarningSystem();
            var fired = w.Check(new Meters { Thirst = 0f });
            Assert.IsTrue(fired.Any(x => x.Id == "thirst_low"));
            Assert.IsTrue(fired.Any(x => x.Id == "thirst_zero" && x.Severe));
        }

        [Test]
        public void ExposureWarning_FiresAtDusk_OnlyWithoutRoofOrFire()
        {
            var s = GameState.NewGame();
            Assert.IsTrue(WarningSystem.ExposureWarningDue(s, Segment.Dusk));
            Assert.IsFalse(WarningSystem.ExposureWarningDue(s, Segment.Day));
            s.Fire = 1;
            Assert.IsFalse(WarningSystem.ExposureWarningDue(s, Segment.Dusk));
            s.Fire = 0;
            s.Shelter = 1;
            Assert.IsFalse(WarningSystem.ExposureWarningDue(s, Segment.Dusk));
        }

        /// <summary>
        /// The law itself, end to end: run a castaway who does nothing and
        /// prove every warning lands while there is still time to act —
        /// hunger warns while health is untouched, the severe warning fires
        /// before death, and death arrives only long after both.
        /// </summary>
        [Test]
        public void TheIslandAlwaysWarns_BeforeItCollects()
        {
            var s = GameState.NewGame();
            var w = new WarningSystem();
            var healthAtWarning = new Dictionary<string, float>();

            for (int guard = 0; guard < 200 && s.DeathCause == null; guard++)
            {
                foreach (var fired in w.Check(s.Stats))
                    if (!healthAtWarning.ContainsKey(fired.Id))
                        healthAtWarning[fired.Id] = s.Stats.Health;
                s.TickSegment();
            }

            Assert.IsNotNull(s.DeathCause, "the do-nothing castaway must eventually die");
            Assert.IsTrue(healthAtWarning.ContainsKey("hunger_low"));
            Assert.IsTrue(healthAtWarning.ContainsKey("thirst_low"));
            Assert.IsTrue(healthAtWarning.ContainsKey("hunger_zero"));
            Assert.IsTrue(healthAtWarning.ContainsKey("thirst_zero"));

            // the first whisper comes while health is still whole
            Assert.AreEqual(100f, healthAtWarning["hunger_low"], "hunger must warn before any harm");
            Assert.AreEqual(100f, healthAtWarning["thirst_low"], "thirst must warn before any harm");
            // and the last warning still leaves health on the table
            Assert.Greater(healthAtWarning["health_low"], 0f, "the final warning must precede death");
        }
    }
}
