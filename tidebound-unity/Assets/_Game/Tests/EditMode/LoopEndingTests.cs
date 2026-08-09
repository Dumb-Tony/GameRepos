using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Ending X3 — THE LOOP. The journal in your own handwriting,
    /// the door only a remembered life can open, and the answer that turns
    /// the whole game's rhythm from a cage into a tally.</summary>
    public class LoopEndingTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState Loop()
        {
            var s = GameState.NewGame();
            s.SetFlag("NGPLUS");
            s.LoopsLived = 2;
            return s;
        }

        static GameState OnTheDay(GameState s)
        {
            s.Day = 30;
            s.Seg = Segment.Day;
            return s;
        }

        [Test]
        public void TheJournal_ComesDueForRememberedLivesOnly()
        {
            var schedule = Chapter1Schedule.Build();

            // a first life walks that beach on day 30 and finds nothing
            Assert.AreNotEqual("ev_loop", EventScheduler.Due(OnTheDay(GameState.NewGame()), schedule));

            // a life the island remembers is sure the grotto is there
            Assert.AreEqual("ev_loop", EventScheduler.Due(OnTheDay(Loop()), schedule));

            // and having read it once, you have put it back before
            var alreadyRead = OnTheDay(Loop());
            alreadyRead.SetFlag("LOOP_KNOWN");
            Assert.AreNotEqual("ev_loop", EventScheduler.Due(alreadyRead, schedule));

            // the calendar does not chase you: wrong segment, no journal
            var wrongHour = Loop();
            wrongHour.Day = 30;
            wrongHour.Seg = Segment.Night;
            Assert.AreNotEqual("ev_loop", EventScheduler.Due(wrongHour, schedule));
        }

        [Test]
        public void ReadingIt_CostsHopeAndPaysDepth()
        {
            var s = Loop();
            int depthBefore = s.Route.Depth;
            float hopeBefore = s.Stats.Hope;

            Script.Get("ev_loop").OnEnter(s);
            Assert.IsTrue(s.Is("LOOP_KNOWN"));
            Assert.AreEqual(depthBefore + 3, s.Route.Depth);
            Assert.Less(s.Stats.Hope, hopeBefore); // certainty curdling into something colder

            // and it only lands once, however often the scene is re-entered
            int depthAfter = s.Route.Depth;
            float hopeAfter = s.Stats.Hope;
            Script.Get("ev_loop").OnEnter(s);
            Assert.AreEqual(depthAfter, s.Route.Depth);
            Assert.AreEqual(hopeAfter, s.Stats.Hope, 1e-4f);
        }

        [Test]
        public void TheHandwritingIsYours()
        {
            var text = string.Join("\n", Script.Get("ev_loop").Text(Loop()));
            StringAssert.Contains("the handwriting in it is <i>yours</i>", text);
            StringAssert.Contains("who is counting WITH you", text);
            StringAssert.Contains("you have put it back before", text);
        }

        [Test]
        public void TheDoor_OpensOnlyForALifeThatReadTheJournal()
        {
            var unread = Loop(); // NG+, but never found the grotto
            foreach (var c in Script.Get("convergence").AvailableChoices(unread))
                StringAssert.DoesNotContain("who is counting with you", c.Label);

            var firstLife = GameState.NewGame();
            firstLife.SetFlag("LOOP_KNOWN"); // impossible in play; the gate holds anyway
            foreach (var c in Script.Get("convergence").AvailableChoices(firstLife))
                StringAssert.DoesNotContain("who is counting with you", c.Label);

            var ready = Loop();
            ready.SetFlag("LOOP_KNOWN");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(ready))
                if (c.Label.Contains("who is counting with you")) { c.Do(ready); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("LOOP", ready.EndingId);
        }

        [Test]
        public void TheAnswer_IsALedgerAndNotACage()
        {
            var s = Loop();
            s.SetFlag("LOOP_KNOWN");
            s.EndingId = "LOOP";
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE LOOP", title);
            var prose = string.Join("\n", body);
            StringAssert.Contains("It isn't a loop. It's a ledger", prose);
            StringAssert.Contains("the count includes you", prose);
            StringAssert.Contains("the Hum sounds <i>glad</i>", prose);
        }

        [Test]
        public void TheLoop_IsAStayingEnding_SoTheCompanionStays()
        {
            var s = Loop();
            s.Companion = "kavi";
            s.Trust = 80;
            s.EndingId = "LOOP";
            var epilogue = string.Join("\n", Endings.Epilogue(s));
            // you walk out into the next morning — nobody is put on a boat
            StringAssert.Contains("grows grey-muzzled at your fire", epilogue);
        }

        [Test]
        public void TheLoop_BanksLikeAnyOtherLife()
        {
            var s = Loop();
            s.SetFlag("EDDA_MET");
            s.EndingId = "LOOP";
            var data = new LoopData { Loops = 2 };
            DriftwoodLoops.Bank(data, s);
            Assert.AreEqual(3, data.Loops);        // the count is not finished
            Assert.IsTrue(data.Knows("KNOW_EDDA"));
        }
    }
}
