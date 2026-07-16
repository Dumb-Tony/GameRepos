using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Finds the best interactable near the player (closest, roughly where
    /// the camera looks), exposes its prompt for the HUD, and routes E/F/C
    /// presses to its options.
    /// </summary>
    public class PlayerInteractor : MonoBehaviour
    {
        public GameManager gm;
        [Tooltip("Camera-facing cone (degrees) that breaks ties between nearby interactables.")]
        public float facingAngle = 80f;

        [HideInInspector] public bool inputLocked;

        public Interactable Current { get; private set; }

        readonly List<InteractionOption> _options = new List<InteractionOption>();
        public IReadOnlyList<InteractionOption> Options => _options;

        void Update()
        {
            if (gm == null || gm.IsDead || inputLocked)
            {
                Current = null;
                _options.Clear();
                return;
            }

            Current = PickBest();
            _options.Clear();
            Current?.GetOptions(gm, _options);
            if (_options.Count > 3) _options.RemoveRange(3, _options.Count - 3);

            for (int i = 0; i < _options.Count; i++)
            {
                if (_options[i].Enabled && GameInput.InteractPressed(i))
                {
                    _options[i].Act?.Invoke(gm);
                    // the action may have changed the world — rebuild the prompt
                    _options.Clear();
                    if (Current != null && Current.IsAvailable(gm)) Current.GetOptions(gm, _options);
                    break;
                }
            }
        }

        Interactable PickBest()
        {
            Interactable best = null;
            float bestScore = float.MaxValue;
            var camera = gm.cam != null ? gm.cam.transform : null;

            foreach (var it in Interactable.All)
            {
                if (it == null || !it.IsAvailable(gm)) continue;
                float dist = Vector3.Distance(transform.position, it.transform.position);
                if (dist > it.interactRadius) continue;

                float score = dist;
                if (camera != null)
                {
                    Vector3 to = it.transform.position - camera.position;
                    to.y = 0f;
                    Vector3 fwd = camera.forward; fwd.y = 0f;
                    if (Vector3.Angle(fwd, to) > facingAngle) score += 100f; // usable, but lose ties
                }
                if (score < bestScore) { bestScore = score; best = it; }
            }
            return best;
        }
    }
}
