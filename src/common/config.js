import fs from "fs";
import {log} from "../../main.mjs"

/**
 * Extract the data from the file config.json.
 * Returns Object : {api_token, tournament_slug, event_slug}
 * @return Object
 */
export function extract_data(){
    return JSON.parse(fs.readFileSync("./config.json", "utf8"));
}

/**
 * Save the data in the file config.json.
 */
export function save_data(data){
    fs.writeFile("./config.json", JSON.stringify(data), err => {if(err) log(err); else log("Data have been correctly updated and written in config.json.")});
}