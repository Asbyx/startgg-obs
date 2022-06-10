import fs from 'fs';

/**
 * Write the arguments (round, name1, score1, name2, score2) in a different file for each argument in ./obs-files
 */
export function writeSet(round, name1, score1, name2, score2) {
    let err = 0;
    fs.writeFile("obs-files/round.txt", round.toString(), (error) => {
        if (error) err = error;
    });
    fs.writeFile("obs-files/name1.txt", name1.toString(), (error) => {
        if (error) err = error;
    });
    fs.writeFile("obs-files/name2.txt", name2.toString(), (error) => {
        if (error) err = error;
    });
    fs.writeFile("obs-files/score1.txt", score1.toString(), (error) => {
        if (error) err = error;
    });
    fs.writeFile("obs-files/score2.txt", score2.toString(), (error) => {
        if (error) err = error;
    });
    return err;
}