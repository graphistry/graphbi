import powerbi from "powerbi-visuals-api";
import DialogConstructorOptions = powerbi.extensibility.visual.DialogConstructorOptions;

/**
 * This class is used to test the dialog API.
 */
export class PopUp {
  static id = "DatePickerDialog";

  /**
   * Initialize our dialog and increment the supplied count by 1, in order to
   * confirm that state can be passed between visual and dialog.
   * eventually clean up and remove count
   */
  constructor(options: DialogConstructorOptions, initialState: DialogState) {
    const { host, element } = options;
    const new_p: HTMLElement = document.createElement("p");
    const newButton = document.createElement('button');
    const textNode = document.createTextNode(
      "Hi! I am a pop up box! You can close me by clicking the button below."
    );
    // newButton.setAttribute("id", "myNewButton");
    // newButton.className = "myClassName";
    // newButton.innerText = "clickMe";
    // newButton.addEventListener("click", clickMe);
    // document.body.appendChild(newButton);
    // function clickMe(){
    // console.log("this is a button for possible SSO redirection!");

    new_p.appendChild(textNode);
    element.appendChild(new_p);
    host.setResult({
      count: (initialState.count += 1),
    });
    }
}

/**
 * Simple state object for the dialog.
 */
export interface DialogState {
  count: number;
}

/**
 * Register the dialog globally by its ID.
 */
globalThis.dialogRegistry = globalThis.dialogRegistry || {};
globalThis.dialogRegistry[PopUp.id] = PopUp;
