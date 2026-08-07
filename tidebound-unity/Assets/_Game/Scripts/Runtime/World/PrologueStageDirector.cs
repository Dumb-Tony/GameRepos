using System;
using System.Collections;
using Tidebound.Narrative;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Stages the crash prologue as a filmed sequence instead of text over
    /// a beach: chase shot of the plane descending (falling), a hard cut
    /// to the sinking blue dark (whowere), the real shore at dusk with the
    /// fuselage dying on the reef (ashore/salvage), the lagoon's seven-beat
    /// glow at night (night0), then black — and you wake at the waterline
    /// at dawn (ch1_open). Drives the camera directly; hands it back to the
    /// orbit rig when the story ends. All rigs are greybox scene objects
    /// wired by the bay builder.
    /// </summary>
    public class PrologueStageDirector : MonoBehaviour
    {
        [Header("Rigs (wired by the scene builder)")]
        public GameObject planeRig;
        public GameObject skyDressing;
        public GameObject underwaterRig;
        public GameObject reefWreck;
        public LagoonGlow lagoonGlow;
        public GameObject shoreAmbience;

        [Header("Shot feel")]
        public Vector3 planeChaseOffset = new Vector3(-11f, 4f, -14f);
        [Tooltip("Where the chase camera looks, in plane-local space — ahead and below, so the island stays in frame.")]
        public Vector3 planeLookTarget = new Vector3(0f, -4f, 18f);
        public float cameraDrift = 0.35f;
        [Tooltip("Fog density while in the air — light aerial haze, so the island reads at distance.")]
        public float aerialFogDensity = 0.0008f;

        float _groundFogDensity;

        GameManager _gm;
        Transform _camera;
        bool _running;
        bool _cameraParented;
        Vector3 _shotPosition, _shotLookAt;
        bool _hasShot;

        public void PlayPrologue(GameManager gm, Action onComplete)
        {
            _gm = gm;
            _camera = Camera.main != null ? Camera.main.transform : null;
            if (_camera == null)
            {
                // no camera to stage with — fall back to plain prose
                _gm.Dialogue.Play(PrologueScript.Build(), PrologueScript.StartFor(_gm.State), onComplete);
                return;
            }

            _running = true;
            _gm.cam.enabled = false;
            _gm.Dialogue.SceneEntered += OnSceneEntered;
            _gm.Dialogue.FadeCut(1f);
            EnterSkyStage();
            _gm.Dialogue.Play(PrologueScript.Build(), PrologueScript.StartFor(_gm.State), () =>
            {
                Cleanup();
                onComplete?.Invoke();
                _gm.Dialogue.FadeTo(0f, 2f); // eyes opening on day one
            }, DialogueStyle.LowerThird);
            _gm.Dialogue.FadeTo(0f, 1.8f);
        }

        // ---- scene routing ---------------------------------------------------
        void OnSceneEntered(string id)
        {
            switch (id)
            {
                case "falling":
                case "falling_courier":
                    break; // already on the plane
                case "whowere":
                    StartCoroutine(CutThen(0.35f, EnterUnderwaterStage, 1.4f));
                    break;
                case "ashore":
                    StartCoroutine(FadeThen(0.8f, EnterAshoreStage, 1.4f));
                    break;
                case "salvage":
                    SetShot(new Vector3(-2f, 2.6f, -14f), new Vector3(-12f, 0.2f, -28f));
                    break;
                case "salvage2":
                    SetShot(new Vector3(-6f, 2.2f, -17f), new Vector3(-13f, -0.2f, -29f));
                    break;
                case "night0":
                    StartCoroutine(FadeThen(0.7f, EnterNightStage, 1.6f));
                    break;
                case "ch1_open":
                    StartCoroutine(FadeThen(1.1f, EnterDawnStage, 1.8f));
                    break;
            }
        }

        // ---- stages -----------------------------------------------------------
        void EnterSkyStage()
        {
            _gm.clock.Clock.Time01 = 0.4f; // the crash happens in full daylight
            _groundFogDensity = RenderSettings.fogDensity;
            RenderSettings.fogDensity = aerialFogDensity;
            if (skyDressing != null) skyDressing.SetActive(true);
            if (planeRig != null)
            {
                planeRig.SetActive(true);
                _camera.SetParent(planeRig.transform, false);
                _camera.localPosition = planeChaseOffset;
                _camera.localRotation = Quaternion.LookRotation(planeLookTarget - planeChaseOffset);
                _cameraParented = true;
            }
            if (shoreAmbience != null) shoreAmbience.SetActive(false);
        }

        void EnterUnderwaterStage()
        {
            UnparentCamera();
            if (planeRig != null) planeRig.SetActive(false);
            if (skyDressing != null) skyDressing.SetActive(false);
            if (underwaterRig != null)
            {
                underwaterRig.SetActive(true);
                _camera.SetParent(underwaterRig.transform, false);
                _camera.localPosition = Vector3.zero;
                _camera.localRotation = Quaternion.Euler(12f, 0f, 4f); // tilted, wrong, sinking
                _cameraParented = true;
            }
        }

        void EnterAshoreStage()
        {
            UnparentCamera();
            if (underwaterRig != null) underwaterRig.SetActive(false);
            if (_groundFogDensity > 0f) RenderSettings.fogDensity = _groundFogDensity;
            if (reefWreck != null) reefWreck.SetActive(true);
            if (shoreAmbience != null) shoreAmbience.SetActive(true);
            _gm.clock.Clock.Time01 = 0.70f; // late dusk, losing its light

            MovePlayerToWaterline(faceSeaward: true);
            var p = _gm.player.transform.position;
            SetShot(p + new Vector3(7f, 2.4f, 5f), new Vector3(-6f, 0.5f, -18f));
        }

        void EnterNightStage()
        {
            if (reefWreck != null) reefWreck.SetActive(false); // the reef holds nothing but reef
            _gm.clock.Clock.Time01 = 0.86f;
            if (lagoonGlow != null) lagoonGlow.forceOn = true;
            var p = _gm.player.transform.position;
            SetShot(p + new Vector3(3f, 3.2f, 6f), new Vector3(0f, 0f, -22f));
        }

        void EnterDawnStage()
        {
            if (lagoonGlow != null) lagoonGlow.forceOn = false; // night-gating takes over
            _gm.clock.Clock.Time01 = 0.02f;
            MovePlayerToWaterline(faceSeaward: false); // wake facing the land you must live on
            var p = _gm.player.transform.position;
            var fwd = _gm.player.transform.forward;
            SetShot(p - fwd * 4.5f + Vector3.up * 2.4f, p + fwd * 3f + Vector3.up * 1.2f);
        }

        // ---- plumbing -----------------------------------------------------------
        void MovePlayerToWaterline(bool faceSeaward)
        {
            var player = _gm.player.transform;
            float x = 2f, z = 2f;
            float y = 0.2f;
            if (Physics.Raycast(new Vector3(x, 30f, z), Vector3.down, out var hit, 60f))
                y = hit.point.y + 0.1f;
            var cc = player.GetComponent<CharacterController>();
            if (cc != null) cc.enabled = false;
            player.SetPositionAndRotation(new Vector3(x, y, z),
                Quaternion.Euler(0f, faceSeaward ? 180f : 10f, 0f));
            if (cc != null) cc.enabled = true;
        }

        void SetShot(Vector3 position, Vector3 lookAt)
        {
            UnparentCamera();
            _shotPosition = position;
            _shotLookAt = lookAt;
            _hasShot = true;
        }

        void UnparentCamera()
        {
            if (!_cameraParented) return;
            _camera.SetParent(null, true);
            _cameraParented = false;
        }

        void Update()
        {
            if (!_running || _cameraParented || !_hasShot || _camera == null) return;
            // a hint of handheld so static shots don't feel frozen
            Vector3 drift = new Vector3(
                Mathf.PerlinNoise(Time.time * 0.09f, 0.3f) - 0.5f,
                Mathf.PerlinNoise(0.6f, Time.time * 0.07f) - 0.5f, 0f) * cameraDrift;
            _camera.position = _shotPosition + drift;
            _camera.rotation = Quaternion.LookRotation(_shotLookAt - _camera.position, Vector3.up);
        }

        IEnumerator CutThen(float holdSeconds, Action switchStage, float fadeInSeconds)
        {
            _gm.Dialogue.FadeCut(1f);
            yield return new WaitForSeconds(holdSeconds);
            switchStage();
            _gm.Dialogue.FadeTo(0f, fadeInSeconds);
        }

        IEnumerator FadeThen(float fadeOutSeconds, Action switchStage, float fadeInSeconds)
        {
            _gm.Dialogue.FadeTo(1f, fadeOutSeconds);
            yield return new WaitForSeconds(fadeOutSeconds);
            switchStage();
            _gm.Dialogue.FadeTo(0f, fadeInSeconds);
        }

        void Cleanup()
        {
            _running = false;
            _hasShot = false;
            _gm.Dialogue.SceneEntered -= OnSceneEntered;
            StopAllCoroutines();
            UnparentCamera();
            if (planeRig != null) planeRig.SetActive(false);
            if (skyDressing != null) skyDressing.SetActive(false);
            if (underwaterRig != null) underwaterRig.SetActive(false);
            if (reefWreck != null) reefWreck.SetActive(false);
            if (_groundFogDensity > 0f) RenderSettings.fogDensity = _groundFogDensity;
            if (lagoonGlow != null) lagoonGlow.forceOn = false;
            if (shoreAmbience != null) shoreAmbience.SetActive(true);
            _gm.Dialogue.FadeCut(1f); // hold black; PlayPrologue's completion fades in
            _gm.cam.enabled = true;
            _gm.cam.SnapBehindTarget();
        }
    }
}
