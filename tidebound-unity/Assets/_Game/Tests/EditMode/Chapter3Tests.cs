using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Three session 1 — the ch3_open cluster, pinned to scenes-chapter3.js.</summary>
    public class Chapter3Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        // ---- the chapter turn ------------------------------------------------
        [Test]
        public void ChapterTurn_SetsChapterOnce()
        {
            var s = GameState.NewGame();
            s.Chapter = 2;
            var open = Script.Get("ch3_open");
            open.OnEnter(s);
            Assert.AreEqual(3, s.Chapter);

            s.Chapter = 4; // reload guard: entering again must not regress
            open.OnEnter(s);
            Assert.AreEqual(4, s.Chapter);
        }

        [Test]
        public void ChapterTwoCard_ContinuesIntoChapterThree()
        {
            Assert.AreEqual("ch3_open", Script.Get("ch2_end").Next);
        }

        [Test]
        public void ChapterTurn_BranchesOnTheSmokeDecision()
        {
            var go = Script.Get("ch3_open").AvailableChoices(GameState.NewGame())[0].GoDynamic;

            var now = GameState.NewGame();
            now.SetFlag("SMOKE_NOW");
            Assert.AreEqual("ch3_edda_now", go(now));

            var later = GameState.NewGame();
            later.SetFlag("SMOKE_LATER");
            Assert.AreEqual("ch3_edda_later", go(later));

            Assert.AreEqual("ch3_open_signal", go(GameState.NewGame()));
        }

        // ---- Edda chemistry (scenes-chapter3.js eddaChem) --------------------
        [Test]
        public void EddaChem_KaviAndSolo()
        {
            var kavi = GameState.NewGame();
            kavi.Companion = "kavi";
            Assert.AreEqual(5, Chapter3Events.EddaChem(kavi));
            Assert.AreEqual(4, Chapter3Events.EddaChem(GameState.NewGame())); // solo: self-reliance
        }

        // ---- the night-visit meeting -----------------------------------------
        [Test]
        public void EddaNow_HonestLedger_SetsMeterHopeAndFlag()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            float hope = s.Stats.Hope;
            var thanks = Script.Get("ch3_edda_now").AvailableChoices(s)[0];
            thanks.Do(s);
            Assert.IsTrue(s.Is("EDDA_MET"));
            Assert.AreEqual(25, s.Edda); // 20 + kavi 5
            Assert.AreEqual(hope + 5, s.Stats.Hope);
            Assert.AreEqual("ch3_after_open", thanks.Go);
        }

        [Test]
        public void EddaNow_PressingTheWord_CostsRegardPaysDepth()
        {
            var s = GameState.NewGame(); // solo
            var press = Script.Get("ch3_edda_now").AvailableChoices(s)[1];
            press.Do(s);
            Assert.IsTrue(s.Is("EDDA_MET"));
            Assert.IsTrue(s.Is("EDDA_PRESSED"));
            Assert.AreEqual(18, s.Edda); // 14 + solo 4
            Assert.AreEqual(2, s.Route.Depth);
            Assert.AreEqual("ch3_after_press", press.Go);
        }

        // ---- the noon appointment --------------------------------------------
        [Test]
        public void EddaLater_Patience_PaysBest()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            float hope = s.Stats.Hope;
            var wait = Script.Get("ch3_edda_later").AvailableChoices(s)[1];
            wait.Do(s);
            Assert.IsTrue(s.Is("EDDA_PATIENT"));
            Assert.AreEqual(37, s.Edda); // 32 + kavi 5
            Assert.AreEqual(hope + 4, s.Stats.Hope);
        }

        [Test]
        public void EddaLater_TheQuestion_PaysDepth()
        {
            var s = GameState.NewGame();
            var ask = Script.Get("ch3_edda_later").AvailableChoices(s)[0];
            ask.Do(s);
            Assert.AreEqual(32, s.Edda); // 28 + solo 4
            Assert.AreEqual(1, s.Route.Depth);
        }

        // ---- the grove opens --------------------------------------------------
        [Test]
        public void AfterOpen_OpensGroveOnce_WithBasketAndFeverbark()
        {
            var s = GameState.NewGame();
            float hunger = s.Stats.Hunger;
            var after = Script.Get("ch3_after_open");
            after.OnEnter(s);
            Assert.IsTrue(s.Is("GROVE_OPENED"));
            Assert.IsTrue(s.Is("LORE_FEVERBARK"));
            Assert.AreEqual(hunger + 12, s.Stats.Hunger); // the basket you didn't earn

            after.OnEnter(s); // once only
            Assert.AreEqual(hunger + 12, s.Stats.Hunger);
        }

        [Test]
        public void AfterPress_OpensGroveWarily_NoBasket()
        {
            var s = GameState.NewGame();
            float hunger = s.Stats.Hunger;
            Script.Get("ch3_after_press").OnEnter(s);
            Assert.IsTrue(s.Is("GROVE_OPENED"));
            Assert.IsTrue(s.Is("LORE_FEVERBARK"));
            Assert.AreEqual(hunger, s.Stats.Hunger); // warily: no basket
        }

        // ---- session 2: the river, her visit, the fever, Old Grin ------------
        [Test]
        public void River_OpensTheArtery_Once()
        {
            var s = GameState.NewGame();
            s.Stats.Thirst = 40f;
            float hope = s.Stats.Hope;
            var river = Script.Get("ev3_river");
            river.OnEnter(s);
            Assert.IsTrue(s.Is("RIVER_KNOWN"));
            Assert.AreEqual(80f, s.Stats.Thirst);
            Assert.AreEqual(hope + 8, s.Stats.Hope);
            Assert.AreEqual(1, s.Route.Roots);

            river.OnEnter(s); // once only
            Assert.AreEqual(80f, s.Stats.Thirst);
        }

        [Test]
        public void EddaVisit_MeetsHerOnTheSignalRoad_WithCuttings()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            Script.Get("ev3_eddavisit").OnEnter(s);
            Assert.IsTrue(s.Is("EDDA_MET"));
            Assert.IsTrue(s.Is("GROVE_OPENED"));
            Assert.IsTrue(s.Is("LORE_FEVERBARK"));
            Assert.IsTrue(s.Is("SALVE")); // she leaves cuttings
            Assert.AreEqual(15, s.Edda); // 10 + kavi 5 — the coldest of the three doors
        }

        [Test]
        public void Fever_Strikes_OnlyTheUntreated()
        {
            var s = GameState.NewGame();
            float energy = s.Stats.Energy;
            Script.Get("ev3_fever").OnEnter(s);
            Assert.AreEqual("fever", s.Disease);
            Assert.IsTrue(s.Is("FEVER_STRUCK"));
            Assert.AreEqual(energy - 15, s.Stats.Energy);

            var sick = GameState.NewGame();
            sick.Disease = "infection"; // already fighting something: no double strike
            Script.Get("ev3_fever").OnEnter(sick);
            Assert.AreEqual("infection", sick.Disease);
            Assert.IsFalse(sick.Is("FEVER_STRUCK"));
        }

        [Test]
        public void OldGrin_SettlesIntoPerfectComfort()
        {
            var s = GameState.NewGame();
            float hope = s.Stats.Hope;
            Script.Get("ev3_grin1").OnEnter(s);
            Assert.IsTrue(s.Is("GRIN_MET"));
            Assert.AreEqual(hope - 3, s.Stats.Hope);
            Assert.AreEqual(1, s.Route.Depth);
        }

        // ---- the calendar ----------------------------------------------------
        [Test]
        public void Schedule_CarriesTheChapterThreeWeek()
        {
            var schedule = Chapter1Schedule.Build();
            var s = GameState.NewGame();
            s.Day = 20; s.Seg = Segment.Dusk;
            Assert.AreEqual("ev3_river", EventScheduler.Due(s, schedule));

            s.Day = 21; s.Seg = Segment.Dawn;
            Assert.IsNull(EventScheduler.Due(s, schedule)); // took a mountain road: no visit
            s.SetFlag("SMOKE_IGNORED");
            Assert.AreEqual("ev3_eddavisit", EventScheduler.Due(s, schedule));
            s.SetFlag("EDDA_MET");
            Assert.IsNull(EventScheduler.Due(s, schedule)); // already met: she stays home

            s.Day = 22; s.Seg = Segment.Dusk;
            Assert.IsNull(EventScheduler.Due(s, schedule)); // no FEVER_SEED: no fever
            s.SetFlag("FEVER_SEED");
            Assert.AreEqual("ev3_fever", EventScheduler.Due(s, schedule));
            s.SetFlag("SALVE");
            Assert.IsNull(EventScheduler.Due(s, schedule)); // the cuttings worked

            s.Day = 24; s.Seg = Segment.Dusk;
            Assert.AreEqual("ev3_grin1", EventScheduler.Due(s, schedule));
        }

        // ---- the grove as a place --------------------------------------------
        [Test]
        public void Grove_IsARegion_OnTheMountainsKnee()
        {
            var grove = Regions.Get("grove");
            Assert.AreEqual("Edda's Grove", grove.Name);
            Assert.AreEqual(288f, grove.ChartX);
            Assert.AreEqual(110f, grove.ChartY);
            Assert.AreEqual("grove", Regions.IdAt(100f, 285f));
            Assert.AreEqual("deepgreen", Regions.IdAt(-40f, 285f)); // west interior stays wild

            var s = GameState.NewGame();
            s.Stats.Hunger = 60f;
            grove.FirstEffects(s);
            Assert.AreEqual(6, s.Edda);
            Assert.AreEqual(68f, s.Stats.Hunger); // greens and a cutting
        }
    }
}
