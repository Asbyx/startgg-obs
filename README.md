This app is designed to update automatically OBS assets using the startgg api. 
In short, when you update the score of a set in startgg, it is automatically updated in OBS !

***You need to have a startgg api token in order to use this app !***

The app provides 5 files while running: round, name1, name2, score1, score2. The "round" file contains the display name of a round (ex: Winner Final). The 
"name1" and "score1" file contain respectively the name and the score of the player 1. Same goes for the player 2. 
All those files are stored in the folder "obs-files".

You need nodejs in order to launch the application (standardized version coming soon) 
Launch the app with the following command **in a node shell**: ```node main.mjs```.

# How to use startgg-obs
## Using nodejs
- Download the code and extract it from the zip file  
- Now open a nodejs command prompt, navigate to find the folder where all the code is stored (i.e where you extracted the zip file)  
- Type the command and watch the magic happen ! Errors can occur, so check from time to time application logs to see if anything went wrong. 

## In Startgg
Before the tournament, define a stream in Settings → Stations & Stream   
During the tournament, the only required thing is to set the stream for every set you want to stream, set the set as started and keep track of the score !

## In OBS
Once you have set your scene with all text fields, instead of changing the name of the players manually *(booooooring)*, select the option "Read from file" and select the correct file in ```obs-files```, where you extracted the zip.  
And that's it ! You can take a break for the whole tounament, scores and names while automatically be updated when you update them in the bracket in start.gg  
*(when changing from a set to another, it usually takes 1 minute to update)*
