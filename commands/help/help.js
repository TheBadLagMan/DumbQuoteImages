/*Help command to go over using the bot
May embed a helpful photo or gif in the future
Will not use DMs for simplicity among other reasons (scope creep, privacy, etc.)*/ 

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('discord.js');
require("dotenv").config()

const { GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

module.exports = {
  cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('FAQ about LoseitKnightMare bot'),
     

  async execute(interaction) {
    //FAQ is too long to hardcode, will write into notepad file 'HELP.txt' and have bot read it
    //File is read synchronously for simplicity
    //If there is issue reading help file, the try catch will resort to a simplified help response
    //Note that it cannot be over 2000 characters in length, and newlines count against this limit

    try 
    {
      var fs = require('fs');
      helpText = fs.readFileSync('./commands/help/HELP.txt', 'utf8');
      await interaction.reply({content: helpText, ephemeral: true });
    } 
    catch (error) 
    {
      shortHelpText = "Right click a User-sent Message **WITH TEXT** --> 'Apps'--> 'reply' to instantly make a meme from existing message \n**OR**\nType /post to manually create a meme.\nPing the user whose name and pfp will be used in the 'author' field\nThe 'memetext' field is where the quote goes, any pings here are replaced by their display name\n'manualauthorname' is optional and used if you want the authors name to be different from their Discord name (must be typed out, cannot use pings/mentions)\n**Make sure the post and reply commands are from this bot! Make sure the pfp matches!**"
      await interaction.reply({content: shortHelpText, ephemeral: true });
    }
  }
}

//Bot token from .env file
client.login(process.env.TOKEN)