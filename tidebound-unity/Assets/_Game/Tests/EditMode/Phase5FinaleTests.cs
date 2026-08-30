using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// Phase 5's finale: shelter tier 3 (the fortified camp), the courier's
    /// case arc, and the cyclone night — Cold Fire's proper vehicle. Every
    /// ported effect pinned to its VN source (scenes-chapter2.js camp works,
    /// scenes-extra.js locked things, scenes-chapter5.js shared events).
    /// </summary>
    public class Phase5FinaleTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        // ================= shelter tier 3 =================
        [Test]
        public void Fortify_ThirdTier_PinnedCostAndProse()
        {
            var s = GameState.NewGame();
            s.Shelter = 2;
            var r = SurvivalActions.BuildShelter(s);
            Assert.AreEqual(3, s.Shelter);
            Assert.AreEqual(71f, s.Stats.Energy); // -14, bare hands
            Assert.AreEqual(2, s.Route.Roots);
            StringAssert.Contains("position", r.Line); // scenes-chapter2.js verbatim
        }

        [Test]
        public void Fortify_TheEngineerPaysLess()
        {
            var s = GameState.NewGame();
            s.Shelter = 2;
            s.SetFlag("BG_ENGINEER");
            SurvivalActions.BuildShelter(s);
            Assert.AreEqual(75f, s.Stats.Energy); // -10
        }

        [Test]
        public void Threshold_KnowsAFortifiedCampWhenItSeesOne()
        {
            var fort = GameState.NewGame();
            fort.Shelter = 3;
            var scene = Script.Get("ch2_threshold");
            StringAssert.Contains("a fortified camp", string.Join("\n", scene.Text(fort)));

            var work = GameState.NewGame();
            work.Shelter = 2;
            StringAssert.Contains("a working camp", string.Join("\n", scene.Text(work)));
        }

        // ================= the courier's case =================
        [Test]
        public void CaseScene_TheDrill_IsTheEngineersAlone()
        {
            var bare = GameState.NewGame();
            Assert.AreEqual(2, Script.Get("case_scene").AvailableChoices(bare).Count); // smash, leave

            var eng = GameState.NewGame();
            eng.SetFlag("BG_ENGINEER");
            eng.AddItem("toolbox");
            var c = Script.Get("case_scene").AvailableChoices(eng);
            Assert.AreEqual(3, c.Count);
            Assert.AreEqual("case_open_drill", c[0].Go);
        }

        [Test]
        public void CaseScene_Drill_PinnedEffects()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_ENGINEER");
            s.AddItem("toolbox");
            Script.Get("case_scene").AvailableChoices(s)[0].Do(s);
            Assert.IsTrue(s.Is("CASE_OPEN"));
            Assert.IsFalse(s.Is("CHART_TORN"));
            Assert.AreEqual(77f, s.Stats.Energy); // -8
        }

        [Test]
        public void CaseScene_Smash_TearsTheChart()
        {
            var s = GameState.NewGame();
            Script.Get("case_scene").AvailableChoices(s)[0].Do(s); // smash leads, bare-handed
            Assert.IsTrue(s.Is("CASE_OPEN"));
            Assert.IsTrue(s.Is("CHART_TORN"));
            Assert.AreEqual(75f, s.Stats.Energy); // -10
        }

        [Test]
        public void CaseScene_Leaving_IsARootsChoice_Once()
        {
            var s = GameState.NewGame();
            var choices = Script.Get("case_scene").AvailableChoices(s);
            var leave = choices[choices.Count - 1];
            Assert.IsNull(leave.Go); // back to the world
            leave.Do(s);
            Assert.IsFalse(s.Is("CASE_OPEN"));
            Assert.AreEqual(1, s.Route.Roots);
            leave.Do(s);
            Assert.AreEqual(1, s.Route.Roots); // no farming the drawer's patience
        }

        [Test]
        public void CaseOpen_TheLootLandsOnce()
        {
            var s = GameState.NewGame();
            var open = Script.Get("case_open_smash");
            open.OnEnter(s);
            Assert.IsTrue(s.Is("CASE_LOOT"));
            Assert.IsTrue(s.Is("GEMS"));
            Assert.IsTrue(s.Is("DOSSIER"));
            Assert.IsTrue(s.Is("CHART_ROSA"));
            Assert.IsTrue(s.Is("GEMS_MYSTERY")); // nothing this run has named the glass
            Assert.AreEqual(2, s.Route.Depth);
            Assert.AreEqual(1, s.Route.Signal);
            open.OnEnter(s);
            Assert.AreEqual(2, s.Route.Depth); // guarded
        }

        [Test]
        public void CaseContents_OnlyNameTheGlassWhenKnown()
        {
            var stranger = GameState.NewGame();
            var text = string.Join("\n", Script.Get("case_open_drill").Text(stranger));
            StringAssert.Contains("most beautiful question", text);
            StringAssert.DoesNotContain("Heartglass", text);

            var initiate = GameState.NewGame();
            initiate.SetFlag("WOUND_SEEN");
            Assert.IsTrue(CaseArc.KnowsGlass(initiate));
            StringAssert.Contains("Heartglass",
                string.Join("\n", Script.Get("case_open_drill").Text(initiate)));
        }

        [Test]
        public void CaseAshore_TheSeaReturnsIt_Once()
        {
            var s = GameState.NewGame();
            var scene = Script.Get("ev2_case_ashore");
            scene.OnEnter(s);
            Assert.IsTrue(s.Has("case"));
            Assert.IsTrue(s.Is("CASE_ASHORE"));
            Assert.AreEqual(1, s.Route.Depth); // the salvage's point travels with the case
            scene.OnEnter(s);
            Assert.AreEqual(1, s.Count("case")); // guarded
        }

        [Test]
        public void CaseAshore_OnlyForTheUnsalvaged_DayEightDawn()
        {
            var schedule = Chapter1Schedule.Build();
            var s = GameState.NewGame();
            s.Day = 8;
            s.Seg = Segment.Dawn;
            Assert.AreEqual("ev2_case_ashore", EventScheduler.Due(s, schedule));

            var salvaged = GameState.NewGame();
            salvaged.Day = 8;
            salvaged.Seg = Segment.Dawn;
            salvaged.SetFlag("SALV_case");
            salvaged.AddItem("case");
            Assert.IsNull(EventScheduler.Due(salvaged, schedule));
        }

        [Test]
        public void Summary_TheCaseRemembersItsState()
        {
            var locked = GameState.NewGame();
            locked.AddItem("case");
            StringAssert.Contains("kept its answer to the end",
                string.Join("\n", Endings.Summary(locked)));

            var opened = GameState.NewGame();
            opened.AddItem("case");
            opened.SetFlag("CASE_OPEN");
            StringAssert.Contains("You opened the courier's case",
                string.Join("\n", Endings.Summary(opened)));
        }

        // ================= the cyclone night =================
        [Test]
        public void Cyclone_IsOnTheCalendar_DayFiftyEightNight()
        {
            var s = GameState.NewGame();
            s.Day = 58;
            s.Seg = Segment.Night;
            Assert.AreEqual("ev5_cyclone", EventScheduler.Due(s, Chapter1Schedule.Build()));
        }

        [Test]
        public void Cyclone_FortifiedCamp_PaysOnlyInSleep_AndHasNoDeathDoor()
        {
            var s = GameState.NewGame();
            s.Shelter = 3;
            s.Fire = 1;
            s.FireFuel = 2f;
            var scene = Script.Get("ev5_cyclone");
            scene.OnEnter(s);
            Assert.AreEqual(3, s.Shelter);
            Assert.AreEqual(79f, s.Stats.Energy); // -6
            Assert.AreEqual(57f, s.Stats.Hope);   // +2
            Assert.AreEqual(0, s.Fire);           // even fortified camps lose fire
            Assert.AreEqual(0f, s.FireFuel);
            Assert.AreEqual(0, scene.AvailableChoices(s).Count); // no question to ask
            scene.OnEnter(s);
            Assert.AreEqual(79f, s.Stats.Energy); // guarded
        }

        [Test]
        public void Cyclone_ATierTwoCamp_LosesATier_AndTheQuestionArrives()
        {
            // the VN measures the death door AFTER the storm's first take:
            // tier 2 → tier 1, and the night asks anyway
            var s = GameState.NewGame();
            s.Shelter = 2;
            var scene = Script.Get("ev5_cyclone");
            scene.OnEnter(s);
            Assert.AreEqual(1, s.Shelter);
            Assert.AreEqual(71f, s.Stats.Energy); // -14
            Assert.AreEqual(49f, s.Stats.Hope);   // -6
            Assert.AreEqual(94f, s.Stats.Health); // -6
            Assert.AreEqual(2, scene.AvailableChoices(s).Count);
        }

        [Test]
        public void Cyclone_Fleeing_CostsEverythingButThePulse()
        {
            var s = GameState.NewGame();
            s.Shelter = 2;
            var scene = Script.Get("ev5_cyclone");
            scene.OnEnter(s);
            var flee = scene.AvailableChoices(s)[0];
            flee.Do(s);
            Assert.AreEqual(0, s.Shelter);
            Assert.AreEqual(55f, s.Stats.Energy); // 71 - 16
            Assert.AreEqual(86f, s.Stats.Health); // 94 - 8
            Assert.AreEqual(43f, s.Stats.Hope);   // 49 - 6
            Assert.IsNull(s.DeathCause);
            Assert.AreEqual("ev5_cyclone_flee", flee.Go);
        }

        [Test]
        public void Cyclone_Staying_IsColdFire_WithItsFullFraming()
        {
            var s = GameState.NewGame();
            s.Shelter = 0;
            var scene = Script.Get("ev5_cyclone");
            scene.OnEnter(s);
            var stay = scene.AvailableChoices(s)[1];
            StringAssert.Contains("WARNING", stay.Sub); // law #1: the island says it plainly
            stay.Do(s);
            Assert.AreEqual("coldfire", s.DeathCause);
            Assert.IsNull(stay.Go); // straight to the run card
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("COLD FIRE", title);
            StringAssert.Contains("The storm only did the audit.", string.Join("\n", body));
        }

        [Test]
        public void ColdFire_WithoutItsCyclone_KeepsTheLeanCard()
        {
            var s = GameState.NewGame();
            s.DeathCause = "coldfire"; // the plain cold-night exposure death
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("COLD FIRE", title);
            StringAssert.Contains("dusk wind", string.Join("\n", body));
            StringAssert.DoesNotContain("audit", string.Join("\n", body));
        }

        [Test]
        public void Cyclone_FortifiedCamp_PlaysAsAContinueScene_NoSoftlock()
        {
            // all choices When-filtered away must read as continue-style,
            // or the fortified camp's cyclone would strand the dialogue
            var s = GameState.NewGame();
            s.Shelter = 3;
            var playback = new StoryPlayback(Script, s, "ev5_cyclone");
            Assert.IsNull(playback.Options);
            playback.Continue();
            Assert.IsTrue(playback.Finished);
        }

        [Test]
        public void Cyclone_KaviKeepsHisWatch()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Shelter = 3;
            Script.Get("ev5_cyclone").OnEnter(s);
            Assert.IsTrue(s.Is("KAVI_FIRE_NIGHT"));
        }
    }
}
