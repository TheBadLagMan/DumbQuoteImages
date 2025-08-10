/*post command to create a meme post.
Interaction is forwarded to getNameFromMention.js
to convert author id/ping to username and pfp*/ 

const Discord = require("discord.js");
require("dotenv").config()
const { SlashCommandBuilder } = require('discord.js');
const getNameFromMention = require("./getNameFromMention")

const { GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

module.exports = {
  cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Turn a quote into a meme [UserID/Ping] [Memetext] [Name if different from Discord name]')

    //.addUserOption allows selection of a server member from the menu, or a user id can be entered.
    //Functionally it is the same as .addStringOption but is more intutitive as it provides a menu to select users from.
    //It also forces a user to be selected or an id to be entered. Invalid characters are automatically blocked by this option
      .addUserOption(option =>
        option.setName('author')
            .setDescription('Select/ping the quoted user or type their user id. Determines name and pfp')
            .setRequired(true))

      .addStringOption(option => 
        option.setName('memetext')
            .setDescription('This is the quoted text, the one you are making a meme out of')
            .setRequired(true))

      .addStringOption(option => 
        option.setName('manualauthorname')
            .setDescription('You can manually change the author name to be different from their Discord name (OPTIONAL)')
            //Max length is 128. If URL size > 512 than the link to view in browser cannot be used hence this limitation.
            .setMaxLength(128)
            .setRequired(false)),        

  async execute(interaction) {
    //Post and reply commands are deferred to allow for > 3 second response time
    await interaction.deferReply()
    await getNameFromMention(interaction)
  }
}

//Bot token from .env file
client.login(process.env.TOKEN)