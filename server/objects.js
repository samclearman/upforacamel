/*
Events:
- eventType: makeLegBet, rollDice, placeDesertTile, makeRaceBet, pickPartner

for later:
- is_secret (do we directly forward this event to clients or do we need to hid some info)
- selected_partner - only for pickPartner event

Game state objects
Fixed:
- number of players, player ids (pick a username in case websocket connection lost)

Per Leg:
- game leg number
- dice rolled / dice left 
- tiles 
    - position on board, +/- side, coins earned per tile
    - camels on board, +/- side
- betting tiles left per color 
- which player has which betting tile

Game overall:
- add coins to each player
- long term bets, winner and loser

*/
