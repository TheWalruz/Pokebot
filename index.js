const Discord = require('discord.js');
const auth = require('./auth.json');
const pokemon = require('pokemontcgsdk');
const logger = require('winston');
const client = new Discord.Client();

const colour = {
  Grass: '#1D932A',
  Fixire: '#EA2A1F',
  Water: '#0778CC',
  Lightning: '#F7DF0D',
  Psychic: '#7C3B8F',
  Fighting: '#D84117',
  Darkness: '#183352',
  Metal: '#899098',
  Colorless: '#ECE8DC',
  Dragon: '#A6891E',
  Fairy: '#D20243',
  Item: '#0D6FBA',
  Supporter: '#F1642A',
  Stadium: '#75C770'
}

client.login(auth.token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  const comtoken = '!'
  if(msg.content.substring(0,1) == comtoken && msg.content.replace(/ +(?= )/g,'').split(" ")[1]) {
    let args = msg.content.substring(1).split(' ')
    let cmd = args[0]
    let colorless = client.emojis.find(emoji => emoji.name == "Colorless")

    switch(cmd) {
      //!ping
      case 'ping':
        msg.channel.send('Pong!')
      break;

        //!ids gets the card ids of cards with name args[1]
        case 'ids':
          pokemon.card.where({name : args[1], pageSize: 100}).then(cards => {
            let ids = []
            if(cards.length > 1) {
              for(let i = 0; i < cards.length; i++) {
                ids.push(cards[i].id);
              }
              msg.channel.send(ids)
            } else {
              msg.channel.send('No cards with that name')
            }
          })
      break;
      //!card returns card info for given card id
      case 'card':
        let embed = new Discord.RichEmbed()
        pokemon.card.find(args[1]).then(result => {
          if(result.card.supertype == 'Pokémon') {
            let type = colour[result.card.types[0]]
            let ctype = client.emojis.find(emoji => emoji.name == `${result.card.types[0]}`)
              embed.setTitle(`${result.card.name} - HP${result.card.hp} - ${ctype}`)
              for(let i = 0; i < result.card.attacks.length; i++) {
                let crd = result.card
                let crd1 = crd.attacks[i].cost.map(x => ` ${client.emojis.find(emoji => emoji.name == x)} `);
                embed.addField(`${crd1.join('')}: ${crd.attacks[i].name} ${crd.attacks[i].damage}`,`${crd.attacks[i].text}\n\u200b`)
              }
              if(result.card.weaknesses) {
                let weakness = client.emojis.find(emoji => emoji.name == `${result.card.weaknesses[0].type}`);
                embed.addField(`Weakness ${weakness} ${result.card.weaknesses[0].value}`, '\u200B')
              }
              if(result.card.resistances) {
                let resistance = client.emojis.find(emoji => emoji.name == `${result.card.resistances[0].type}`)
                embed.addField(`Resistance ${resistance} ${result.card.resistances[0].value}`, '\u200b')
              }
              if(result.card.retreatCost.length) {
                let retreat = result.card.retreatCost.map(x => `${client.emojis.find(emoji => emoji.name == x)}`)
                embed.addField(`Retreat ${retreat.join('')}`, '\u200b')
              }
              embed.setImage(`${result.card.imageUrl}`)
              embed.setColor(type)
          } else if(result.card.supertype == 'Trainer') {
            let type = colour[result.card.subtype]
              embed.setTitle(`${result.card.name}`)
              embed.setDescription(`${result.card.text}`)
              embed.setImage(`${result.card.imageUrl}`)
              embed.setColor(type)
          }
          msg.channel.send(embed)
        })
    break;
    };
  }
});
