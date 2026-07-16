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
            BuildBounds();
            BuildJungleWall(mats);
            BuildWreck(mats);
            BuildRocksAndTrickle(mats);
            BuildPalms(mats);
            BuildBerryBushes(mats);
            BuildDriftwood(mats);
            BuildCamp(mats);
            BuildSosSite(mats);
            BuildPlayerCameraAndSystems(gameClockHost);

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
            sea.isStatic = true;
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
                Prim(PrimitiveType.Sphere, "Canopy", parent.transform,
                    new Vector3(x + Rnd(-1f, 1f), y + 5.6f + Rnd(0f, 1.5f), z + Rnd(-1f, 1f)),
                    new Vector3(Rnd(3f, 4.6f), Rnd(1.8f, 2.6f), Rnd(3f, 4.6f)), mats.JungleDark, stripCollider: true);
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
            for (int i = 0; i < 8; i++)
            {
                float x = Mathf.Lerp(-80f, 80f, i / 7f) + Rnd(-8f, 8f);
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
                Prim(PrimitiveType.Sphere, "Bush", bush.transform,
                    new Vector3(x, y + 0.7f, z), new Vector3(1.8f, 1.3f, 1.8f), mats.Leaf, stripCollider: true);
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
            for (int i = 0; i < 10; i++)
            {
                float x = Mathf.Lerp(-60f, 60f, i / 9f) + Rnd(-4f, 4f);
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

        // ================= systems, player, camera, sun =================
        static void BuildLightingAndAtmosphere(out GameObject systemsHost)
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.55f, 0.58f, 0.62f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.Exponential;
            RenderSettings.fogDensity = 0.006f;
            var skybox = AssetDatabase.GetBuiltinExtraResource<Material>("Default-Skybox.mat");
            if (skybox != null) RenderSettings.skybox = skybox;

            systemsHost = new GameObject("Game");
            systemsHost.AddComponent<GameClock>();
        }

        static void BuildPlayerCameraAndSystems(GameObject systemsHost)
        {
            // ---- sun ----
            var sunGo = new GameObject("Sun");
            var sun = sunGo.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.shadows = LightShadows.Soft;
            RenderSettings.sun = sun;
            var cycle = sunGo.AddComponent<SunCycle>();
            cycle.clock = systemsHost.GetComponent<GameClock>();

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
