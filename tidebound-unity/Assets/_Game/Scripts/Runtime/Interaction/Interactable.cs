using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// One entry in an interactable's prompt: a labeled choice with the
    /// VN's consequence subtext, either doable or visibly locked with the
    /// reason. Options 0/1/2 bind to E/F/C.
    /// </summary>
    public struct InteractionOption
    {
        public string Label;
        public string Detail;
        public bool Enabled;
        public Action<GameManager> Act;

        public static InteractionOption Do(string label, string detail, Action<GameManager> act) =>
            new InteractionOption { Label = label, Detail = detail, Enabled = true, Act = act };

        public static InteractionOption Locked(string label, string reason) =>
            new InteractionOption { Label = label, Detail = reason, Enabled = false };
    }

    /// <summary>
    /// THE interaction system — proximity prompt + option list, reused for
    /// everything ever after (bible §7 Phase 1). Interactables self-register
    /// so no physics layers or trigger colliders are needed; the
    /// PlayerInteractor scans the registry by distance and facing.
    /// </summary>
    public abstract class Interactable : MonoBehaviour
    {
        public static readonly List<Interactable> All = new List<Interactable>();

        [Tooltip("How close the player must be for the prompt to appear.")]
        public float interactRadius = 2.6f;

        protected virtual void OnEnable() => All.Add(this);
        protected virtual void OnDisable() => All.Remove(this);

        /// <summary>Shown as the prompt heading. Undiscovered stays unnamed.</summary>
        public abstract string DisplayName { get; }

        /// <summary>Whether the prompt should appear at all right now.</summary>
        public virtual bool IsAvailable(GameManager gm) => true;

        /// <summary>Fill the current options (max 3 are shown: E/F/C).</summary>
        public abstract void GetOptions(GameManager gm, List<InteractionOption> options);
    }
}
