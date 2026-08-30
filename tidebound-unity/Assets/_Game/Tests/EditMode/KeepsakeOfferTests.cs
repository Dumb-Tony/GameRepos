using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>The island's last question, asked once per life: what crosses
    /// the water with you? The offer waits for the card to have shown and the
    /// life to be banked, and never asks twice.</summary>
    public class KeepsakeOfferTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        /// <summary>The gate GameManager applies at run's end.</summary>
        static bool WouldOffer(GameState s) =>
            s.Is("LOOP_BANKED") && !s.Is("KEEPSAKE_CHOSEN");

        static GameState EndedRun()
        {
            var s = GameState.NewGame();
            s.EndingId = "HOME";
            return s;
        }

        [Test]
        public void TheQuestion_WaitsForTheLifeToBeBanked()
        {
            var justEnded = EndedRun();
            Assert.IsFalse(WouldOffer(justEnded)); // the card hasn't rendered its verdict yet

            var data = new LoopData();
            DriftwoodLoops.Bank(data, justEnded); // RunCardUI.Show does this
            Assert.IsTrue(WouldOffer(justEnded));
        }

        [Test]
        public void TheQuestion_IsNeverAskedTwice()
        {
            var s = EndedRun();
            DriftwoodLoops.Bank(new LoopData(), s);
            Assert.IsTrue(WouldOffer(s));

            // answering it — by any option, including refusing — closes it
            var refuse = Script.Get("keepsake").AvailableChoices(s);
            s.SetFlag("KEEPSAKE_CHOSEN"); // what every choice's Do sets
            Assert.IsFalse(WouldOffer(s));
            Assert.Greater(refuse.Count, 0);
        }

        [Test]
        public void ADeath_IsAskedTheSameQuestion()
        {
            var drowned = GameState.NewGame();
            drowned.DeathCause = "undertow";
            DriftwoodLoops.Bank(new LoopData(), drowned);
            Assert.IsTrue(WouldOffer(drowned)); // a life is a life; it still leaves something
        }

        [Test]
        public void EveryOption_ClosesTheQuestionAndBanksTheChoice()
        {
            // each keepsake choice must set KEEPSAKE_CHOSEN, or the offer
            // would re-open forever at the run card
            var earned = EndedRun();
            earned.SetFlag("EDDA_MET");
            earned.SetFlag("GULLET_MAP");
            DriftwoodLoops.Bank(new LoopData(), earned);

            var options = Script.Get("keepsake").AvailableChoices(earned);
            Assert.AreEqual(4, options.Count); // rope, tin, chart, and the sea
            foreach (var option in options)
                Assert.IsNotNull(option.Do, option.Label);
        }

        [Test]
        public void TheSceneNeverLeadsAnywhere_SoTheCardComesBack()
        {
            var scene = Script.Get("keepsake");
            Assert.IsNull(scene.Next); // the dialogue simply ends; the card returns
            foreach (var c in scene.Choices)
                Assert.IsNull(c.Go);
        }
    }
}
