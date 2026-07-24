using Tidebound.Narrative;
using UnityEngine;
using UnityEngine.UI;

namespace Tidebound
{
    /// <summary>
    /// The pack on demand: I (or Tab) opens a left-hand sheet listing
    /// everything you carry, freezing the world while you rummage. Built
    /// in code, rebuilt on every open — and structured over ItemCatalog
    /// rows so per-item USE actions can light up here later (the owner's
    /// roadmap: drink from a canteen without walking to water).
    /// </summary>
    public class InventoryUI : MonoBehaviour
    {
        public Color sheetColor = new Color(0.07f, 0.07f, 0.06f, 0.93f);
        public Color inkColor = new Color(0.88f, 0.85f, 0.78f);

        GameManager _gm;
        Font _font;
        GameObject _root;
        Text _body;

        public bool IsOpen => _root != null && _root.activeSelf;

        public static InventoryUI Create(GameManager gm)
        {
            var go = new GameObject("InventoryUI");
            var ui = go.AddComponent<InventoryUI>();
            ui._gm = gm;
            ui.Build();
            return ui;
        }

        void Build()
        {
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            var canvas = gameObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 15; // above HUD, below dialogue
            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            _root = new GameObject("Sheet", typeof(RectTransform));
            _root.transform.SetParent(transform, false);
            var rt = (RectTransform)_root.transform;
            rt.anchorMin = new Vector2(0f, 0f);
            rt.anchorMax = new Vector2(0f, 1f);
            rt.pivot = new Vector2(0f, 0.5f);
            rt.anchoredPosition = new Vector2(20f, 0f);
            rt.sizeDelta = new Vector2(480f, -80f);

            var bg = _root.AddComponent<Image>();
            bg.color = sheetColor;

            var bodyGo = new GameObject("Body", typeof(RectTransform));
            bodyGo.transform.SetParent(_root.transform, false);
            var brt = (RectTransform)bodyGo.transform;
            brt.anchorMin = Vector2.zero;
            brt.anchorMax = Vector2.one;
            brt.offsetMin = new Vector2(28f, 24f);
            brt.offsetMax = new Vector2(-28f, -24f);
            _body = bodyGo.AddComponent<Text>();
            _body.font = _font;
            _body.fontSize = 18;
            _body.lineSpacing = 1.15f;
            _body.color = inkColor;
            _body.supportRichText = true;
            _body.alignment = TextAnchor.UpperLeft;
            _body.horizontalOverflow = HorizontalWrapMode.Wrap;
            _body.verticalOverflow = VerticalWrapMode.Truncate;

            var hint = new GameObject("Hint", typeof(RectTransform));
            hint.transform.SetParent(_root.transform, false);
            var hrt = (RectTransform)hint.transform;
            hrt.anchorMin = new Vector2(0f, 0f);
            hrt.anchorMax = new Vector2(1f, 0f);
            hrt.pivot = new Vector2(0.5f, 0f);
            hrt.anchoredPosition = new Vector2(0f, 6f);
            hrt.sizeDelta = new Vector2(0f, 20f);
            var hintText = hint.AddComponent<Text>();
            hintText.font = _font;
            hintText.fontSize = 14;
            hintText.color = new Color(0.5f, 0.5f, 0.5f);
            hintText.alignment = TextAnchor.MiddleCenter;
            hintText.text = "I closes the pack";

            _root.SetActive(false);
        }

        public void Toggle()
        {
            if (IsOpen) Close();
            else Open();
        }

        public void Open()
        {
            _body.text = string.Join("\n", ItemCatalog.Build(_gm.State));
            _root.SetActive(true);
            _gm.SetInventoryOpen(true);
        }

        public void Close()
        {
            _root.SetActive(false);
            _gm.SetInventoryOpen(false);
        }
    }
}
