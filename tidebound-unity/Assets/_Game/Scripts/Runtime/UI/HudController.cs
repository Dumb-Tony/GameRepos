using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Tidebound
{
    /// <summary>
    /// The whole HUD, constructed in code (the code-driven-scenes rule
    /// applies to UI too): five meter bars, the day/segment readout, the
    /// interaction prompt, a toast feed for the island's warnings, the
    /// sleep fade, and the death card. Colors are public fields for tuning.
    /// </summary>
    public class HudController : MonoBehaviour
    {
        [Header("Meter colors")]
        public Color healthColor = new Color(0.85f, 0.30f, 0.30f);
        public Color hungerColor = new Color(0.90f, 0.62f, 0.25f);
        public Color thirstColor = new Color(0.30f, 0.62f, 0.90f);
        public Color energyColor = new Color(0.92f, 0.85f, 0.35f);
        public Color hopeColor = new Color(0.68f, 0.50f, 0.88f);
        public Color lowColor = new Color(1.00f, 0.20f, 0.15f);

        [Header("Toast timing")]
        public float toastSeconds = 5f;
        public int maxToasts = 5;

        GameManager _gm;
        Font _font;

        readonly Dictionary<Meter, Image> _fills = new Dictionary<Meter, Image>();
        readonly Dictionary<Meter, Color> _baseColors = new Dictionary<Meter, Color>();
        Text _dayLabel;
        Text _inventoryLabel;
        Image _dayBarFill;
        readonly Color _dayBarColor = new Color(1f, 0.92f, 0.72f, 0.9f);
        readonly Color _dayBarSweepColor = new Color(1f, 0.75f, 0.35f, 1f);

        RectTransform _promptPanel;
        Text _promptTitle;
        readonly Text[] _promptOptions = new Text[3];

        RectTransform _toastPanel;
        readonly List<(Text text, float dieAt)> _toasts = new List<(Text, float)>();

        Image _fade;
        GameObject _deathPanel;
        Text _deathTitle, _deathLine;

        static readonly string[] SegmentNames = { "Dawn", "Day", "Dusk", "Night" };
        static readonly string[] OptionKeys = { "E", "F", "C" };

        public static HudController Create(GameManager gm)
        {
            var go = new GameObject("HUD");
            var hud = go.AddComponent<HudController>();
            hud._gm = gm;
            hud.Build();
            return hud;
        }

        // ---- construction --------------------------------------------------
        void Build()
        {
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            var canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 10;
            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            BuildMeters();
            BuildClockLabel();
            BuildPrompt();
            BuildToasts();
            BuildOverlays();
        }

        RectTransform Panel(string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 pivot, Vector2 pos, Vector2 size)
        {
            var go = new GameObject(name, typeof(RectTransform));
            var rt = (RectTransform)go.transform;
            rt.SetParent(transform, false);
            rt.anchorMin = anchorMin;
            rt.anchorMax = anchorMax;
            rt.pivot = pivot;
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;
            return rt;
        }

        Text MakeText(Transform parent, string name, int size, TextAnchor anchor, Color color, bool bold = false)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = _font;
            t.fontSize = size;
            t.alignment = anchor;
            t.color = color;
            t.fontStyle = bold ? FontStyle.Bold : FontStyle.Normal;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        Image MakeRect(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var img = go.AddComponent<Image>();
            img.color = color;
            img.raycastTarget = false;
            return img;
        }

        static void Fill(RectTransform rt) { rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one; rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero; }

        void BuildMeters()
        {
            var panel = Panel("Meters", new Vector2(0, 1), new Vector2(0, 1), new Vector2(0, 1), new Vector2(24, -24), new Vector2(300, 200));
            var defs = new (Meter meter, string label, Color color)[]
            {
                (Meter.Health, "Health", healthColor),
                (Meter.Hunger, "Hunger", hungerColor),
                (Meter.Thirst, "Thirst", thirstColor),
                (Meter.Energy, "Energy", energyColor),
                (Meter.Hope,   "Hope",   hopeColor),
            };
            for (int i = 0; i < defs.Length; i++)
            {
                float y = -i * 32f;
                var label = MakeText(panel, defs[i].label, 18, TextAnchor.MiddleLeft, new Color(1, 1, 1, 0.9f));
                var lrt = (RectTransform)label.transform;
                lrt.anchorMin = lrt.anchorMax = new Vector2(0, 1);
                lrt.pivot = new Vector2(0, 1);
                lrt.anchoredPosition = new Vector2(0, y);
                lrt.sizeDelta = new Vector2(80, 26);
                label.text = defs[i].label;

                var bg = MakeRect(panel, defs[i].label + "Bg", new Color(0f, 0f, 0f, 0.55f));
                var brt = (RectTransform)bg.transform;
                brt.anchorMin = brt.anchorMax = new Vector2(0, 1);
                brt.pivot = new Vector2(0, 1);
                brt.anchoredPosition = new Vector2(86, y - 4);
                brt.sizeDelta = new Vector2(200, 18);

                var fill = MakeRect(bg.transform, "Fill", defs[i].color);
                var frt = (RectTransform)fill.transform;
                frt.anchorMin = new Vector2(0, 0);
                frt.anchorMax = new Vector2(1, 1);
                frt.offsetMin = new Vector2(2, 2);
                frt.offsetMax = new Vector2(-2, -2);

                _fills[defs[i].meter] = fill;
                _baseColors[defs[i].meter] = defs[i].color;
            }

            _inventoryLabel = MakeText(panel, "Inventory", 16, TextAnchor.UpperLeft, new Color(1, 1, 1, 0.75f));
            var irt = (RectTransform)_inventoryLabel.transform;
            irt.anchorMin = irt.anchorMax = new Vector2(0, 1);
            irt.pivot = new Vector2(0, 1);
            irt.anchoredPosition = new Vector2(0, -5 * 32f - 6f);
            irt.sizeDelta = new Vector2(300, 60);
        }

        void BuildClockLabel()
        {
            var panel = Panel("Clock", new Vector2(1, 1), new Vector2(1, 1), new Vector2(1, 1), new Vector2(-24, -24), new Vector2(280, 64));
            _dayLabel = MakeText(panel, "DayLabel", 22, TextAnchor.UpperRight, new Color(1, 1, 1, 0.92f), bold: true);
            var lrt = (RectTransform)_dayLabel.transform;
            lrt.anchorMin = new Vector2(0, 1); lrt.anchorMax = new Vector2(1, 1);
            lrt.pivot = new Vector2(0.5f, 1);
            lrt.anchoredPosition = Vector2.zero;
            lrt.sizeDelta = new Vector2(0, 30);

            // the day at a glance: a bar that creeps left→right, dawn to dawn
            var barBg = MakeRect(panel, "DayBarBg", new Color(0f, 0f, 0f, 0.55f));
            var brt = (RectTransform)barBg.transform;
            brt.anchorMin = new Vector2(0, 1); brt.anchorMax = new Vector2(1, 1);
            brt.pivot = new Vector2(0.5f, 1);
            brt.anchoredPosition = new Vector2(0, -36);
            brt.sizeDelta = new Vector2(0, 10);

            _dayBarFill = MakeRect(barBg.transform, "Fill", _dayBarColor);
            var frt = (RectTransform)_dayBarFill.transform;
            frt.anchorMin = Vector2.zero;
            frt.anchorMax = new Vector2(0f, 1f);
            frt.offsetMin = new Vector2(1, 1);
            frt.offsetMax = new Vector2(0, -1);

            // segment dividers: dawn | day | dusk | night
            for (int i = 1; i < 4; i++)
            {
                var tick = MakeRect(barBg.transform, "Tick", new Color(1f, 1f, 1f, 0.35f));
                var trt = (RectTransform)tick.transform;
                trt.anchorMin = trt.anchorMax = new Vector2(i * 0.25f, 0.5f);
                trt.pivot = new Vector2(0.5f, 0.5f);
                trt.sizeDelta = new Vector2(2, 10);
            }
        }

        void BuildPrompt()
        {
            _promptPanel = Panel("Prompt", new Vector2(0.5f, 0), new Vector2(0.5f, 0), new Vector2(0.5f, 0), new Vector2(0, 120), new Vector2(640, 170));
            var bg = MakeRect(_promptPanel, "Bg", new Color(0f, 0f, 0f, 0.45f));
            Fill((RectTransform)bg.transform);

            _promptTitle = MakeText(_promptPanel, "Title", 20, TextAnchor.UpperCenter, new Color(1f, 0.95f, 0.8f), bold: true);
            var trt = (RectTransform)_promptTitle.transform;
            trt.anchorMin = new Vector2(0, 1); trt.anchorMax = new Vector2(1, 1);
            trt.pivot = new Vector2(0.5f, 1);
            trt.anchoredPosition = new Vector2(0, -8);
            trt.sizeDelta = new Vector2(-20, 28);

            for (int i = 0; i < 3; i++)
            {
                var t = MakeText(_promptPanel, "Option" + i, 17, TextAnchor.UpperLeft, Color.white);
                var rt = (RectTransform)t.transform;
                rt.anchorMin = new Vector2(0, 1); rt.anchorMax = new Vector2(1, 1);
                rt.pivot = new Vector2(0.5f, 1);
                rt.anchoredPosition = new Vector2(0, -40 - i * 42f);
                rt.sizeDelta = new Vector2(-40, 40);
                _promptOptions[i] = t;
            }
        }

        void BuildToasts()
        {
            _toastPanel = Panel("Toasts", new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(24, 24), new Vector2(560, 320));
        }

        void BuildOverlays()
        {
            _fade = MakeRect(transform, "Fade", new Color(0, 0, 0, 0));
            Fill((RectTransform)_fade.transform);
            _fade.raycastTarget = false;

            _deathPanel = new GameObject("DeathCard", typeof(RectTransform));
            _deathPanel.transform.SetParent(transform, false);
            Fill((RectTransform)_deathPanel.transform);
            var bg = MakeRect(_deathPanel.transform, "Bg", new Color(0, 0, 0, 0.88f));
            Fill((RectTransform)bg.transform);

            _deathTitle = MakeText(_deathPanel.transform, "Title", 46, TextAnchor.MiddleCenter, new Color(0.9f, 0.85f, 0.75f), bold: true);
            var drt = (RectTransform)_deathTitle.transform;
            drt.anchorMin = new Vector2(0.1f, 0.55f); drt.anchorMax = new Vector2(0.9f, 0.72f);
            drt.offsetMin = drt.offsetMax = Vector2.zero;

            _deathLine = MakeText(_deathPanel.transform, "Line", 22, TextAnchor.UpperCenter, new Color(0.85f, 0.85f, 0.85f));
            var lrt = (RectTransform)_deathLine.transform;
            lrt.anchorMin = new Vector2(0.18f, 0.30f); lrt.anchorMax = new Vector2(0.82f, 0.54f);
            lrt.offsetMin = lrt.offsetMax = Vector2.zero;

            var hint = MakeText(_deathPanel.transform, "Hint", 18, TextAnchor.MiddleCenter, new Color(0.6f, 0.6f, 0.6f));
            var hrt = (RectTransform)hint.transform;
            hrt.anchorMin = new Vector2(0.2f, 0.14f); hrt.anchorMax = new Vector2(0.8f, 0.22f);
            hrt.offsetMin = hrt.offsetMax = Vector2.zero;
            hint.text = "Press Enter to wake on another tide.";

            _deathPanel.SetActive(false);
        }

        // ---- runtime -----------------------------------------------------------
        void Update()
        {
            if (_gm == null || _gm.State == null) return;
            var s = _gm.State;

            foreach (var pair in _fills)
            {
                float v = s.Stats.Get(pair.Key);
                var rt = (RectTransform)pair.Value.transform;
                rt.anchorMax = new Vector2(Mathf.Clamp01(v / 100f), 1f);
                // low meters pulse toward red — the quiet, always-on warning
                bool low = v <= 25f && pair.Key != Meter.Hope;
                pair.Value.color = low
                    ? Color.Lerp(_baseColors[pair.Key], lowColor, Mathf.PingPong(Time.time * 1.6f, 1f))
                    : _baseColors[pair.Key];
            }

            _dayLabel.text = $"Day {s.Day} · {SegmentNames[(int)s.Seg]}";
            if (_gm.clock != null)
            {
                var frt = (RectTransform)_dayBarFill.transform;
                frt.anchorMax = new Vector2(Mathf.Clamp01(_gm.clock.Clock.Time01), 1f);
                // the sweep announces itself: the bar flares warm while time is being spent
                _dayBarFill.color = _gm.clock.IsFastForwarding ? _dayBarSweepColor : _dayBarColor;
            }

            int wood = s.Count(Items.Driftwood);
            int rations = s.Count(Items.Rations);
            _inventoryLabel.text =
                (wood > 0 ? $"Driftwood × {wood}" : "") +
                (rations > 0 ? (wood > 0 ? "   " : "") + $"Rations × {rations}" : "");

            UpdatePrompt();
            UpdateToasts();

            if (_gm.IsDead && !_deathPanel.activeSelf)
            {
                var (title, line) = _gm.DeathCard();
                _deathTitle.text = title;
                _deathLine.text = line;
                _deathPanel.SetActive(true);
            }
        }

        void UpdatePrompt()
        {
            var interactor = _gm.interactor;
            var target = interactor != null ? interactor.Current : null;
            bool show = target != null && interactor.Options.Count > 0 && !_gm.IsDead;
            if (_promptPanel.gameObject.activeSelf != show) _promptPanel.gameObject.SetActive(show);
            if (!show) return;

            _promptTitle.text = target.DisplayName;
            for (int i = 0; i < 3; i++)
            {
                if (i < interactor.Options.Count)
                {
                    var o = interactor.Options[i];
                    _promptOptions[i].gameObject.SetActive(true);
                    _promptOptions[i].color = o.Enabled ? Color.white : new Color(0.6f, 0.6f, 0.6f);
                    _promptOptions[i].text = o.Enabled
                        ? $"[{OptionKeys[i]}]  {o.Label}\n        <i>{o.Detail}</i>"
                        : $"[{OptionKeys[i]}]  {o.Label} — {o.Detail}";
                    _promptOptions[i].supportRichText = true;
                }
                else _promptOptions[i].gameObject.SetActive(false);
            }
        }

        // ---- toasts ---------------------------------------------------------
        public void PushToast(string message, ToastKind kind)
        {
            Color c = kind == ToastKind.Severe ? new Color(1f, 0.35f, 0.3f)
                : kind == ToastKind.Warning ? new Color(1f, 0.75f, 0.35f)
                : kind == ToastKind.Good ? new Color(0.55f, 0.9f, 0.6f)
                : new Color(0.92f, 0.92f, 0.92f);

            var t = MakeText(_toastPanel, "Toast", 18, TextAnchor.LowerLeft, c);
            var rt = (RectTransform)t.transform;
            rt.anchorMin = new Vector2(0, 0); rt.anchorMax = new Vector2(1, 0);
            rt.pivot = new Vector2(0, 0);
            rt.sizeDelta = new Vector2(0, 44);
            t.text = message;

            float life = kind == ToastKind.Info ? toastSeconds : toastSeconds + 2f;
            _toasts.Add((t, Time.time + life));
            while (_toasts.Count > maxToasts)
            {
                Destroy(_toasts[0].text.gameObject);
                _toasts.RemoveAt(0);
            }
            Relayout();
        }

        void UpdateToasts()
        {
            bool changed = false;
            for (int i = _toasts.Count - 1; i >= 0; i--)
            {
                float remaining = _toasts[i].dieAt - Time.time;
                if (remaining <= 0f)
                {
                    Destroy(_toasts[i].text.gameObject);
                    _toasts.RemoveAt(i);
                    changed = true;
                }
                else if (remaining < 1f)
                {
                    var c = _toasts[i].text.color;
                    c.a = remaining;
                    _toasts[i].text.color = c;
                }
            }
            if (changed) Relayout();
        }

        void Relayout()
        {
            for (int i = 0; i < _toasts.Count; i++)
            {
                var rt = (RectTransform)_toasts[i].text.transform;
                rt.anchoredPosition = new Vector2(0, (_toasts.Count - 1 - i) * 46f);
            }
        }

        // ---- sleep fade -------------------------------------------------------
        /// <summary>Fade to black, run the world change, fade back in.</summary>
        public void SleepFade(Action atBlack) => StartCoroutine(FadeRoutine(atBlack));

        IEnumerator FadeRoutine(Action atBlack)
        {
            _gm.player.inputLocked = true;
            _gm.cam.inputLocked = true;
            yield return Ramp(0f, 1f, 0.7f);
            atBlack?.Invoke();
            yield return new WaitForSeconds(0.6f);
            yield return Ramp(1f, 0f, 0.9f);
            if (!_gm.IsDead && !_gm.DialogueActive) // a cutscene may have taken over at wake
            {
                _gm.player.inputLocked = false;
                _gm.cam.inputLocked = false;
            }
        }

        IEnumerator Ramp(float from, float to, float seconds)
        {
            for (float t = 0f; t < seconds; t += Time.deltaTime)
            {
                _fade.color = new Color(0, 0, 0, Mathf.Lerp(from, to, t / seconds));
                yield return null;
            }
            _fade.color = new Color(0, 0, 0, to);
        }
    }
}
