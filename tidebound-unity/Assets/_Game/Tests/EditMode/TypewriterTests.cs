using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    public class TypewriterTests
    {
        [Test]
        public void RevealsCharactersAtTheGivenRate()
        {
            var tw = new Typewriter("hello world", 10f);
            tw.Advance(0.5f); // 5 chars
            Assert.AreEqual("hello", tw.Visible);
            Assert.IsFalse(tw.IsComplete);
        }

        [Test]
        public void CompletesAndStaysComplete()
        {
            var tw = new Typewriter("abc", 10f);
            tw.Advance(10f);
            Assert.IsTrue(tw.IsComplete);
            Assert.AreEqual("abc", tw.Visible);
            tw.Advance(10f);
            Assert.AreEqual("abc", tw.Visible);
        }

        [Test]
        public void CompleteAll_SkipsToTheEnd()
        {
            var tw = new Typewriter("a long paragraph of island prose", 1f);
            tw.CompleteAll();
            Assert.IsTrue(tw.IsComplete);
        }

        [Test]
        public void NeverRevealsHalfAMarkupTag()
        {
            var tw = new Typewriter("ab<i>cd</i>", 1f);
            for (int i = 0; i < 20; i++)
            {
                tw.Advance(1f); // one char per step
                string v = tw.Visible;
                // a visible chunk must contain balanced-or-absent brackets
                int opens = 0, closes = 0;
                foreach (char c in v)
                {
                    if (c == '<') opens++;
                    if (c == '>') closes++;
                }
                Assert.AreEqual(opens, closes, $"half-open tag in \"{v}\"");
            }
            Assert.AreEqual("ab<i>cd</i>", tw.Visible);
        }

        [Test]
        public void EmptyText_IsInstantlyComplete()
        {
            var tw = new Typewriter("");
            Assert.IsTrue(tw.IsComplete);
            Assert.AreEqual("", tw.Visible);
        }
    }
}
