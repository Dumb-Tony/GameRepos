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
        };
    }
}
