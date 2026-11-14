/** The answer form of the quiz. The app and the style page (`style.html`) use this one markup. */
export interface QuizForm {
  form: HTMLFormElement;
  input: HTMLInputElement;
  feedback: HTMLElement;
  options: HTMLElement;
}

/** The ways to answer (#39): type the name, or tap one of four names (easy: random streets, hard: near streets). */
export type Mode = "type" | "easy" | "hard";
export const MODES: Mode[] = ["type", "easy", "hard"];

export function createForm(): QuizForm {
  const form = document.createElement("form");
  form.className = "quiz";
  form.autocomplete = "off";
  form.innerHTML = `<div class="modes" role="radiogroup" aria-label="Mode">${MODES.map(
    (mode) =>
      `<label><input type="radio" name="mode" value="${mode}"${mode === "type" ? " checked" : ""} />${mode}</label>`,
  ).join("")}</div>
<div class="feedback" aria-live="polite"></div>
<div class="options"></div>
<div class="row">
  <input class="answer" type="text" placeholder="Street name" aria-label="Street name" enterkeyhint="go" autocapitalize="off" spellcheck="false" />
  <button type="submit">OK</button>
</div>`;
  const input = form.querySelector<HTMLInputElement>("input.answer");
  const feedback = form.querySelector<HTMLElement>(".feedback");
  const options = form.querySelector<HTMLElement>(".options");
  if (!input || !feedback || !options) throw new Error("the form markup is incomplete");
  return { form, input, feedback, options };
}

/** Return the selected mode of the switch. */
export function selectedMode(quiz: QuizForm): Mode {
  const checked = quiz.form.querySelector<HTMLInputElement>('input[name="mode"]:checked');
  return (checked?.value as Mode) ?? "type";
}

/** Show the form of a mode: the typed answer, or the option buttons with these names. `tap` gets the tapped name. */
export function showMode(quiz: QuizForm, mode: Mode, names: string[], tap: (name: string) => void): void {
  quiz.form.dataset.mode = mode;
  quiz.options.replaceChildren(
    ...(mode === "type" ? [] : names).map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.textContent = name;
      button.addEventListener("click", () => tap(name));
      return button;
    }),
  );
}

/** Mark the option buttons after a tap: the tapped name is right or wrong, and the correct name gets a mark. */
export function markOptions(quiz: QuizForm, tapped: string, correct: string): void {
  for (const button of quiz.options.querySelectorAll<HTMLButtonElement>("button")) {
    const name = button.textContent;
    button.classList.toggle("correct", name === correct);
    button.classList.toggle("wrong", name === tapped && name !== correct);
  }
}

/** Show a result on the form: "right", "wrong" or none. */
export function showResult(quiz: QuizForm, result: "right" | "wrong" | "", text: string): void {
  quiz.form.className = result ? `quiz ${result}` : "quiz";
  quiz.feedback.textContent = text;
}
