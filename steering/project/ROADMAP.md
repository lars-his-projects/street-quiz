# Roadmap

The goals of street-quiz and their features: done (`[x]`) or missing (`[ ]`). The `roadmap` skill makes the next epic from a missing feature.

## 1. Learn the streets of an area

- [ ] `area:skeleton` One small area that is in the app, on a map with no street names: the app marks a street and you type its name
  - The app runs on a phone from its public address, with no account
  - A right answer and a wrong answer look different, and the next street comes
- [x] `area:name` You type the name of an area, such as "Amsterdam", and the app takes each street with a name in that area
  - The area can be a city, a town, a village or a part of a city, in each country
  - When more than one area has the name, you select the correct one from a list
  - The parts of one street count as one street
  - The street data comes from OpenStreetMap and stays on the device for the next visit
- [ ] `area:fun` The quiz is fun to play
  - A round has a score and a streak of right answers
  - A good moment gets a small reward on the screen, and the next street comes with no wait
- [ ] `area:typing` A typed answer that is almost correct counts
  - Capital letters, accents and a short form such as "str." do not make an answer wrong
- [ ] `area:progress` The app remembers what you know
  - A street that you missed comes back sooner than a street that you know
  - Each area shows how many of its streets you know
  - A large city works: a round has a part of its streets
- [ ] `area:prove` A proof round: each street of the area one time, with a result at the end
  - The result shows the score and the streets that you missed
- [ ] `area:saved` More than one area, each with a name of yours
  - You can switch between areas, change a name and remove an area

## 2. More ways to answer

- [ ] `answer:choices` Answer with four options in place of typing
  - Easy: the wrong options are random streets of the area
  - Hard: the wrong options are streets near the marked street
- [ ] `answer:tap` The other direction: the app gives a name and you tap the street on the map
  - A tap near the street counts, and the app shows the correct street after a wrong tap

## 3. Select what you learn

- [ ] `rank:formula` The app ranks the streets of an area from large to small
  - The rank uses values from OpenStreetMap: the length of the street, its road class and its number of lanes
  - A long quay with little traffic does not rank above a main street
- [ ] `rank:levels` Three levels select how many streets you learn: easy, medium and hard
  - Easy has only the largest streets, and each next level adds smaller streets
  - A level shows its number of streets before you start
  - "The 100 largest streets of Amsterdam" is one selection
- [ ] `rank:why` Each street shows why it is in its level
- [ ] `rank:exclude` Remove a street that does not belong to your selection
  - A removed street stays out of the quiz and out of the score of that area
- [ ] `select:draw` You draw a shape on the map with a finger, and the app takes each street with a name inside the shape
  - You can scroll and zoom the map before and after you draw
- [ ] `select:route` Give a start and an end, with stops between them: the app makes a route and you learn its streets
  - The route follows roads, and the quiz has the streets in the sequence of the route
  - An "extended" switch adds the side streets of the route
- [ ] `select:next` A quiz that asks for the next street of the route

## 4. A good app for everyone

- [ ] `app:access` Each person can use the app
  - The app works with a keyboard and with a screen reader, and the text stays readable at a large text size
  - The colors are not the only sign of a right or a wrong answer
- [ ] `app:offline` The app and a saved area work with no internet
- [ ] `app:languages` The texts of the app are in English and Dutch
- [ ] `app:share` Share an area or a route with a link, and the other person gets the same streets
- [ ] `app:feedback` A feedback button sends what you saw and what you did (the feedback standard of the fleet)

## 5. More than streets

- [ ] `kinds:bridges` The bridges of an area: the app marks a bridge and you give its name
  - The names come from OpenStreetMap. The street script leaves the bridges out of the streets now (`scripts/fetch_area.py`)
- [ ] `kinds:zones` The zones of an area: the app marks a zone, such as the Jordaan in Amsterdam, and you give its name
  - A zone is a part of a city with a name: a neighbourhood, a quarter or a district
- [ ] `kinds:select` You select what you learn in an area: streets, bridges, zones or a mix
- [ ] `kinds:more` Other things with a name on the map
  - Ideas: squares, parks, canals and stations. The owner selects the kinds: one card with examples from one area
