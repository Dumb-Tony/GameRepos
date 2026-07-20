using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// The ending pipeline: every terminal state resolves to a titled
    /// card, the three v1 endings work end to end, and endings survive
    /// the save round-trip.
    /// </summary>
    public class EndingsTests
    {
        [Test]
        public void ColdFire_ResolvesToItsCanonTitle()
        {
            var s = GameState.NewGame();
            s.DeathCause = "coldfire";
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("COLD FIRE", title);
            Assert.IsNotEmpty(body);
            Assert.IsTrue(Endings.RunIsOver(s));
        }

        [Test]
        public void TheGreenSwallows_GetsItsFullEpilogue()
        {
            var s = GameState.NewGame();
            s.DeathCause = "despair";
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE GREEN SWALLOWS", title);
            Assert.AreEqual(3, body.Length);
            StringAssert.Contains("stop keeping the days", body[0]);
        }

        [Test]
        public void TheEmptyHorizon_IsACoreEnding()
        {
            var s = GameState.NewGame();
            s.EndingId = "EMPTY_HORIZON";
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE EMPTY HORIZON", title);
            Assert.AreEqual(3, body.Length);
            StringAssert.Contains("never the island you were escaping", body[2]);
            Assert.IsTrue(Endings.RunIsOver(s));
        }

        [Test]
        public void UnknownCause_StillGetsACard()
        {
            var s = GameState.NewGame();
            s.DeathCause = "meteor";
            var (title, _) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND KEEPS", title);
        }

        [Test]
        public void ALivingRun_IsNotOver()
        {
            Assert.IsFalse(Endings.RunIsOver(GameState.NewGame()));
        }

        [Test]
        public void EndingId_SurvivesTheSaveRoundTrip_UnderTheVNKey()
        {
            var s = GameState.NewGame();
            s.EndingId = "EMPTY_HORIZON";
            string json = SaveSystem.ToJson(s);
            StringAssert.Contains("\"endingId\"", json);
            Assert.AreEqual("EMPTY_HORIZON", SaveSystem.FromJson(json).EndingId);
        }

        // ---- the raft ----------------------------------------------------
        [Test]
        public void TheRaft_LaunchingEndsTheRun_RefusingDoesNot()
        {
            var launch = GameState.NewGame();
            var script = Endings.BuildRaftScript();
            script.Get("raft_launch").AvailableChoices(launch)[0].Do(launch);
            Assert.AreEqual("EMPTY_HORIZON", launch.EndingId);

            var stay = GameState.NewGame();
            script.Get("raft_launch").AvailableChoices(stay)[1].Do(stay);
            Assert.IsNull(stay.EndingId);
            Assert.IsTrue(stay.Is("RAFT_REFUSED"));
            Assert.AreEqual(57f, stay.Stats.Hope); // +2
        }

        // ---- the dark door ------------------------------------------------
        [Test]
        public void Despair_RefusalIsTheDiscipline()
        {
            var s = GameState.NewGame();
            var scene = Chapter1Encounters.Build().Get("ev_despair");
            scene.AvailableChoices(s)[0].Do(s);
            Assert.AreEqual(63f, s.Stats.Hope); // +8
            Assert.IsTrue(s.Is("DESPAIR_REFUSED"));
            Assert.IsFalse(Endings.RunIsOver(s));
        }

        [Test]
        public void Despair_AcceptedIsTheGreenSwallows()
        {
            var s = GameState.NewGame();
            var scene = Chapter1Encounters.Build().Get("ev_despair");
            scene.AvailableChoices(s)[1].Do(s);
            Assert.AreEqual("despair", s.DeathCause);
            Assert.AreEqual("THE GREEN SWALLOWS", Endings.Resolve(s).Title);
        }

        [Test]
        public void DespairText_KnowsWhoSleepsByTheFire()
        {
            var withDog = GameState.NewGame();
            withDog.Companion = "kavi";
            var scene = Chapter1Encounters.Build().Get("ev_despair");
            Assert.IsTrue(scene.Text(withDog).Any(p => p.Contains("Kavi shifts in sleep")));

            var alone = GameState.NewGame();
            Assert.IsTrue(scene.Text(alone).Any(p => p.Contains("The dark does not")));
        }

        // ---- the summary ----------------------------------------------------
        [Test]
        public void Summary_RemembersTheRun()
        {
            var s = GameState.NewGame();
            s.Day = 7;
            s.Background = "medic";
            s.Companion = "kavi";
            s.SetFlag("KAVI_NAMED");
            s.SetFlag("SOS");
            s.SetFlag(Regions.SeenFlag("bay"));
            s.SetFlag(Regions.SeenFlag("tidepools"));
            var text = string.Join("\n", Endings.Summary(s));
            StringAssert.Contains("Day 7", text);
            StringAssert.Contains("flight medic", text);
            StringAssert.Contains("Kavi", text);
            StringAssert.Contains("2 of the island's 5", text); // grove joined the chart (ch3)
            StringAssert.Contains("eyes that fly", text);
            StringAssert.Contains("Everything is remembered", text);
        }
    }
}
