using System;
using System.Collections.Generic;
using Tidebound.Narrative;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace Tidebound
{
    /// <summary>
    /// The VN's soul in 3D: a full-screen reading overlay with typewriter
    /// paragraphs and choices that always show their consequence subtext.
    /// Built entirely in code. While a story plays, the world freezes
    /// (GameManager.SetDialogueActive) and the HUD steps aside.
    /// Advance: Space/E/Enter/click. Choices: click or number keys.
    /// </summary>
    public class DialogueUI : MonoBehaviour
    {
        [Header("Reading feel")]
        [Tooltip("Typewriter speed. The VN's soul lives at ~40–60.")]
        public float charsPerSecond = 50f;

        [Header("Look")]
        public Color backdropColor = new Color(0.02f, 0.03f, 0.05f, 0.94f);
        public Color proseColor = new Color(0.92f, 0.90f, 0.85f);
        public Color choiceColor = new Color(1f, 0.97f, 0.88f);
        public Color subColor = new Color(0.62f, 0.60f, 0.55f);

        GameManager _gm;
        Font _font;
        GameObject _root;
        RectTransform _column;

        StoryPlayback _playback;
        Action _onComplete;
        List<string> _paragraphs;
        readonly List<Text> _paragraphTexts = new List<Text>();
        int _paragraphIndex;
        Typewriter _typewriter;
        bool _choicesShown;
        readonly List<GameObject> _choiceWidgets = new List<GameObject>();

        public bool IsActive => _playback != null;

        public static DialogueUI Create(GameManager gm)
        {
            var go = new GameObject("DialogueUI");
            var ui = go.AddComponent<DialogueUI>();
            ui._gm = gm;
            ui.Build();
            return ui;
        }

        // ---- construction --------------------------------------------------
        void Build()
        {
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            var canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 20; // above the HUD
            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;
            gameObject.AddComponent<GraphicRaycaster>();

            if (FindFirstObjectByType<EventSystem>() == null)
                new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));

            _root = new GameObject("Root", typeof(RectTransform));
            _root.transform.SetParent(transform, false);
            Stretch((RectTransform)_root.transform);

            var backdrop = new GameObject("Backdrop", typeof(RectTransform)).AddComponent<Image>();
            backdrop.transform.SetParent(_root.transform, false);
            Stretch((RectTransform)backdrop.transform);
            backdrop.color = backdropColor;
            backdrop.raycastTarget = true; // eat clicks aimed at the world

            var columnGo = new GameObject("Column", typeof(RectTransform));
            columnGo.transform.SetParent(_root.transform, false);
            _column = (RectTransform)columnGo.transform;
            _column.anchorMin = new Vector2(0.5f, 0.5f);
            _column.anchorMax = new Vector2(0.5f, 0.5f);
            _column.pivot = new Vector2(0.5f, 0.5f);
            _column.sizeDelta = new Vector2(980f, 0f);
            var layout = columnGo.AddComponent<VerticalLayoutGroup>();
            layout.childAlignment = TextAnchor.UpperLeft;
            layout.spacing = 16f;
            layout.childControlWidth = true;
            layout.childControlHeight = true;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = false;
            var fitter = columnGo.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            _root.SetActive(false);
        }

        static void Stretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        Text MakeParagraph()
        {
            var go = new GameObject("Paragraph", typeof(RectTransform));
            go.transform.SetParent(_column, false);
            var t = go.AddComponent<Text>();
            t.font = _font;
            t.fontSize = 21;
            t.lineSpacing = 1.15f;
            t.color = proseColor;
            t.supportRichText = true;
            t.horizontalOverflow = HorizontalWrapMode.Wrap;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        // ---- playing a story ------------------------------------------------
        public void Play(StoryScript script, string startId, Action onComplete)
        {
            _playback = new StoryPlayback(script, _gm.State, startId);
            _onComplete = onComplete;
            _gm.SetDialogueActive(true);
            _root.SetActive(true);
            EnterScene();
        }

        void EnterScene()
        {
            foreach (Transform child in _column)
            {
                child.gameObject.SetActive(false); // Destroy defers a frame; don't flash
                Destroy(child.gameObject);
            }
            _paragraphTexts.Clear();
            _choiceWidgets.Clear();
            _choicesShown = false;

            _paragraphs = _playback.Paragraphs();
            for (int i = 0; i < _paragraphs.Count; i++)
            {
                var t = MakeParagraph();
                t.text = "";
                _paragraphTexts.Add(t);
            }
            _paragraphIndex = 0;
            if (_paragraphs.Count == 0) ShowChoices();
            else _typewriter = new Typewriter(_paragraphs[0], charsPerSecond);
        }

        void Update()
        {
            if (!IsActive) return;

            if (!_choicesShown)
            {
                if (GameInput.AdvancePressed)
                {
                    for (int i = 0; i < _paragraphs.Count; i++) _paragraphTexts[i].text = _paragraphs[i];
                    ShowChoices();
                    return; // consume the press; options react next frame
                }

                _typewriter.Advance(Time.deltaTime);
                _paragraphTexts[_paragraphIndex].text = _typewriter.Visible;
                if (_typewriter.IsComplete)
                {
                    _paragraphIndex++;
                    if (_paragraphIndex < _paragraphs.Count)
                        _typewriter = new Typewriter(_paragraphs[_paragraphIndex], charsPerSecond);
                    else
                        ShowChoices();
                }
                return;
            }

            // choices are up
            if (_playback.Options == null)
            {
                if (GameInput.AdvancePressed || GameInput.NumberPressed(1)) StepContinue();
            }
            else
            {
                for (int i = 0; i < _playback.Options.Count; i++)
                    if (GameInput.NumberPressed(i + 1)) { StepChoose(i); break; }
            }
        }

        void ShowChoices()
        {
            _choicesShown = true;
            var options = _playback.Options;
            if (options == null)
            {
                _choiceWidgets.Add(MakeButton(1, _playback.Current.NextLabel, null, StepContinue));
            }
            else
            {
                for (int i = 0; i < options.Count; i++)
                {
                    int index = i;
                    _choiceWidgets.Add(MakeButton(i + 1, options[i].Label, options[i].Sub, () => StepChoose(index)));
                }
            }
        }

        GameObject MakeButton(int number, string label, string sub, Action onPick)
        {
            var go = new GameObject("Choice", typeof(RectTransform));
            go.transform.SetParent(_column, false);
            var bg = go.AddComponent<Image>();
            bg.color = new Color(1f, 1f, 1f, 0.06f);
            var button = go.AddComponent<Button>();
            button.targetGraphic = bg;
            var colors = button.colors;
            colors.highlightedColor = new Color(1f, 1f, 1f, 0.85f);
            colors.pressedColor = new Color(1f, 0.9f, 0.6f, 0.9f);
            button.colors = colors;
            button.onClick.AddListener(() => onPick());

            var layoutGroup = go.AddComponent<VerticalLayoutGroup>();
            layoutGroup.padding = new RectOffset(14, 14, 8, 10);
            layoutGroup.spacing = 3f;
            layoutGroup.childControlWidth = true;
            layoutGroup.childControlHeight = true;
            layoutGroup.childForceExpandWidth = true;
            layoutGroup.childForceExpandHeight = false;

            var labelText = MakeChild(go.transform, $"[{number}]  {label}", 20, choiceColor, bold: true);
            labelText.raycastTarget = false;
            if (!string.IsNullOrEmpty(sub))
            {
                var subText = MakeChild(go.transform, sub, 16, subColor);
                subText.fontStyle = FontStyle.Italic;
                subText.raycastTarget = false;
            }
            return go;
        }

        Text MakeChild(Transform parent, string content, int size, Color color, bool bold = false)
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

        void StepChoose(int index)
        {
            _playback.Choose(index);
            AfterStep();
        }

        void StepContinue()
        {
            _playback.Continue();
            AfterStep();
        }

        void AfterStep()
        {
            if (_playback.Finished) End();
            else EnterScene();
        }

        void End()
        {
            _playback = null;
            _root.SetActive(false);
            _gm.SetDialogueActive(false);
            var done = _onComplete;
            _onComplete = null;
            done?.Invoke();
        }
    }
}
