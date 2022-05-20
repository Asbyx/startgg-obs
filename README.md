This app is designed to update automatically OBS assets using the startgg api. 
In short, when you update the score of a set in startgg, it is automatically updated in OBS.

***You need to have an startgg api token in order to use this app !*** 

The app provides 5 files while running: round, name1, name2, score1, score2. The "round" file contains the display name of a round (ex: Winner Final). The 
"name1" and "score1" file contain respectively the name and the score of the player 1. Same goes for the player 2.

To link the app and OBS, select your text element in OBS and select option "read from file". Select the correct file and there you go !  
Launch the app with the following command in a node shell: ```node main.mjs <tournament-slug> <Event Name>```.  
Ex: ```node main.mjs pound-2022 "Ultimate Singles"```
