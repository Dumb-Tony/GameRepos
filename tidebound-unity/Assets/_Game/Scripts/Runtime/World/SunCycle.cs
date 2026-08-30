using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The lighting face of the day loop: rotates the directional light,
    /// grades its color/intensity, and drives flat ambient + fog color from
    /// the clock's continuous time. Every curve and gradient is an inspector
    /// parameter — tune the look by hand; the defaults are a serviceable
    /// tropical day. Dawn is t=0, night begins at t=0.75.
    /// </summary>
    [RequireComponent(typeof(Light))]
    public class SunCycle : MonoBehaviour
    {
        public GameClock clock;

        [Header("Path across the sky")]
        [Tooltip("Sun azimuth at dawn, degrees.")] public float dawnAzimuth = 60f;
        [Tooltip("Sun azimuth at the start of night; it keeps turning through the night back to dawn.")]
        public float duskAzimuth = 300f;
        [Tooltip("Sun elevation in degrees over the normalized day (0 = dawn).")]
        public AnimationCurve elevationOverDay;

        [Header("Light & atmosphere")]
        public Gradient lightColor;
        public AnimationCurve intensityOverDay;
        public Gradient ambientColor;
        [Tooltip("Also tint RenderSettings.fogColor from the ambient gradient.")]
        public bool driveFog = true;

        /// <summary>Stage overrides (underwater, etc.) set this to take the wheel.</summary>
        [HideInInspector] public bool suppressed;

        /// <summary>How much sky the weather is taking, 0..1. The monsoon
        /// presses the sun down and greys everything it lights.</summary>
        [HideInInspector] public float overcast;

        Light _sun;

        void Awake()
        {
            _sun = GetComponent<Light>();
            EnsureDefaults();
        }

        /// <summary>Editor add/reset — serializes the defaults so they're tunable.</summary>
        void Reset() => EnsureDefaults();

        void EnsureDefaults()
        {
            if (elevationOverDay == null || elevationOverDay.length == 0) elevationOverDay = DefaultElevation();
            if (intensityOverDay == null || intensityOverDay.length == 0) intensityOverDay = DefaultIntensity();
            if (lightColor == null || lightColor.colorKeys.Length == 0) lightColor = DefaultLightColor();
            if (ambientColor == null || ambientColor.colorKeys.Length == 0) ambientColor = DefaultAmbient();
        }

        void LateUpdate()
        {
            if (clock == null || suppressed) return;
            Apply(clock.Clock.Time01);
        }

        public void Apply(float t)
        {
            float elevation = elevationOverDay.Evaluate(t);
            float azimuth = t <= 0.75f
                ? Mathf.Lerp(dawnAzimuth, duskAzimuth, t / 0.75f)
                : Mathf.Lerp(duskAzimuth, dawnAzimuth + 360f, (t - 0.75f) / 0.25f);
            transform.rotation = Quaternion.Euler(elevation, azimuth, 0f);

            float weather = Mathf.Clamp01(overcast);
            _sun.color = lightColor.Evaluate(t);
            _sun.intensity = intensityOverDay.Evaluate(t) * (1f - weather);
            // below the horizon the sun must not light the ground from beneath
            if (elevation < 0f) _sun.intensity = Mathf.Min(_sun.intensity, 0.02f);

            var ambient = ambientColor.Evaluate(t);
            if (weather > 0f)
            {
                // the sky closes: colour drains toward wet slate, and the day
                // loses a little of itself along with it
                float grey = ambient.grayscale * 0.82f;
                ambient = Color.Lerp(ambient, new Color(grey, grey, grey * 1.06f), weather);
            }
            RenderSettings.ambientLight = ambient;
            if (driveFog) RenderSettings.fogColor = ambient;
        }

        static AnimationCurve DefaultElevation() => new AnimationCurve(
            new Keyframe(0f, 0f),
            new Keyframe(0.1f, 25f),
            new Keyframe(0.375f, 65f),
            new Keyframe(0.65f, 20f),
            new Keyframe(0.75f, -2f),
            new Keyframe(0.85f, -30f),
            new Keyframe(0.95f, -15f),
            new Keyframe(1f, 0f));

        static AnimationCurve DefaultIntensity() => new AnimationCurve(
            new Keyframe(0f, 0.45f),
            new Keyframe(0.15f, 1.05f),
            new Keyframe(0.375f, 1.35f),
            new Keyframe(0.65f, 0.9f),
            new Keyframe(0.73f, 0.35f),
            new Keyframe(0.78f, 0.02f),
            new Keyframe(0.97f, 0.02f),
            new Keyframe(1f, 0.45f));

        static Gradient DefaultLightColor()
        {
            var g = new Gradient();
            g.SetKeys(
                new[]
                {
                    new GradientColorKey(new Color(1.00f, 0.62f, 0.42f), 0.00f), // dawn amber
                    new GradientColorKey(new Color(1.00f, 0.96f, 0.88f), 0.30f), // day
                    new GradientColorKey(new Color(1.00f, 0.97f, 0.90f), 0.55f),
                    new GradientColorKey(new Color(1.00f, 0.52f, 0.30f), 0.73f), // sunset
                    new GradientColorKey(new Color(0.45f, 0.55f, 0.85f), 0.80f), // moon-blue
                    new GradientColorKey(new Color(0.95f, 0.60f, 0.45f), 1.00f),
                },
                new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(1f, 1f) });
            return g;
        }

        static Gradient DefaultAmbient()
        {
            var g = new Gradient();
            g.SetKeys(
                new[]
                {
                    new GradientColorKey(new Color(0.42f, 0.38f, 0.42f), 0.00f),
                    new GradientColorKey(new Color(0.58f, 0.62f, 0.66f), 0.35f),
                    new GradientColorKey(new Color(0.50f, 0.42f, 0.40f), 0.72f),
                    new GradientColorKey(new Color(0.10f, 0.13f, 0.22f), 0.82f), // night blue
                    new GradientColorKey(new Color(0.10f, 0.13f, 0.22f), 0.95f),
                    new GradientColorKey(new Color(0.35f, 0.30f, 0.35f), 1.00f),
                },
                new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(1f, 1f) });
            return g;
        }
    }
}
