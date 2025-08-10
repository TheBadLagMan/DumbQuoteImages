/*getNameFromMention replaces pings with names, and determines the author and name used for the meme.
User pings, channel pings, and role pings are all replaced with their names
message.cleancontent is not used as it does not remove the ping signs (#, @)*/

const Discord = require("discord.js")
require("dotenv").config()
const generateImage = require("./generateImage")

const { GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

const getNameFromMention = async (interaction) => {
    var loseitUser;
    var loseitUsername;
    var loseitText;

    //Checks if command is the reply command from context menu, otherwise checks for parameters from /post options
    if(interaction.isMessageContextMenuCommand())
    {
        try 
        {
            loseitUser = interaction.targetMessage.author
            loseitUsername = interaction.targetMessage.author.displayName
            loseitText = interaction.targetMessage.content 

            if (loseitText.length == (0 | undefined || null || "" | " "))
                {
                    //Error is forcefully thrown if no text is detected
                    throw (error)
                }
        } 
        
        //Error message is given and then deleted so new command can be issued without missing text
        catch (error) 
        {
            await interaction.editReply({content:"**ERROR! Reply command can only be used on user-sent messages with text!**", ephemeral: true});
            setTimeout(() => interaction.deleteReply(), 3000);            
            return
        }
    }

    else
    {
    //Trys to fetch Discord user from author field forwarded from slash command
        try 
        {
            let author = interaction.options.getUser('author').toString()
            let newAuthor = author.replace(/\D/gi, '');
            loseitUser = await client.users.fetch(newAuthor);
            loseitUsername = loseitUser.displayName
        }

        catch (error) 
        //If author is not specified (no proper ping/id) use message poster as author
        {
            console.log(error)
            loseitUser = await client.users.fetch(interaction.member);
            loseitUsername = loseitUser.displayName;
        }

        //If there is a manual author name written, that name will be used instead
        //The userdata is unaffected to ensure pfp is still retained.

        let manualauthorname = interaction.options.getString('manualauthorname')
        if(((manualauthorname != '') && (manualauthorname != ' ') && (manualauthorname != null) && (manualauthorname != undefined))) 
        {
            try
            {
                loseitUsername = manualauthorname
            }

        catch (error)
            {   
            }
        } 
        //Takes memetext from slash command
        loseitText = interaction.options.getString('memetext')
    }

        //If there is no text somehow, this trycatch will cancel the function
        try 
        {
            if((loseitText == '') || (loseitText == ' ') || (loseitText == null) || (loseitText == undefined))
            {
                throw (error)
            }
        } 
        catch (error) 
        {
            await interaction.editReply({content:"ERROR! **reply command can only be used on user messages that have text!**"})
            setTimeout(() => interaction.deleteReply(), 5000);            
            return
        }

    //Calls function to replace all mentions in lucid text with appropriate names
    loseitText = await replaceNameFromMention(loseitText, interaction)
    
    //Sends over text, userdata of author, username of author, and interaction data to generateImage.
    await generateImage(loseitText, loseitUser, loseitUsername, interaction)
}

//indexOf has an optional position label: indexOf(searchString, position), see below for documentation
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
//This can be used with counter i in the for loop to speed up operations
//.includes also has the same parameter

//Replaces mentions in memetext with proper names regardless of /post or reply command usage
async function replaceNameFromMention(loseitText, interaction)
{  
    //Code to replace userids with usernames
    for (let i = 0; i < loseitText.length; i++)
    {
        //If there's no ping characters, then stop the function
        if ((!loseitText.includes('<')) || (!loseitText.includes('>')))
        {
            i = loseitText.length
            break
        }

        //If ping characters present, check for role ping, followed by user, then channel ping
        //role ping comes first due to use <@& while user uses <@. This is to avoid unnecessary API calls when roles are misread as users
        
        //Checking for role mentions
        if (loseitText.includes('<@&', i) && loseitText.includes('>', i)) 
        {
            roleId = loseitText.slice(loseitText.indexOf('<@&', i), loseitText.indexOf('>', i))
            roleId = roleId.slice(3)
            try     
            {
                //First find current guild
                const interactionGuild = interaction.guild
                const guild = await client.guilds.fetch(interactionGuild)
                
                roleReplace = (await guild.roles.fetch(roleId)).name
                mentionReplace = loseitText.slice((loseitText.indexOf('<@&', i)), (loseitText.indexOf('>', i)) + 1)
                loseitText = loseitText.replaceAll(mentionReplace, roleReplace)
                i += roleReplace.length
                matches.push(roleId)
            } 
    
            //If no proper pings are found.
            catch (error) 
            {
            } 
        }
        

        //Check for user mentions
        if (loseitText.includes('<@', i) && loseitText.includes('>', i)) 
        {
            userId = loseitText.slice(loseitText.indexOf('<@', i), loseitText.indexOf('>', i))
            userId = userId.slice(2)
            try 
            {
                usernameReplace = (await client.users.fetch(userId)).displayName
                mentionReplace = loseitText.slice((loseitText.indexOf('<@', i)), (loseitText.indexOf('>', i)) + 1)
                loseitText = loseitText.replaceAll(mentionReplace, usernameReplace)
                i += usernameReplace.length
                matches.push(userId)
            } 

            //If no proper pings are found.
            catch (error) 
            {
            } 
        }

        //Now check for channel mentions
        if ((loseitText.includes('<#', i)) && (loseitText.includes('>', i)))
        {
            channelId = loseitText.slice(loseitText.indexOf('<#', i), loseitText.indexOf('>', i))
            channelId = channelId.slice(2)
            try 
            {
                channelReplace = (await client.channels.fetch(channelId))
                channelReplace = channelReplace.name
                mentionReplace = loseitText.slice((loseitText.indexOf('<#', i)), (loseitText.indexOf('>', i)) + 1)
                loseitText = loseitText.replaceAll(mentionReplace, channelReplace)
                i += channelReplace.length
                matches.push(channelId)
            } 
    
            //If no proper pings are found.
            catch (error) 
            {
            }           
        }
    }
    return loseitText
}

//Exports current file
module.exports = getNameFromMention
//Bot token from .env file
client.login(process.env.TOKEN)