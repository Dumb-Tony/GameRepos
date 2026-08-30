using System;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Reveals a string over time, rich-text-aware: markup tags (&lt;i&gt;,
    /// &lt;/i&gt;…) are emitted atomically so half-typed tags never render
    /// as literal text. Pure logic; the dialogue UI feeds it deltaTime.
    /// </summary>
    public class Typewriter
    {
        readonly string _full;
        readonly float _charsPerSecond;
        float _revealed;

        public Typewriter(string text, float charsPerSecond = 45f)
        {
            _full = text ?? "";
            _charsPerSecond = Math.Max(1f, charsPerSecond);
        }

        public bool IsComplete => VisibleCount >= _full.Length;

        int VisibleCount => Math.Min(_full.Length, (int)_revealed);

        public void Advance(float deltaSeconds)
        {
            if (deltaSeconds > 0f) _revealed += deltaSeconds * _charsPerSecond;
            // skip whole tags: a reveal boundary never rests inside markup
            int n = VisibleCount;
            while (n > 0 && n < _full.Length)
            {
                int open = _full.LastIndexOf('<', n - 1);
                if (open < 0) break;
                int close = _full.IndexOf('>', open);
                if (close < n) break;      // last tag already fully revealed
                _revealed = close + 1;      // jump past the half-open tag
                n = VisibleCount;
            }
        }

        public void CompleteAll() => _revealed = _full.Length;

        public string Visible => _full.Substring(0, VisibleCount);

        public string Full => _full;
    }
}
