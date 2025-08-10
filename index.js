/*Command handler for bot
Commented out statements across the .js files are for documentation*/

const Discord = require("discord.js")
require("dotenv").config()

//Below code is for slash commands
const fs = require('node:fs');
const path = require('node:path');
const { Collection, Events, GatewayIntentBits } = require('discord.js');
//Note the ./means within current directory, and ../ means going one file up from current directory
const loseitDelete = require("./commands/buttons/loseitDelete")

//Bot intents needed to function in public servers
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

client.commands = new Collection();
client.cooldowns = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else 
		{
			//getNameFromMention and generateImage throw warnings so the message is commented out
			//These commands are executed after /post and are not meant to have the required properties or be called directly
			//console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, () => {
	console.log('Ready!');

	//Debug code to remove bot from any server, only need guild ID to do this
	/*
	client.guilds.cache.get('1153851387063586907') // Grab the guild
    .leave() // Leave
    .then(g => console.log(`I left ${g}`)) // Give confirmation after leaving
    .catch(console.error);
	*/
});

client.on(Events.InteractionCreate, async interaction => {

//If command is not from chat, right-click context menu or button, it is ignored
	if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && !interaction.isButton()) return;
	const command = client.commands.get(interaction.commandName);

//Listener for button commands, if the delete command is detected, loseitDelete.js is used to determine
//Whether or not the message can be deleted
	if(interaction.isButton()) {
        if(interaction.customId == 'loseitdelete') {
			try {
				await loseitDelete(interaction)
			} catch (error)  {
				console.error(error);
				//Deletes the error message, kills the bot, and force restarts it if an error occurs
				console.log("Error has occurred, restarting bot!")
				await interaction.reply({ content: '**THERE WAS A FATAL ERROR WITH THE ISSUED COMMAND! RESTARTING BOT!**', ephemeral: true });
				setTimeout(() => interaction.deleteReply(), 5000);            
				client.login(process.env.TOKEN);
			}
        }
    }

	if (!command){
		//This line keeps popping up when I use my button, so it's commented out
		//console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

//Code for cooldowns
	const { cooldowns } = interaction.client;
	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

//Code for executing commands
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		//Deletes the error message, kills the bot, and force restarts it if an error occurs
		console.log("Error has occurred, restarting bot!")
		await interaction.reply({ content: '**THERE WAS A FATAL ERROR WITH THE ISSUED COMMAND! RESTARTING BOT!**', ephemeral: true });
		setTimeout(() => interaction.deleteReply(), 5000);            
		client.login(process.env.TOKEN);
	}
});

//Above code is for slash commands

//Power on message
client.on("ready", () => {
	console.clear()
    console.log(`Logged in as ${client.user.tag}`)
})

//Checking for errors
  process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

//Bot token from .env file
client.login(process.env.TOKEN)