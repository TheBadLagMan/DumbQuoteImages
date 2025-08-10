const Canvas = require("canvas")
const Discord = require("discord.js")
const { GatewayIntentBits } = require('discord.js');
const loseitButton = require("../buttons/loseitButton.js");
require("dotenv").config()

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  })

//Blank background for meme post. Background can be modified by changing file or path
const background = "./commands/postreply/loseitphotos/loseitPostBackground.png";

//Dimensions of the canvas
const dim = {
    height: 2289,
    width: 2289,
    margin: 50
}

//Avatar size
//The x and y values are for the top left of the profile picture
const av = {
    size: 1024,
    x: 20,
    y: 420
}

//generateImage function to create the meme on a canvas
const generateImage = async (loseitText, loseitUser, loseitUserName, interaction) => {
memeText = loseitText;    
memeUser = "-" + loseitUserName;

//Gets the avatar url
let avatarURL = loseitUser.displayAvatarURL({extension: "png", dynamic: true, size: av.size})

//Creates a canvas
    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx = canvas.getContext("2d")

//Draw the background
    const backimg = await Canvas.loadImage(background)
    ctx.drawImage(backimg, 0, 0)

//Declares avatar image to be that of the URL mentioned aboved in the let avatarURL code
    const avimg = await Canvas.loadImage(avatarURL)
    ctx.save()

//Draws a circle (arc) for pfp. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc for documentation
    ctx.beginPath()
    ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true) //X and Y values are the center of the arc.
    ctx.closePath()
    ctx.clip()

//Draws the users profile picture 
//drawImage can have a 4th and 5th parameter for width and height respectively
    ctx.drawImage(avimg, av.x, av.y, 1024, 1024)
    ctx.restore()

var context = canvas.getContext("2d");

//aligns textBaseline so it lies at the top of box properly,
context.textBaseline = "top";

//Base font size and type
//Note that font has to be installed on system/project folder and that naming may be different between Windows and Linux
//"250px EnduranceW01-Black" for Linux
//"250px EnduranceW01" for Windows
fontSize = 250;
context.font = "250px EnduranceW01";

//Text style
//The alignment is relative to the x value of the fillText() method. 
//For example, if textAlign is "center", then the text's left edge will be at x - (textWidth / 2).
//left is used to make it easier to measure and shrink text when needed
ctx.textAlign = "left";

//Calling textAdjust function to adjust and print memetext
//Area for memetext is about 1200 pixels wide.
memeText = textAdjust("EnduranceW01", 1200, 1534, memeText)

//See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText for documentation
//on context.filltext. Syntax is text, x, y, and an optional max width before text shrinking occurs
//The textadjust function will create spaces as needed to avoid cutoff before compressions

//1658, 148, 1250 og values
//1665 is the sweetspot for now
//context.fillText(memeText, 1665, 148, 1250);

//context.fillText(memeText, 1665, 148);

//Optional width is set as a fail safe for text shrinking function
//Using left alignment and starting at x = 1060 instead
context.fillText(memeText, 1060, 148, 1200);

//Resets font after memetext is filled, is smaller for the author name
context.textBaseline = "top";
fontSize = 250;
context.font = "250px EnduranceW01";
ctx.textAlign = "left"

//Calling textAdjust function to adjust and print memeauthor
//The memeauthor portion is about 2244 pixels wide, round down to 2200. 547 is bottom of page to top of memeauthor area. Use 500 for now 
//About 24 pixels from the left side of the page
memeUser = textAdjust("EnduranceW01", 2200, 500, memeUser)
//ctx.fillText(memeUser, 1057, 1742)

//Optional width of 2300 is set as failsafe as text shrinking function isn't perfect
ctx.fillText(memeUser, 24, 1742, 2300)

//Creates and names the attachement
const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), loseitUserName + "moment.png");
attachment.setName(loseitUserName + "moment.png")

