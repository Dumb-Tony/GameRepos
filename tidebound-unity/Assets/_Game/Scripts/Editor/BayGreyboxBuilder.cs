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
        /// <summary>The bay's height function — also used to sit objects on the sand.</summary>
        static float Height(float x, float z)
        {
            float slope = z < 0f
                ? z * 0.16f                                   // shelf falling into the sea
                : 6f * Smooth01(z / 95f);                     // dune rising to the treeline
            float bowl = 3.5f * Smooth01((Mathf.Abs(x) - 78f) / 42f); // headlands close the bay
            float noise = (Mathf.PerlinNoise(x * 0.035f + 7.3f, z * 0.035f + 2.1f) - 0.5f) * 1.1f;
            return slope + bowl + noise - 0.15f;
        }

        static float Smooth01(float t)
        {
            t = Mathf.Clamp01(t);
            return t * t * (3f - 2f * t);
        }

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
            const int nx = 97, nz = 81;
            const float x0 = -120f, x1 = 120f, z0 = -60f, z1 = 140f;

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
                (new Vector3(-40f, 10f, 260f), new Vector3(260f, 90f, 200f)),
                (new Vector3(90f, 5f, 320f), new Vector3(220f, 70f, 190f)),
                (new Vector3(-140f, 0f, 330f), new Vector3(200f, 55f, 170f)),
                (new Vector3(20f, 20f, 420f), new Vector3(300f, 150f, 240f)), // the mountain itself
                (new Vector3(150f, 0f, 460f), new Vector3(180f, 60f, 160f)),
            };
            foreach (var (pos, scale) in domes)
                NoShadow(Prim(PrimitiveType.Sphere, "Terrace", parent.transform, pos, scale, mats.Mountain, stripCollider: true));

            // the broken crown: two rim stubs with the break between them
            NoShadow(Prim(PrimitiveType.Cylinder, "CrownWest", parent.transform,
                new Vector3(-8f, 105f, 415f), new Vector3(52f, 26f, 48f), mats.Mountain, stripCollider: true));
            NoShadow(Prim(PrimitiveType.Cylinder, "CrownEast", parent.transform,
                new Vector3(58f, 96f, 428f), new Vector3(40f, 20f, 38f), mats.Mountain, stripCollider: true));

            parent.isStatic = true;
        }

        static GameObject NoShadow(GameObject go)
        {
            go.GetComponent<MeshRenderer>().shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            return go;
        }

        static void BuildBounds()
        {
            var parent = new GameObject("Bounds");
            Wall(parent.transform, "SeaWall", new Vector3(0, 4f, -12f), new Vector3(400f, 12f, 1f));
            Wall(parent.transform, "JungleWall", new Vector3(0, 6f, 76f), new Vector3(400f, 16f, 1f));
            Wall(parent.transform, "WestWall", new Vector3(-105f, 8f, 30f), new Vector3(1f, 20f, 220f));
            Wall(parent.transform, "EastWall", new Vector3(105f, 8f, 30f), new Vector3(1f, 20f, 220f));
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
            var parent = new GameObject("JungleFringe");
            for (int i = 0; i < 46; i++)
            {
                float x = Rnd(-115f, 115f);
                float z = Rnd(78f, 98f);
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

            var shelter = site.AddComponent<ShelterInteractable>();
            shelter.tier1Visual = tier1;
            shelter.tier2Visual = tier2;
            shelter.interactRadius = 3.2f;
        }

        static void BuildSosSite(Mats mats)
        {
            float ox = 22f, oz = 9f;
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
                            Prim(PrimitiveType.Cube, "Stone", letters.transform,
                                new Vector3(x, Height(x, z) + 0.12f, z),
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

            // ---- the director ----
            var directorGo = new GameObject("EncounterDirector");
            var director = directorGo.AddComponent<EncounterStageDirector>();
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
