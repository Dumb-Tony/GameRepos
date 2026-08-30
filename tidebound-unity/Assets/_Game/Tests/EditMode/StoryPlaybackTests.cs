using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// Drives the whole prologue headless, exactly as the DialogueUI
    /// would, and checks the accumulated state at the far end.
    /// </summary>
    public class StoryPlaybackTests
    {
        [Test]
        public void FullPlaythrough_CourierMedicPath_ArrivesAtDayOneWithTheRightPockets()
        {
            var s = GameState.NewGame();
            var play = new StoryPlayback(PrologueScript.Build(), s, PrologueScript.Start);

            Assert.AreEqual("falling", play.Current.Id);
            play.Choose(1); // help the courier

            Assert.AreEqual("falling_courier", play.Current.Id);
            Assert.IsNull(play.Options); // continue-style
            play.Continue();

            Assert.AreEqual("whowere", play.Current.Id);
            play.Choose(0); // flight medic

            Assert.AreEqual("ashore", play.Current.Id);
            Assert.IsTrue(play.Paragraphs().Any(p => p.Contains("photograph")));
            play.Continue();

            Assert.AreEqual("salvage", play.Current.Id);
            Assert.AreEqual(5, play.Options.Count);
            play.Choose(play.Options.FindIndex(c => c.Label.Contains("first-aid")));

            Assert.AreEqual("salvage2", play.Current.Id);
            Assert.AreEqual(4, play.Options.Count);
            play.Choose(play.Options.FindIndex(c => c.Label.StartsWith("Rations")));

            Assert.AreEqual("night0", play.Current.Id);
            Assert.IsTrue(play.Paragraphs().Any(p => p.Contains("courier's photograph")));
            play.Choose(0); // watch the water

            Assert.AreEqual("ch1_open", play.Current.Id);
            play.Continue();
            Assert.IsTrue(play.Finished);

            // the far end: day one, dawn, a medic with a photograph,
            // 4 medkit (1 pocket + 3 salvaged), rations, tarp
            Assert.AreEqual(1, s.Day);
            Assert.AreEqual(Segment.Dawn, s.Seg);
            Assert.AreEqual("medic", s.Background);
            Assert.IsTrue(s.Has("photo"));
            Assert.AreEqual(4, s.Count("medkit"));
            Assert.AreEqual(4, s.Count("rations"));
            Assert.IsTrue(s.Has("tarp"));
            Assert.IsTrue(s.Is("PROLOGUE_DONE") == false); // the runner sets it, not the script
            Assert.IsTrue(s.Is("COMPASS_SPINS"));
        }

        [Test]
        public void EveryBackgroundPath_ReachesTheEnd()
        {
            for (int bg = 0; bg < 4; bg++)
            {
                var s = GameState.NewGame();
                var play = new StoryPlayback(PrologueScript.Build(), s, PrologueScript.Start);
                play.Choose(0);        // brace → whowere
                play.Choose(bg);       // background → ashore
                play.Continue();       // → salvage
                play.Choose(0);        // → salvage2
                play.Choose(0);        // → night0
                play.Choose(1);        // working day → ch1_open
                play.Continue();       // → end
                Assert.IsTrue(play.Finished, $"background index {bg}");
                Assert.AreEqual(1, s.Day);
                Assert.IsNotNull(s.Background);
            }
        }
    }
}
