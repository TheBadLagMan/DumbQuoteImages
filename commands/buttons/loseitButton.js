/*After an image is generated, the meme is edited to include a delete button and a button to view in browser
The actual delete function is present in loseitDelete.js and uses a button listener located in index.js*/ 

const Discord = require("discord.js")
const { GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
require("dotenv").config()

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

//Button requires message and link to be generated
//The deleting function relies on the listener obtained from index.js (See loseitDelete.js)
const loseitButton = async (message, loseitLink) => {
  const deleteMsg = new ButtonBuilder()
    .setLabel('Delete Meme (Poster/Admin Only)')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('loseitdelete');

  const memeLink = new ButtonBuilder()
    .setLabel('Download Image')
    .setStyle(ButtonStyle.Link)
    .setURL(loseitLink)
    
  const buttonRow = new ActionRowBuilder()
    .addComponents(deleteMsg, memeLink);
  
  //Edits the message with the button row
  const msgWithButtons = await message.edit({components: [buttonRow], ephmeral: false}); 
}    

module.exports = loseitButton
client.login(process.env.TOKEN);