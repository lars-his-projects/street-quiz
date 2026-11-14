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
