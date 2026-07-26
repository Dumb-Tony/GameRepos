using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Where Naia is in the world, as pure state — the arc the whole game
    /// walks her through: a shape at the treeline nobody believes in, then a
    /// person at your fire, then a guide at the stair's foot, then a
    /// councilwoman in her own green.
    /// </summary>
    public static class NaiaPlace
    {
        /// <summary>Before contact she is only ever a glimpse — and only after
        /// the first days, because the watching starts with your first fire.</summary>
        public static bool WatchingSeason(GameState s) =>
            !s.Is("NAIA_MET") && s.Day >= 3 && s.DeathCause == null;

        /// <summary>Invited to the mountain: she waits where the climb begins.</summary>
        public static bool WalksWithYou(GameState s) =>
            s.Is("INNER_INVITED") && !s.Is("CH6_DONE");

        /// <summary>After the judging, her own country holds her.</summary>
        public static bool LivesInTheGreen(GameState s) =>
            s.Is("INNER_GREEN") || s.Is("INNER_PROBATION");
    }

    /// <summary>
    /// Naia in the world. Before contact she is the game's only NPC you are
    /// not allowed to reach: she shows at the treeline's edge when you come
    /// near her posts, holds while you keep your distance, and withdraws the
    /// moment you close on her or stare too long — then stays gone for days.
    /// The canon is that weeks of small oddities resolve, eventually, into
    /// one person. After contact she stops hiding and takes her posts: the
    /// stair's foot for the ascent, the Inner Green after the judging.
    /// </summary>
    public class NaiaPresence : MonoBehaviour
    {
        [Header("Wired by the scene builder")]
        public GameObject model;

        [Header("Watch posts (pre-contact glimpses)")]
        public Vector3[] watchPosts = new Vector3[0];
        [Tooltip("How near you must come before she is there at all.")]
        public float noticeRange = 34f;
        [Tooltip("Close this far and she is simply gone.")]
        public float spookRange = 16f;
        [Tooltip("How long one glimpse can last before she withdraws.")]
        public float lingerSeconds = 22f;
        [Tooltip("Days she stays away after being seen — the watching is patient.")]
        public int cooldownDays = 2;

        [Header("Posts she keeps once she has a face")]
        public Vector3 mountainPost;
        public Vector3 calderaPost;

        float _lingerUntil;
        int _seenOnDay = -99;
        Vector3 _standing;
        bool _shown;

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || model == null) return;
            if (gm.DialogueActive || gm.JournalOpen || gm.IsDead) { Show(false); return; }

            var s = gm.State;
            Vector3 playerPos = gm.player.transform.position;

            if (NaiaPlace.WalksWithYou(s)) { Stand(mountainPost, playerPos); return; }
            if (NaiaPlace.LivesInTheGreen(s)) { Stand(calderaPost, playerPos); return; }
            if (!NaiaPlace.WatchingSeason(s) || watchPosts.Length == 0) { Show(false); return; }

            // the watching: she is only ever there when you have come close
            // enough to notice — and never for long
            if (_shown)
            {
                bool spooked = FlatDistance(_standing, playerPos) < spookRange || Time.time > _lingerUntil;
                if (spooked) { _seenOnDay = s.Day; Show(false); return; }
                Face(playerPos);
                return;
            }

            if (s.Day - _seenOnDay < cooldownDays) return;

            Vector3 post = NearestPost(playerPos, out float dist);
            if (dist > noticeRange || dist < spookRange) return;

            _standing = post;
            transform.position = post;
            _lingerUntil = Time.time + lingerSeconds;
            Face(playerPos);
            Show(true);
        }

        Vector3 NearestPost(Vector3 playerPos, out float best)
        {
            best = float.MaxValue;
            Vector3 pick = watchPosts[0];
            foreach (var p in watchPosts)
            {
                float d = FlatDistance(p, playerPos);
                if (d < best) { best = d; pick = p; }
            }
            return pick;
        }

        void Stand(Vector3 post, Vector3 playerPos)
        {
            transform.position = post;
            Face(playerPos);
            Show(true);
        }

        void Face(Vector3 playerPos)
        {
            Vector3 to = playerPos - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude > 0.01f)
                transform.rotation = Quaternion.LookRotation(to.normalized, Vector3.up);
        }

        void Show(bool on)
        {
            if (_shown == on) return;
            _shown = on;
            model.SetActive(on);
        }

        static float FlatDistance(Vector3 a, Vector3 b)
        {
            a.y = 0f;
            b.y = 0f;
            return Vector3.Distance(a, b);
        }
    }
}
