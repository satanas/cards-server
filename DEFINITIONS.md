# Protocol

## Match making

* First player sends 'new-match' to create new Match
* Server creates match and joins player 1 sending 'joined' with the list of participants
* Second player sends 'join-match' to join Match
* Server joins player 2 and sends 'joined' with the list of participants (it indicates who created the match)
* Server also sends 'new-player' to the other players
* First player sends 'start-match'
* Server sends 'match-started' to all players in match
* Server sends 'player' to each player with basic info about itself (position, health, mana, number of cards, etc)
* Server sends 'opponents' to each player with basic info about the other players (position, health, mana, number of cards, etc)
* Server sends 'hand' to each player with detailed information of all its cards

## Gameplay

* Server sends 'battlefield' to all players with the status of each card in the battlefield of the current player (unsick, unused, etc)
* Server sends 'turn' to the player with the current turn. This contains player statuses and one card drawn from the deck
* Server sends 'wait' to the others players with player statuses
* Player in turn can:
  * Play card:
    * Send 'play-card' with the card id to put one card from the hand to the battlefield
    * Server sends 'played-card' to all players with the card info
  * Attack enemy card:
    * Send 'attack' with the card id of one of the cards in the battlefield to attack an enemy card
    * Server sends 'battle' to all players with the details of the battle
  * Attack player directly:
    * Send 'direct-attack' with one card id to attack the player directly
    * Server sends 'damage' with the details of the player damaged
  * End turn
    * Send 'end-turn' once the player ends its turn
    * Server switches turn and starts the gameplay cycle again

## Match end

* Server sends 'victory' to the player who wins the match and 'defeat' to the player who loses

# Considerations

* There are two ways to implement match making:
  1. Client never sends match id. Instead, server associates sockets ids to match and validate that the requesting
  client is a valid client for that match.
  2. Client always sends match id. Server still associates socket ids with match id and also validate that the
  requesting client is a valid client for that match.
* Server app must be stateless. It doesn't matter the match, any server should be able to process the request from the
client. Phase one will include only one process serving all requests but in order to server a high load, the match
information should be stored in something like Redis (or maybe Mongo) and any server should be able to load the info,
process the action and return a response to the client.

