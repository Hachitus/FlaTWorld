#mapMovement extension
##Explanation
This extension takes care of the more resource friendly way for the player to move around the map.

This class requires the subcontainers to be used as it is the most efficient way to do this (so far). What it does
is that, this class hides all the subcontainers that are outside the current viewport / browser window. So we don't
draw the objects outside our visible area.

Tests have proven to be fast enough for this class to work well with current requirements.

##Known issues
- Currently does not calculate the are correctly and leaves objects outside of viewport visible, even when they should be hidden.

##Possibilities in the future
- The extension can also remove the subontainers from the logic that are outside viewport and add them back when needed. We can e.g. store the subcontainers to disk (memory, localstorage, indexedDB or such). If it makes the module more efficient. Currently is it not known what is the most unefficient part of this code.