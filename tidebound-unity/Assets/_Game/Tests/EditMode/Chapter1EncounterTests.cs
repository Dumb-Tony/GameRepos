using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// The chapter-one encounters are ports of scenes-chapter1.js — every
    /// delta pinned to the VN, plus the calendar's firing rules.
    /// </summary>
    public class Chapter1EncounterTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        // ---- the sea eagle -------------------------------------------------
        [Test]
        public void Vela_CookAndEat_PinnedEffects()
        {
            var s = GameState.NewGame();
            Script.Get("ev_vela").AvailableChoices(s)[0].Do(s);
            Assert.IsTrue(s.Met["vela"]);
            Assert.AreEqual(1, s.Interest["vela"]);
            Assert.AreEqual(94f, s.Stats.Hunger); // 80 + 14
            Assert.AreEqual(58f, s.Stats.Hope);   // 55 + 3
        }

        [Test]
        public void Vela_WatchingAsAPhotographer_CountsDouble()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_PHOTOG");
            Script.Get("ev_vela").AvailableChoices(s)[2].Do(s);
            Assert.AreEqual(2, s.Interest["vela"]);
            Assert.IsTrue(s.Is("VELA_STUDIED"));
        }

        // ---- the grey dog, twice --------------------------------------------
        [Test]
        public void Howls_TossingFood_OpensTheDoor()
        {
            var s = GameState.NewGame();
            Script.Get("ev_howls").AvailableChoices(s)[0].Do(s);
            Assert.IsTrue(s.Met["kavi"]);
            Assert.AreEqual(2, s.Interest["kavi"]);
            Assert.AreEqual(76f, s.Stats.Hunger); // 80 - 4
        }

        [Test]
        public void Kavi2_TheCrab_WarmsHimMost()
        {
            var s = GameState.NewGame();
            Script.Get("ev_kavi2").AvailableChoices(s)[0].Do(s);
            Assert.IsTrue(s.Met["kavi"]);
            Assert.AreEqual(3, s.Interest["kavi"]);
            Assert.AreEqual(76f, s.Stats.Hunger);
        }

        // ---- the thief --------------------------------------------------------
        [Test]
        public void Ipo_AlwaysTakesTheLighter_HoweverYouRespond()
        {
            for (int choice = 0; choice < 3; choice++)
            {
                var s = GameState.NewGame();
                s.AddItem("lighter"); // pretend we had one; he removes even the idea
                Script.Get("ev_ipo").AvailableChoices(s)[choice].Do(s);
                Assert.IsFalse(s.Has("lighter"), $"choice {choice}");
                Assert.IsTrue(s.Is("LIGHTER_GONE"), $"choice {choice}");
                Assert.IsTrue(s.Met["ipo"], $"choice {choice}");
            }
        }

        [Test]
        public void Ipo_TheChase_PinnedCosts()
        {
            var s = GameState.NewGame();
            var c = Script.Get("ev_ipo").AvailableChoices(s)[0];
            c.Do(s);
            Assert.AreEqual(77f, s.Stats.Energy); // -8
            Assert.AreEqual(56f, s.Stats.Hope);   // +1
            Assert.AreEqual("ev_ipo2", c.Go);
        }

        // ---- the squall (enter effects, idempotent) ----------------------------
        [Test]
        public void Squall_WithARoof_IsAVictory()
        {
            var s = GameState.NewGame();
            s.Shelter = 1;
            Script.Get("ev_squall").OnEnter(s);
            Assert.AreEqual(60f, s.Stats.Hope);   // +5
            Assert.AreEqual(85f, s.Stats.Thirst); // +10
            Assert.IsTrue(s.Is("SQUALL_DRY"));
        }

        [Test]
        public void Squall_WithOnlyTheTarp_JustWater()
        {
            var s = GameState.NewGame();
            s.AddItem("tarp");
            Script.Get("ev_squall").OnEnter(s);
            Assert.AreEqual(85f, s.Stats.Thirst);
            Assert.AreEqual(55f, s.Stats.Hope); // untouched
        }

        [Test]
        public void Squall_Exposed_DrownsTheFire()
        {
            var s = GameState.NewGame();
            s.Fire = 1;
            s.FireFuel = 3f;
            Script.Get("ev_squall").OnEnter(s);
            Assert.AreEqual(75f, s.Stats.Energy); // -10
            Assert.AreEqual(49f, s.Stats.Hope);   // -6
            Assert.AreEqual(87f, s.Stats.Thirst); // +12
            Assert.AreEqual(0, s.Fire);
            Assert.AreEqual(0f, s.FireFuel);
            Assert.IsTrue(s.Is("FIRE_DROWNED"));
        }

        [Test]
        public void Squall_NeverAppliesTwice()
        {
            var s = GameState.NewGame();
            s.Shelter = 1;
            Script.Get("ev_squall").OnEnter(s);
            Script.Get("ev_squall").OnEnter(s);
            Assert.AreEqual(60f, s.Stats.Hope); // once
        }

        // ---- the auditor --------------------------------------------------------
        [Test]
        public void Buri_AlwaysCostsARation_WhenYouHaveThem()
        {
            for (int choice = 0; choice < 3; choice++)
            {
                var s = GameState.NewGame();
                s.AddItem("rations", 3);
                Script.Get("ev_buri").AvailableChoices(s)[choice].Do(s);
                Assert.AreEqual(2, s.Count("rations"), $"choice {choice}");
                Assert.IsTrue(s.Met["buri"], $"choice {choice}");
            }
        }

        [Test]
        public void Buri_FeedingHimWithEmptyPockets_CostsHunger()
        {
            var s = GameState.NewGame();
            Script.Get("ev_buri").AvailableChoices(s)[1].Do(s);
            Assert.AreEqual(75f, s.Stats.Hunger); // -5
            Assert.AreEqual(58f, s.Stats.Hope);   // +3
            Assert.AreEqual(2, s.Interest["buri"]);
        }

        // ---- the hen --------------------------------------------------------------
        [Test]
        public void Moa_Intervening_EarnsHerAttention()
        {
            var s = GameState.NewGame();
            Script.Get("ev_moa").AvailableChoices(s)[1].Do(s); // the stone
            Assert.AreEqual(2, s.Interest["moa"]);
        }

        [Test]
        public void Moa_StandingStill_FeedsTheDeep()
        {
            var s = GameState.NewGame();
            Script.Get("ev_moa").AvailableChoices(s)[2].Do(s);
            Assert.AreEqual(0, s.Interest["moa"]);
            Assert.AreEqual(1, s.Route.Depth);
        }

        // ---- the light on the horizon ----------------------------------------------
        [Test]
        public void Lights_FiringTheFlare_SpendsItAndHope()
        {
            var s = GameState.NewGame();
            s.AddItem("flaregun");
            Script.Get("ev_lights").AvailableChoices(s)[0].Do(s);
            Assert.IsFalse(s.Has("flaregun"));
            Assert.IsTrue(s.Is("FLARE_SPENT"));
            Assert.AreEqual(4, s.Route.Signal);
            Assert.AreEqual(47f, s.Stats.Hope); // -8: hope spent skyward
        }

        [Test]
        public void Lights_HoldingIt_ChangesYouInstead()
        {
            var s = GameState.NewGame();
            s.AddItem("flaregun");
            Script.Get("ev_lights").AvailableChoices(s)[1].Do(s);
            Assert.IsTrue(s.Has("flaregun"));
            Assert.IsTrue(s.Is("FLARE_HELD"));
            Assert.AreEqual(57f, s.Stats.Hope); // +2
        }

        // ---- structure ----------------------------------------------------------------
        [Test]
        public void EveryTransitionTarget_Exists_AndTextResolvesInAllWorlds()
        {
            var script = Script;
            var worlds = new List<GameState>();
            worlds.Add(GameState.NewGame());
            var rich = GameState.NewGame();
            rich.Fire = 1;
            rich.Shelter = 1;
            rich.AddItem("rations", 2);
            rich.AddItem("tarp");
            worlds.Add(rich);

            foreach (var scene in script.All)
            {
                if (scene.Next != null) Assert.IsTrue(script.Has(scene.Next), scene.Id);
                if (scene.Choices != null)
                    foreach (var c in scene.Choices)
                        if (c.Go != null)
                            Assert.IsTrue(script.Has(c.Go), $"{scene.Id} → {c.Go}");
                foreach (var w in worlds)
                    Assert.IsNotEmpty(scene.Text(w), scene.Id);
            }
        }

        // ---- the calendar ---------------------------------------------------------------
        [Test]
        public void Schedule_FiresOnTheExactDayAndSegment_Once()
        {
            var s = GameState.NewGame();
            var schedule = Chapter1Schedule.Build();

            s.Day = 1; s.Seg = Segment.Day;
            Assert.IsNull(EventScheduler.Due(s, schedule));

            s.Seg = Segment.Dusk;
            Assert.AreEqual("ev_vela", EventScheduler.Due(s, schedule));
            EventScheduler.MarkFired(s, "ev_vela");
            Assert.IsNull(EventScheduler.Due(s, schedule));
        }

        [Test]
        public void Schedule_MissedIsMissed()
        {
            var s = GameState.NewGame();
            s.Day = 2; s.Seg = Segment.Day;
            Assert.IsNull(EventScheduler.Due(s, Chapter1Schedule.Build())); // ev_ipo was dawn
        }

        [Test]
        public void Schedule_TheShipNeedsTheFlareGun()
        {
            var s = GameState.NewGame();
            s.Day = 4; s.Seg = Segment.Dusk;
            var schedule = Chapter1Schedule.Build();
            Assert.IsNull(EventScheduler.Due(s, schedule));
            s.AddItem("flaregun");
            Assert.AreEqual("ev_lights", EventScheduler.Due(s, schedule));
        }

        [Test]
        public void EveryScheduledScene_ExistsInTheEncounterScript()
        {
            var script = Script;
            foreach (var e in Chapter1Schedule.Build())
                Assert.IsTrue(script.Has(e.SceneId), e.SceneId);
        }
    }
}