//Edits the deferred interaction to finally respond with the attachment
await interaction.editReply({content: '', files: [attachment]})

//The interaction is fully acknowledged, now the message component is used for the button event to create a new one
//This adds the button only after the interaction reply is edited to include the image

const message = await interaction.fetchReply()
const loseitLink = await message.attachments.first().url;
//Sends over the message object, userid of the person who triggered the original command, and url of photo
await loseitButton(message, loseitLink)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//New text Adjust function for both memetext and memeauthor
//Newlines will no longer be force added, instead, font is shrunk if width is too long
//Parameters are fontface, boxwidth, descent, and the actual text, s.
//The boundaries are a percentage of boxwidth and will decrease as the font shrinks 

function textAdjust(fontface, width, descent, s)
{
    var FINISHED = false
    var boxWidth = width
    
    //Reset value for s, will reset text/spaces when shrinking font to avoid awkward spacing
    var r = s 

    //When the remaining width is less than or equal to this amount, a space will be replaced by a newline
    var newLineWidth = 0.35

    //When the remaining width is less than or equal to this amount, the font is shrunk (only if newline cannot be added)
    var fontShrinkWidth = 0.10

    //Loop will continue until all text is printed properly (FINISHED = true)
    while (FINISHED != true) 
    {
        for(var i = 0; i < s.length; i++)
        {          
            //Reduces available width by the width of the current character
            //console.log("Current count is: " + i)
            boxWidth -= context.measureText(s.charAt(i)).width
            /*
            console.log("Current width percentage is: " + boxWidth/width * 100 + "%")
            console.log("Current char is: " + s.charAt(i))
            */

            //Replaces next char with newline if little width remaining and next char is a space
            if ((boxWidth/width < (newLineWidth)) && ((s.charAt(i+1) == " ")))
            {
                //Replaces space with newline
                //Last char is excluded in slice
                //See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
                s = s.slice(0, i+1) + "\n" + s.slice(i+2, s.length);
                //console.log("Newline added at space, char and boxwidth percent is: " + s.charAt(i) + " " + boxWidth/width)
                i += 1
                boxWidth = width;
            }

            //Font shrinks if a newline cannot replace a space or if there's too many newlines (text is close to bottom boundary)
            //The loop is reset to retry the whole process and to avoid awkward spacing caused by the intermediate newlines and font shrinking
            if( ((boxWidth/width < (fontShrinkWidth)) && ((s.charAt(i+1) != " "))) || (ctx.measureText(s).actualBoundingBoxDescent > descent) )
            {
                /*
                if ((ctx.measureText(s).actualBoundingBoxDescent > descent))
                {
                    console.log("Too many lines! Decreasing font size!")
                }
                */

                //Ensures font shrinking is actually being processed
                fontSize -=5;
                context.font = fontSize + "px EnduranceW01";
                i = 0;
                s = r;
                boxWidth = width

                //The font shrink width decrease along the font size as to use newlines sparingly and to avoid unneccesary line breaks
                fontShrinkWidth -= 0.01;
                if(fontShrinkWidth <= 0.01)
                {
                    fontShrinkWidth = 0.01
                }
                
                /*
                console.log("Font has been shrunk due to low width! Fontsize is now: " + context.font)
                console.log("newLineWidth has decreased! newLineWidth is now: " + newLineWidth * 100 + "%")
                console.log("fontShrinkWidth has decreased! fontShrinkWidth is now: " + fontShrinkWidth * 100 + "%")
                console.log("Boxwidth has been reset to: " + boxWidth)
                */
            }

            //Finishes loop if string is done and everything fits
            if (i == (s.length - 1))
            {
                FINISHED = true;
            }
        }
    } 

    //Font update is finalized outside if statement and while loop
    context.font = fontSize + "px " + fontface;
    return s;
}
}

//Exports image
module.exports = generateImage

//Bot token from .env file
client.login(process.env.TOKEN)