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

            AssetDatabase.SaveAssets();
            Debug.Log("[Tidebound] Project configured: URP pipeline assigned (default + quality), " +
                      "linear color space, product name set. Assets in " + SettingsDir);
        }
    }
}
