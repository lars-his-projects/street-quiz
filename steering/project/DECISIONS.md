# Decisions: street-quiz

The log of the owner's decisions about this project: one line per decision, the newest at the end.
`steering/project/PRINCIPLES.md` generalizes them. Runs only add lines here.

Columns: date · ticket · decision · recommendation (`taken`, `changed`: the owner combined or changed it, `other`:
the owner chose another option, `agent`: an agent decided and logged it, `-`: no recommendation) · principle
(`P<n>`, or `new` when no principle predicts it).

- 2026-11-13 · hub card 7 · The project starts: a quiz on a real map to learn the street names of an area. The owner is Larspolo only; Jeroen is a collaborator and not an owner · changed · new
- 2026-11-13 · hub card 7 · The app is fun, and each person can use it · other · P6, P4
- 2026-11-13 · hub card 7 · The first selection is the name of an area. The shape drawing, the levels and more ways to answer come later · changed · P7
- 2026-11-14 · hub card 6 · The starter session of the hub starts the runs of this project. The starter cannot select the effort of a run, so `.claude/settings.json` sets `effortLevel` to `low` for each run of this project. Raise it when the epics or the reviews of the deep lane are poor · agent · new (the quota standard S4 of the hub)
- 2026-11-14 · session · The weekly pace does not limit the runs of this project until the owner can try the first version (`week_guard = false`); then it goes back to the pace of the other projects · other · new
- 2026-11-14 · #8 · An agent can get OpenStreetMap data on purpose for the stored data of an area or of a test. Tests and CI keep stored data. Before, the rule P3 gave this step to the owner · changed · P3
- 2026-11-14 · #8 · For a look at a page, an agent loads the real map in a browser. This is the agent's reading of the owner's decision in the line above. The cause: three page checks with all outside requests blocked did not see that the live map was empty · agent · P3
- 2026-11-14 · #8 · A street of the quiz is a way that the public can use. A platform of a stop, the name of a bridge and a dot shorter than 15 m are not streets (`scripts/fetch_area.py`). The Jordaan gave 151 names, and 106 are streets · agent · P1
- 2026-11-14 · session · The lanes get the names of their models: `haiku`, `sonnet`, `opus` and `fable`. The owner saw that `main` and `deep` were both Opus at medium effort (the line `effortLevel` of the settings did not change the effort). An agent decided the roles: Opus stays the default lane and does the planning work; the label `lane:deep` becomes `lane:fable`; Sonnet is a new lane for clear tickets · taken (owner), the roles: agent · new (the quota standard S4 of the hub)
- 2026-11-14 · session · A later feature: the quiz has more kinds than streets, such as bridges and zones (the Jordaan as an answer), and maybe other kinds. It is goal 5 of the roadmap, after the other goals · - · P1
