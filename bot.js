const fetch = require('cross-fetch');
const fs = require('fs');
let request = require(`request`);
const { token, prefix, channel, owner, whitelist } = require("./config.json")
const { Client, version, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const { exec } = require("child_process");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        "CHANNEL",
		"MESSAGE"
    ]
});
 

const activities_list = [
   `${prefix}obfuscate | then upload a file.`, 
   "for .lua files to obfuscate.",
   `for ${prefix}obfuscate`,
   `${prefix}obfuscate`
];

client.on("ready", () => {
    console.log('----------------------------------------------------------');
    console.log('Connected to Discord via the token successfully.');
    console.log(`Username: ${client.user.tag}`);
    console.log(`User ID: ${client.user.id}`);
    console.log(`Prefix: ${prefix}`);
    console.log(`Running on Discord API version ${version}`);
    console.log('----------------------------------------------------------');
	setInterval(() => {
            const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
            client.user.setActivity(activities_list[index], {type: 'WATCHING'});
         }, 10000);
});

client.on('messageCreate', (message) => {
	if (message.guild == null && message.author.id != owner && message.channel.id != channel && (!whitelist.includes(message.author.id))) return;
    if (message.content.startsWith(`${prefix}obfuscate`)) {
        if (message.attachments.size > 0) {

            var url = message.attachments.first().url;

            fetchAndObfuscate(url, message);
        } else {
			
            var new_message = message.content;

            if (message.content.includes('```lua')) new_message = message.content.replace(/(```lua)/i, '```');

            var reg = /(?<=```)[\S\s]*(?=```)/g;
            var code = reg.exec(new_message);
			let filename = createID(7);
            if (code) {
					message.channel.send('obfuscating...');
				    fs.writeFileSync(`file-${filename}.lua`, code.toString());
					thefile = fs.readFileSync(`file-${filename}.lua`, 'utf-8');
					
					fs.readFile(`obfuscate.lua`, 'utf8', function (err,data) {
					  if (err) {
						return console.log(err);
					  }
					  var result = data.replace(/--SCRIPT/i, thefile);

					  fs.writeFile(`file-${filename}.obfuscated.copy.lua`, result, 'utf8', function (err) {
						 if (err) return console.log(err);
					  });
					});	
					setTimeout(() => { exec(`lua file-${filename}.obfuscated.copy.lua`,
			   function (error, stdout) {
				  if (error !== null) {
					  console.log('exec error: ' + error);
				  }
				  fs.writeFile(`file-${filename}.obfuscated.lua`, stdout, 'utf8', function (err) {
						 if (err) return console.log(err);
					  });
			   });
			   }, 5000);
			
			setTimeout(() => {
				const buffer = fs.readFileSync(`file-${filename}.obfuscated.lua`);
				const file = new MessageAttachment(`file-${filename}.obfuscated.lua`); 
				message.channel.send({ 
				content: 'there u go',
				files: [{
					attachment: `file-${filename}.obfuscated.lua`,
					}]});
				
				fs.unlinkSync(`file-${filename}.lua`)

			}, 10000);
			setTimeout(() => {
				 fs.unlinkSync(`file-${filename}.obfuscated.lua`);
				 fs.unlinkSync(`file-${filename}.obfuscated.copy.lua`);
			}, 60000);
            } else {
                message.channel.send('no file or code block');
            }
        }
    }
});

async function fetchAndObfuscate(url, message) {
    let response = await fetch(url);
    let script = await response.text();

    obfuscate(script, message);
};

async function obfuscate(content, message) {
	message.channel.send('obfuscating...');
	
    let filename = createID(7);
	let attachment = message.attachments.first();
	const file = message.attachments.first()?.url;

    const response = await fetch(file);
	
	if(attachment) {
		request.get(attachment.url)
		fs.writeFileSync(`file-${filename}.lua`, content.toString());
		thefile = fs.readFileSync(`file-${filename}.lua`, 'utf-8');

		fs.readFile(`obfuscate.lua`, 'utf8', function (err,data) {
		if (err) {
		return console.log(err);
		}
		var result = data.replace(/--SCRIPT/i, thefile);

		fs.writeFile(`file-${filename}.obfuscated.copy.lua`, result, 'utf8', function (err) {
		if (err) return console.log(err);
		});
		});	
		setTimeout(() => { exec(`lua file-${filename}.obfuscated.copy.lua`,
		function (error, stdout) {
		if (error !== null) {
		console.log('exec error: ' + error);
		fs.writeFile(`file-${filename}.obfuscated.lua`, error.toString(), 'utf8', function (err) {
		if (err) return console.log(err);
		});
		return;
		}
		fs.writeFile(`file-${filename}.obfuscated.lua`, stdout, 'utf8', function (err) {
		if (err) return console.log(err);
		});
		});
		}, 5000);
			
			setTimeout(() => {
				const buffer = fs.readFileSync(`file-${filename}.obfuscated.lua`);
				const file = new MessageAttachment(`file-${filename}.obfuscated.lua`); 
				message.channel.send({ 
				content: 'there u go',
				files: [{
					attachment: `file-${filename}.obfuscated.lua`,
					}]});
				
				fs.unlinkSync(`file-${filename}.lua`)

			}, 10000);
			setTimeout(() => {
				 fs.unlinkSync(`file-${filename}.obfuscated.lua`);
				 fs.unlinkSync(`file-${filename}.obfuscated.copy.lua`);
			}, 60000);
			
	}
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function createID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   
    return result;
};	

client.login(token);