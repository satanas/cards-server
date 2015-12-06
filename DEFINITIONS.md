# Protocol

## Match making

* First player sends 'new-match' to create new Match
* Server creates match and joins player 1 sending 'joined'
* Second player sends 'join-match' to join Match
* Server joins player 2 and sends 'joined'
* First player sends 'start-match'
* Server sends 'starting-match' to all players in match
* Server sends 'match-started' to all players in match once the match started
* Server sends 'players' with basic info about the players (position, health, mana, number of cards, etc)
* Server sends 'hand' to each player with detailed information of all its cards
