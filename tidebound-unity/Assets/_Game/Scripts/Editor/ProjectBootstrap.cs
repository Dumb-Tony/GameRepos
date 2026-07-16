using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Tidebound.EditorTools
{
    /// <summary>
    /// One-click project configuration — the "code-driven scenes" rule
    /// applied to project settings. Run once after first opening the
    /// project: Tidebound ▸ Setup ▸ Configure Project (URP + Player).
    /// Idempotent; safe to re-run.
    /// </summary>
    public static class ProjectBootstrap
    {
        const string SettingsDir = "Assets/_Game/Settings";
        const string RendererPath = SettingsDir + "/Tidebound URP Renderer.asset";
        const string PipelinePath = SettingsDir + "/Tidebound URP Pipeline.asset";

        [MenuItem("Tidebound/Setup/Configure Project (URP + Player)")]
        public static void Configure()
        {
            if (!AssetDatabase.IsValidFolder(SettingsDir))
                AssetDatabase.CreateFolder("Assets/_Game", "Settings");

            var renderer = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererPath);
            if (renderer == null)
            {
                renderer = ScriptableObject.CreateInstance<UniversalRendererData>();
                AssetDatabase.CreateAsset(renderer, RendererPath);
            }

            var pipeline = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelinePath);
            if (pipeline == null)
            {
                pipeline = UniversalRenderPipelineAsset.Create(renderer);
                AssetDatabase.CreateAsset(pipeline, PipelinePath);
            }

            GraphicsSettings.defaultRenderPipeline = pipeline;
            QualitySettings.renderPipeline = pipeline;

            PlayerSettings.colorSpace = ColorSpace.Linear;
            PlayerSettings.companyName = "GameRepos";
            PlayerSettings.productName = "Tidebound";

            bool inputChanged = EnableBothInputBackends();

            AssetDatabase.SaveAssets();
            Debug.Log("[Tidebound] Project configured: URP pipeline assigned (default + quality), " +
                      "linear color space, product name set. Assets in " + SettingsDir +
                      (inputChanged ? " — Active Input Handling set to Both; RESTART the editor once for it to apply." : ""));
        }

        /// <summary>
        /// GameInput compiles against whichever backend is enabled; setting
        /// Active Input Handling to Both (2) makes that a non-decision.
        /// There's no public API — this pokes the serialized PlayerSettings,
        /// the standard workaround. Takes effect after an editor restart.
        /// </summary>
        static bool EnableBothInputBackends()
        {
            var assets = AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset");
            if (assets == null || assets.Length == 0) return false;
            var so = new SerializedObject(assets[0]);
            var prop = so.FindProperty("activeInputHandler");
            if (prop == null || prop.intValue == 2) return false;
            prop.intValue = 2;
            so.ApplyModifiedProperties();
            return true;
        }
    }
}
