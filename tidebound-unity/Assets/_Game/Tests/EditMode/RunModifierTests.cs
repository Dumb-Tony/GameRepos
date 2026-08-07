using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>The conditions the loops permit — and the teeth behind them.
    /// A modifier that changes nothing is a lie, so each one here bites
    /// something the player can feel.</summary>
    public class RunModifierTests
    {
        static StoryScript Prologue => PrologueScript.Build();
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState Loop(string mod = null)
        {
            var s = GameState.NewGame();
            s.SetFlag("NGPLUS");
            s.LoopsLived = 3;
            s.RunModifier = mod;
            return s;
        }

        [Test]
        public void AFirstLife_FallsStraightOutOfTheSky()
        {
            Assert.AreEqual("falling", PrologueScript.StartFor(GameState.NewGame()));
            Assert.AreEqual("falling", PrologueScript.StartFor(null));
        }

        [Test]
        public void ARememberedLife_CrossesThroughTheMenuFirst()
        {
            Assert.AreEqual("loops_menu", PrologueScript.StartFor(Loop()));
            var menu = Prologue.Get("loops_menu");
            StringAssert.Contains("DRIFTWOOD LOOPS", string.Join("\n", menu.Text(Loop())));
            StringAssert.Contains("remembers 3 lives", string.Join("\n", menu.Text(Loop())));
        }

        [Test]
        public void OneLife_IsCountedInTheSingular()
        {
            var s = Loop();
            s.LoopsLived = 1;
            StringAssert.Contains("remembers 1 life of yours",
                string.Join("\n", Prologue.Get("loops_menu").Text(s)));
        }

        [Test]
        public void EveryMenuOption_LeadsIntoTheCrossing()
        {
            var choices = Prologue.Get("loops_menu").AvailableChoices(Loop());
            Assert.AreEqual(1 + RunModifiers.All.Length, choices.Count); // plain + each condition
            foreach (var c in choices)
                Assert.AreEqual("loop_arrival", c.Go);
        }

        [Test]
        public void ChoosingACondition_StampsItOnTheRun()
        {
            foreach (var mod in RunModifiers.All)
            {
                var s = Loop();
                StoryChoice picked = null;
                foreach (var c in Prologue.Get("loops_menu").AvailableChoices(s))
                    if (c.Label == mod.Name) picked = c;
                Assert.IsNotNull(picked, mod.Id);
                picked.Do(s);
                Assert.AreEqual(mod.Id, s.RunModifier);
            }
            // and the standard crossing clears any condition
            var plain = Loop("hard");
            Prologue.Get("loops_menu").AvailableChoices(plain)[0].Do(plain);
            Assert.IsNull(plain.RunModifier);
        }

        [Test]
        public void TheCrossing_NamesTheConditionYouChose()
        {
            var crossing = Prologue.Get("loop_arrival");
            foreach (var mod in RunModifiers.All)
            {
                var s = Loop(mod.Id);
                StringAssert.Contains(mod.CrossingLine, string.Join("\n", crossing.Text(s)));
            }
            // an unconditioned loop says nothing extra
            var plain = Loop();
            foreach (var mod in RunModifiers.All)
                StringAssert.DoesNotContain(mod.CrossingLine, string.Join("\n", crossing.Text(plain)));
        }

        [Test]
        public void SilentIsland_EmptiesTheClearing()
        {
            var met = GameState.NewGame();
            foreach (var animal in new[] { "kavi", "buri", "moa", "vela", "ipo", "nine" })
                met.Meet(animal, 2);

            var loud = Script.Get("clearing").AvailableChoices(met);
            Assert.AreEqual(7, loud.Count); // six wild lives, and the solo road

            met.RunModifier = RunModifiers.Silent;
            var silent = Script.Get("clearing").AvailableChoices(met);
            Assert.AreEqual(1, silent.Count);
            StringAssert.Contains("alone", silent[0].Label); // the wild kept its distance
        }

        [Test]
        public void KindTide_SoftensTheDrains()
        {
            var hard = GameState.NewGame();
            var kind = GameState.NewGame();
            kind.RunModifier = RunModifiers.Kind;
            Assert.AreEqual(1f, RunModifiers.DrainScale(hard));
            Assert.AreEqual(0.6f, RunModifiers.DrainScale(kind), 1e-4f);

            hard.TickSegment();
            kind.TickSegment();
            Assert.Greater(kind.Stats.Hunger, hard.Stats.Hunger); // gentler hands
            Assert.Greater(kind.Stats.Thirst, hard.Stats.Thirst);
            Assert.Greater(kind.Stats.Energy, hard.Stats.Energy);
        }

        [Test]
        public void HardSeason_BringsTheRainAChapterEarly_AndTheSkyAgrees()
        {
            var ordinary = GameState.NewGame();
            ordinary.Chapter = 4;
            ordinary.Day = 45;
            Assert.IsFalse(ordinary.IsMonsoon);
            Assert.AreEqual(0f, Monsoon.Intensity(ordinary), 1e-4f); // a dry chapter four

            var harsh = GameState.NewGame();
            harsh.Chapter = 4;
            harsh.Day = 45;
            harsh.RunModifier = RunModifiers.Hard;
            Assert.IsTrue(harsh.IsMonsoon);                       // the drains know
            Assert.Greater(Monsoon.Intensity(harsh), 0f);         // and so does the sky
        }

        [Test]
        public void HardSeason_NeverOutlastsTheSeventyFirstMorning()
        {
            var harsh = GameState.NewGame();
            harsh.Chapter = 6;
            harsh.Day = 80;
            harsh.RunModifier = RunModifiers.Hard;
            Assert.AreEqual(0f, Monsoon.Intensity(harsh), 1e-4f); // the drumming still stops
        }

        [Test]
        public void ChaosIsNotOffered_UntilItCanBite()
        {
            // the VN's chaos modifier rides a random-event roll this port
            // doesn't have yet; a menu option that does nothing is a lie
            Assert.IsNull(RunModifiers.ById("chaos"));
            foreach (var m in RunModifiers.All)
                Assert.AreNotEqual("chaos", m.Id);
        }
    }
}
