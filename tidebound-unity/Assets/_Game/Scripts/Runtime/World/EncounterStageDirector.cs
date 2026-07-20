using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Cutscene staging for the chapter-one encounters: greybox actors
    /// appear where the prose says they are, the camera frames them, and
    /// the world dresses itself (storm-dark and rain for the squall, a
    /// ship's light for the horizon, a flare if you spend it). Begin(id)
    /// before Dialogue.Play; End() when the story closes — actors vanish,
    /// weather clears, and the orbit camera takes back the wheel.
    /// </summary>
    public class EncounterStageDirector : MonoBehaviour
    {
        [Header("Actor rigs (wired by the scene builder)")]
        public GameObject velaRig;
        public GameObject fishDrop;
        public GameObject dogNightRig;
        public GameObject dogDayRig;
        public GameObject ipoRig;
        public GameObject rainRig;
        public GameObject buriRig;
        public GameObject moaRig;
        public GameObject hawkRig;
        public GameObject shipRig;
        public GameObject flareRig;
        public GameObject nineRig;
        public GameObject boarKingRig;
        public GameObject smokeColumn;
        public GameObject lanternShape;
        public SunCycle sun;

        [Header("Shot feel")]
        public float cameraDrift = 0.22f;

        GameManager _gm;
        Transform _camera;
        bool _active;
        bool _hasShot;
        Vector3 _shotPosition, _shotLookAt;

        bool _weatherOverridden;
        Color _savedAmbient, _savedFogColor;
        float _savedFogDensity;

        readonly System.Collections.Generic.List<GameObject> _shown =
            new System.Collections.Generic.List<GameObject>();

        public void Begin(string sceneId)
        {
            _gm = GameManager.Instance;
            _camera = Camera.main != null ? Camera.main.transform : null;
            if (_gm == null || _camera == null) return;
            if (!Stage(sceneId)) return; // unknown scene: plain lower-third is fine

            _active = true;
            _gm.cam.enabled = false;
            _gm.Dialogue.SceneEntered += OnSceneEntered;
        }

        bool Stage(string id)
        {
            switch (id)
            {
                case "ev_vela":
                    Show(velaRig); Show(fishDrop);
                    Shot(new Vector3(-3f, 2.2f, 9f), new Vector3(5.5f, 3.4f, 12f));
                    return true;
                case "ev_howls":
                    Show(dogNightRig);
                    Shot(new Vector3(2f, 1.8f, 22f), new Vector3(12f, 1.4f, 74f));
                    return true;
                case "ev_ipo":
                    Show(ipoRig);
                    Shot(new Vector3(0.5f, 1.3f, 16f), new Vector3(4f, 0.6f, 20f));
                    return true;
                case "ev_squall":
                    Show(rainRig);
                    WeatherOn();
                    Shot(new Vector3(-7f, 3.5f, 7f), new Vector3(0f, 1f, 15f));
                    return true;
                case "ev_buri":
                    Show(buriRig);
                    Shot(new Vector3(-3.5f, 1.8f, 12f), new Vector3(1.5f, 0.8f, 16.5f));
                    return true;
                case "ev_moa":
                    Show(moaRig); Show(hawkRig);
                    Shot(new Vector3(3f, 2.4f, 14f), new Vector3(10f, 0.8f, 8f));
                    return true;
                case "ev_kavi2":
                    Show(dogDayRig);
                    Shot(new Vector3(1.5f, 1.7f, 19f), new Vector3(8f, 0.9f, 26f));
                    return true;
                case "ev_lights":
                    Show(shipRig);
                    Shot(new Vector3(2f, 2.4f, 10f), new Vector3(-250f, 12f, -500f));
                    return true;
                case "ev_nine":
                    Show(nineRig);
                    Shot(new Vector3(172f, 2f, 22f), new Vector3(186f, 0.2f, 2f));
                    return true;
                case "ev_despair":
                    // the banked fire, the enormous dark; no actors but the night
                    Shot(new Vector3(-4f, 2.2f, 9f), new Vector3(0f, 0.8f, 15f));
                    return true;
                case "ev2_boarking":
                    // the edited camp — and, if Kavi saw him first, HIM
                    if (_gm.State.Companion == "kavi" && boarKingRig != null)
                    {
                        boarKingRig.transform.position = GroundAt(10f, 76f);
                        Show(boarKingRig);
                        Shot(new Vector3(-2f, 1.9f, 14f), new Vector3(10f, 1.6f, 76f));
                    }
                    else
                    {
                        Shot(new Vector3(-3.5f, 2f, 11f), new Vector3(1.5f, 0.6f, 16.5f));
                    }
                    return true;
                case "ev2_smoke":
                    Show(smokeColumn);
                    Shot(new Vector3(0f, 3f, 30f), new Vector3(20f, 130f, 560f)); // the thread against the crown
                    return true;
                case "ev2_heart":
                case "ev2_heart_low":
                case "ev2_coco":
                    Shot(new Vector3(-4f, 1.8f, 10f), new Vector3(1f, 0.7f, 15.5f));
                    return true;
                case "ev2_kingtide":
                    Shot(new Vector3(6f, 2.6f, 18f), new Vector3(-4f, 0.2f, -2f)); // the silver fingers
                    return true;
                case "ev2_bond":
                case "ev2_solo":
                    Shot(new Vector3(-4f, 1.8f, 10f), new Vector3(1f, 0.7f, 15.5f));
                    return true;
                case "ev2_storm":
                    Show(rainRig);
                    WeatherOn();
                    Shot(new Vector3(-7f, 3.5f, 7f), new Vector3(0f, 1f, 15f));
                    return true;
                case "ev5_cyclone":
                    // the season's true fist — the squall's dressing, harder light
                    Show(rainRig);
                    WeatherOn();
                    Shot(new Vector3(-7f, 3.5f, 7f), new Vector3(0f, 1f, 15f));
                    return true;
                case "case_scene":
                    // the flat stone, in good light
                    Shot(new Vector3(-4f, 1.8f, 10f), new Vector3(1f, 0.7f, 15.5f));
                    return true;
                case "ev2_case_ashore":
                    // the wrack line and the returned thing
                    Shot(new Vector3(4f, 2.2f, 12f), new Vector3(-2f, 0.3f, 0f));
                    return true;
                case "ch2_threshold":
                    Show(smokeColumn);
                    Shot(new Vector3(0f, 3f, 30f), new Vector3(20f, 130f, 560f));
                    return true;
                case "clearing":
                    // they are all, in their various ways, present
                    Show(dogNightRig); Show(moaRig); Show(velaRig);
                    Shot(new Vector3(-2f, 2.2f, 10f), new Vector3(10f, 1.2f, 60f));
                    return true;
                default:
                    return false;
            }
        }

        void OnSceneEntered(string id)
        {
            // sub-scene beats inside one staged encounter
            switch (id)
            {
                case "ev_lights2":
                    Show(flareRig); // the argument, made
                    break;
                case "ev2_boarkface":
                    // the audit with tusks, on his chosen ground
                    if (boarKingRig != null)
                    {
                        boarKingRig.transform.position = GroundAt(-36f, 256f);
                        Show(boarKingRig);
                    }
                    Shot(new Vector3(-46f, 2.4f, 248f), new Vector3(-36f, 1.4f, 256f));
                    break;
                case "ev2_storm2":
                    // the storm proper — rain stays; the camp endures
                    Shot(new Vector3(5f, 2.8f, 9f), new Vector3(0f, 0.9f, 16f));
                    break;
                case "ev5_cyclone_flee":
                    // the treeline, the root-vaults, the world ending overhead
                    Shot(new Vector3(4f, 2f, 66f), new Vector3(12f, 1.2f, 74f));
                    break;
                case "ch2_end_trek":
                    HideShown();
                    Show(lanternShape); // the lantern, the braid, the unlowered shotgun
                    Shot(new Vector3(-27f, 2.2f, 273f), new Vector3(-20f, 1.3f, 282f));
                    break;
                case "ch2_end_fort":
                case "ch2_end_signal":
                case "ch2_end":
                    HideShown();
                    Shot(new Vector3(-4f, 2.2f, 9f), new Vector3(0f, 0.8f, 15f));
                    break;
                case "court_kavi":
                    HideShown();
                    Show(dogDayRig); // he crosses the distance
                    Shot(new Vector3(4f, 1.6f, 21f), new Vector3(8f, 0.9f, 26f));
                    break;
                case "court_none":
                    HideShown(); // the eyes withdraw; the fire is yours alone
                    Shot(new Vector3(-4f, 2.2f, 9f), new Vector3(0f, 0.8f, 15f));
                    break;
            }
        }

        void HideShown()
        {
            foreach (var rig in _shown)
                if (rig != null) rig.SetActive(false);
            _shown.Clear();
        }

        static Vector3 GroundAt(float x, float z)
        {
            if (Physics.Raycast(new Vector3(x, 40f, z), Vector3.down, out var hit, 80f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                return hit.point;
            return new Vector3(x, 0.5f, z);
        }

        void Show(GameObject rig)
        {
            if (rig == null) return;
            rig.SetActive(true);
            _shown.Add(rig);
        }

        void Shot(Vector3 position, Vector3 lookAt)
        {
            _shotPosition = position;
            _shotLookAt = lookAt;
            _hasShot = true;
        }

        void WeatherOn()
        {
            _weatherOverridden = true;
            _savedAmbient = RenderSettings.ambientLight;
            _savedFogColor = RenderSettings.fogColor;
            _savedFogDensity = RenderSettings.fogDensity;
            if (sun != null) sun.suppressed = true;
            var stormGrey = new Color(0.16f, 0.18f, 0.20f);
            RenderSettings.ambientLight = stormGrey * 1.5f;
            RenderSettings.fogColor = stormGrey;
            RenderSettings.fogDensity = 0.014f;
        }

        void WeatherOff()
        {
            if (!_weatherOverridden) return;
            _weatherOverridden = false;
            RenderSettings.ambientLight = _savedAmbient;
            RenderSettings.fogColor = _savedFogColor;
            RenderSettings.fogDensity = _savedFogDensity;
            if (sun != null) sun.suppressed = false;
        }

        void Update()
        {
            if (!_active || !_hasShot || _camera == null) return;
            Vector3 drift = new Vector3(
                Mathf.PerlinNoise(Time.time * 0.09f, 0.4f) - 0.5f,
                Mathf.PerlinNoise(0.7f, Time.time * 0.07f) - 0.5f, 0f) * cameraDrift;
            _camera.position = _shotPosition + drift;
            _camera.rotation = Quaternion.LookRotation(_shotLookAt - _camera.position, Vector3.up);
        }

        public void End()
        {
            if (!_active) return;
            _active = false;
            _hasShot = false;
            _gm.Dialogue.SceneEntered -= OnSceneEntered;
            foreach (var rig in _shown)
                if (rig != null) rig.SetActive(false);
            _shown.Clear();
            WeatherOff();
            _gm.cam.enabled = true;
            _gm.cam.SnapBehindTarget();
        }
    }
}
