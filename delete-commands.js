//Code from discord js guide
//Unpushes commands for global, guild, or both 
const Discord = require("discord.js")
require("dotenv").config()

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

const { REST, Routes } = require('discord.js');
//const { CLIENTID, GUILDID, TOKEN } = require('./.env');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
// .setToken(BOT_TOKEN_HERE)
const rest = new REST().setToken(process.env.TOKEN);

//Can comment out either guild or global command block when running delete-commands.js to only delete one set of commands.

// for guild-based commands
// (Routes.applicationGuildCommands('CLIENTID, 'GUILDID'), { body: [] })
rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
// rest.put(Routes.applicationCommands('CLIENTID'), { body: [] })
rest.put(Routes.applicationCommands(process.env.CLIENTID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
