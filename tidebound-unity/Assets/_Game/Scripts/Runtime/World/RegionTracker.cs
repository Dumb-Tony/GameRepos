using System.Collections.Generic;
using Tidebound.Narrative;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Watches where the player stands. Crossing into an unseen region
    /// plays its first-visit set piece (and applies the VN's fx1); return
    /// visits sometimes draw from the region's deck (once a day at most).
    /// Kavi has opinions about the interior. Nothing here names a region
    /// before it is walked (law #3).
    /// </summary>
    public class RegionTracker : MonoBehaviour
    {
        [Tooltip("Chance an eligible return visit draws a deck find.")]
        [Range(0f, 1f)] public float deckChance = 0.5f;

        string _currentRegion;
        float _nextPollAt;
        readonly Dictionary<string, int> _lastDeckDay = new Dictionary<string, int>();
        int _lastHuffDay = -1;

        void Update()
        {
            if (Time.time < _nextPollAt) return;
            _nextPollAt = Time.time + 0.5f;

            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || gm.player == null) return;
            if (gm.IsDead || gm.DialogueActive || gm.JournalOpen || gm.MapOpen) return;
            if (!gm.State.Is("PROLOGUE_DONE")) return;

            var pos = gm.player.transform.position;
            string id = Regions.IdAt(pos.x, pos.z);
            if (id == _currentRegion) return;
            _currentRegion = id;
            OnEnterRegion(gm, Regions.Get(id));
        }

        void OnEnterRegion(GameManager gm, RegionDef region)
        {
            var s = gm.State;
            if (!s.Is(Regions.SeenFlag(region.Id)))
            {
                s.SetFlag(Regions.SeenFlag(region.Id));
                region.FirstEffects?.Invoke(s);
                PlayProse(gm, region.Name, region.First);
                gm.Toast($"The Wayfinder learns: {region.Name}.", ToastKind.Good);
                gm.SaveNow();
            }
            else if (region.Deck != null && region.Deck.Length > 0)
            {
                _lastDeckDay.TryGetValue(region.Id, out int lastDay);
                if (s.Day > lastDay && Random.value < deckChance)
                {
                    _lastDeckDay[region.Id] = s.Day;
                    var (text, fx) = region.Deck[Random.Range(0, region.Deck.Length)];
                    fx?.Invoke(s);
                    PlayProse(gm, region.Name, new[] { text });
                }
            }

            // the dog's route opinions: the interior gets a huff, daily
            if (region.Id == "deepgreen" && s.Companion == "kavi" && s.Day > _lastHuffDay)
            {
                _lastHuffDay = s.Day;
                gm.Toast("Kavi stops at the light-line and huffs, low — one ear flat. Then he follows anyway, placing himself between you and the interior.", ToastKind.Info);
            }
        }

        static void PlayProse(GameManager gm, string title, string[] paragraphs)
        {
            var script = new StoryScript();
            script.Add(new StoryScene
            {
                Id = "region_prose",
                Speaker = title,
                Text = _ => new List<string>(paragraphs),
                Next = null,
                NextLabel = "Take it in",
            });
            gm.Dialogue.Play(script, "region_prose", () => { }, DialogueStyle.LowerThird);
        }
    }
}
