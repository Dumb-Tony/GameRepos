using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// THE CYCLONE — ev5_cyclone ported from scenes-chapter5.js: the
    /// season's true fist on the fifty-eighth night, and COLD FIRE's proper
    /// vehicle — the one death that is purely the sum of small skipped
    /// choices. The island's law holds: the death only exists for a camp
    /// below tier 2 when the night's question is asked (the enter effects
    /// have already taken their tier first, exactly as the VN does), the
    /// stay-choice carries its warning in plain text, and the flee-choice
    /// is always offered. V1 adaptations noted inline: the Kavi, Vela
    /// (mantled or gone — her whole arc, by storm-light) and solo lines are
    /// live (other companions arrive with their phases), and v1 camps are
    /// always the beach, so the overhang branches wait dormant for the site
    /// choice to exist.
    /// </summary>
    public static class CycloneNight
    {
        public static void AddTo(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev5_cyclone",
                OnEnter = s =>
                {
                    if (s.Is("CYCLONE_APPLIED")) return;
                    s.SetFlag("CYCLONE_APPLIED");
                    if (s.Site == "overhang") s.Stat(Meter.Hope, 4);
                    else if (s.Shelter >= 3) { s.Stat(Meter.Energy, -6); s.Stat(Meter.Hope, 2); }
                    else
                    {
                        if (s.Shelter > 0) s.Shelter -= 1;
                        s.Stat(Meter.Energy, -14);
                        s.Stat(Meter.Hope, -6);
                        s.Stat(Meter.Health, -6);
                    }
                    if (s.Fire > 0 && s.Site != "overhang")
                    {
                        s.Fire = 0;
                        s.FireFuel = 0f;
                    }
                    if (s.Companion == "vela" && s.Trust >= 75) s.SetFlag("VELA_MANTLED");
                    if (s.Companion == "kavi") s.SetFlag("KAVI_FIRE_NIGHT");
                },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "The season's true fist arrives on the fifty-eighth night: a cyclone's outer arm, and the world simply becomes velocity. Rain traveling flat. The reef's roar relocated directly overhead. Trees inland surrendering with sounds like artillery.",
                    };
                    t.Add(s.Site == "overhang"
                        ? "And you sit behind fifty feet of stone with your fire burning — <i>burning</i>, in this — listening to the apocalypse miss you by a geological accident you chose on Day 4. You have never loved a rock before."
                        : s.Shelter >= 3
                            ? "Your fortified camp takes it the way a good hull takes a sea: groaning, flexing, shedding. You lose thatch, a windbreak, a night's sleep — and keep everything that bleeds. Every hour you ever spent bracing and lashing pays out tonight, with interest."
                            : "Your camp loses its argument with the sky in the first hour. After that it's endurance: you and everything living pressed into the lee of what holds, taking the night one gust at a time while your work disassembles around you in the dark.");
                    if (s.Companion == "vela")
                        t.Add(s.Is("VELA_MANTLED")
                            ? "And Vela stays. The storm-wise one, the one with a hidden roost and a blind eye full of cyclone history and every reason to be gone — she plants herself on your food cache in the screaming dark, shaking, wings mantled over it like it's a nest, her whole broken-weather past held down by will alone, because the flock she has left is you and yours. In the morning she is soaked to the pin-feathers and furious and PRESENT, and you understand you have seen the whole of her heart, once, by storm-light."
                            : "Vela was gone before the front hit — storm-wise as ever, to her hidden roost — and the night is longer for the empty snag where the weight of her should be.");
                    if (s.Companion == "kavi")
                        t.Add(s.Is("KAVI_FIRE_NIGHT") && s.Site == "overhang"
                            ? "The fire is Kavi's war tonight: it must burn — the overhang holds it safe — and so he lies all night at the far wall, ears flat, watching his oldest enemy dance in the wind-eddies, trembling and unmoving, guarding you from inside his fear. Twice you wake and find his eyes going between you and the flames, doing sums. Twice you put your hand on the scarred flank until the shaking stops."
                            : "Lightning walks the inland ridges half the night, and with every white crash Kavi presses harder against you — the burn-scar side, always turned away from the flashes. You keep one hand on him through the worst of it, and he lets you, which is its own kind of milestone.");
                    if (s.Companion == null)
                        t.Add(s.Is("COCO")
                            ? "You ride it out alone with Coco under one arm — you fetched him in from the shelf at the first real gust, an act you have elected not to examine — and you talk to him through the worst hours, steady nothing-talk, the way you'd steady a rookie. It helps. You have also elected not to examine why."
                            : "You ride it out alone, small and low and patient, talking yourself through the worst hours the way you'd steady a rookie: steady nothing-talk, one gust at a time. It helps more than it should.");
                    if (s.Shelter <= 1 && s.Site != "overhang")
                        t.Add("And then, an hour before the worst of it, the night puts its real question: what's left of your camp is coming apart lash by lash, your fire is dead, the cold rain is finding everything — and the storm has HOURS left in its arm. Stay with your work, or give the night your camp and keep the body.");
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    // COLD FIRE: the one death that is purely the sum of small
                    // skipped choices — it only exists for a camp below tier 2
                    // outside the overhang, measured AFTER the storm's first take
                    new StoryChoice
                    {
                        Label = "Abandon camp. Burrow into the fringe root-vaults till dawn.",
                        Sub = "Lose the night, some gear, and every shred of comfort — keep the pulse.",
                        When = s => s.Shelter <= 1 && s.Site != "overhang",
                        Do = s =>
                        {
                            s.Fire = 0;
                            s.FireFuel = 0f;
                            if (s.Shelter > 0) s.Shelter -= 1;
                            s.Stat(Meter.Energy, -16);
                            s.Stat(Meter.Health, -8);
                            s.Stat(Meter.Hope, -6);
                        },
                        Go = "ev5_cyclone_flee",
                    },
                    new StoryChoice
                    {
                        Label = "Stay. Hold what's left of camp together with your hands.",
                        Sub = "WARNING: what's left of a shelter, no fire, and hours of cyclone to go. This is the storm every skipped choice was saving up for.",
                        When = s => s.Shelter <= 1 && s.Site != "overhang",
                        Do = s => s.DeathCause = "coldfire",
                    },
                },
                NextLabel = "Morning, eventually",
            });

            script.Add(new StoryScene
            {
                Id = "ev5_cyclone_flee",
                Text = _ => new List<string>
                {
                    "You wedge yourself into the buttress-roots of the biggest fig on the fringe with your knees to your chest and the world ending overhead, and you spend the cyclone the way the island's oldest things spend it: small, low, and patient.",
                    "Dawn arrives grey and ringing. Your camp is a debris field, your hands won't close, and you are alive — entirely, undramatically alive — because at the one moment it mattered you chose the body over the work. The island respects nothing more. Rebuilding is a thing the living get to do.",
                },
                NextLabel = "Morning, eventually",
            });
        }
    }
}
