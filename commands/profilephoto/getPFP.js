/*getPFP command takes user and gives link to their PFP to view on browser and download (right-click menu on a user)*/

const Discord = require("discord.js");
require("dotenv").config()
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

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
	data: new ContextMenuCommandBuilder()
		.setName('getPFP')
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    //If statement prevents command from being sent as anything other than a user context command
    //See: https://discord.js.org/docs/packages/discord.js/14.16.3/UserContextMenuCommandInteraction:Class For documentation on user context commands
    if (interaction.isUserContextMenuCommand() == false) 
      {
        return;
      }
    else
    {
      await interaction.deferReply({ephemeral: true})
      try 
      {
        //Avatar size caps off at 1024, this is highest resolution. Can always shrink it down using 3rd party tools
        const pfpLink = interaction.targetUser.avatarURL({extension: "png", dynamic: true, size:1024})
        interaction.editReply({content: "Link to user profile image is: "  + pfpLink, ephemeral: true})
      } 
      catch (error) 
      {
        interaction.editReply({content: "Error in retriving user profile image!", ephemeral: true})
      }
    }
  }
}

//Bot token from .env file
client.login(process.env.TOKEN)