const Discord = require('discord.js');
const auth = require('./auth.json');
const mysql = require('mysql');
const pokemon = require('pokemontcgsdk');
const logger = require('winston');
const client = new Discord.Client();

let cid = [];

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let comtoken = '!'
  if(msg.content.substring(0,1) == comtoken) {
    let args = msg.content.substring(1).split(' ')
    let cmd = args[0]

    switch(cmd) {
      //!ping
      case 'ping':
        msg.channel.send('Pong!')
      break;

        //!card gets card info for card with id args[1]
        case 'card':
          pokemon.card.find(args[1]).then(result => {
            let ctype = client.emojis.find(emoji => emoji.name == `${result.card.types[0]}`)
            msg.channel.send(`${result.card.name} - HP:${result.card.hp} - ${ctype}`)
            for(let i = 0; i < result.card.attacks.length; i++) {
              let crd = result.card
              let crd1 = crd.attacks[i].cost.map(x => ` ${client.emojis.find(emoji => emoji.name == x)} `)
              msg.channel.send(`${crd1.join('')}: ${crd.attacks[i].name} ${crd.attacks[i].damage}\n${crd.attacks[i].text}`)
            }
            if(result.card.weaknesses) {
              let weakness = client.emojis.find(emoji => emoji.name == `${result.card.weaknesses[0].type}`)
              msg.channel.send(`${weakness} ${result.card.weaknesses[0].value}`)
            }
            if(result.card.resistances) {
              let resistance = client.emojis.find(emoji => emoji.name == `${result.card.resistances[0].typa}`)
              msg.channel.send(`${resistance} ${result.card.resistances[0].value}`)
            }
            msg.channel.send(`${result.card.imageUrl}`)
          })
      break;

        //!ids gets the card ids of cards with name args[1]
        case 'ids':
          pokemon.card.where({name : args[1], pageSize: 100}).then(cards => {
            if(cards.length > 1) {
              for(let i = 0; i < cards.length; i++) {
                msg.channel.send(cards[i].id);
              }
            } else {
              msg.channel.send('No cards with that name')
            }
          })
      break;
    };
  }
});

client.login(auth.token);
