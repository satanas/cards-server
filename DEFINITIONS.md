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

## Gameplay

* Server sends 'turn' to the player with the current turn. This contains player statuses and one card drawn from the deck
* Server sends 'wait' to the others players with player statuses
* Player in turn can:
  * Send 'play-card' with the card id to put one card from the hand to the battlefield
  * Server sends 'played-card' to all players with the card info

  * Send 'attack' with the card id of one of the cards in the battlefield to attack an enemy card
  * Server sends 'battle' to all players with the details of the battle

  * Send 'direct-attack' with one card id to attack the player directly
  * Server sends 'damage' with the details of the player damaged

  * Send 'end-turn' once the player ends its turn
  * Server switches turn and starts the gameplay cycle again
* Server sends 'victory' to the player who wins the match and 'defeat' to the player who loses

