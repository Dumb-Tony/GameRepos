using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Tidebound.EditorTools
{
    /// <summary>
    /// Generates the Castaway Bay vertical-slice scene from code — terrain,
    /// sea, camp, forage points, player, camera, sun, systems — so Claude
    /// can iterate on the level without ever clicking the editor. Re-run any
    /// time: Tidebound ▸ Scenes ▸ Build Castaway Bay (Greybox). The scene
    /// file is overwritten; hand-placed tweaks belong in inspector values on
    /// the generated objects only until this tool learns them.
    ///
    /// Layout: the sea lies toward −Z, the jungle wall toward +Z. The camp
    /// sits on the flat at z≈15; the wrack line (driftwood) at z≈3–7.
    /// </summary>
    public static class BayGreyboxBuilder
    {
        const string ScenePath = "Assets/_Game/Scenes/CastawayBay.unity";
        const string MaterialDir = "Assets/_Game/Art/Materials";

        static System.Random _rng;

        [MenuItem("Tidebound/Scenes/Build Castaway Bay (Greybox)")]
        public static void Build()
        {
            _rng = new System.Random(42); // deterministic bay

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            if (!AssetDatabase.IsValidFolder("Assets/_Game/Scenes"))
                AssetDatabase.CreateFolder("Assets/_Game", "Scenes");

            var mats = new Mats();

            BuildLightingAndAtmosphere(out var gameClockHost);
            BuildTerrain(mats);
            BuildSea(mats);
            BuildDistantIsland(mats);
            BuildTidePoolsZone(mats);
            BuildGreenDeepZone(mats);
            BuildEddasGrove(mats);
            BuildSilverthread(mats);
            BuildMangroveEast(mats);
            BuildRyoAndKingfisher(mats);
            BuildBounds();
            BuildJungleWall(mats);
            BuildWreck(mats);
            BuildRocksAndTrickle(mats);
            BuildPalms(mats);
            BuildBerryBushes(mats);
            BuildDriftwood(mats);
            BuildCamp(mats);
            BuildSosSite(mats);
            var shoreAmbience = BuildAmbientLife(mats);
            var director = BuildPrologueStage(mats, shoreAmbience);
            var encounterDirector = BuildEncounterStage(mats);
            BuildKavi(mats);
            BuildRaftSite(mats);
            BuildPlayerCameraAndSystems(gameClockHost, director, encounterDirector);

            EditorSceneManager.SaveScene(scene, ScenePath);
            AddToBuildSettings();

            Debug.Log("[Tidebound] Castaway Bay greybox built and saved to " + ScenePath +
                      ". Press Play: WASD + mouse, E/F/C to interact. " +
                      "Survive three days — the definition of done is that doing so is mildly fun.");
        }

        // ================= materials =================
        class Mats
        {
            public Material Sand = Mat("Sand", new Color(0.86f, 0.79f, 0.62f));
            public Material Sea = Mat("Sea", new Color(0.13f, 0.35f, 0.45f), 0.75f);
            public Material Rock = Mat("Rock", new Color(0.48f, 0.47f, 0.45f));
            public Material DarkStone = Mat("DarkStone", new Color(0.22f, 0.21f, 0.20f));
            public Material Wood = Mat("Wood", new Color(0.45f, 0.33f, 0.22f));
            public Material Driftwood = Mat("DriftwoodGrey", new Color(0.62f, 0.57f, 0.48f));
            public Material Leaf = Mat("Leaf", new Color(0.20f, 0.42f, 0.22f));
            public Material JungleDark = Mat("JungleDark", new Color(0.10f, 0.24f, 0.13f));
            public Material Fruit = Mat("Fruit", new Color(0.75f, 0.15f, 0.20f));
            public Material Metal = Mat("Metal", new Color(0.55f, 0.58f, 0.62f), 0.5f);
            public Material Flame = Mat("Flame", new Color(1.0f, 0.55f, 0.15f));
            public Material Fresh = Mat("Freshwater", new Color(0.35f, 0.65f, 0.85f), 0.8f);
            public Material Foam = Mat("Foam", new Color(0.93f, 0.96f, 0.94f), 0.4f);
            public Material Crab = Mat("Crab", new Color(0.72f, 0.42f, 0.30f));
            public Material Cloud = Mat("Cloud", new Color(0.95f, 0.96f, 0.97f), 0.05f);
            public Material Mountain = Mat("Mountain", new Color(0.30f, 0.37f, 0.34f));
            public Material TeaWater = Mat("TeaWater", new Color(0.16f, 0.20f, 0.14f), 0.88f);
            public Material Cushion = Mat("Cushion", new Color(0.85f, 0.45f, 0.15f)); // life-vest orange
            public Material Slick = Mat("FuelSlick", new Color(0.08f, 0.06f, 0.12f), 0.95f);
            public Material StormGrey = Mat("StormGrey", new Color(0.44f, 0.45f, 0.48f));
            public Material Copper = Mat("Copper", new Color(0.72f, 0.34f, 0.14f));
            public Material FlareRed = Mat("FlareRed", new Color(1f, 0.25f, 0.15f));
        }

        static Material Mat(string name, Color color, float smoothness = 0.15f)
        {
            if (!AssetDatabase.IsValidFolder("Assets/_Game/Art"))
                AssetDatabase.CreateFolder("Assets/_Game", "Art");
            if (!AssetDatabase.IsValidFolder(MaterialDir))
                AssetDatabase.CreateFolder("Assets/_Game/Art", "Materials");

            string path = MaterialDir + "/" + name + ".mat";
            var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (mat == null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Lit");
                mat = new Material(shader);
                AssetDatabase.CreateAsset(mat, path);
            }
            mat.SetColor("_BaseColor", color);
            mat.SetFloat("_Smoothness", smoothness);
            EditorUtility.SetDirty(mat);
            return mat;
        }

        // ================= terrain =================
        /// <summary>
        /// The island's height function — also used to sit objects on the
        /// ground. Zones: the bay (unchanged where the camp lives), the
        /// tide-pool shelf east, the fringe rising into the Green Deep's
        /// interior shelf. The west headland still closes the bay; the east
        /// opens onto the pools.
        /// </summary>
        static float Height(float x, float z)
        {
            float slope = z < 0f
                ? z * 0.16f                                   // shelf falling into the sea
                : 6f * Smooth01(z / 95f);                     // dune rising to the treeline
            float bowl = 3.5f * Smooth01((-x - 78f) / 42f);   // the WEST headland
            float noise = (Mathf.PerlinNoise(x * 0.035f + 7.3f, z * 0.035f + 2.1f) - 0.5f) * 1.1f;
            float h = slope + bowl + noise - 0.15f;

            // east: the tide-pool shelf — a low rock terrace pitted with pools
            if (x > 110f && z < 75f)
            {
                float blend = Smooth01((x - 110f) / 28f) * Smooth01((70f - z) / 25f);
                float pits = (Mathf.PerlinNoise(x * 0.09f + 3.1f, z * 0.09f + 5.7f) - 0.55f) * 1.7f;
                float shelf = 0.55f + Mathf.Max(pits, -0.55f);
                h = Mathf.Lerp(h, shelf, blend);
            }

            // interior: the fringe climbs into the Green Deep
            if (z > 80f)
            {
                h += 8f * Smooth01((z - 80f) / 160f);
                h += (Mathf.PerlinNoise(x * 0.02f + 1.7f, z * 0.02f + 9.2f) - 0.5f) * 3f * Smooth01((z - 130f) / 60f);
            }

            // the Silverthread: a green ravine carved down the west interior,
            // draining the mountain's shadow toward the deep green
            if (z > 160f)
            {
                float rx = RiverX(z);
                float d = Mathf.Abs(x - rx);
                if (d < 9f)
                    h -= 2.2f * Smooth01((9f - d) / 6f) * Smooth01((z - 160f) / 25f);
            }

            // northeast: the mountain's knee — the ground climbs out of the
            // interior toward the broken crown, and near the grove the rise
            // quantizes into cut terraces (sixty years of Edda's spadework).
            if (z > 230f && x > 30f)
            {
                float knee = Smooth01((z - 230f) / 70f) * Smooth01((x - 30f) / 50f);
                float rise = 14f * knee;
                float dGrove = Mathf.Sqrt((x - 100f) * (x - 100f) + (z - 285f) * (z - 285f));
                if (dGrove < 48f)
                {
                    float steps = Mathf.Round(rise / 1.5f) * 1.5f;
                    rise = Mathf.Lerp(rise, steps, Smooth01((48f - dGrove) / 18f));
                }
                h += rise;
            }

            return h;
        }

        static float Smooth01(float t)
        {
            t = Mathf.Clamp01(t);
            return t * t * (3f - 2f * t);
        }

        /// <summary>The Silverthread's centerline through the west interior.</summary>
        static float RiverX(float z) => -40f + 10f * Mathf.Sin((z - 160f) * 0.03f);

        /// <summary>
        /// The z where this column of sand crosses sea level (y = 0) — the
        /// real waterline, wiggles and all. Scans seaward-to-landward and
        /// interpolates the crossing.
        /// </summary>
        static float WaterlineZ(float x)
        {
            float prevZ = -14f;
            float prevH = Height(x, prevZ);
            for (float z = -13.5f; z <= 14f; z += 0.25f)
            {
                float h = Height(x, z);
                if (prevH < 0f && h >= 0f)
                {
                    float t = -prevH / (h - prevH);
                    return Mathf.Lerp(prevZ, z, t);
                }
                prevZ = z;
                prevH = h;
            }
            return 0f; // no crossing found (shouldn't happen inside the bay)
        }

        static void BuildTerrain(Mats mats)
        {
            const int nx = 121, nz = 134;
            const float x0 = -140f, x1 = 220f, z0 = -60f, z1 = 340f;

            var verts = new Vector3[nx * nz];
            var uvs = new Vector2[nx * nz];
            for (int j = 0; j < nz; j++)
                for (int i = 0; i < nx; i++)
                {
                    float x = Mathf.Lerp(x0, x1, i / (float)(nx - 1));
                    float z = Mathf.Lerp(z0, z1, j / (float)(nz - 1));
                    verts[j * nx + i] = new Vector3(x, Height(x, z), z);
                    uvs[j * nx + i] = new Vector2(i / (float)(nx - 1), j / (float)(nz - 1));
                }

            var tris = new int[(nx - 1) * (nz - 1) * 6];
            int t = 0;
            for (int j = 0; j < nz - 1; j++)
                for (int i = 0; i < nx - 1; i++)
                {
                    int a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
                    tris[t++] = a; tris[t++] = c; tris[t++] = b;
                    tris[t++] = b; tris[t++] = c; tris[t++] = d;
                }

            var mesh = new Mesh { name = "BayTerrain", indexFormat = UnityEngine.Rendering.IndexFormat.UInt32 };
            mesh.vertices = verts;
            mesh.uv = uvs;
            mesh.triangles = tris;
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();

            var go = new GameObject("Terrain");
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            go.AddComponent<MeshRenderer>().sharedMaterial = mats.Sand;
            go.AddComponent<MeshCollider>().sharedMesh = mesh;
            go.isStatic = true;
        }

        static void BuildSea(Mats mats)
        {
            var sea = GameObject.CreatePrimitive(PrimitiveType.Plane);
            sea.name = "Sea";
            sea.transform.position = new Vector3(0f, 0f, -90f);
            sea.transform.localScale = new Vector3(60f, 1f, 34f); // 600 × 340
            sea.GetComponent<MeshRenderer>().sharedMaterial = mats.Sea;
            Object.DestroyImmediate(sea.GetComponent<Collider>());
            sea.AddComponent<SeaMotion>();

            // the ocean to the horizon — sits just under the detailed sea so
            // the water never visibly ends (and the prologue flies over it)
            var openOcean = GameObject.CreatePrimitive(PrimitiveType.Plane);
            openOcean.name = "OpenOcean";
            openOcean.transform.position = new Vector3(0f, -0.35f, -300f);
            openOcean.transform.localScale = new Vector3(400f, 1f, 400f); // 4 km square
            openOcean.GetComponent<MeshRenderer>().sharedMaterial = mats.Sea;
            Object.DestroyImmediate(openOcean.GetComponent<Collider>());
            openOcean.isStatic = true;

            // surf wash: irregular rounded patches scattered along the real
            // waterline — no straight edges anywhere. Each line washes in
            // and out of phase; FoamLine pulses the patches so foam swells
            // on the push and dissolves on the retreat.
            var foamParent = new GameObject("Foam");
            float[] zOffsets = { 0.5f, -0.8f, -2.0f };
            float[] heights = { 0.10f, 0.08f, 0.06f };
            float[] patchScale = { 1.0f, 0.85f, 0.7f };
            for (int i = 0; i < 3; i++)
            {
                var lineGo = new GameObject("FoamLine");
                lineGo.transform.SetParent(foamParent.transform, true);

                for (float x = -96f; x <= 96f; x += 2.5f)
                {
                    if (_rng.NextDouble() < 0.2) continue; // gaps — surf is patchy
                    float px = x + Rnd(-1.1f, 1.1f);
                    float pz = WaterlineZ(px) + zOffsets[i] + Rnd(-0.5f, 0.5f);
                    var patch = Prim(PrimitiveType.Sphere, "Foam", lineGo.transform,
                        new Vector3(px, heights[i], pz),
                        new Vector3(Rnd(1.6f, 3.4f), 0.05f, Rnd(0.5f, 1.1f)) * patchScale[i],
                        mats.Foam, stripCollider: true);
                    patch.transform.rotation = Quaternion.Euler(0f, Rnd(-25f, 25f), 0f);
                }

                var line = lineGo.AddComponent<FoamLine>();
                line.phase = i * 2.1f;
                line.slideAmplitude = 1.4f + i * 0.35f;
                line.slidePeriod = 6.5f + i * 1.7f;
            }
        }

        /// <summary>
        /// The island beyond the bay, as permanent silhouette: green terraces
        /// climbing to the mountain with the broken crown. Visible from the
        /// beach through the haze every day — the whole game's promise — and
        /// from the air during the crash.
        /// </summary>
        static void BuildDistantIsland(Mats mats)
        {
            var parent = new GameObject("DistantIsland");

            // the massif: overlapping domes rising landward
            var domes = new (Vector3 pos, Vector3 scale)[]
            {
                (new Vector3(-40f, 10f, 430f), new Vector3(260f, 90f, 200f)),
                (new Vector3(90f, 5f, 490f), new Vector3(220f, 70f, 190f)),
                (new Vector3(-140f, 0f, 500f), new Vector3(200f, 55f, 170f)),
                (new Vector3(20f, 20f, 590f), new Vector3(300f, 150f, 240f)), // the mountain itself
                (new Vector3(150f, 0f, 630f), new Vector3(180f, 60f, 160f)),
            };
            foreach (var (pos, scale) in domes)
                NoShadow(Prim(PrimitiveType.Sphere, "Terrace", parent.transform, pos, scale, mats.Mountain, stripCollider: true));

            // the broken crown: two rim stubs with the break between them
            NoShadow(Prim(PrimitiveType.Cylinder, "CrownWest", parent.transform,
                new Vector3(-8f, 105f, 585f), new Vector3(52f, 26f, 48f), mats.Mountain, stripCollider: true));
            NoShadow(Prim(PrimitiveType.Cylinder, "CrownEast", parent.transform,
                new Vector3(58f, 96f, 598f), new Vector3(40f, 20f, 38f), mats.Mountain, stripCollider: true));

            parent.isStatic = true;
        }

        static GameObject NoShadow(GameObject go)
        {
            go.GetComponent<MeshRenderer>().shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            return go;
        }

        // ================= Edda's Grove =================
        /// <summary>
        /// The grove on the mountain's knee (Chapter 3): terraced beds,
        /// her hut, rain tanks, the drying rack, the two graves under the
        /// flowering tree, the feverbark at the edge, boundary stones and
        /// a marked path up from the interior. Greybox; the EddaRig stands
        /// by the hut for the stage director to borrow later.
        /// </summary>
        static void BuildEddasGrove(Mats mats)
        {
            var parent = new GameObject("EddasGrove");
            const float cx = 100f, cz = 285f;

            // fence — a ring of posts with a gap where the path enters (south)
            for (int i = 0; i < 26; i++)
            {
                float a = i / 26f * Mathf.PI * 2f;
                float deg = a * Mathf.Rad2Deg;
                if (deg > 250f && deg < 290f) continue; // the gate gap
                float x = cx + Mathf.Cos(a) * 32f, z = cz + Mathf.Sin(a) * 32f;
                Prim(PrimitiveType.Cylinder, "FencePost", parent.transform,
                    new Vector3(x, Height(x, z) + 0.45f, z), new Vector3(0.15f, 0.5f, 0.15f), mats.Wood);
            }

            // the hut, with the shotgun leaning by the door
            float hutY = Height(108f, 296f);
            Prim(PrimitiveType.Cube, "EddaHut", parent.transform,
                new Vector3(108f, hutY + 1.3f, 296f), new Vector3(4.4f, 2.6f, 3.6f), mats.Wood);
            Prim(PrimitiveType.Cube, "EddaHutRoof", parent.transform,
                new Vector3(108f, hutY + 2.85f, 296f), new Vector3(5.0f, 0.5f, 4.2f), mats.JungleDark);
            var gun = Prim(PrimitiveType.Cylinder, "Shotgun", parent.transform,
                new Vector3(105.6f, hutY + 0.62f, 294.4f), new Vector3(0.06f, 0.65f, 0.06f), mats.DarkStone);
            gun.transform.rotation = Quaternion.Euler(0f, 0f, 18f);

            // rain tanks and the drying rack
            for (int i = 0; i < 2; i++)
            {
                float x = 104.6f - i * 1.6f, z = 297.8f;
                Prim(PrimitiveType.Cylinder, "RainTank", parent.transform,
                    new Vector3(x, Height(x, z) + 0.7f, z), new Vector3(1.1f, 0.7f, 1.1f), mats.Metal);
            }
            float rackY = Height(96f, 292f);
            Prim(PrimitiveType.Cylinder, "RackPost", parent.transform,
                new Vector3(95.2f, rackY + 0.8f, 292f), new Vector3(0.1f, 0.85f, 0.1f), mats.Wood);
            Prim(PrimitiveType.Cylinder, "RackPost", parent.transform,
                new Vector3(97.4f, rackY + 0.8f, 292f), new Vector3(0.1f, 0.85f, 0.1f), mats.Wood);
            var bar = Prim(PrimitiveType.Cylinder, "RackBar", parent.transform,
                new Vector3(96.3f, rackY + 1.5f, 292f), new Vector3(0.07f, 1.25f, 0.07f), mats.Driftwood);
            bar.transform.rotation = Quaternion.Euler(0f, 0f, 90f);

            // terraced beds stepping down the south slope, planted in rows
            for (int b = 0; b < 6; b++)
            {
                float bx = 88f + (b % 3) * 8.5f, bz = 264f + (b / 3) * 7f;
                float by = Height(bx, bz);
                Prim(PrimitiveType.Cube, "TerraceBed", parent.transform,
                    new Vector3(bx, by + 0.15f, bz), new Vector3(6.2f, 0.3f, 2.2f), mats.JungleDark);
                for (int c = 0; c < 5; c++)
                    NoShadow(Prim(PrimitiveType.Sphere, "Crop", parent.transform,
                        new Vector3(bx - 2.4f + c * 1.2f, by + 0.45f, bz), new Vector3(0.5f, 0.45f, 0.5f),
                        mats.Leaf, stripCollider: true));
            }

            // the flowering tree, and the two graves kept clear beneath it
            float treeY = Height(80f, 300f);
            Prim(PrimitiveType.Cylinder, "FloweringTree", parent.transform,
                new Vector3(80f, treeY + 1.9f, 300f), new Vector3(0.4f, 2.0f, 0.4f), mats.Wood);
            NoShadow(Prim(PrimitiveType.Sphere, "FloweringCanopy", parent.transform,
                new Vector3(80f, treeY + 4.4f, 300f), new Vector3(4.4f, 3.0f, 4.4f), mats.Leaf, stripCollider: true));
            for (int i = 0; i < 7; i++)
                NoShadow(Prim(PrimitiveType.Sphere, "Blossom", parent.transform,
                    new Vector3(80f + Rnd(-2f, 2f), treeY + 4.2f + Rnd(-0.8f, 1.2f), 300f + Rnd(-2f, 2f)),
                    new Vector3(0.35f, 0.35f, 0.35f), mats.Fruit, stripCollider: true));
            for (int i = 0; i < 2; i++)
            {
                float gx = 78.4f + i * 2.4f, gz = 297.2f;
                NoShadow(Prim(PrimitiveType.Sphere, "GraveMound", parent.transform,
                    new Vector3(gx, Height(gx, gz) + 0.12f, gz), new Vector3(1.7f, 0.45f, 0.95f),
                    mats.Sand, stripCollider: true));
            }

            // the feverbark — a tall straight grey-barked tree at the edge
            float fevY = Height(122f, 270f);
            Prim(PrimitiveType.Cylinder, "Feverbark", parent.transform,
                new Vector3(122f, fevY + 3.2f, 270f), new Vector3(0.35f, 3.4f, 0.35f), mats.Driftwood);
            NoShadow(Prim(PrimitiveType.Sphere, "FeverbarkCrown", parent.transform,
                new Vector3(122f, fevY + 7.1f, 270f), new Vector3(2.6f, 1.8f, 2.6f), mats.Leaf, stripCollider: true));

            // the marked path up from the interior, and the boundary stones
            for (int i = 0; i < 10; i++)
            {
                float t = i / 9f;
                float x = Mathf.Lerp(88f, 100f, t) + Mathf.Sin(t * 5.2f) * 2.4f;
                float z = Mathf.Lerp(206f, 251f, t);
                NoShadow(Prim(PrimitiveType.Cylinder, "PathStone", parent.transform,
                    new Vector3(x, Height(x, z) + 0.05f, z), new Vector3(0.9f, 0.05f, 0.9f),
                    mats.Rock, stripCollider: true));
            }
            for (int i = 0; i < 3; i++)
            {
                float x = 93f + i * 3.4f, z = 232f + i * 8f;
                var stone = Prim(PrimitiveType.Cube, "BoundaryStone", parent.transform,
                    new Vector3(x, Height(x, z) + 0.55f, z), new Vector3(0.8f, 1.1f, 0.5f), mats.DarkStone);
                stone.transform.rotation = Quaternion.Euler(Rnd(-6f, 6f), Rnd(0f, 360f), Rnd(-4f, 4f));
            }

            // Edda herself — a greybox keeper by the hut, weathered as driftwood
            var edda = new GameObject("EddaRig");
            edda.transform.SetParent(parent.transform, true);
            float ey = Height(104f, 293f);
            edda.transform.position = new Vector3(104f, ey, 293f);
            Prim(PrimitiveType.Capsule, "EddaBody", edda.transform,
                new Vector3(104f, ey + 0.8f, 293f), new Vector3(0.42f, 0.8f, 0.42f), mats.Driftwood);
            Prim(PrimitiveType.Sphere, "EddaHead", edda.transform,
                new Vector3(104f, ey + 1.75f, 293f), new Vector3(0.32f, 0.32f, 0.32f), mats.Driftwood);
            var braid = Prim(PrimitiveType.Cylinder, "EddaBraid", edda.transform,
                new Vector3(104f, ey + 1.35f, 293.18f), new Vector3(0.07f, 0.35f, 0.07f), mats.Foam);
            braid.transform.rotation = Quaternion.Euler(12f, 0f, 0f);
            edda.AddComponent<EddaInteractable>().interactRadius = 3.5f;
        }

        // ================= the Silverthread =================
        /// <summary>
        /// The river down the west interior: water strips laid along the
        /// carved ravine, and a hauling bank at the reachable end. The bank
        /// stays a nameless murmur of running water until ev3_river names it.
        /// </summary>
        static void BuildSilverthread(Mats mats)
        {
            var parent = new GameObject("Silverthread");
            for (float z = 170f; z <= 338f; z += 8f)
            {
                float rx = RiverX(z);
                float bed = Height(rx, z);
                NoShadow(Prim(PrimitiveType.Cube, "RiverWater", parent.transform,
                    new Vector3(rx, bed + 0.55f, z), new Vector3(5.2f, 0.12f, 8.4f),
                    mats.Fresh, stripCollider: true));
            }
            // amber stones in the shallows
            for (int i = 0; i < 12; i++)
            {
                float z = Rnd(175f, 330f);
                float rx = RiverX(z) + Rnd(-2f, 2f);
                NoShadow(Prim(PrimitiveType.Sphere, "RiverStone", parent.transform,
                    new Vector3(rx, Height(rx, z) + 0.35f, z), new Vector3(Rnd(0.4f, 0.9f), 0.35f, Rnd(0.4f, 0.9f)),
                    mats.Driftwood, stripCollider: true));
            }
            // the hauling bank — cut clay, grey and thick
            float bankZ = 185f;
            float bankX = RiverX(bankZ) + 6f;
            var bank = Prim(PrimitiveType.Cube, "RiverBank", parent.transform,
                new Vector3(bankX, Height(bankX, bankZ) + 0.25f, bankZ), new Vector3(2.4f, 0.5f, 2.0f), mats.DarkStone);
            bank.AddComponent<RiverInteractable>();
        }

        // ================= the mangrove east =================
        /// <summary>
        /// The east's drowned forest: tea-dark water standing between root
        /// cathedrals, one clear channel through the middle — and lying in
        /// it, permanent as geology, Old Grin. Half water, half secret.
        /// </summary>
        static GameObject BuildMangroveEast(Mats mats)
        {
            var parent = new GameObject("MangroveEast");

            // the standing water, one sheet, a hand's width over the ground
            const float waterY = 0.45f;
            NoShadow(Prim(PrimitiveType.Cube, "TeaWater", parent.transform,
                new Vector3(180f, waterY, 160f), new Vector3(72f, 0.1f, 132f), mats.TeaWater, stripCollider: true));

            // root cathedrals: trunk + a tripod of angled prop roots
            for (int i = 0; i < 34; i++)
            {
                float x = Rnd(148f, 214f), z = Rnd(98f, 222f);
                if (Mathf.Abs(z - 160f) < 7f && x > 150f) continue; // the landlord's channel stays clear
                var trunk = Prim(PrimitiveType.Cylinder, "MangroveTrunk", parent.transform,
                    new Vector3(x, waterY + 2.4f, z), new Vector3(Rnd(0.28f, 0.45f), 2.5f, Rnd(0.28f, 0.45f)), mats.JungleDark);
                trunk.transform.rotation = Quaternion.Euler(Rnd(-4f, 4f), Rnd(0f, 360f), Rnd(-4f, 4f));
                for (int r = 0; r < 3; r++)
                {
                    float a = (r / 3f + Rnd(0f, 0.2f)) * Mathf.PI * 2f;
                    var root = Prim(PrimitiveType.Cylinder, "PropRoot", parent.transform,
                        new Vector3(x + Mathf.Cos(a) * 0.9f, waterY + 0.7f, z + Mathf.Sin(a) * 0.9f),
                        new Vector3(0.09f, 1.1f, 0.09f), mats.Wood);
                    root.transform.rotation = Quaternion.Euler(Mathf.Sin(a) * 28f, 0f, -Mathf.Cos(a) * 28f);
                }
                if (i % 3 == 0)
                    NoShadow(Prim(PrimitiveType.Sphere, "MangroveCanopy", parent.transform,
                        new Vector3(x, waterY + 5.4f, z), new Vector3(Rnd(2.6f, 4f), Rnd(1.4f, 2f), Rnd(2.6f, 4f)),
                        mats.JungleDark, stripCollider: true));
            }

            // OLD GRIN — six meters of patience, moss-backed, mostly submerged
            var grin = new GameObject("GrinRig");
            grin.transform.SetParent(parent.transform, true);
            var gp = new Vector3(185f, waterY + 0.08f, 160f);
            var body = Prim(PrimitiveType.Capsule, "GrinBody", grin.transform,
                gp, new Vector3(1.15f, 2.6f, 0.5f), mats.JungleDark);
            body.transform.rotation = Quaternion.Euler(90f, 20f, 0f); // lying along the channel
            var snout = Prim(PrimitiveType.Cube, "GrinSnout", grin.transform,
                gp + new Vector3(2.6f, 0.02f, 0.95f), new Vector3(1.5f, 0.3f, 0.62f), mats.JungleDark);
            snout.transform.rotation = Quaternion.Euler(0f, 20f, 0f);
            var tail = Prim(PrimitiveType.Cube, "GrinTail", grin.transform,
                gp + new Vector3(-2.7f, 0f, -1.0f), new Vector3(2.2f, 0.28f, 0.42f), mats.JungleDark);
            tail.transform.rotation = Quaternion.Euler(0f, 32f, 0f);
            NoShadow(Prim(PrimitiveType.Sphere, "GrinEye", grin.transform,
                gp + new Vector3(1.9f, 0.24f, 0.55f), Vector3.one * 0.14f, mats.Flame, stripCollider: true));
            NoShadow(Prim(PrimitiveType.Sphere, "GrinEye", grin.transform,
                gp + new Vector3(1.75f, 0.24f, 1.05f), Vector3.one * 0.14f, mats.Flame, stripCollider: true));

            // claw-marks on a root-buttress, high as your chest, old as rumor
            var buttress = Prim(PrimitiveType.Cube, "MarkedButtress", parent.transform,
                new Vector3(156f, waterY + 0.9f, 176f), new Vector3(0.7f, 1.8f, 0.5f), mats.Wood);
            buttress.transform.rotation = Quaternion.Euler(0f, 25f, 0f);

            // the east bank: a cairn where the swallowed service road begins
            var trailhead = new GameObject("StationTrailhead");
            trailhead.transform.SetParent(parent.transform, true);
            float thY = Height(215f, 166f);
            trailhead.transform.position = new Vector3(215f, thY, 166f);
            for (int i = 0; i < 4; i++)
                Prim(PrimitiveType.Cube, "CairnStone", trailhead.transform,
                    new Vector3(215f + Rnd(-0.3f, 0.3f), thY + 0.2f + i * 0.28f, 166f + Rnd(-0.3f, 0.3f)),
                    new Vector3(0.7f - i * 0.12f, 0.28f, 0.6f - i * 0.1f), mats.Rock);
            var stake = Prim(PrimitiveType.Cylinder, "TrailStake", trailhead.transform,
                new Vector3(215.8f, thY + 0.8f, 166f), new Vector3(0.08f, 0.85f, 0.08f), mats.Driftwood);
            stake.transform.rotation = Quaternion.Euler(0f, 0f, -6f);
            trailhead.AddComponent<StationTrailhead>().interactRadius = 3.2f;

            return grin;
        }

        // ================= Ryo and the Kingfisher =================
        /// <summary>
        /// The sailor by the fire and his boat above the tideline — both
        /// hidden until the sea delivers them on day 40 (RyoCamp shows them
        /// once RYO_MET). The hull lies canted on the west beach, mast
        /// snapped at the spreaders, pointed at the sea like a held argument.
        /// </summary>
        static void BuildRyoAndKingfisher(Mats mats)
        {
            var host = new GameObject("RyoCampSite");

            // Ryo, convalescing by the fire pit
            var ryo = new GameObject("RyoRig");
            ryo.transform.SetParent(host.transform, true);
            float ry = Height(-2.2f, 13.6f);
            var body = Prim(PrimitiveType.Capsule, "RyoBody", ryo.transform,
                new Vector3(-2.2f, ry + 0.55f, 13.6f), new Vector3(0.45f, 0.55f, 0.45f), mats.Cushion);
            body.transform.rotation = Quaternion.Euler(-18f, 40f, 0f); // propped, not standing
            Prim(PrimitiveType.Sphere, "RyoHead", ryo.transform,
                new Vector3(-2.2f, ry + 1.25f, 13.6f), new Vector3(0.3f, 0.3f, 0.3f), mats.Cushion);
            NoShadow(Prim(PrimitiveType.Cube, "Bedroll", ryo.transform,
                new Vector3(-2.2f, ry + 0.06f, 13.6f), new Vector3(0.9f, 0.12f, 2.0f), mats.StormGrey, stripCollider: true));
            ryo.SetActive(false);

            // the Kingfisher, hauled above the high-water line on the west beach
            var hull = new GameObject("KingfisherHull");
            hull.transform.SetParent(host.transform, true);
            float hx = -34f, hz = 3f;
            float hy = Height(hx, hz);
            var keel = Prim(PrimitiveType.Cube, "Hull", hull.transform,
                new Vector3(hx, hy + 0.7f, hz), new Vector3(2.1f, 1.1f, 6.4f), mats.Wood);
            keel.transform.rotation = Quaternion.Euler(0f, 12f, 14f); // canted where the sea spat her out
            var mastStub = Prim(PrimitiveType.Cylinder, "SnappedMast", hull.transform,
                new Vector3(hx - 0.2f, hy + 1.9f, hz + 0.6f), new Vector3(0.12f, 0.8f, 0.12f), mats.Driftwood);
            mastStub.transform.rotation = Quaternion.Euler(8f, 0f, 20f);
            var boom = Prim(PrimitiveType.Cylinder, "FallenBoom", hull.transform,
                new Vector3(hx + 1.6f, hy + 0.15f, hz - 1.2f), new Vector3(0.09f, 1.6f, 0.09f), mats.Driftwood);
            boom.transform.rotation = Quaternion.Euler(0f, 30f, 88f);
            NoShadow(Prim(PrimitiveType.Cube, "DraggedCanvas", hull.transform,
                new Vector3(hx + 1.1f, hy + 0.08f, hz + 2.2f), new Vector3(1.6f, 0.08f, 2.4f), mats.Foam, stripCollider: true));
            hull.SetActive(false);

            var camp = host.AddComponent<RyoCamp>();
            camp.ryoRig = ryo;
            camp.hullRig = hull;
            camp.interactRadius = 3.2f;
            host.transform.position = new Vector3(-2.2f, ry, 13.6f); // the prompt stands with the sailor
        }

        static void BuildBounds()
        {
            var parent = new GameObject("Bounds");
            // the bay's sea line, and the pools' deeper one east of it
            Wall(parent.transform, "SeaWallBay", new Vector3(-15f, 4f, -12f), new Vector3(250f, 12f, 1f));
            Wall(parent.transform, "SeaWallPools", new Vector3(170f, 4f, -28f), new Vector3(120f, 12f, 1f));
            Wall(parent.transform, "SeaWallJoin", new Vector3(110f, 4f, -20f), new Vector3(1f, 12f, 18f));
            // the deep interior's edge — the mountain's country starts here
            Wall(parent.transform, "InteriorWall", new Vector3(40f, 14f, 315f), new Vector3(500f, 24f, 1f));
            Wall(parent.transform, "WestWall", new Vector3(-125f, 10f, 130f), new Vector3(1f, 28f, 560f));
            Wall(parent.transform, "EastWall", new Vector3(212f, 10f, 130f), new Vector3(1f, 28f, 560f));
        }

        static void Wall(Transform parent, string name, Vector3 pos, Vector3 size)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, true);
            go.transform.position = pos;
            var box = go.AddComponent<BoxCollider>();
            box.size = size;
            go.isStatic = true;
        }

        // ================= dressing =================
        static void BuildJungleWall(Mats mats)
        {
            // no longer a wall: the fringe is a walkable ecotone band now
            var parent = new GameObject("JungleFringe");
            for (int i = 0; i < 42; i++)
            {
                float x = Rnd(-130f, 205f);
                float z = Rnd(78f, 148f);
                float y = Height(x, z);
                var trunk = Prim(PrimitiveType.Cylinder, "Trunk", parent.transform,
                    new Vector3(x, y + 2.6f, z), new Vector3(0.4f, 2.8f, 0.4f), mats.Wood, stripCollider: true);
                trunk.transform.rotation = Quaternion.Euler(Rnd(-6f, 6f), Rnd(0f, 360f), Rnd(-6f, 6f));
                var canopy = Prim(PrimitiveType.Sphere, "Canopy", parent.transform,
                    new Vector3(x + Rnd(-1f, 1f), y + 5.6f + Rnd(0f, 1.5f), z + Rnd(-1f, 1f)),
                    new Vector3(Rnd(3f, 4.6f), Rnd(1.8f, 2.6f), Rnd(3f, 4.6f)), mats.JungleDark, stripCollider: true);
                var sway = canopy.AddComponent<SwayInWind>();
                sway.degrees = 2f;
                sway.speed = 0.35f;
            }
            parent.isStatic = true;
        }

        static void BuildWreck(Mats mats)
        {
            var parent = new GameObject("Wreck");
            var fuselage = Prim(PrimitiveType.Cylinder, "Fuselage", parent.transform,
                new Vector3(-18f, 0.4f, -9f), new Vector3(2.2f, 5f, 2.2f), mats.Metal);
            fuselage.transform.rotation = Quaternion.Euler(84f, 24f, 0f);
            var fin = Prim(PrimitiveType.Cube, "TailFin", parent.transform,
                new Vector3(-13.5f, 1.6f, -12.5f), new Vector3(0.25f, 3f, 1.8f), mats.Metal);
            fin.transform.rotation = Quaternion.Euler(0f, 24f, -18f);
            for (int i = 0; i < 4; i++)
            {
                float x = Rnd(-30f, 5f), z = Rnd(1f, 7f);
                var piece = Prim(PrimitiveType.Cube, "Debris", parent.transform,
                    new Vector3(x, Height(x, z) + 0.15f, z),
                    new Vector3(Rnd(0.5f, 1.4f), Rnd(0.2f, 0.5f), Rnd(0.4f, 1f)), mats.Metal, stripCollider: true);
                piece.transform.rotation = Quaternion.Euler(0f, Rnd(0f, 360f), Rnd(-10f, 10f));
            }

            float bx = 32f, bz = 34f;
            var stone = Prim(PrimitiveType.Cube, "BoundaryStone", parent.transform,
                new Vector3(bx, Height(bx, bz) + 1.1f, bz), new Vector3(0.8f, 2.4f, 0.6f), mats.DarkStone);
            stone.transform.rotation = Quaternion.Euler(Rnd(-4f, 4f), Rnd(0f, 360f), Rnd(-4f, 4f));

            // the morning after: cushions, a suitcase, and the fuel slick
            // rainbowing the shallows (canon prose, kept permanently)
            for (int i = 0; i < 4; i++)
            {
                float cx = Rnd(-24f, 12f), cz = Rnd(0.5f, 5f);
                var cushion = Prim(PrimitiveType.Cube, "SeatCushion", parent.transform,
                    new Vector3(cx, Height(cx, cz) + 0.1f, cz),
                    new Vector3(0.55f, 0.13f, 0.45f), mats.Cushion, stripCollider: true);
                cushion.transform.rotation = Quaternion.Euler(0f, Rnd(0f, 360f), Rnd(-8f, 8f));
            }
            Prim(PrimitiveType.Cube, "Suitcase", parent.transform,
                new Vector3(-6f, Height(-6f, 3f) + 0.2f, 3f), new Vector3(0.55f, 0.4f, 0.8f), mats.DarkStone, stripCollider: true)
                .transform.rotation = Quaternion.Euler(-6f, 70f, 0f);
            for (int i = 0; i < 3; i++)
            {
                float sx = Rnd(-20f, 0f), sz = Rnd(-8f, -3f);
                NoShadow(Prim(PrimitiveType.Cylinder, "FuelSlick", parent.transform,
                    new Vector3(sx, 0.12f, sz),
                    new Vector3(Rnd(3f, 6f), 0.015f, Rnd(2f, 4f)), mats.Slick, stripCollider: true));
            }
            parent.isStatic = true;
        }

        static void BuildRocksAndTrickle(Mats mats)
        {
            var parent = new GameObject("Rocks");
            for (int i = 0; i < 12; i++)
            {
                float x = Rnd(-70f, 70f), z = Rnd(4f, 55f);
                if (Vector2.Distance(new Vector2(x, z), new Vector2(0f, 15f)) < 9f) continue;   // keep the camp flat clear
                if (Vector2.Distance(new Vector2(x, z), new Vector2(-42f, 30f)) < 6f) continue; // and the trickle
                var rock = Prim(_rng.NextDouble() < 0.5 ? PrimitiveType.Cube : PrimitiveType.Sphere,
                    "Rock", parent.transform,
                    new Vector3(x, Height(x, z) + 0.3f, z),
                    new Vector3(Rnd(0.7f, 2.4f), Rnd(0.5f, 1.6f), Rnd(0.7f, 2.4f)), mats.Rock);
                rock.transform.rotation = Quaternion.Euler(Rnd(-12f, 12f), Rnd(0f, 360f), Rnd(-12f, 12f));
            }

            // the freshwater trickle — the bay's one safe source
            var cluster = new GameObject("FreshwaterTrickle");
            cluster.transform.SetParent(parent.transform, true);
            float tx = -42f, tz = 30f, ty = Height(tx, tz);
            cluster.transform.position = new Vector3(tx, ty, tz);
            for (int i = 0; i < 4; i++)
            {
                var rock = Prim(PrimitiveType.Sphere, "SpringRock", cluster.transform,
                    new Vector3(tx + Rnd(-1.4f, 1.4f), ty + Rnd(0.2f, 0.9f), tz + Rnd(-1.4f, 1.4f)),
                    new Vector3(Rnd(1.2f, 2.2f), Rnd(1f, 1.8f), Rnd(1.2f, 2.2f)), mats.Rock);
                rock.transform.rotation = Quaternion.Euler(Rnd(-10f, 10f), Rnd(0f, 360f), Rnd(-10f, 10f));
            }
            var water = Prim(PrimitiveType.Cube, "Water", cluster.transform,
                new Vector3(tx, ty + 0.7f, tz + 0.9f), new Vector3(0.35f, 1.5f, 0.1f), mats.Fresh, stripCollider: true);
            water.transform.rotation = Quaternion.Euler(28f, 0f, 0f);
            var source = cluster.AddComponent<WaterSource>();
            source.interactRadius = 3.2f;
        }

        static void BuildPalms(Mats mats)
        {
            var parent = new GameObject("Palms");
            for (int i = 0; i < 14; i++)
            {
                float x = Mathf.Lerp(-85f, 85f, i / 13f) + Rnd(-8f, 8f);
                float z = Rnd(55f, 72f);
                float y = Height(x, z);
                var palm = new GameObject("Palm");
                palm.transform.SetParent(parent.transform, true);
                palm.transform.position = new Vector3(x, y, z);

                var trunk = Prim(PrimitiveType.Cylinder, "Trunk", palm.transform,
                    new Vector3(x, y + 2.2f, z), new Vector3(0.25f, 2.2f, 0.25f), mats.Wood);
                trunk.transform.rotation = Quaternion.Euler(Rnd(-9f, 9f), Rnd(0f, 360f), Rnd(-9f, 9f));

                for (int f = 0; f < 5; f++)
                {
                    float ang = f * 72f + Rnd(-14f, 14f);
                    var frond = Prim(PrimitiveType.Sphere, "Frond", palm.transform,
                        new Vector3(x, y + 4.4f, z) + Quaternion.Euler(0, ang, 0) * new Vector3(1.1f, 0f, 0f),
                        new Vector3(2.1f, 0.3f, 0.7f), mats.Leaf, stripCollider: true);
                    frond.transform.rotation = Quaternion.Euler(0f, -ang, Rnd(8f, 20f));
                    var sway = frond.AddComponent<SwayInWind>();
                    sway.degrees = 5f;
                    sway.speed = 0.6f;
                }

                if (i % 2 == 0)
                {
                    var nuts = new GameObject("Coconuts");
                    nuts.transform.SetParent(palm.transform, true);
                    nuts.transform.position = new Vector3(x, y, z);
                    for (int n = 0; n < 2; n++)
                        Prim(PrimitiveType.Sphere, "Coconut", nuts.transform,
                            new Vector3(x + Rnd(-0.8f, 0.8f), y + 0.2f, z + Rnd(-0.8f, 0.8f)),
                            Vector3.one * 0.35f, mats.Wood, stripCollider: true);
                    var point = palm.AddComponent<ForagePoint>();
                    point.kind = ForagePoint.Kind.Coconut;
                    point.regrowSegments = 6;
                    point.visual = nuts;
                    point.interactRadius = 3f;
                }
            }
            parent.isStatic = false; // forage visuals toggle
        }

        static void BuildBerryBushes(Mats mats)
        {
            var parent = new GameObject("Thickets");
            for (int i = 0; i < 5; i++)
            {
                float x = Mathf.Lerp(-65f, 65f, i / 4f) + Rnd(-6f, 6f);
                float z = Rnd(48f, 60f);
                float y = Height(x, z);
                var bush = new GameObject("Thicket");
                bush.transform.SetParent(parent.transform, true);
                bush.transform.position = new Vector3(x, y, z);
                var bushBall = Prim(PrimitiveType.Sphere, "Bush", bush.transform,
                    new Vector3(x, y + 0.7f, z), new Vector3(1.8f, 1.3f, 1.8f), mats.Leaf, stripCollider: true);
                var bushSway = bushBall.AddComponent<SwayInWind>();
                bushSway.degrees = 3f;
                bushSway.speed = 0.5f;
                var fruit = new GameObject("Fruit");
                fruit.transform.SetParent(bush.transform, true);
                fruit.transform.position = new Vector3(x, y, z);
                for (int b = 0; b < 4; b++)
                    Prim(PrimitiveType.Sphere, "Berry", fruit.transform,
                        new Vector3(x + Rnd(-0.7f, 0.7f), y + Rnd(0.6f, 1.2f), z + Rnd(-0.7f, 0.7f)),
                        Vector3.one * 0.16f, mats.Fruit, stripCollider: true);
                var point = bush.AddComponent<ForagePoint>();
                point.kind = ForagePoint.Kind.Berries;
                point.regrowSegments = 4;
                point.visual = fruit;
                point.interactRadius = 2.8f;
            }
        }

        static void BuildDriftwood(Mats mats)
        {
            var parent = new GameObject("WrackLine");
            for (int i = 0; i < 16; i++)
            {
                float x = Mathf.Lerp(-75f, 75f, i / 15f) + Rnd(-4f, 4f);
                float z = Rnd(3f, 7f);
                float y = Height(x, z);
                var piece = new GameObject("DriftwoodPiece");
                piece.transform.SetParent(parent.transform, true);
                piece.transform.position = new Vector3(x, y, z);
                var wood = Prim(PrimitiveType.Cylinder, "Wood", piece.transform,
                    new Vector3(x, y + 0.12f, z), new Vector3(0.14f, Rnd(0.6f, 1.1f), 0.14f), mats.Driftwood, stripCollider: true);
                wood.transform.rotation = Quaternion.Euler(90f, Rnd(0f, 360f), 0f);
                var point = piece.AddComponent<ForagePoint>();
                point.kind = ForagePoint.Kind.Driftwood;
                point.regrowSegments = 6;
                point.visual = wood;
                point.interactRadius = 2.2f;
            }
        }

        // ================= camp =================
        static void BuildCamp(Mats mats)
        {
            float cx = 0f, cz = 15f, cy = Height(cx, cz);

            // ---- fire pit ----
            var pit = new GameObject("FirePit");
            pit.transform.position = new Vector3(cx, cy, cz);
            for (int i = 0; i < 8; i++)
            {
                float ang = i * 45f * Mathf.Deg2Rad;
                Prim(PrimitiveType.Sphere, "Stone", pit.transform,
                    new Vector3(cx + Mathf.Cos(ang) * 0.75f, cy + 0.12f, cz + Mathf.Sin(ang) * 0.75f),
                    Vector3.one * 0.3f, mats.Rock, stripCollider: true);
            }
            Prim(PrimitiveType.Cylinder, "Ash", pit.transform,
                new Vector3(cx, cy + 0.03f, cz), new Vector3(0.55f, 0.03f, 0.55f), mats.DarkStone, stripCollider: true);

            var flame = new GameObject("Flame");
            flame.transform.SetParent(pit.transform, true);
            flame.transform.position = new Vector3(cx, cy, cz);
            Prim(PrimitiveType.Sphere, "Fire", flame.transform,
                new Vector3(cx, cy + 0.42f, cz), new Vector3(0.55f, 0.8f, 0.55f), mats.Flame, stripCollider: true);
            var lightGo = new GameObject("FireLight");
            lightGo.transform.SetParent(flame.transform, true);
            lightGo.transform.position = new Vector3(cx, cy + 1.1f, cz);
            var fireLight = lightGo.AddComponent<Light>();
            fireLight.type = LightType.Point;
            fireLight.color = new Color(1f, 0.62f, 0.28f);
            fireLight.range = 11f;
            fireLight.intensity = 2.2f;
            var crackleSource = flame.AddComponent<AudioSource>();
            crackleSource.playOnAwake = false;
            flame.AddComponent<FireCrackle>(); // starts/stops with the flame
            flame.SetActive(false);

            var campfire = pit.AddComponent<CampfireInteractable>();
            campfire.flame = flame;
            campfire.fireLight = fireLight;
            campfire.interactRadius = 2.8f;

            // ---- shelter site ----
            float sx = 5.5f, sz = 17f, sy = Height(sx, sz);
            var site = new GameObject("ShelterSite");
            site.transform.position = new Vector3(sx, sy, sz);
            for (int i = 0; i < 4; i++)
            {
                float ox = (i % 2 == 0 ? -1.2f : 1.2f), oz = (i < 2 ? -1.6f : 1.6f);
                Prim(PrimitiveType.Sphere, "CornerStone", site.transform,
                    new Vector3(sx + ox, sy + 0.1f, sz + oz), Vector3.one * 0.22f, mats.DarkStone, stripCollider: true);
            }

            var tier1 = new GameObject("Tier1_LeanTo");
            tier1.transform.SetParent(site.transform, true);
            tier1.transform.position = new Vector3(sx, sy, sz);
            var roof = Prim(PrimitiveType.Cube, "Roof", tier1.transform,
                new Vector3(sx, sy + 1.1f, sz + 0.6f), new Vector3(2.6f, 0.1f, 2.6f), mats.Leaf, stripCollider: true);
            roof.transform.rotation = Quaternion.Euler(-52f, 0f, 0f);
            Prim(PrimitiveType.Cylinder, "PostL", tier1.transform,
                new Vector3(sx - 1.2f, sy + 0.8f, sz - 0.5f), new Vector3(0.1f, 0.8f, 0.1f), mats.Driftwood, stripCollider: true);
            Prim(PrimitiveType.Cylinder, "PostR", tier1.transform,
                new Vector3(sx + 1.2f, sy + 0.8f, sz - 0.5f), new Vector3(0.1f, 0.8f, 0.1f), mats.Driftwood, stripCollider: true);
            tier1.SetActive(false);

            var tier2 = new GameObject("Tier2_Hut");
            tier2.transform.SetParent(site.transform, true);
            tier2.transform.position = new Vector3(sx, sy, sz);
            Prim(PrimitiveType.Cube, "WallBack", tier2.transform,
                new Vector3(sx, sy + 0.9f, sz + 1.6f), new Vector3(3f, 1.8f, 0.15f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Cube, "WallL", tier2.transform,
                new Vector3(sx - 1.5f, sy + 0.9f, sz + 0.4f), new Vector3(0.15f, 1.8f, 2.4f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Cube, "WallR", tier2.transform,
                new Vector3(sx + 1.5f, sy + 0.9f, sz + 0.4f), new Vector3(0.15f, 1.8f, 2.4f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Cube, "RoofSlab", tier2.transform,
                new Vector3(sx, sy + 1.95f, sz + 0.4f), new Vector3(3.3f, 0.12f, 2.9f), mats.Leaf, stripCollider: true);
            tier2.SetActive(false);

            // tier 3 — the fortified camp: a palisade ring of sharpened stakes
            // and the raised cache no pig on earth can reach
            var tier3 = new GameObject("Tier3_Fortified");
            tier3.transform.SetParent(site.transform, true);
            tier3.transform.position = new Vector3(sx, sy, sz);
            for (int i = 0; i < 14; i++)
            {
                float ang = i * (360f / 14f) * Mathf.Deg2Rad;
                float px = sx + Mathf.Cos(ang) * 4.2f, pz = sz + Mathf.Sin(ang) * 4.2f;
                float py = Height(px, pz);
                var stake = Prim(PrimitiveType.Cylinder, "Stake", tier3.transform,
                    new Vector3(px, py + 0.7f, pz), new Vector3(0.12f, 0.7f, 0.12f),
                    mats.Driftwood, stripCollider: true);
                stake.transform.rotation = Quaternion.Euler(
                    Mathf.Sin(ang) * 8f, 0f, -Mathf.Cos(ang) * 8f); // leaning out, on purpose
                Prim(PrimitiveType.Sphere, "Point", tier3.transform,
                    new Vector3(px, py + 1.45f, pz), new Vector3(0.09f, 0.18f, 0.09f),
                    mats.Wood, stripCollider: true);
            }
            float chx = sx - 2.6f, chz = sz - 2.2f, chy = Height(chx, chz);
            for (int i = 0; i < 4; i++)
                Prim(PrimitiveType.Cylinder, "CacheLeg", tier3.transform,
                    new Vector3(chx + (i % 2 == 0 ? -0.5f : 0.5f), chy + 0.8f, chz + (i < 2 ? -0.4f : 0.4f)),
                    new Vector3(0.09f, 0.8f, 0.09f), mats.Driftwood, stripCollider: true);
            Prim(PrimitiveType.Cube, "CachePlatform", tier3.transform,
                new Vector3(chx, chy + 1.66f, chz), new Vector3(1.5f, 0.1f, 1.2f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Cube, "CacheStores", tier3.transform,
                new Vector3(chx, chy + 1.92f, chz), new Vector3(0.9f, 0.42f, 0.7f), mats.Leaf, stripCollider: true);
            tier3.SetActive(false);

            var shelter = site.AddComponent<ShelterInteractable>();
            shelter.tier1Visual = tier1;
            shelter.tier2Visual = tier2;
            shelter.tier3Visual = tier3;
            shelter.interactRadius = 3.2f;

            // ---- the courier's case, by the flat stone -----------------------
            // (a shape you last saw chained to a wrist; visible once carried)
            float kx = cx - 1.9f, kz = cz + 1.4f, ky = Height(kx, kz);
            var caseGo = new GameObject("CourierCase");
            caseGo.transform.position = new Vector3(kx, ky, kz);
            var caseVisual = new GameObject("CaseVisual");
            caseVisual.transform.SetParent(caseGo.transform, true);
            caseVisual.transform.position = caseGo.transform.position;
            var body = Prim(PrimitiveType.Cube, "CaseBody", caseVisual.transform,
                new Vector3(kx, ky + 0.16f, kz), new Vector3(0.62f, 0.3f, 0.42f), mats.Metal, stripCollider: true);
            body.transform.rotation = Quaternion.Euler(0f, 24f, 0f);
            var crest = Prim(PrimitiveType.Cylinder, "Crest", caseVisual.transform,
                new Vector3(kx + 0.1f, ky + 0.325f, kz - 0.05f), new Vector3(0.12f, 0.008f, 0.12f),
                mats.Copper, stripCollider: true);
            crest.transform.rotation = Quaternion.Euler(0f, 24f, 0f);
            caseVisual.SetActive(false); // CaseInteractable shows it once carried
            var courierCase = caseGo.AddComponent<CaseInteractable>();
            courierCase.visual = caseVisual;
            courierCase.interactRadius = 2.4f;
        }

        static void BuildSosSite(Mats mats)
        {
            // well up the beach — the terrain noise can dip below sea level
            // near the waterline, and letters must never stand in the sea
            float ox = 26f, oz = 15f;
            var site = new GameObject("SosSite");
            site.transform.position = new Vector3(ox, Height(ox, oz), oz);

            var letters = new GameObject("Letters");
            letters.transform.SetParent(site.transform, true);
            letters.transform.position = site.transform.position;

            string[][] glyphs =
            {
                new[] { "111", "100", "111", "001", "111" }, // S
                new[] { "111", "101", "101", "101", "111" }, // O
                new[] { "111", "100", "111", "001", "111" }, // S
            };
            float spacing = 0.9f;
            for (int g = 0; g < glyphs.Length; g++)
                for (int row = 0; row < 5; row++)
                    for (int col = 0; col < 3; col++)
                        if (glyphs[g][row][col] == '1')
                        {
                            float x = ox + g * 4f * spacing + col * spacing;
                            float z = oz - row * spacing;
                            float y = Mathf.Max(Height(x, z) + 0.12f, 0.4f); // dry, whatever the sand does
                            Prim(PrimitiveType.Cube, "Stone", letters.transform,
                                new Vector3(x, y, z),
                                new Vector3(0.55f, 0.25f, 0.55f), mats.DarkStone, stripCollider: true);
                        }
            letters.SetActive(false);

            var sos = site.AddComponent<SosSite>();
            sos.letters = letters;
            sos.interactRadius = 3.5f;
        }

        // ================= ambient life =================
        static GameObject BuildAmbientLife(Mats mats)
        {
            // the sound of the place — synthesized, no audio files
            var ambience = new GameObject("ShoreAmbience");
            var shoreSource = ambience.AddComponent<AudioSource>();
            shoreSource.playOnAwake = false;
            ambience.AddComponent<ShoreAmbience>();

            var birds = new GameObject("Birds");
            var flights = birds.AddComponent<BirdFlights>();
            flights.birdMaterial = mats.DarkStone;

            var crabs = new GameObject("Crabs");
            for (int i = 0; i < 12; i++)
            {
                float x = Rnd(-70f, 70f), z = Rnd(1f, 9f);
                var crab = new GameObject("Crab");
                crab.transform.SetParent(crabs.transform, true);
                var pos = new Vector3(x, Height(x, z) + 0.06f, z);
                crab.transform.position = pos;
                Prim(PrimitiveType.Sphere, "Body", crab.transform,
                    pos + new Vector3(0f, 0.04f, 0f), new Vector3(0.22f, 0.09f, 0.16f), mats.Crab, stripCollider: true);
                Prim(PrimitiveType.Sphere, "ClawL", crab.transform,
                    pos + new Vector3(-0.12f, 0.05f, 0.08f), Vector3.one * 0.06f, mats.Crab, stripCollider: true);
                Prim(PrimitiveType.Sphere, "ClawR", crab.transform,
                    pos + new Vector3(0.12f, 0.05f, 0.08f), Vector3.one * 0.06f, mats.Crab, stripCollider: true);
                crab.AddComponent<CrabAI>();
            }

            return ambience;
        }

        // ================= the prologue stage =================
        static PrologueStageDirector BuildPrologueStage(Mats mats, GameObject shoreAmbience)
        {
            // ---- the charter plane (chase-shot exterior; no fire — canon:
            // the engines are fine, the instruments are drunk) ----
            var plane = new GameObject("ProloguePlane");
            var body = Prim(PrimitiveType.Capsule, "Fuselage", plane.transform,
                Vector3.zero, new Vector3(1.5f, 1.5f, 1.5f), mats.Metal, stripCollider: true);
            body.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            body.transform.localScale = new Vector3(1.5f, 2.6f, 1.5f); // capsule axis = Y → lies along Z after rotation
            Prim(PrimitiveType.Cube, "Wings", plane.transform,
                new Vector3(0f, 0.35f, 0.4f), new Vector3(9.5f, 0.12f, 1.6f), mats.Metal, stripCollider: true);
            var tail = Prim(PrimitiveType.Cube, "TailFin", plane.transform,
                new Vector3(0f, 1.1f, -2.6f), new Vector3(0.12f, 1.6f, 1.1f), mats.Metal, stripCollider: true);
            tail.transform.localRotation = Quaternion.Euler(-18f, 0f, 0f);
            Prim(PrimitiveType.Cylinder, "EngineL", plane.transform,
                new Vector3(-2.6f, 0.15f, 0.8f), new Vector3(0.5f, 0.6f, 0.5f), mats.DarkStone, stripCollider: true)
                .transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            Prim(PrimitiveType.Cylinder, "EngineR", plane.transform,
                new Vector3(2.6f, 0.15f, 0.8f), new Vector3(0.5f, 0.6f, 0.5f), mats.DarkStone, stripCollider: true)
                .transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            // children were placed at world origin; re-seat them as locals
            foreach (Transform child in plane.transform) child.localPosition = child.position;
            plane.AddComponent<PlaneDescent>();
            var droneSource = plane.AddComponent<AudioSource>();
            droneSource.playOnAwake = false;
            plane.AddComponent<EngineDrone>();
            plane.SetActive(false);

            // ---- the sinking blue dark ----
            var underwater = new GameObject("UnderwaterStage");
            underwater.transform.position = new Vector3(0f, -45f, -140f);
            var underwaterDrift = underwater.AddComponent<UnderwaterDrift>();
            var bubbleRng = new System.Random(11);
            for (int i = 0; i < 18; i++)
            {
                var bubble = Prim(PrimitiveType.Sphere, "Bubble", underwater.transform,
                    underwater.transform.position + new Vector3(
                        (float)(bubbleRng.NextDouble() * 8 - 4),
                        (float)(bubbleRng.NextDouble() * 12 - 6),
                        (float)(bubbleRng.NextDouble() * 8 - 4) + 2f),
                    Vector3.one * (0.05f + (float)bubbleRng.NextDouble() * 0.09f), mats.Foam, stripCollider: true);
                bubble.transform.SetParent(underwater.transform, true);
            }
            var abyssLight = new GameObject("AbyssLight");
            abyssLight.transform.SetParent(underwater.transform, false);
            abyssLight.transform.localPosition = new Vector3(0f, -8f, 4f);
            var abyss = abyssLight.AddComponent<Light>();
            abyss.type = LightType.Point;
            abyss.color = new Color(0.2f, 0.75f, 0.7f);
            abyss.range = 25f;
            abyss.intensity = 1.1f;

            // the rest of the crash goes down with you
            var sunkFuselage = Prim(PrimitiveType.Capsule, "Fuselage", underwater.transform,
                underwater.transform.position + new Vector3(5f, -11f, 9f),
                new Vector3(2.2f, 4f, 2.2f), mats.Metal, stripCollider: true);
            sunkFuselage.transform.rotation = Quaternion.Euler(75f, 25f, 10f);
            for (int i = 0; i < 7; i++)
            {
                var isCushion = i % 2 == 0;
                var piece = Prim(PrimitiveType.Cube, "Debris", underwater.transform,
                    underwater.transform.position + new Vector3(
                        (float)(bubbleRng.NextDouble() * 10 - 5),
                        (float)(bubbleRng.NextDouble() * 10 - 5),
                        (float)(bubbleRng.NextDouble() * 10 - 3) + 3f),
                    isCushion ? new Vector3(0.5f, 0.12f, 0.4f) : new Vector3(0.4f, 0.3f, 0.55f),
                    isCushion ? mats.Cushion : mats.DarkStone, stripCollider: true);
                piece.transform.rotation = Quaternion.Euler(Rnd(0f, 360f), Rnd(0f, 360f), Rnd(0f, 360f));
            }
            for (int i = 0; i < 5; i++)
                Prim(PrimitiveType.Cube, "Paper", underwater.transform,
                    underwater.transform.position + new Vector3(
                        (float)(bubbleRng.NextDouble() * 7 - 3.5f),
                        (float)(bubbleRng.NextDouble() * 8 - 4),
                        (float)(bubbleRng.NextDouble() * 6 - 2) + 2f),
                    new Vector3(0.25f, 0.01f, 0.33f), mats.Foam, stripCollider: true);
            // the surface, already impossibly far above
            NoShadow(Prim(PrimitiveType.Sphere, "SurfaceGlow", underwater.transform,
                underwater.transform.position + new Vector3(0f, 28f, 6f),
                new Vector3(70f, 3f, 70f), mats.Foam, stripCollider: true));
            underwater.SetActive(false);

            // ---- the fuselage dying on the reef (prologue only; it sinks) ----
            var wreck = new GameObject("ReefWreck");
            var hull = Prim(PrimitiveType.Cylinder, "Hull", wreck.transform,
                new Vector3(-12f, -0.4f, -28f), new Vector3(2.4f, 4.5f, 2.4f), mats.Metal, stripCollider: true);
            hull.transform.rotation = Quaternion.Euler(78f, -30f, 0f);
            var doorway = Prim(PrimitiveType.Cube, "Doorway", wreck.transform,
                new Vector3(-10.6f, 0.6f, -26.8f), new Vector3(1.1f, 1.4f, 0.15f), mats.DarkStone, stripCollider: true);
            doorway.transform.rotation = Quaternion.Euler(12f, -30f, 0f);
            var wing = Prim(PrimitiveType.Cube, "Wing", wreck.transform,
                new Vector3(-17f, -0.05f, -31f), new Vector3(6f, 0.16f, 1.7f), mats.Metal, stripCollider: true);
            wing.transform.rotation = Quaternion.Euler(7f, -42f, 11f);
            Prim(PrimitiveType.Cube, "CargoAdrift", wreck.transform,
                new Vector3(-8.8f, 0.05f, -25.5f), new Vector3(0.7f, 0.5f, 0.9f), mats.Wood, stripCollider: true)
                .transform.rotation = Quaternion.Euler(6f, 30f, -8f);
            Prim(PrimitiveType.Cube, "CushionAdrift", wreck.transform,
                new Vector3(-14.5f, 0.06f, -24f), new Vector3(0.55f, 0.12f, 0.45f), mats.Cushion, stripCollider: true);
            wreck.SetActive(false);

            // ---- the sky: clouds to fall past, sister islands on the horizon ----
            var sky = new GameObject("PrologueSky");
            var cloudRng = new System.Random(31);
            for (int i = 0; i < 22; i++)
            {
                float cx = -350f + (float)(cloudRng.NextDouble() * 600);
                float cy = 110f + (float)(cloudRng.NextDouble() * 190);
                float cz = -620f + (float)(cloudRng.NextDouble() * 540);
                NoShadow(Prim(PrimitiveType.Sphere, "Cloud", sky.transform,
                    new Vector3(cx, cy, cz),
                    new Vector3(28f + (float)(cloudRng.NextDouble() * 34),
                                5f + (float)(cloudRng.NextDouble() * 5),
                                22f + (float)(cloudRng.NextDouble() * 26)),
                    mats.Cloud, stripCollider: true));
            }
            // "islands whose names you learned yesterday" — far astern, low, blue
            NoShadow(Prim(PrimitiveType.Sphere, "SisterIsle", sky.transform,
                new Vector3(-800f, -8f, -1300f), new Vector3(320f, 45f, 220f), mats.Mountain, stripCollider: true));
            NoShadow(Prim(PrimitiveType.Sphere, "SisterIsle", sky.transform,
                new Vector3(550f, -8f, -1500f), new Vector3(240f, 30f, 180f), mats.Mountain, stripCollider: true));
            sky.SetActive(false);

            // ---- the lagoon's glow (prologue night, then every night after) ----
            var glow = new GameObject("LagoonGlow");
            var glowRng = new System.Random(23);
            for (int i = 0; i < 9; i++)
            {
                float gx = (float)(glowRng.NextDouble() * 110 - 55);
                float gz = -5f - (float)(glowRng.NextDouble() * 38);
                NoShadow(Prim(PrimitiveType.Cylinder, "GlowDisc", glow.transform,
                    new Vector3(gx, 0.15f, gz), // riding the surface; the sea is opaque greybox
                    new Vector3(4f + (float)glowRng.NextDouble() * 5f, 0.03f, 4f + (float)glowRng.NextDouble() * 5f),
                    Mat("HeartglassGlow", new Color(0.25f, 0.95f, 0.85f), 0.9f), stripCollider: true));
                if (i % 2 == 0)
                {
                    var lightGo = new GameObject("GlowLight");
                    lightGo.transform.SetParent(glow.transform, false);
                    lightGo.transform.position = new Vector3(gx, 1.2f, gz);
                    var l = lightGo.AddComponent<Light>();
                    l.type = LightType.Point;
                    l.color = new Color(0.25f, 0.95f, 0.85f);
                    l.range = 20f;
                }
            }
            var lagoon = glow.AddComponent<LagoonGlow>();

            // ---- the director ----
            var directorGo = new GameObject("PrologueDirector");
            var director = directorGo.AddComponent<PrologueStageDirector>();
            director.planeRig = plane;
            director.skyDressing = sky;
            director.underwaterRig = underwater;
            director.reefWreck = wreck;
            director.lagoonGlow = lagoon;
            director.shoreAmbience = shoreAmbience;
            // the sun doesn't exist yet — BuildPlayerCameraAndSystems wires
            // underwaterDrift.sun once it does
            return director;
        }

        // ================= the eastern shelf: THE TIDE POOLS =================
        static void BuildTidePoolsZone(Mats mats)
        {
            var parent = new GameObject("TidePoolsZone");

            for (int i = 0; i < 14; i++)
            {
                float x = Rnd(125f, 205f), z = Rnd(-15f, 55f);
                var rock = Prim(PrimitiveType.Sphere, "ShelfRock", parent.transform,
                    new Vector3(x, Height(x, z) + 0.25f, z),
                    new Vector3(Rnd(0.8f, 2.6f), Rnd(0.4f, 1.2f), Rnd(0.8f, 2.6f)), mats.Rock);
                rock.transform.rotation = Quaternion.Euler(Rnd(-10f, 10f), Rnd(0f, 360f), Rnd(-10f, 10f));
            }

            // the pools themselves — cities at low tide
            for (int i = 0; i < 10; i++)
            {
                float x = Rnd(128f, 202f), z = Rnd(-12f, 50f);
                NoShadow(Prim(PrimitiveType.Cylinder, "Pool", parent.transform,
                    new Vector3(x, 0.12f, z),
                    new Vector3(Rnd(1.6f, 3.6f), 0.03f, Rnd(1.4f, 3f)), mats.Fresh, stripCollider: true));
            }

            // three workable pool cities — LANDMARKS, not easter eggs: a ring
            // of stones around one bright raised pool, dressed in shells and
            // starfish (the dressing is the depletable visual)
            var poolSpots = new[] { new Vector2(140f, 12f), new Vector2(166f, 32f), new Vector2(192f, 6f) };
            foreach (var spot in poolSpots)
            {
                var point = new GameObject("TidePoolPoint");
                point.transform.SetParent(parent.transform, true);
                float py = Mathf.Max(Height(spot.x, spot.y), 0.2f);
                var center = new Vector3(spot.x, py, spot.y);
                point.transform.position = center;

                // the pool itself, raised enough to catch the eye
                NoShadow(Prim(PrimitiveType.Cylinder, "CityPool", point.transform,
                    center + Vector3.up * 0.16f, new Vector3(2.4f, 0.05f, 2.2f), mats.Fresh, stripCollider: true));
                // the ring of stones that says "this one is different"
                for (int i = 0; i < 6; i++)
                {
                    float ang = i * 60f * Mathf.Deg2Rad;
                    var ringStone = Prim(PrimitiveType.Sphere, "RingStone", point.transform,
                        center + new Vector3(Mathf.Cos(ang) * 1.5f, 0.22f, Mathf.Sin(ang) * 1.4f),
                        new Vector3(Rnd(0.35f, 0.55f), Rnd(0.3f, 0.45f), Rnd(0.35f, 0.55f)), mats.Rock, stripCollider: true);
                    ringStone.transform.rotation = Quaternion.Euler(0f, Rnd(0f, 360f), 0f);
                }

                var dressing = new GameObject("Shells");
                dressing.transform.SetParent(point.transform, true);
                dressing.transform.position = center;
                for (int i = 0; i < 7; i++)
                    Prim(PrimitiveType.Sphere, "Shell", dressing.transform,
                        center + new Vector3(Rnd(-1.1f, 1.1f), 0.24f, Rnd(-1f, 1f)),
                        Vector3.one * Rnd(0.14f, 0.2f), mats.Foam, stripCollider: true);
                for (int i = 0; i < 2; i++)
                    NoShadow(Prim(PrimitiveType.Sphere, "Starfish", dressing.transform,
                        center + new Vector3(Rnd(-1f, 1f), 0.22f, Rnd(-0.9f, 0.9f)),
                        new Vector3(0.22f, 0.05f, 0.22f), mats.Cushion, stripCollider: true));

                var forage = point.AddComponent<ForagePoint>();
                forage.kind = ForagePoint.Kind.TidePool;
                forage.regrowSegments = 3;
                forage.visual = dressing;
                forage.interactRadius = 3.5f;
            }

            // the gallery at the drop-off: sorted shells, stacked stones,
            // curated by eight patient arms you don't see today
            var gallery = new GameObject("TheGallery");
            gallery.transform.SetParent(parent.transform, true);
            gallery.transform.position = new Vector3(186f, Height(186f, 0f), 0f);
            for (int i = 0; i < 6; i++)
                Prim(PrimitiveType.Cube, "SortedStone", gallery.transform,
                    gallery.transform.position + new Vector3(Rnd(-0.8f, 0.8f), 0.1f + i * 0.02f, Rnd(-0.8f, 0.8f)),
                    Vector3.one * Rnd(0.1f, 0.22f), mats.DarkStone, stripCollider: true);
        }

        // ================= the interior: THE GREEN DEEP =================
        static void BuildGreenDeepZone(Mats mats)
        {
            var parent = new GameObject("GreenDeepZone");

            // the canopy closes like a lid; trunks keep their colliders —
            // the interior is a maze you thread, not a lawn you cross
            for (int i = 0; i < 70; i++)
            {
                float x = Rnd(-120f, 205f), z = Rnd(155f, 300f);
                // the grove is kept ground — no wild interior inside the fence
                if ((x - 100f) * (x - 100f) + (z - 285f) * (z - 285f) < 40f * 40f) continue;
                // and nothing grows mid-channel in the Silverthread
                if (z > 160f && Mathf.Abs(x - RiverX(z)) < 6f) continue;
                float y = Height(x, z);
                var trunk = Prim(PrimitiveType.Cylinder, "DeepTrunk", parent.transform,
                    new Vector3(x, y + 2.8f, z), new Vector3(Rnd(0.35f, 0.6f), 2.9f, Rnd(0.35f, 0.6f)), mats.Wood);
                trunk.transform.rotation = Quaternion.Euler(Rnd(-5f, 5f), Rnd(0f, 360f), Rnd(-5f, 5f));
                if (i % 2 == 0)
                    Prim(PrimitiveType.Sphere, "DeepCanopy", parent.transform,
                        new Vector3(x + Rnd(-2f, 2f), y + Rnd(9f, 13f), z + Rnd(-2f, 2f)),
                        new Vector3(Rnd(8f, 14f), Rnd(3f, 5f), Rnd(8f, 14f)), mats.JungleDark, stripCollider: true);
            }

            // the fig hoard tree — the interior's one generous table
            float fx = 60f, fz = 230f, fy = Height(fx, fz);
            var figTree = new GameObject("FigHoardTree");
            figTree.transform.SetParent(parent.transform, true);
            figTree.transform.position = new Vector3(fx, fy, fz);
            Prim(PrimitiveType.Cylinder, "Trunk", figTree.transform,
                new Vector3(fx, fy + 3.2f, fz), new Vector3(1.1f, 3.2f, 1.1f), mats.Wood);
            Prim(PrimitiveType.Sphere, "Crown", figTree.transform,
                new Vector3(fx, fy + 8.5f, fz), new Vector3(11f, 5f, 11f), mats.Leaf, stripCollider: true);
            var figs = new GameObject("Figs");
            figs.transform.SetParent(figTree.transform, true);
            figs.transform.position = figTree.transform.position;
            for (int i = 0; i < 5; i++)
                Prim(PrimitiveType.Sphere, "Fig", figs.transform,
                    figTree.transform.position + new Vector3(Rnd(-1.5f, 1.5f), 0.15f, Rnd(-1.5f, 1.5f)),
                    Vector3.one * 0.14f, mats.Fruit, stripCollider: true);
            var figPoint = figTree.AddComponent<ForagePoint>();
            figPoint.kind = ForagePoint.Kind.Berries;
            figPoint.regrowSegments = 6;
            figPoint.visual = figs;
            figPoint.interactRadius = 3.2f;

            // the glyph stone — the island's oldest furniture
            float gx = -30f, gz = 210f, gy = Height(gx, gz);
            var glyph = Prim(PrimitiveType.Cube, "GlyphStone", parent.transform,
                new Vector3(gx, gy + 1.1f, gz), new Vector3(1.1f, 2.4f, 0.7f), mats.DarkStone);
            glyph.transform.rotation = Quaternion.Euler(Rnd(-6f, 6f), Rnd(0f, 360f), Rnd(-6f, 6f));
            var glyphStone = glyph.AddComponent<LoreStone>();
            glyphStone.displayName = "A mossed standing stone";
            glyphStone.optionLabel = "Peel the moss back";
            glyphStone.optionSub = "Earth on this island has a habit of holding things.";
            glyphStone.flag = "GLYPH_1";
            glyphStone.prose = "Under the moss, cut faces: spirals and tide-lines, worked once by hands. The strokes run seven to a row. You trace one, and the jungle seems, briefly, to listen.";
            glyphStone.interactRadius = 3f;

            // the wallow — the King's home counties, posted plainly
            float wx = -40f, wz = 260f, wy = Height(wx, wz);
            NoShadow(Prim(PrimitiveType.Cylinder, "WallowMud", parent.transform,
                new Vector3(wx, wy + 0.06f, wz), new Vector3(5f, 0.05f, 4f), mats.Wood, stripCollider: true));
            var wallowMark = new GameObject("Wallow");
            wallowMark.transform.SetParent(parent.transform, true);
            wallowMark.transform.position = new Vector3(wx, wy, wz);
            var wallow = wallowMark.AddComponent<LoreStone>();
            wallow.displayName = "A wallow like a crater";
            wallow.optionLabel = "Read the sign";
            wallow.optionSub = "Old and new. Somebody large lives here.";
            wallow.flag = "WALLOW_SEEN";
            wallow.prose = "Churned mud, tusk-scored trees, sign in every age from ancient to this-morning. Rent country. You keep your tread soft and your tithe-arithmetic ready.";
            wallow.interactRadius = 3.5f;
        }

        // ================= the encounter stage =================
        static EncounterStageDirector BuildEncounterStage(Mats mats)
        {
            // the dead palm at the edge of camp — permanent; Vela's perch
            float px = 5.5f, pz = 12f, py = Height(px, pz);
            var deadPalm = Prim(PrimitiveType.Cylinder, "DeadPalm", null,
                new Vector3(px, py + 1.9f, pz), new Vector3(0.22f, 1.9f, 0.22f), mats.Driftwood);
            deadPalm.transform.rotation = Quaternion.Euler(0f, 0f, 14f);

            // ---- Vela: the one-eyed accountant, perched ----
            var vela = new GameObject("VelaRig");
            var perchTop = new Vector3(px - 0.85f, py + 3.6f, pz);
            Prim(PrimitiveType.Sphere, "Body", vela.transform, perchTop, new Vector3(0.34f, 0.44f, 0.3f), mats.Foam, stripCollider: true);
            Prim(PrimitiveType.Cube, "WingL", vela.transform, perchTop + new Vector3(-0.16f, 0.05f, 0f),
                new Vector3(0.1f, 0.34f, 0.42f), mats.DarkStone, stripCollider: true);
            Prim(PrimitiveType.Cube, "WingR", vela.transform, perchTop + new Vector3(0.16f, 0.05f, 0f),
                new Vector3(0.1f, 0.34f, 0.42f), mats.DarkStone, stripCollider: true);
            Prim(PrimitiveType.Sphere, "Head", vela.transform, perchTop + new Vector3(0f, 0.3f, 0.08f),
                Vector3.one * 0.18f, mats.Foam, stripCollider: true);
            Prim(PrimitiveType.Cube, "Beak", vela.transform, perchTop + new Vector3(0f, 0.28f, 0.2f),
                new Vector3(0.05f, 0.05f, 0.12f), mats.Cushion, stripCollider: true);
            vela.SetActive(false);

            var fish = new GameObject("FishDrop");
            var fishBody = Prim(PrimitiveType.Capsule, "Fish", fish.transform,
                new Vector3(0.8f, Height(0.8f, 14f) + 0.08f, 14f), new Vector3(0.09f, 0.2f, 0.09f), mats.Metal, stripCollider: true);
            fishBody.transform.rotation = Quaternion.Euler(90f, 35f, 0f);
            fish.SetActive(false);

            // ---- the grey dog, twice ----
            var dogNight = BuildDog(mats, new Vector3(12f, Height(12f, 74f), 74f), nightEyes: true);
            var dogDay = BuildDog(mats, new Vector3(8f, Height(8f, 26f), 26f), nightEyes: false);

            // ---- Ipo, delighted with himself ----
            var ipo = new GameObject("IpoRig");
            var ipoPos = new Vector3(4f, Height(4f, 20f) + 0.16f, 20f);
            Prim(PrimitiveType.Sphere, "Body", ipo.transform, ipoPos, new Vector3(0.24f, 0.28f, 0.22f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Sphere, "Head", ipo.transform, ipoPos + new Vector3(0f, 0.26f, 0.04f),
                Vector3.one * 0.16f, mats.Wood, stripCollider: true);
            var ipoTail = Prim(PrimitiveType.Cylinder, "Tail", ipo.transform, ipoPos + new Vector3(0f, 0.18f, -0.22f),
                new Vector3(0.03f, 0.22f, 0.03f), mats.Wood, stripCollider: true);
            ipoTail.transform.rotation = Quaternion.Euler(-40f, 0f, 0f);
            Prim(PrimitiveType.Cube, "Lighter", ipo.transform, ipoPos + new Vector3(0.14f, 0.14f, 0.12f),
                new Vector3(0.04f, 0.06f, 0.03f), mats.FlareRed, stripCollider: true);
            ipo.SetActive(false);

            // ---- the squall's rain ----
            var rain = new GameObject("RainRig");
            rain.transform.position = new Vector3(0f, 14f, 15f);
            var ps = rain.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startLifetime = 1.1f;
            main.startSpeed = 0f;
            main.gravityModifier = 3.4f;
            main.startSize = 0.045f;
            main.maxParticles = 2500;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            var emission = ps.emission;
            emission.rateOverTime = 1000f;
            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Box;
            shape.scale = new Vector3(46f, 1f, 46f);
            var psr = rain.GetComponent<ParticleSystemRenderer>();
            psr.renderMode = ParticleSystemRenderMode.Stretch;
            psr.velocityScale = 0.08f;
            psr.sharedMaterial = ParticleMat("RainDrop", new Color(0.72f, 0.8f, 0.9f, 0.55f));
            rain.SetActive(false);

            // ---- Buri, mid-audit ----
            var buri = new GameObject("BuriRig");
            var buriPos = new Vector3(1.5f, Height(1.5f, 16.5f) + 0.42f, 16.5f);
            var barrel = Prim(PrimitiveType.Capsule, "Body", buri.transform, buriPos,
                new Vector3(0.5f, 0.55f, 0.5f), mats.DarkStone, stripCollider: true);
            barrel.transform.rotation = Quaternion.Euler(78f, 200f, 0f); // nose down in your supplies
            Prim(PrimitiveType.Cylinder, "Snout", buri.transform, buriPos + new Vector3(-0.15f, -0.28f, -0.35f),
                new Vector3(0.14f, 0.1f, 0.14f), mats.Wood, stripCollider: true);
            for (int leg = 0; leg < 4; leg++)
                Prim(PrimitiveType.Cylinder, "Leg", buri.transform,
                    buriPos + new Vector3(leg % 2 == 0 ? -0.22f : 0.22f, -0.35f, leg < 2 ? -0.2f : 0.25f),
                    new Vector3(0.08f, 0.2f, 0.08f), mats.DarkStone, stripCollider: true);
            buri.SetActive(false);

            // ---- Moa and the hawk ----
            var moa = new GameObject("MoaRig");
            var moaPos = new Vector3(10f, Height(10f, 8f) + 0.12f, 8f);
            Prim(PrimitiveType.Sphere, "Hen", moa.transform, moaPos, new Vector3(0.24f, 0.2f, 0.3f), mats.Copper, stripCollider: true);
            var moaTail = Prim(PrimitiveType.Cube, "Tail", moa.transform, moaPos + new Vector3(0f, 0.08f, -0.2f),
                new Vector3(0.06f, 0.16f, 0.14f), mats.DarkStone, stripCollider: true);
            moaTail.transform.rotation = Quaternion.Euler(-35f, 0f, 0f);
            Prim(PrimitiveType.Sphere, "Head", moa.transform, moaPos + new Vector3(0f, 0.16f, 0.16f),
                Vector3.one * 0.1f, mats.Copper, stripCollider: true);
            moa.SetActive(false);

            var hawk = new GameObject("HawkRig");
            var hawkBody = Prim(PrimitiveType.Cube, "Hawk", hawk.transform,
                moaPos + Vector3.up * 11f, new Vector3(0.9f, 0.06f, 0.3f), mats.DarkStone, stripCollider: true);
            var circle = hawkBody.AddComponent<HawkCircle>();
            circle.center = moaPos;
            hawk.SetActive(false);

            // ---- the ship's light, and the flare ----
            var ship = new GameObject("ShipRig");
            NoShadow(Prim(PrimitiveType.Sphere, "Light", ship.transform,
                new Vector3(-280f, 1.6f, -480f), new Vector3(5f, 2.2f, 2.2f), mats.Foam, stripCollider: true));
            ship.AddComponent<ShipCrawl>();
            ship.SetActive(false);

            // ---- Nine: the rock that opens an eye, at the gallery ----
            var nine = new GameObject("NineRig");
            var ninePos = new Vector3(186f, Height(186f, 2f) + 0.15f, 2f);
            Prim(PrimitiveType.Sphere, "Mantle", nine.transform,
                ninePos, new Vector3(0.5f, 0.35f, 0.5f), mats.Rock, stripCollider: true);
            NoShadow(Prim(PrimitiveType.Sphere, "Eye", nine.transform,
                ninePos + new Vector3(0.14f, 0.12f, 0.18f), Vector3.one * 0.09f, mats.Cushion, stripCollider: true));
            for (int arm = 0; arm < 4; arm++)
            {
                var tentacle = Prim(PrimitiveType.Cylinder, "Arm", nine.transform,
                    ninePos + Quaternion.Euler(0f, arm * 85f + 20f, 0f) * new Vector3(0.42f, -0.08f, 0f),
                    new Vector3(0.07f, 0.3f, 0.07f), mats.Rock, stripCollider: true);
                tentacle.transform.rotation = Quaternion.Euler(80f, arm * 85f + 20f, 0f);
            }
            nine.SetActive(false);

            var flare = new GameObject("FlareRig");
            flare.transform.position = new Vector3(0f, 2f, -12f);
            NoShadow(Prim(PrimitiveType.Sphere, "Ball", flare.transform,
                flare.transform.position, Vector3.one * 0.5f, mats.FlareRed, stripCollider: true));
            var flareLightGo = new GameObject("FlareLight");
            flareLightGo.transform.SetParent(flare.transform, false);
            var flareLight = flareLightGo.AddComponent<Light>();
            flareLight.type = LightType.Point;
            flareLight.color = new Color(1f, 0.3f, 0.2f);
            flareLight.range = 120f;
            flareLight.intensity = 5f;
            flare.AddComponent<FlareBurst>();
            flare.SetActive(false);

            // ---- the Boar King: grey-black, plated in scar, one tusk a stump ----
            var king = new GameObject("BoarKingRig");
            LocalPrim(king.transform, PrimitiveType.Capsule, "Body",
                new Vector3(0f, 1.15f, 0f), new Vector3(1.1f, 1.5f, 1.1f), mats.DarkStone, new Vector3(90f, 0f, 0f));
            LocalPrim(king.transform, PrimitiveType.Sphere, "Head",
                new Vector3(0f, 1.15f, 1.6f), Vector3.one * 0.85f, mats.DarkStone);
            LocalPrim(king.transform, PrimitiveType.Cylinder, "Snout",
                new Vector3(0f, 0.95f, 2.1f), new Vector3(0.32f, 0.25f, 0.32f), mats.Wood, new Vector3(90f, 0f, 0f));
            LocalPrim(king.transform, PrimitiveType.Cube, "TuskWhole",
                new Vector3(-0.28f, 0.85f, 2.15f), new Vector3(0.08f, 0.4f, 0.08f), mats.Foam, new Vector3(-35f, 0f, 15f));
            LocalPrim(king.transform, PrimitiveType.Cube, "TuskStump",
                new Vector3(0.28f, 0.8f, 2.1f), new Vector3(0.09f, 0.14f, 0.09f), mats.Foam, new Vector3(-25f, 0f, -10f));
            LocalPrim(king.transform, PrimitiveType.Cube, "ScarPlate",
                new Vector3(0.5f, 1.35f, 0.3f), new Vector3(0.06f, 0.5f, 1.1f), mats.StormGrey);
            LocalPrim(king.transform, PrimitiveType.Cube, "BristleRidge",
                new Vector3(0f, 1.95f, 0.1f), new Vector3(0.12f, 0.22f, 2.2f), mats.DarkStone);
            for (int leg = 0; leg < 4; leg++)
                LocalPrim(king.transform, PrimitiveType.Cylinder, "Leg",
                    new Vector3(leg % 2 == 0 ? -0.5f : 0.5f, 0.45f, leg < 2 ? 0.9f : -0.9f),
                    new Vector3(0.18f, 0.45f, 0.18f), mats.DarkStone);
            king.SetActive(false);

            // ---- the smoke inland: a kept fire's thread against the crown ----
            var smoke = new GameObject("SmokeColumn");
            for (int i = 0; i < 9; i++)
                NoShadow(Prim(PrimitiveType.Sphere, "Puff", smoke.transform,
                    new Vector3(18f + i * 1.2f, 118f + i * 14f, 555f + i * 2f),
                    new Vector3(5f + i * 1.1f, 7f, 5f + i * 1.1f), mats.Cloud, stripCollider: true));
            smoke.SetActive(false);

            // ---- a lantern, a braid, a shotgun (never named here — law #3) ----
            var lantern = new GameObject("LanternShape");
            lantern.transform.position = new Vector3(-20f, Height(-20f, 282f), 282f);
            LocalPrim(lantern.transform, PrimitiveType.Capsule, "Figure",
                new Vector3(0f, 0.85f, 0f), new Vector3(0.42f, 0.85f, 0.42f), mats.DarkStone);
            LocalPrim(lantern.transform, PrimitiveType.Cylinder, "Braid",
                new Vector3(0f, 1.1f, -0.24f), new Vector3(0.06f, 0.5f, 0.06f), mats.StormGrey, new Vector3(12f, 0f, 0f));
            LocalPrim(lantern.transform, PrimitiveType.Cylinder, "Shotgun",
                new Vector3(0.3f, 0.9f, 0.3f), new Vector3(0.05f, 0.55f, 0.05f), mats.Metal, new Vector3(70f, -20f, 0f));
            var lampBall = LocalPrim(lantern.transform, PrimitiveType.Sphere, "Lamp",
                new Vector3(-0.35f, 0.55f, 0.25f), Vector3.one * 0.2f, mats.Flame);
            var lampLightGo = new GameObject("LampLight");
            lampLightGo.transform.SetParent(lampBall.transform, false);
            var lampLight = lampLightGo.AddComponent<Light>();
            lampLight.type = LightType.Point;
            lampLight.color = new Color(1f, 0.75f, 0.45f);
            lampLight.range = 14f;
            lampLight.intensity = 2.4f;
            lantern.SetActive(false);

            // ---- Edda, come down the mountain (ev3_eddavisit) ----
            var eddaCamp = new GameObject("EddaCampRig");
            float ecY = Height(2.2f, 13.2f);
            Prim(PrimitiveType.Capsule, "Body", eddaCamp.transform,
                new Vector3(2.2f, ecY + 0.8f, 13.2f), new Vector3(0.42f, 0.8f, 0.42f), mats.Driftwood, stripCollider: true);
            Prim(PrimitiveType.Sphere, "Head", eddaCamp.transform,
                new Vector3(2.2f, ecY + 1.75f, 13.2f), new Vector3(0.32f, 0.32f, 0.32f), mats.Driftwood, stripCollider: true);
            var ecBraid = Prim(PrimitiveType.Cylinder, "Braid", eddaCamp.transform,
                new Vector3(2.2f, ecY + 1.35f, 13.38f), new Vector3(0.07f, 0.35f, 0.07f), mats.Foam, stripCollider: true);
            ecBraid.transform.rotation = Quaternion.Euler(12f, 0f, 0f);
            var ecGun = Prim(PrimitiveType.Cylinder, "BrokenShotgun", eddaCamp.transform,
                new Vector3(2.55f, ecY + 1.05f, 13.2f), new Vector3(0.05f, 0.5f, 0.05f), mats.DarkStone, stripCollider: true);
            ecGun.transform.rotation = Quaternion.Euler(0f, 0f, 65f); // broken open over one arm
            eddaCamp.SetActive(false);

            // ---- the Halcyon mast, against the far light (ch3_east) ----
            var mast = new GameObject("EastMastRig");
            Prim(PrimitiveType.Cylinder, "Mast", mast.transform,
                new Vector3(640f, 42f, 480f), new Vector3(1.6f, 42f, 1.6f), mats.Metal, stripCollider: true);
            var mastLean = mast.transform.Find("Mast");
            if (mastLean != null) mastLean.rotation = Quaternion.Euler(0f, 0f, 4f); // decades of lean
            Prim(PrimitiveType.Cube, "Rooftop", mast.transform,
                new Vector3(628f, 4f, 470f), new Vector3(26f, 8f, 18f), mats.Foam, stripCollider: true);
            Prim(PrimitiveType.Cube, "Rooftop", mast.transform,
                new Vector3(654f, 3f, 492f), new Vector3(18f, 6f, 14f), mats.Foam, stripCollider: true);
            mast.SetActive(false);

            // ---- the director ----
            var directorGo = new GameObject("EncounterDirector");
            var director = directorGo.AddComponent<EncounterStageDirector>();
            director.eddaCampRig = eddaCamp;
            director.eastMastRig = mast;
            director.grinRig = GameObject.Find("GrinRig");
            director.velaRig = vela;
            director.fishDrop = fish;
            director.dogNightRig = dogNight;
            director.dogDayRig = dogDay;
            director.ipoRig = ipo;
            director.rainRig = rain;
            director.buriRig = buri;
            director.moaRig = moa;
            director.hawkRig = hawk;
            director.shipRig = ship;
            director.flareRig = flare;
            director.nineRig = nine;
            director.boarKingRig = king;
            director.smokeColumn = smoke;
            director.lanternShape = lantern;
            return director;
        }

        /// <summary>A storm-grey dog: capsule body, head, ears, tail — and at
        /// night, two eyes catching the lagoon glow.</summary>
        static GameObject BuildDog(Mats mats, Vector3 groundPos, bool nightEyes)
        {
            var dog = new GameObject(nightEyes ? "DogNightRig" : "DogDayRig");
            var body = Prim(PrimitiveType.Capsule, "Body", dog.transform,
                groundPos + new Vector3(0f, 0.52f, 0f), new Vector3(0.32f, 0.5f, 0.32f), mats.StormGrey, stripCollider: true);
            body.transform.rotation = Quaternion.Euler(nightEyes ? 90f : 62f, 200f, 0f); // day pose sits back
            Prim(PrimitiveType.Sphere, "Head", dog.transform,
                groundPos + new Vector3(-0.12f, nightEyes ? 0.72f : 0.95f, -0.42f), Vector3.one * 0.3f, mats.StormGrey, stripCollider: true);
            Prim(PrimitiveType.Cube, "EarL", dog.transform,
                groundPos + new Vector3(-0.22f, nightEyes ? 0.92f : 1.15f, -0.42f), new Vector3(0.07f, 0.14f, 0.05f), mats.StormGrey, stripCollider: true);
            Prim(PrimitiveType.Cube, "EarR", dog.transform,
                groundPos + new Vector3(-0.02f, nightEyes ? 0.92f : 1.15f, -0.42f), new Vector3(0.07f, 0.14f, 0.05f), mats.StormGrey, stripCollider: true);
            var tail = Prim(PrimitiveType.Cylinder, "Tail", dog.transform,
                groundPos + new Vector3(0.05f, 0.55f, 0.42f), new Vector3(0.05f, 0.24f, 0.05f), mats.StormGrey, stripCollider: true);
            tail.transform.rotation = Quaternion.Euler(35f, 0f, 0f);
            for (int leg = 0; leg < 4; leg++)
                Prim(PrimitiveType.Cylinder, "Leg", dog.transform,
                    groundPos + new Vector3(leg % 2 == 0 ? -0.16f : 0.12f, 0.22f, leg < 2 ? -0.28f : 0.26f),
                    new Vector3(0.06f, 0.24f, 0.06f), mats.StormGrey, stripCollider: true);
            if (nightEyes)
            {
                var glowMat = Mat("HeartglassGlow", new Color(0.25f, 0.95f, 0.85f), 0.9f);
                NoShadow(Prim(PrimitiveType.Sphere, "EyeL", dog.transform,
                    groundPos + new Vector3(-0.2f, 0.74f, -0.55f), Vector3.one * 0.045f, glowMat, stripCollider: true));
                NoShadow(Prim(PrimitiveType.Sphere, "EyeR", dog.transform,
                    groundPos + new Vector3(-0.08f, 0.74f, -0.55f), Vector3.one * 0.045f, glowMat, stripCollider: true));
            }
            dog.SetActive(false);
            return dog;
        }

        // ================= the raft: the early door out =================
        static void BuildRaftSite(Mats mats)
        {
            float rx = -24f, rz = 4f;
            float ry = Mathf.Max(Height(rx, rz), 0.15f);
            var site = new GameObject("RaftSite");
            site.transform.position = new Vector3(rx, ry, rz);

            // the spot announces itself: two logs already dragged together
            Prim(PrimitiveType.Cylinder, "MarkerLog", site.transform,
                new Vector3(rx - 0.5f, ry + 0.15f, rz), new Vector3(0.16f, 1.4f, 0.16f), mats.Driftwood, stripCollider: true)
                .transform.rotation = Quaternion.Euler(90f, 8f, 0f);
            Prim(PrimitiveType.Cylinder, "MarkerLog2", site.transform,
                new Vector3(rx + 0.4f, ry + 0.15f, rz + 0.4f), new Vector3(0.16f, 1.2f, 0.16f), mats.Driftwood, stripCollider: true)
                .transform.rotation = Quaternion.Euler(90f, -14f, 0f);

            var stage1 = new GameObject("Stage1_Frame");
            stage1.transform.SetParent(site.transform, true);
            stage1.transform.position = site.transform.position;
            for (int i = 0; i < 4; i++)
                Prim(PrimitiveType.Cylinder, "Log", stage1.transform,
                    new Vector3(rx - 0.9f + i * 0.6f, ry + 0.22f, rz + 1.6f), new Vector3(0.18f, 1.6f, 0.18f), mats.Driftwood, stripCollider: true)
                    .transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            stage1.SetActive(false);

            var stage2 = new GameObject("Stage2_Rigged");
            stage2.transform.SetParent(site.transform, true);
            stage2.transform.position = site.transform.position;
            Prim(PrimitiveType.Cube, "Deck", stage2.transform,
                new Vector3(rx, ry + 0.35f, rz + 1.6f), new Vector3(2.6f, 0.1f, 2f), mats.Driftwood, stripCollider: true);
            Prim(PrimitiveType.Cylinder, "Mast", stage2.transform,
                new Vector3(rx, ry + 1.6f, rz + 1.6f), new Vector3(0.08f, 1.2f, 0.08f), mats.Wood, stripCollider: true);
            Prim(PrimitiveType.Cube, "Sail", stage2.transform,
                new Vector3(rx, ry + 1.9f, rz + 1.75f), new Vector3(1.4f, 1.1f, 0.04f), mats.Cushion, stripCollider: true);
            stage2.SetActive(false);

            var raft = site.AddComponent<RaftSite>();
            raft.stage1Visual = stage1;
            raft.stage2Visual = stage2;
            raft.interactRadius = 3.2f;
        }

        // ================= Kavi, the companion himself =================
        /// <summary>
        /// The persistent dog: a rig that lives in the scene from day one
        /// and self-gates (KaviController shows him only once the Clearing
        /// chose him). Model parts are LOCAL children so the controller can
        /// move the root; the encounter rigs are separate set-dressing.
        /// </summary>
        static void BuildKavi(Mats mats)
        {
            var root = new GameObject("Kavi");
            root.transform.position = new Vector3(14f, Height(14f, 70f), 70f); // starts at the treeline he came from

            var model = new GameObject("Model");
            model.transform.SetParent(root.transform, false);

            LocalPrim(model.transform, PrimitiveType.Capsule, "Body",
                new Vector3(0f, 0.55f, 0f), new Vector3(0.34f, 0.5f, 0.34f), mats.StormGrey, new Vector3(90f, 0f, 0f));
            LocalPrim(model.transform, PrimitiveType.Sphere, "Head",
                new Vector3(0f, 0.78f, 0.45f), Vector3.one * 0.3f, mats.StormGrey);
            LocalPrim(model.transform, PrimitiveType.Cube, "Snout",
                new Vector3(0f, 0.72f, 0.62f), new Vector3(0.12f, 0.1f, 0.18f), mats.StormGrey);
            LocalPrim(model.transform, PrimitiveType.Cube, "EarL",
                new Vector3(-0.09f, 0.98f, 0.42f), new Vector3(0.07f, 0.15f, 0.05f), mats.StormGrey);
            LocalPrim(model.transform, PrimitiveType.Cube, "EarR",
                new Vector3(0.09f, 0.98f, 0.42f), new Vector3(0.07f, 0.15f, 0.05f), mats.StormGrey);
            for (int leg = 0; leg < 4; leg++)
                LocalPrim(model.transform, PrimitiveType.Cylinder, "Leg",
                    new Vector3(leg % 2 == 0 ? -0.14f : 0.14f, 0.26f, leg < 2 ? 0.28f : -0.28f),
                    new Vector3(0.06f, 0.26f, 0.06f), mats.StormGrey);
            // the old burn along one flank, where the fur grows wrong
            LocalPrim(model.transform, PrimitiveType.Cube, "Scar",
                new Vector3(0.17f, 0.6f, -0.05f), new Vector3(0.02f, 0.14f, 0.3f), mats.DarkStone);
            var tail = LocalPrim(model.transform, PrimitiveType.Cylinder, "Tail",
                new Vector3(0f, 0.62f, -0.5f), new Vector3(0.05f, 0.24f, 0.05f), mats.StormGrey, new Vector3(35f, 0f, 0f));
            var wag = tail.AddComponent<TailWag>();

            var controller = root.AddComponent<KaviController>();
            controller.model = model;
            controller.tailWag = wag;

            var interactable = root.AddComponent<KaviInteractable>();
            interactable.controller = controller;
            interactable.interactRadius = 3f;

            model.SetActive(false); // the controller decides when he's real
        }

        static GameObject LocalPrim(Transform parent, PrimitiveType type, string name,
            Vector3 localPos, Vector3 localScale, Material mat, Vector3 localEuler = default)
        {
            var go = GameObject.CreatePrimitive(type);
            go.name = name;
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            go.transform.localScale = localScale;
            go.transform.localRotation = Quaternion.Euler(localEuler);
            go.GetComponent<MeshRenderer>().sharedMaterial = mat;
            Object.DestroyImmediate(go.GetComponent<Collider>());
            return go;
        }

        static Material ParticleMat(string name, Color color)
        {
            string path = MaterialDir + "/" + name + ".mat";
            var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (mat == null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Particles/Unlit");
                if (shader == null) shader = Shader.Find("Universal Render Pipeline/Unlit");
                mat = new Material(shader);
                AssetDatabase.CreateAsset(mat, path);
            }
            mat.SetColor("_BaseColor", color);
            EditorUtility.SetDirty(mat);
            return mat;
        }

        // ================= systems, player, camera, sun =================
        static void BuildLightingAndAtmosphere(out GameObject systemsHost)
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.55f, 0.58f, 0.62f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.Exponential;
            // thin enough that the broken crown reads from the beach; the
            // haze still eats the horizon
            RenderSettings.fogDensity = 0.0035f;
            var skybox = AssetDatabase.GetBuiltinExtraResource<Material>("Default-Skybox.mat");
            if (skybox != null) RenderSettings.skybox = skybox;

            systemsHost = new GameObject("Game");
            systemsHost.AddComponent<GameClock>();
        }

        static void BuildPlayerCameraAndSystems(GameObject systemsHost, PrologueStageDirector director,
            EncounterStageDirector encounterDirector)
        {
            // ---- sun ----
            var sunGo = new GameObject("Sun");
            var sun = sunGo.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.shadows = LightShadows.Soft;
            RenderSettings.sun = sun;
            var cycle = sunGo.AddComponent<SunCycle>();
            cycle.clock = systemsHost.GetComponent<GameClock>();
            if (director != null && director.underwaterRig != null)
                director.underwaterRig.GetComponent<UnderwaterDrift>().sun = cycle;
            if (encounterDirector != null) encounterDirector.sun = cycle;

            // ---- player ----
            float px = 0f, pz = 6f;
            var player = new GameObject("Player") { layer = 2 }; // Ignore Raycast: camera sees past it
            player.transform.position = new Vector3(px, Height(px, pz) + 0.2f, pz);
            player.transform.rotation = Quaternion.Euler(0f, 180f + 25f, 0f); // wakes facing up the beach

            var body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Body";
            body.layer = 2;
            Object.DestroyImmediate(body.GetComponent<Collider>());
            body.transform.SetParent(player.transform, false);
            body.transform.localPosition = new Vector3(0f, 0.95f, 0f);
            var nose = GameObject.CreatePrimitive(PrimitiveType.Cube);
            nose.name = "Nose"; // makes the facing readable on a grey capsule
            nose.layer = 2;
            Object.DestroyImmediate(nose.GetComponent<Collider>());
            nose.transform.SetParent(player.transform, false);
            nose.transform.localPosition = new Vector3(0f, 1.45f, 0.35f);
            nose.transform.localScale = new Vector3(0.22f, 0.12f, 0.28f);

            var cc = player.AddComponent<CharacterController>();
            cc.height = 1.8f;
            cc.radius = 0.4f;
            cc.center = new Vector3(0f, 0.95f, 0f);
            cc.slopeLimit = 50f;

            var controller = player.AddComponent<PlayerController>();
            var interactor = player.AddComponent<PlayerInteractor>();

            // ---- camera ----
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" };
            var cam = camGo.AddComponent<Camera>();
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 3000f; // the open ocean and the crown must reach the horizon
            camGo.AddComponent<AudioListener>();
            var orbit = camGo.AddComponent<OrbitCamera>();
            orbit.target = player.transform;
            camGo.transform.position = player.transform.position + new Vector3(0f, 3f, -4f);

            // ---- game manager wiring ----
            systemsHost.AddComponent<RegionTracker>();
            var gm = systemsHost.AddComponent<GameManager>();
            gm.clock = systemsHost.GetComponent<GameClock>();
            gm.player = controller;
            gm.cam = orbit;
            gm.interactor = interactor;
            gm.prologueDirector = director;
            gm.encounterDirector = encounterDirector;
            controller.cameraTransform = camGo.transform;
            controller.gm = gm;
            interactor.gm = gm;
        }

        static void AddToBuildSettings()
        {
            var scenes = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            if (!scenes.Exists(s => s.path == ScenePath))
            {
                scenes.Add(new EditorBuildSettingsScene(ScenePath, true));
                EditorBuildSettings.scenes = scenes.ToArray();
            }
        }

        // ================= helpers =================
        static GameObject Prim(PrimitiveType type, string name, Transform parent,
            Vector3 pos, Vector3 scale, Material mat, bool stripCollider = false)
        {
            var go = GameObject.CreatePrimitive(type);
            go.name = name;
            go.transform.SetParent(parent, true);
            go.transform.position = pos;
            go.transform.localScale = scale;
            go.GetComponent<MeshRenderer>().sharedMaterial = mat;
            if (stripCollider) Object.DestroyImmediate(go.GetComponent<Collider>());
            return go;
        }

        static float Rnd(float min, float max) => min + (float)_rng.NextDouble() * (max - min);
    }
}
