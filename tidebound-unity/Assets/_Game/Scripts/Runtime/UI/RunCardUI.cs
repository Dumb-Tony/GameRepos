using Tidebound.Narrative;
using UnityEngine;
using UnityEngine.UI;

namespace Tidebound
{
    /// <summary>
    /// The run card: when a life ends — by death or by choosing a door —
    /// this shows the ending's title and epilogue, then the island's
    /// memory of the run. Enter starts another tide. One screen for every
    /// terminal state: the whole ending pipeline exits through here.
    /// </summary>
    public class RunCardUI : MonoBehaviour
    {
        public Color backdrop = new Color(0.01f, 0.015f, 0.02f, 0.97f);
        public Color titleColor = new Color(0.9f, 0.85f, 0.75f);
        public Color proseColor = new Color(0.85f, 0.85f, 0.85f);
        public Color summaryColor = new Color(0.62f, 0.6f, 0.55f);

        GameManager _gm;
        Font _font;
        GameObject _root;
        RectTransform _column;
        bool _shown;

        public static RunCardUI Create(GameManager gm)
        {
            var go = new GameObject("RunCardUI");
            var ui = go.AddComponent<RunCardUI>();
            ui._gm = gm;
            ui.Build();
            return ui;
        }

        void Build()
        {
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            var canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 25; // above everything
            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            _root = new GameObject("Root", typeof(RectTransform));
            _root.transform.SetParent(transform, false);
            var rrt = (RectTransform)_root.transform;
            rrt.anchorMin = Vector2.zero;
            rrt.anchorMax = Vector2.one;
            rrt.offsetMin = rrt.offsetMax = Vector2.zero;
            var bg = _root.AddComponent<Image>();
            bg.color = backdrop;

            var columnGo = new GameObject("Column", typeof(RectTransform));
            columnGo.transform.SetParent(_root.transform, false);
            _column = (RectTransform)columnGo.transform;
            _column.anchorMin = _column.anchorMax = new Vector2(0.5f, 0.5f);
            _column.pivot = new Vector2(0.5f, 0.5f);
            _column.sizeDelta = new Vector2(1000f, 0f);
            var layout = columnGo.AddComponent<VerticalLayoutGroup>();
            layout.childAlignment = TextAnchor.UpperCenter;
            layout.spacing = 14f;
            layout.childControlWidth = true;
            layout.childControlHeight = true;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = false;
            var fitter = columnGo.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            _root.SetActive(false);
        }

        Text MakeLine(string content, int size, Color color, TextAnchor align, bool bold = false, bool italic = false)
        {
            var go = new GameObject("Line", typeof(RectTransform));
            go.transform.SetParent(_column, false);
            var t = go.AddComponent<Text>();
            t.font = _font;
            t.fontSize = size;
            t.fontStyle = bold ? FontStyle.Bold : italic ? FontStyle.Italic : FontStyle.Normal;
            t.color = color;
            t.alignment = align;
            t.supportRichText = true;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            t.text = content;
            return t;
        }

        void Update()
        {
            if (_gm == null || _gm.State == null) return;
            bool over = Endings.RunIsOver(_gm.State);
            if (over && !_shown) Show();
            else if (!over && _shown)
            {
                _shown = false;
                _root.SetActive(false);
            }
        }

        void Show()
        {
            _shown = true;

            // the loops take their toll first: this life is banked the moment
            // the island renders its verdict, and the LOOP_BANKED guard goes
            // back to the save so a re-read can never count it twice
            if (!_gm.State.Is("LOOP_BANKED"))
            {
                LoopStore.BankRun(_gm.State);
                _gm.SaveNow();
            }

            foreach (Transform child in _column) Destroy(child.gameObject);

            var (title, body) = Endings.Resolve(_gm.State);
            MakeLine(title, 44, titleColor, TextAnchor.MiddleCenter, bold: true);
            MakeLine("", 8, proseColor, TextAnchor.MiddleCenter);
            foreach (var paragraph in body)
                MakeLine(paragraph, 19, proseColor, TextAnchor.UpperLeft);

            // an ending's card carries the run's assembled epilogue and
            // THE LEDGER OPENS after the core; deaths keep their lean cards
            if (_gm.State.EndingId != null)
            {
                foreach (var line in Endings.Epilogue(_gm.State))
                    MakeLine(line, 17, proseColor, TextAnchor.UpperLeft);
                MakeLine("", 10, proseColor, TextAnchor.MiddleCenter);
                foreach (var line in Endings.LedgerReport(_gm.State))
                    MakeLine(line, 16, summaryColor, TextAnchor.UpperLeft);
            }

            MakeLine("", 10, proseColor, TextAnchor.MiddleCenter);
            MakeLine("— the island will remember it like this —", 15, summaryColor, TextAnchor.MiddleCenter, italic: true);
            foreach (var line in Endings.Summary(_gm.State))
                MakeLine(line, 16, summaryColor, TextAnchor.UpperLeft);

            MakeLine("", 10, proseColor, TextAnchor.MiddleCenter);
            MakeLine("Press Enter to wake on another tide.", 17,
                new Color(0.55f, 0.55f, 0.55f), TextAnchor.MiddleCenter);

            _root.SetActive(true);
        }
    }
}
