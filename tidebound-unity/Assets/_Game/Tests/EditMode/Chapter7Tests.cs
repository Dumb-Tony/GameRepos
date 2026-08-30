using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Seven — Convergence: the final choice and the ending engine, pinned to scenes-chapter7.js.</summary>
    public class Chapter7Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void ChapterSixCard_ContinuesIntoConvergence()
        {
            Assert.AreEqual("ch7_open", Script.Get("ch6_end").Next);
            Assert.AreEqual("convergence", Script.Get("ch7_open").Next);
        }

        [Test]
        public void SilencedWorld_OffersTheFoundShore()
        {
            var s = GameState.NewGame();
            s.SetFlag("TIDEWELL_SILENCE");
            var options = Script.Get("convergence").AvailableChoices(s);
            Assert.AreEqual(2, options.Count); // meet the ships / stay as the world arrives

            options[0].Do(s);
            Assert.AreEqual("RESCUE", s.EndingId); // hope is high: no regret
            Assert.IsNull(options[0].GoDynamic(s)); // the run card takes it

            var low = GameState.NewGame();
            low.SetFlag("TIDEWELL_SILENCE");
            low.Stats.Hope = 20f;
            Script.Get("convergence").AvailableChoices(low)[0].Do(low);
            Assert.AreEqual("REGRET", low.EndingId); // leaving in the low season
        }

        [Test]
        public void KeptCovenant_ResolvesKeeperOrCovenant()
        {
            var alone = GameState.NewGame();
            alone.SetFlag("TIDEWELL_KEEP");
            Script.Get("convergence").AvailableChoices(alone)[0].Do(alone);
            Assert.AreEqual("KEEPER", alone.EndingId);

            var welcomed = GameState.NewGame();
            welcomed.SetFlag("TIDEWELL_KEEP");
            welcomed.SetFlag("INNER_GREEN");
            Script.Get("convergence").AvailableChoices(welcomed)[0].Do(welcomed);
            Assert.AreEqual("COVENANT", welcomed.EndingId);
        }

        [Test]
        public void InsideTheVeil_StayOrSail()
        {
            var stay = GameState.NewGame();
            stay.SetFlag("TIDEWELL_WITNESS");
            var options = Script.Get("convergence").AvailableChoices(stay);
            options[0].Do(stay);
            Assert.AreEqual("HOME", stay.EndingId);

            var village = GameState.NewGame();
            village.SetFlag("TIDEWELL_WITNESS");
            village.SetFlag("RYO_MET");
            village.SetFlag("EDDA_WINTER");
            Script.Get("convergence").AvailableChoices(village)[0].Do(village);
            Assert.AreEqual("VILLAGE", village.EndingId);

            var raft = GameState.NewGame(); // no vessel, no contact: the desperate door
            raft.SetFlag("TIDEWELL_FEED");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(raft))
                if (c.Label.Contains("Lash a raft")) { c.Do(raft); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("EMPTY_HORIZON", raft.EndingId);
        }

        [Test]
        public void TheSail_ResolvesByBondAndBoat()
        {
            var ryo = GameState.NewGame();
            ryo.SetFlag("TIDEWELL_WITNESS");
            ryo.SetFlag("VESSEL_READY");
            ryo.SetFlag("RYO_MET");
            ryo.Ryo = 50;
            bool found = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(ryo))
                if (c.Label.Contains("Sail with Ryo")) { c.Do(ryo); found = true; }
            Assert.IsTrue(found);
            Assert.AreEqual("RYO_BOAT", ryo.EndingId);

            var kindred = GameState.NewGame();
            kindred.SetFlag("TIDEWELL_WITNESS");
            kindred.SetFlag("VESSEL_READY");
            kindred.Companion = "kavi";
            kindred.Trust = 95;
            foreach (var c in Script.Get("convergence").AvailableChoices(kindred))
                if (c.Label.StartsWith("Sail. Through")) c.Do(kindred);
            Assert.AreEqual("SAIL_BLESSED", kindred.EndingId); // two tickets
        }

        [Test]
        public void TheIslandsOwn_WalksKaviUp()
        {
            var s = GameState.NewGame();
            s.SetFlag("TIDEWELL_WITNESS");
            s.Companion = "kavi";
            s.Trust = 95;
            bool found = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Kavi up the mountain")) { c.Do(s); found = true; }
            Assert.IsTrue(found);
            Assert.AreEqual("ISLANDS_OWN", s.EndingId);

            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Kavi", string.Join("\n", body));
        }

        [Test]
        public void HumSilenced_NeedsTheDepthToDare()
        {
            var s = GameState.NewGame();
            s.SetFlag("TIDEWELL_WITNESS");
            s.SetFlag("WOUND_SEEN");
            s.AddRoute(RouteAxis.Depth, 15);
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("break the seam")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("HUM_SILENCED", s.EndingId);
            Assert.AreEqual("THE HUM SILENCED", Endings.Resolve(s).Title);
        }

        [Test]
        public void UnwrittenCores_FallBackToRootstead()
        {
            var s = GameState.NewGame();
            s.EndingId = "LAST_PACK"; // the VN's own dictionary gap
            Assert.AreEqual("ROOTSTEAD", Endings.Resolve(s).Title);
        }

        [Test]
        public void Epilogue_AssemblesTheRunsThreads()
        {
            var s = GameState.NewGame();
            s.EndingId = "HOME";
            s.Companion = "kavi";
            s.SetFlag("EDDA_MET");
            s.Edda = 70;
            s.SetFlag("RYO_MET");
            s.SetFlag("KING_FED");
            s.SetFlag("HOME_NAMED");
            s.SetFlag("NAME_DRIFTWOOD");
            var text = string.Join("\n", Endings.Epilogue(s));
            StringAssert.Contains("grey-muzzled", text);         // Kavi stays
            StringAssert.Contains("ninetieth spring", text);     // Edda's warm years
            StringAssert.Contains("boatyard", text);             // Ryo stays
            StringAssert.Contains("Rent, it turned out", text);  // the King's treaty
            StringAssert.Contains("Driftwood outlives", text);   // the name holds

            var leaving = GameState.NewGame();
            leaving.EndingId = "LONG_SWIM";
            leaving.Companion = "kavi";
            var gone = string.Join("\n", Endings.Epilogue(leaving));
            StringAssert.Contains("hear a dog singing", gone);   // the tideline goodbye
        }

        [Test]
        public void TheLedgerOpens_CountsTheRoadsNotTaken()
        {
            var s = GameState.NewGame();
            s.EndingId = "HOME";
            s.Day = 100;
            s.Companion = "kavi";
            s.Trust = 80;
            var report = Endings.LedgerReport(s);
            StringAssert.Contains("THE LEDGER OPENS", report[0]);
            StringAssert.Contains("Run of 100 days", report[1]);
            StringAssert.Contains("Companion: Kavi (trust devoted)", report[1]);
            StringAssert.Contains("Roads not taken", report[2]);
            StringAssert.Contains("other lives", report[3]);
        }
    }
}
