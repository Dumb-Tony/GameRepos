using System;
using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>One entry in the story calendar (the VN's TB.SCHEDULE).</summary>
    public class ScheduledEvent
    {
        public int Day;
        public Segment Seg;
        public string SceneId;
        /// <summary>The VN's `when` guard — null means unconditional.</summary>
        public Func<GameState, bool> When;
    }

    /// <summary>
    /// The VN's event firing rule, exactly: an event fires when the day and
    /// segment match, it hasn't fired before, and its guard passes. Missed
    /// is missed — the calendar does not chase you. Pure; the GameManager
    /// asks after every segment tick.
    /// </summary>
    public static class EventScheduler
    {
        /// <summary>The scene id due right now, or null. Does not mark fired.</summary>
        public static string Due(GameState s, IEnumerable<ScheduledEvent> schedule)
        {
            foreach (var e in schedule)
            {
                if (e.Day != s.Day || e.Seg != s.Seg) continue;
                if (s.FiredEvents.TryGetValue(e.SceneId, out var fired) && fired) continue;
                if (e.When != null && !e.When(s)) continue;
                return e.SceneId;
            }
            return null;
        }

        public static void MarkFired(GameState s, string sceneId) => s.FiredEvents[sceneId] = true;
    }

    /// <summary>Chapter one's calendar — scenes-chapter1.js TB.SCHEDULE verbatim.</summary>
    public static class Chapter1Schedule
    {
        public static List<ScheduledEvent> Build() => new List<ScheduledEvent>
        {
            new ScheduledEvent { Day = 1, Seg = Segment.Dusk, SceneId = "ev_vela" },
            new ScheduledEvent { Day = 1, Seg = Segment.Night, SceneId = "ev_howls" },
            new ScheduledEvent { Day = 2, Seg = Segment.Dawn, SceneId = "ev_ipo" },
            new ScheduledEvent { Day = 3, Seg = Segment.Dusk, SceneId = "ev_squall" },
            new ScheduledEvent { Day = 3, Seg = Segment.Night, SceneId = "ev_buri" },
            new ScheduledEvent { Day = 4, Seg = Segment.Dawn, SceneId = "ev_moa" },
            new ScheduledEvent { Day = 4, Seg = Segment.Day, SceneId = "ev_kavi2" },
            new ScheduledEvent { Day = 4, Seg = Segment.Dusk, SceneId = "ev_lights", When = s => s.Has("flaregun") },
            new ScheduledEvent { Day = 5, Seg = Segment.Dusk, SceneId = "clearing" },
            // ---- chapter two (scenes-chapter2.js TB.SCHEDULE, v1 subset) ----
            new ScheduledEvent { Day = 7, Seg = Segment.Dawn, SceneId = "ev2_boarking" },
            new ScheduledEvent { Day = 13, Seg = Segment.Day, SceneId = "ev2_smoke" },
            new ScheduledEvent { Day = 15, Seg = Segment.Dawn, SceneId = "ev2_heart",
                When = s => s.Companion != null && s.Trust >= 50 },
            new ScheduledEvent { Day = 15, Seg = Segment.Dawn, SceneId = "ev2_heart_low",
                When = s => s.Companion != null && s.Trust < 50 },
            new ScheduledEvent { Day = 15, Seg = Segment.Dawn, SceneId = "ev2_coco",
                When = s => s.Companion == null },
            new ScheduledEvent { Day = 16, Seg = Segment.Night, SceneId = "ev2_kingtide",
                When = s => s.Site == "beach" },
            new ScheduledEvent { Day = 9, Seg = Segment.Dusk, SceneId = "ev2_bond",
                When = s => s.Companion != null },
            new ScheduledEvent { Day = 9, Seg = Segment.Dusk, SceneId = "ev2_solo",
                When = s => s.Companion == null },
            new ScheduledEvent { Day = 11, Seg = Segment.Dusk, SceneId = "ev2_storm" },
            new ScheduledEvent { Day = 18, Seg = Segment.Dusk, SceneId = "ch2_threshold" },
            // the sea returns the unsalvaged case (v1 adaptation — bible §Phase 5)
            new ScheduledEvent { Day = 8, Seg = Segment.Dawn, SceneId = "ev2_case_ashore",
                When = s => !s.Is("SALV_case") && !s.Has("case") },
            // ---- chapter three (scenes-chapter3.js TB.SCHEDULE, v1 subset) ----
            new ScheduledEvent { Day = 20, Seg = Segment.Dusk, SceneId = "ev3_river" },
            new ScheduledEvent { Day = 21, Seg = Segment.Dawn, SceneId = "ev3_eddavisit",
                When = s => s.Is("SMOKE_IGNORED") && !s.Is("EDDA_MET") },
            // FEVER_SEED is planted by fringe-site camping (scenes-chapter2.js);
            // dormant until the fringe camp arrives — the guard is the VN's.
            new ScheduledEvent { Day = 22, Seg = Segment.Dusk, SceneId = "ev3_fever",
                When = s => s.Is("FEVER_SEED") && !s.Is("SALVE") && s.Disease == null },
            new ScheduledEvent { Day = 24, Seg = Segment.Dusk, SceneId = "ev3_grin1" },
            new ScheduledEvent { Day = 27, Seg = Segment.Day, SceneId = "ev3_king2" },
            new ScheduledEvent { Day = 28, Seg = Segment.Night, SceneId = "ev3_pulse" },
            new ScheduledEvent { Day = 31, Seg = Segment.Dawn, SceneId = "ev3_heart2",
                When = s => s.Companion != null && s.Trust >= 75 },
            new ScheduledEvent { Day = 31, Seg = Segment.Dawn, SceneId = "ev3_heart2_low",
                When = s => s.Companion != null && s.Trust < 75 },
            new ScheduledEvent { Day = 31, Seg = Segment.Dawn, SceneId = "ev3_coco2",
                When = s => s.Companion == null },
            new ScheduledEvent { Day = 35, Seg = Segment.Dusk, SceneId = "ch3_threshold" },
            // ---- the long game (scenes-chapter5.js, the shared events) ----
            new ScheduledEvent { Day = 58, Seg = Segment.Night, SceneId = "ev5_cyclone" },
        };
    }
}
