/*When delete button is pressed and detected by listener (See index.js)
This command executes to see if the message can be deleted*/ 

const Discord = require("discord.js")
const { GatewayIntentBits, PermissionsBitField } = require('discord.js');
require("dotenv").config()

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

  const loseitDelete = async (interaction) => { 
  //Takes message from which button was clicked, then takes partial interaction data of message
  //to see who issued command to create post, the orignal user
  let originalUser = interaction.message.interaction.user
  if ((originalUser == interaction.user || interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)))
  {
    await interaction.reply({content: "Deleting meme :wastebasket:", ephemeral: true})
    interaction.message.delete()
    setTimeout(() => interaction.deleteReply(), 1000);            
    return;			
  }
  else
  {
    await interaction.reply({content: "Must be poster/mod to delete memes!", ephemeral: true})
    setTimeout(() => interaction.deleteReply(), 1000);            
    return;
  }
}
module.exports = loseitDelete
client.login(process.env.TOKEN);