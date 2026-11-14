# Principles

The direction of street-quiz, made from the owner's decisions (`steering/project/DECISIONS.md`).
The runs add a principle when the owner decides a question (the `ticket` skill, "Decision tickets"). Agents: before
you recommend an option, compare it with these principles and name the principle ("follows P1").

## P1. A flashcard, not a trivia game

The questions are plain: the name of a marked street, or the street of a given name. The app asks no question about
history or facts. Example: the quiz never asks who a street is named after.
Later the same holds for other things with a name on the map, such as a bridge or a zone (the Jordaan as an
answer): goal 5 of `ROADMAP.md` (owner, 2026-11-14).

## P2. A real map

The user scrolls and zooms a real map. A street is a shape on the map from OpenStreetMap, not a picture with fixed
pixels. The names on the map stay hidden during a quiz.

## P3. Open data and free services

The map and the streets come from OpenStreetMap. The app uses no paid service and no key in the browser. A service
with a cost or a key needs a decision ticket. Obey the usage policy of each free service, and keep the data on the
device. Tests and CI use stored data: they send no request to a map or data service. An agent can get data from an
OpenStreetMap service on purpose, to make the stored data of an area or of a test (owner, 2026-11-14): few and small
requests, one at a time, with the name of the project in the User-Agent. For a look at a page, an agent loads the
real map in a browser, as a user does: one load for each image. A page check with no map does not show that the
map works. A step that a machine can do is not a step for the owner.

## P4. Phone first, no account, for everyone

The app works on a phone with one hand. The progress stays on the device. The app has no login and no server of its own.
Each person can open the app and use it for an area in each country (owner, 2026-11-13). The pages follow the
accessibility rules of the design standard of the fleet.

## P5. The user can see how streets are selected

A formula with values from OpenStreetMap decides which streets are large. The app shows these values, and the user can
remove a street from a selection.

## P6. Fun first

The quiz feels like a game: it is fast, it has a score and a streak, and a good moment gets a small reward on the
screen (owner, 2026-11-13). The fun comes from the pace and the feedback, not from trivia (P1). A feature that makes
the quiz slow or heavy needs a strong reason.

## P7. Start simple, then add ways

The first way to select streets is the name of an area, and the first way to answer is to type the name (owner,
2026-11-13). More ways to select an area, the levels and more ways to answer come later, in the sequence of the roadmap.

## Owner involvement

The areas where the owner decides each choice, also when one option is clearly best (a decision ticket). In all
other areas the agents decide, and ask only when two options are equally good.

- Only real ties.
- The look follows the design standard of the fleet: one design system, approved one time.

## Try a feature

How the owner tries a new feature. The agents make what this needs for each feature or epic.

- A live preview: each merge to `main` goes to GitHub Pages (https://lars-his-projects.github.io/street-quiz/). The
  owner opens it on a phone. The first roadmap feature makes the deploy workflow.
