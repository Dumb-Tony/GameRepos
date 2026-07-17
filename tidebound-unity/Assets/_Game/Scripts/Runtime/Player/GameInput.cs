using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace Tidebound
{
    /// <summary>
    /// One thin seam over input so the rest of the game never touches a
    /// backend API. Compiles against the new Input System when its backend
    /// is enabled, falls back to the legacy manager otherwise. The project
    /// currently ships legacy-only (the Input System package was dropped —
    /// its download kept corrupting on the owner's network); the new-input
    /// branch stays so re-adding com.unity.inputsystem later Just Works.
    /// </summary>
    public static class GameInput
    {
#if ENABLE_INPUT_SYSTEM
        public static Vector2 Move
        {
            get
            {
                var k = Keyboard.current;
                if (k == null) return Vector2.zero;
                float x = (k.dKey.isPressed || k.rightArrowKey.isPressed ? 1f : 0f)
                        - (k.aKey.isPressed || k.leftArrowKey.isPressed ? 1f : 0f);
                float y = (k.wKey.isPressed || k.upArrowKey.isPressed ? 1f : 0f)
                        - (k.sKey.isPressed || k.downArrowKey.isPressed ? 1f : 0f);
                return new Vector2(x, y);
            }
        }

        public static bool RunHeld
        {
            get { var k = Keyboard.current; return k != null && k.leftShiftKey.isPressed; }
        }

        /// <summary>Mouse delta in pixels this frame.</summary>
        public static Vector2 Look
        {
            get { var m = Mouse.current; return m != null ? m.delta.ReadValue() : Vector2.zero; }
        }

        /// <summary>Interaction options 0/1/2 are bound to E / F / C.</summary>
        public static bool InteractPressed(int option)
        {
            var k = Keyboard.current;
            if (k == null) return false;
            switch (option)
            {
                case 0: return k.eKey.wasPressedThisFrame;
                case 1: return k.fKey.wasPressedThisFrame;
                case 2: return k.cKey.wasPressedThisFrame;
                default: return false;
            }
        }

        public static bool ConfirmPressed
        {
            get
            {
                var k = Keyboard.current;
                return k != null && (k.enterKey.wasPressedThisFrame || k.numpadEnterKey.wasPressedThisFrame);
            }
        }

        public static bool CancelPressed
        {
            get { var k = Keyboard.current; return k != null && k.escapeKey.wasPressedThisFrame; }
        }

        public static bool AnyMouseButtonPressed
        {
            get { var m = Mouse.current; return m != null && m.leftButton.wasPressedThisFrame; }
        }
#else
        public static Vector2 Move
        {
            get
            {
                float x = (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow) ? 1f : 0f)
                        - (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow) ? 1f : 0f);
                float y = (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow) ? 1f : 0f)
                        - (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow) ? 1f : 0f);
                return new Vector2(x, y);
            }
        }

        public static bool RunHeld => Input.GetKey(KeyCode.LeftShift);

        // scaled to roughly match the new backend's pixel delta
        public static Vector2 Look =>
            new Vector2(Input.GetAxisRaw("Mouse X"), Input.GetAxisRaw("Mouse Y")) * 10f;

        public static bool InteractPressed(int option)
        {
            switch (option)
            {
                case 0: return Input.GetKeyDown(KeyCode.E);
                case 1: return Input.GetKeyDown(KeyCode.F);
                case 2: return Input.GetKeyDown(KeyCode.C);
                default: return false;
            }
        }

        public static bool ConfirmPressed =>
            Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter);

        public static bool CancelPressed => Input.GetKeyDown(KeyCode.Escape);

        public static bool AnyMouseButtonPressed => Input.GetMouseButtonDown(0);
#endif
    }
}
