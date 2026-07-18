using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// The prologue is a port of scenes-prologue.js — these tests pin every
    /// choice's effects to the VN's exact deltas, and walk the whole
    /// sequence end to end so no path can dead-end.
    /// </summary>
    public class PrologueScriptTests
    {
        static StoryScript Script => PrologueScript.Build();

        static StoryChoice Choice(StoryScene scene, GameState s, int index) =>
            scene.AvailableChoices(s)[index];

        // ---- the crash ---------------------------------------------------
        [Test]
        public void Falling_Brace_PinnedEffects()
        {
            var s = GameState.NewGame();
            var c = Choice(Script.Get("falling"), s, 0);
            c.Do(s);
            Assert.IsTrue(s.Is("BRACED"));
            Assert.AreEqual(59f, s.Stats.Hope); // 55 + 4
            Assert.AreEqual("whowere", c.Go);
        }

        [Test]
        public void Falling_HelpTheCourier_GrantsThePhotograph()
        {
            var s = GameState.NewGame();
            var c = Choice(Script.Get("falling"), s, 1);
            c.Do(s);
            Assert.IsTrue(s.Is("HELPED_COURIER"));
            Assert.IsTrue(s.Has("photo"));
            Assert.AreEqual(57f, s.Stats.Hope); // 55 + 2
            Assert.AreEqual("falling_courier", c.Go);
        }

        [Test]
        public void Falling_Memorize_FeedsDepth()
        {
            var s = GameState.NewGame();
            Choice(Script.Get("falling"), s, 2).Do(s);
            Assert.IsTrue(s.Is("SAW_ISLAND"));
            Assert.AreEqual(1, s.Route.Depth);
        }

        // ---- who you were ------------------------------------------------
        [Test]
        public void Backgrounds_PinnedEffects()
        {
            var medic = GameState.NewGame();
            Choice(Script.Get("whowere"), medic, 0).Do(medic);
            Assert.AreEqual("medic", medic.Background);
            Assert.AreEqual(1, medic.Count("medkit"));
            Assert.IsTrue(medic.Is("BG_MEDIC"));

            var photog = GameState.NewGame();
            Choice(Script.Get("whowere"), photog, 1).Do(photog);
            Assert.AreEqual("photog", photog.Background);
            Assert.IsTrue(photog.Has("camera"));
            Assert.IsTrue(photog.Is("BG_PHOTOG"));

            var cook = GameState.NewGame();
            Choice(Script.Get("whowere"), cook, 2).Do(cook);
            Assert.AreEqual("cook", cook.Background);
            Assert.IsTrue(cook.Has("knife"));
            Assert.AreEqual(47f, cook.Stats.Hope); // 55 - 8: the crash hit hardest
            Assert.IsTrue(cook.Is("BG_COOK"));

            var engineer = GameState.NewGame();
            Choice(Script.Get("whowere"), engineer, 3).Do(engineer);
            Assert.AreEqual("engineer", engineer.Background);
            Assert.IsTrue(engineer.Has("multitool"));
            Assert.IsTrue(engineer.Is("BG_ENGINEER"));
        }

        // ---- the salvage threshold ----------------------------------------
        [Test]
        public void Salvage_RationsBundle_GrantsFourTinsAndTheTarp()
        {
            var s = GameState.NewGame();
            var options = Script.Get("salvage").AvailableChoices(s);
            var rations = options.First(c => c.Label.StartsWith("Rations"));
            rations.Do(s);
            Assert.AreEqual(4, s.Count("rations"));
            Assert.IsTrue(s.Has("tarp"));
            Assert.IsTrue(s.Is("SALV_rations"));
        }

        [Test]
        public void Salvage_MedkitBundle_GrantsThreeTreatments()
        {
            var s = GameState.NewGame();
            Script.Get("salvage").AvailableChoices(s).First(c => c.Label.Contains("first-aid")).Do(s);
            Assert.AreEqual(3, s.Count("medkit"));
        }

        [Test]
        public void Salvage_TheCase_FeedsDepth()
        {
            var s = GameState.NewGame();
            Script.Get("salvage").AvailableChoices(s).First(c => c.Label.Contains("courier")).Do(s);
            Assert.IsTrue(s.Has("case"));
            Assert.AreEqual(1, s.Route.Depth);
        }

        [Test]
        public void Salvage_ATakenBundleIsGoneFromTheSecondTrip()
        {
            var s = GameState.NewGame();
            Assert.AreEqual(5, Script.Get("salvage").AvailableChoices(s).Count);
            Script.Get("salvage").AvailableChoices(s)[0].Do(s); // flare gun
            var second = Script.Get("salvage2").AvailableChoices(s);
            Assert.AreEqual(4, second.Count);
            Assert.IsFalse(second.Any(c => c.Label.Contains("flare")));
        }

        // ---- the first night -----------------------------------------------
        [Test]
        public void Night0_WatchTheWater_PinnedEffects()
        {
            var s = GameState.NewGame();
            var c = Choice(Script.Get("night0"), s, 0);
            c.Do(s);
            Assert.AreEqual(61f, s.Stats.Hope);   // 55 + 6
            Assert.AreEqual(1, s.Route.Depth);
            Assert.IsTrue(s.Is("COMPASS_SPINS"));
            Assert.AreEqual(1, s.Day);
            Assert.AreEqual(Segment.Dawn, s.Seg);
            Assert.AreEqual(100f, s.Stats.Energy); // 85 + 15 clamps
            Assert.AreEqual("ch1_open", c.Go);
        }

        [Test]
        public void Night0_TurnYourBack_PinnedEffects()
        {
            var s = GameState.NewGame();
            s.Stats.Energy = 60f;
            Choice(Script.Get("night0"), s, 1).Do(s);
            Assert.AreEqual(1, s.Route.Roots);
            Assert.AreEqual(82f, s.Stats.Energy); // 60 + 22
            Assert.AreEqual(1, s.Day);
        }

        // ---- structural safety ----------------------------------------------
        [Test]
        public void EveryTransitionTarget_ExistsInTheScript()
        {
            var script = Script;
            foreach (var scene in script.All)
            {
                if (scene.Next != null)
                    Assert.IsTrue(script.Has(scene.Next), $"{scene.Id} → {scene.Next}");
                if (scene.Choices != null)
                    foreach (var c in scene.Choices)
                        if (c.Go != null)
                            Assert.IsTrue(script.Has(c.Go), $"{scene.Id} → {c.Go}");
            }
        }

        [Test]
        public void EverySceneText_ResolvesWithoutCrashing_InBothFlagWorlds()
        {
            var script = Script;
            var bare = GameState.NewGame();
            var flagged = GameState.NewGame();
            foreach (var f in new[] { "BRACED", "HELPED_COURIER", "SAW_ISLAND", "COMPASS_SPINS" })
                flagged.SetFlag(f);
            flagged.AddItem("photo");
            foreach (var scene in script.All)
            {
                Assert.IsNotEmpty(scene.Text(bare), scene.Id);
                Assert.IsNotEmpty(scene.Text(flagged), scene.Id);
            }
        }

        [Test]
        public void Ashore_ReflectsTheCrashChoices()
        {
            var braced = GameState.NewGame();
            braced.SetFlag("BRACED");
            Assert.IsTrue(Script.Get("ashore").Text(braced).Any(p => p.Contains("Bracing saved you")));

            var battered = GameState.NewGame();
            Assert.IsTrue(Script.Get("ashore").Text(battered).Any(p => p.Contains("ribs light up")));
        }
    }
}
