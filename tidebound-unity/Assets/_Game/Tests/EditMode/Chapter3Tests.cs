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
    }
}
