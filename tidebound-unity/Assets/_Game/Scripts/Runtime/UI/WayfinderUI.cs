using Tidebound.Narrative;
using UnityEngine;
using UnityEngine.UI;

namespace Tidebound
{
    /// <summary>
    /// The Wayfinder: the island as a hand-drawn chart, M to open. Regions
    /// appear at their canonical chart positions — named once walked, dark
    /// question marks until then (fog of war, law #3). A pale dot is you.
    /// The compass corner spins, because on this island it always does.
    /// </summary>
    public class WayfinderUI : MonoBehaviour
    {
        public Color parchment = new Color(0.16f, 0.14f, 0.11f, 0.96f);
        public Color inkKnown = new Color(0.88f, 0.82f, 0.66f);
        public Color inkUnknown = new Color(0.45f, 0.43f, 0.40f);

        GameManager _gm;
        Font _font;
        GameObject _root;
        RectTransform _chart;
        Image _playerDot;
        Text _compassNeedle;
        readonly System.Collections.Generic.List<(RegionDef def, Text label, Image blob)> _marks =
            new System.Collections.Generic.List<(RegionDef, Text, Image)>();

        public bool IsOpen => _root != null && _root.activeSelf;

        public static WayfinderUI Create(GameManager gm)
        {
            var go = new GameObject("WayfinderUI");
            var ui = go.AddComponent<WayfinderUI>();
            ui._gm = gm;
            ui.Build();
            return ui;
        }

        void Build()
        {
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            var canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 16; // above HUD/journal, below dialogue
            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            _root = new GameObject("Sheet", typeof(RectTransform));
            _root.transform.SetParent(transform, false);
            var rt = (RectTransform)_root.transform;
            rt.anchorMin = rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.sizeDelta = new Vector2(820f, 700f);
            _root.AddComponent<Image>().color = parchment;

            var title = MakeText(_root.transform, "THE WAYFINDER", 26, inkKnown, bold: true);
            var trt = (RectTransform)title.transform;
            trt.anchorMin = new Vector2(0f, 1f); trt.anchorMax = new Vector2(1f, 1f);
            trt.pivot = new Vector2(0.5f, 1f);
            trt.anchoredPosition = new Vector2(0f, -18f);
            trt.sizeDelta = new Vector2(0f, 34f);
            title.alignment = TextAnchor.MiddleCenter;

            var chartGo = new GameObject("Chart", typeof(RectTransform));
            chartGo.transform.SetParent(_root.transform, false);
            _chart = (RectTransform)chartGo.transform;
            _chart.anchorMin = Vector2.zero;
            _chart.anchorMax = Vector2.one;
            _chart.offsetMin = new Vector2(40f, 60f);
            _chart.offsetMax = new Vector2(-40f, -70f);

            foreach (var def in Regions.All)
            {
                var blob = new GameObject("Blob", typeof(RectTransform)).AddComponent<Image>();
                blob.transform.SetParent(_chart, false);
                var brt = (RectTransform)blob.transform;
                brt.anchorMin = brt.anchorMax = new Vector2(0.5f, 0.5f);
                brt.sizeDelta = new Vector2(150f, 84f);
                brt.anchoredPosition = ChartToPanel(def.ChartX, def.ChartY);
                blob.color = new Color(0f, 0f, 0f, 0.35f);

                var label = MakeText(blob.transform, "?", 18, inkUnknown, bold: true);
                var lrt = (RectTransform)label.transform;
                lrt.anchorMin = Vector2.zero; lrt.anchorMax = Vector2.one;
                lrt.offsetMin = lrt.offsetMax = Vector2.zero;
                label.alignment = TextAnchor.MiddleCenter;

                _marks.Add((def, label, blob));
            }

            _playerDot = new GameObject("You", typeof(RectTransform)).AddComponent<Image>();
            _playerDot.transform.SetParent(_chart, false);
            var prt = (RectTransform)_playerDot.transform;
            prt.anchorMin = prt.anchorMax = new Vector2(0.5f, 0.5f);
            prt.sizeDelta = new Vector2(12f, 12f);
            _playerDot.color = new Color(0.95f, 0.9f, 0.75f);

            _compassNeedle = MakeText(_root.transform, "+", 30, inkUnknown, bold: true);
            var crt = (RectTransform)_compassNeedle.transform;
            crt.anchorMin = crt.anchorMax = new Vector2(1f, 0f);
            crt.pivot = new Vector2(1f, 0f);
            crt.anchoredPosition = new Vector2(-26f, 18f);
            crt.sizeDelta = new Vector2(44f, 44f);
            _compassNeedle.alignment = TextAnchor.MiddleCenter;

            var hint = MakeText(_root.transform, "M closes the chart · the compass points at everything", 14,
                new Color(0.5f, 0.48f, 0.45f));
            var hrt = (RectTransform)hint.transform;
            hrt.anchorMin = new Vector2(0f, 0f); hrt.anchorMax = new Vector2(1f, 0f);
            hrt.pivot = new Vector2(0.5f, 0f);
            hrt.anchoredPosition = new Vector2(0f, 8f);
            hrt.sizeDelta = new Vector2(0f, 22f);
            hint.alignment = TextAnchor.MiddleCenter;

            _root.SetActive(false);
        }

        Text MakeText(Transform parent, string content, int size, Color color, bool bold = false)
        {
            var go = new GameObject("Text", typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = _font;
            t.fontSize = size;
            t.fontStyle = bold ? FontStyle.Bold : FontStyle.Normal;
            t.color = color;
            t.text = content;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        /// <summary>map.js chart coords → panel offsets (chart center ≈ 215,215).</summary>
        static Vector2 ChartToPanel(float chartX, float chartY) =>
            new Vector2((chartX - 215f) * 2.6f, (215f - chartY) * 2.6f);

        /// <summary>World position → panel offsets, via the two spaces' shared anchors.</summary>
        static Vector2 WorldToPanel(Vector3 world) =>
            ChartToPanel(220f + world.x * 0.55f, 266f - world.z * 0.47f);

        public void Toggle()
        {
            if (IsOpen) Close();
            else Open();
        }

        public void Open()
        {
            foreach (var (def, label, blob) in _marks)
            {
                bool seen = _gm.State.Is(Regions.SeenFlag(def.Id));
                label.text = seen ? def.Name : "?";
                label.color = seen ? inkKnown : inkUnknown;
                blob.color = seen ? new Color(0.25f, 0.28f, 0.22f, 0.55f) : new Color(0f, 0f, 0f, 0.35f);
            }
            _root.SetActive(true);
            _gm.SetMapOpen(true);
        }

        public void Close()
        {
            _root.SetActive(false);
            _gm.SetMapOpen(false);
        }

        void Update()
        {
            if (!IsOpen || _gm.player == null) return;
            ((RectTransform)_playerDot.transform).anchoredPosition = WorldToPanel(_gm.player.transform.position);
            // the compass points at everything
            _compassNeedle.transform.localRotation =
                Quaternion.Euler(0f, 0f, Time.time * 40f + Mathf.Sin(Time.time * 1.7f) * 55f);
        }
    }
}
