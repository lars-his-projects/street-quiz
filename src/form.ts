/** The answer form of the quiz. The app and the style page (`style.html`) use this one markup. */
export interface QuizForm {
  form: HTMLFormElement;
  input: HTMLInputElement;
  feedback: HTMLElement;
}

export function createForm(): QuizForm {
  const form = document.createElement("form");
  form.className = "quiz";
  form.autocomplete = "off";
  form.innerHTML = `<div class="feedback" aria-live="polite"></div>
<div class="row">
  <input class="answer" type="text" placeholder="Street name" aria-label="Street name" enterkeyhint="go" autocapitalize="off" spellcheck="false" />
  <button type="submit">OK</button>
</div>`;
  const input = form.querySelector<HTMLInputElement>("input");
  const feedback = form.querySelector<HTMLElement>(".feedback");
  if (!input || !feedback) throw new Error("the form markup is incomplete");
  return { form, input, feedback };
}

/** Show a result on the form: "right", "wrong" or none. */
export function showResult(quiz: QuizForm, result: "right" | "wrong" | "", text: string): void {
  quiz.form.className = result ? `quiz ${result}` : "quiz";
  quiz.feedback.textContent = text;
}
