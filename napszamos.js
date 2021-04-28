const Discord = require('discord.js');
const util = require('./util');
const client = new Discord.Client();
const fs = require('fs')
require('dotenv').config()

client.once('ready', () => {
    console.log('Napszámos Tunyacsáp to the rescue!');
})

const emojis = ['🎉', '🤘', '🥳', '🎵', '🎸', '🎹', '🎺', '💃', '🕺'];
const messages = [
  'Hallgassátok szeretettel!',
  'Reméljük tetszeni fog.',
  'Jó szórakozást hozzá!',
  'Jó választás!'
];
const fallbackLinks = [
  {
    name: 'Bacall-tól a Gone Love',
    link: 'https://www.youtube.com/watch?v=Q10nxrjkrUs'
  },
  {
    name: 'Calcutta-tól a Paracetamol',
    link: 'https://www.youtube.com/watch?v=8o_N6mPNeFo'
  },
  {
    name: 'Manu Pilas-tól a Bella Ciao',
    link: 'https://www.youtube.com/watch?v=X5dGRM7Fw88'
  },
  {
    name: 'Metronomy-től a The Bay',
    link: 'https://www.youtube.com/watch?v=MfYqeGiUPDo'
  }
];

client.on('message', message => {
  if (message.author.bot) return false;

  if (message.content.includes('@here') || message.content.includes('@everyone')) return false;

  if ((message.mentions.has(client.user.id) || message.content.match('napszám|nap száma|Napszám|Nap száma')) && message.channel.type === 'text') {

    util.jsonReader('./db.json', (err, response) => {
      if (err) {
          console.log(err);
          return
      }

      if (response.lastDayUsed == '' || !isToday(new Date(response.lastDayUsed))) {      
        
        if (response.currentIndex < (response.songs.length - 1)) {
          response.currentIndex++;
        } else {
          response.currentIndex = 0;
        }

        response.lastDayUsed = new Date;
        response.link = response.songs[response.currentIndex].link;
        const jsonString = JSON.stringify(response)
        fs.writeFile('./db.json', jsonString, err => {
            if (err) {
                console.log('Ajjajj hiba lépett fel :(', err);
            } else {
                console.log('Új napszám kiválasztva.');
            }
        })
      }
      
      const song = response.songs[response.currentIndex];
      const id = song.id;
      if (response.link.length != 0) {
        message.channel.send('A nap kiválasztottja <@' + id + '>.' +
          '\n' + messages[Math.floor(Math.random()*messages.length)] + ' ' + emojis[Math.floor(Math.random()*emojis.length)] +
          '\n\n' + response.link);
      } else {
        fallback = fallbackLinks[Math.floor(Math.random()*fallbackLinks.length)]
        message.channel.send('Mára sajnos nem találtam nap számát, de cserébe itt az egyik kedvencem:\n\nItt van ' + fallback.name + ':\n\n' + fallback.link);
      }
    })
  };

  if (message.channel.type === 'dm' && util.validURL(message.content) && message.content.split(' ').length === 1) {
    message.react(emojis[Math.floor(Math.random()*emojis.length)]);
    util.jsonReader('./db.json', (err, response) => {
      if (err) {
          console.log(err);
          return
      }

      const song = response.songs.find(song => String(song.id) === String(message.author.id));

      if (song) {
        song.link = message.content;
        const jsonString = JSON.stringify(response)
        fs.writeFile('./db.json', jsonString, err => {
            if (err) {
                console.log('Ajjajj hiba lépett fel :(', err);
            } else {
                console.log('Link hozzáadva.');
                message.reply('Köszönöm a zenét, felírtam magamnak.');
            }
        });
      } else {
        message.reply('Sajnos nem vagy benne az adatbázisban.\nHa szerinted ez egy hiba, jelezd ezt a karbantartóimnak.');
      }
    });
  }
});

const isToday = (someDate) => {
  const today = new Date()
  return new Date(someDate).getDate() == today.getDate() &&
    new Date(someDate).getMonth() == today.getMonth() &&
    new Date(someDate).getFullYear() == today.getFullYear()
}

client.login(process.env.TOKEN);