using System.IO;
using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;
using UnityEngine;

namespace Tidebound.Tests
{
    /// <summary>
    /// Parses the REAL extracted content (not a fixture) so a broken
    /// extractor run or a schema drift fails loudly here.
    /// </summary>
    public class NarrativeContentTests
    {
        static NarrativeDatabase _db;

        static NarrativeDatabase Db()
        {
            if (_db == null)
            {
                var path = Path.Combine(Application.dataPath, "_Game/Data/Narrative/tidebound-content.json");
                Assert.IsTrue(File.Exists(path), "tidebound-content.json missing — run `node Tools/extract-vn-content.mjs`");
                _db = NarrativeDatabase.Parse(File.ReadAllText(path));
            }
            return _db;
        }

        [Test]
        public void Parses_WithTheExpectedShape()
        {
            var db = Db();
            Assert.AreEqual(1, db.Content.Format);
            Assert.GreaterOrEqual(db.SceneCount, 240);
            Assert.GreaterOrEqual(db.Content.Schedule.Count, 60);
            Assert.AreEqual(12, db.Content.Regions.Count);
            Assert.GreaterOrEqual(db.Content.Trinkets.Count, 20);
            Assert.GreaterOrEqual(db.Content.Species.Count, 24);
            Assert.GreaterOrEqual(db.Content.Endings.Count, 40);
        }

        [Test]
        public void Calendar_ConvergenceLandsOnDay100()
        {
            Assert.AreEqual(100, Db().Content.Calendar["convergence"]);
            Assert.AreEqual(5, Db().Content.Calendar["clearing"]);
        }

        [Test]
        public void KeyScenes_Exist()
        {
            var db = Db();
            foreach (var id in new[] { "camp", "ch1_open", "clearing", "act_result", "wayfinder", "death", "ending" })
                Assert.IsTrue(db.HasScene(id), $"missing scene '{id}'");
        }

        [Test]
        public void Camp_IsTheHubWithChoices()
        {
            var camp = Db().GetScene("camp");
            Assert.GreaterOrEqual(camp.Choices.Count, 5);
            Assert.IsTrue(camp.Choices.All(c => !string.IsNullOrEmpty(c.Label)));
        }

        [Test]
        public void Chapter1Opener_KeepsItsProse()
        {
            var s = Db().GetScene("ch1_open");
            Assert.IsNotNull(s.Text);
            Assert.GreaterOrEqual(s.Text.Count, 4);
            StringAssert.Contains("THE FIRST FIRE", s.Text[0]);
        }

        [Test]
        public void Schedule_DaysAllInsideTheHundred()
        {
            Assert.IsTrue(Db().Content.Schedule.All(e => e.Day >= 1 && e.Day <= 100));
        }

        [Test]
        public void EverySceneReference_Resolves()
        {
            var db = Db();
            var known = db.Content.Meta.UnknownGoTargets ?? new System.Collections.Generic.List<string>();
            var unresolved = db.UnresolvedTargets().Except(known).ToList();
            Assert.IsEmpty(unresolved, "dangling go/next targets: " + string.Join(", ", unresolved));
        }

        [Test]
        public void Regions_MatchTheWayfinder()
        {
            var regions = Db().Content.Regions;
            Assert.IsTrue(regions.ContainsKey("bay"));
            Assert.AreEqual("Castaway Bay", regions["bay"].Name);
            Assert.IsTrue(regions.Values.All(r => !string.IsNullOrEmpty(r.Name)));
        }

        [Test]
        public void Endings_IncludeTheCanonicalCores()
        {
            var endings = Db().Content.Endings;
            foreach (var id in new[] { "RESCUE", "HOME", "VILLAGE", "KEEPER", "COVENANT" })
                Assert.IsNotNull(endings[id], $"missing ending core '{id}'");
        }

        [Test]
        public void ScheduledEventLookup_Works()
        {
            var day1 = Db().ScheduledFor(1).ToList();
            Assert.IsTrue(day1.Any(), "day 1 should have scheduled events (the animals come to look)");
        }
    }
}
