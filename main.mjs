import {main_shell} from "./src/shell/main.js"

switch (process.argv[2]){
    case "shell":
        main_shell();
        break;
    case "graphic":
        exit(true, "Work In Progress")
        break;
    default:
        exit(true, 'Unknown parameter: "' + process.argv[2] + '"');
}

/**
 * Allow to log with time indicated, for more clarity.
 * Also display errors in red
 */
export function log(msg, error = false){
    let now = new Date(Date.now());
    console.log("[%s:%s:%s] %s%s%s",
        now.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}),
        now.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}),
        now.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}),
        (error ? "\x1b[31m" : ""), msg, "\x1b[0m");
}

/**
 * Terminate the program if given condition is true and display the given message
 */
export function exit(cond, msg) {
    if (cond) {
        log(msg);
        process.exit(1);
    }
}

console.log("Process exited normally");