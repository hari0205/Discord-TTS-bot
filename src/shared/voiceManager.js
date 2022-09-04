"use strict";

const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioResource, StreamType } = require("@discordjs/voice");


const { requestSpeech } = require("./fakeYou.js");

const audioPlayers = new Map();

/*
  Name: joinVoice(Object interaction)
  Description: Joins the sender's voice channel, creating an audio player if needed
  Returns: None
*/
module.exports.joinVoice = (interaction) => {

	const channel = interaction.member.voice.channel;
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guildId,
		adapterCreator: channel.guild.voiceAdapterCreator
	});

	entersState(connection, VoiceConnectionStatus.Ready, 5000).then(() => {

		interaction.reply("Joined voice channel! Use `/ttss generate a voice!").catch(console.error);
		

		if (!audioPlayers.has(interaction.guildId)) {
			const player = createAudioPlayer();
			audioPlayers.set(interaction.guildId, player);
			connection.subscribe(player);
		}

	}).catch(error => {
		connection.destroy();
		interaction.reply("Error joining voice channel!").catch(console.error);
		console.error(error);
	});
}

/*
  Name: leaveVoice(Object interaction)
  Description: Leaves the voice channel and destroys the connection
  Returns: None
*/
module.exports.leaveVoice = (interaction) => {

	const connection = getVoiceConnection(interaction.guildId);
	if (!connection) {
		interaction.reply("I need to be in voice channel! Use `/join`.").catch(console.error);
		return;
	}

	connection.destroy();
	audioPlayers.delete(interaction.guildId);
	
	interaction.reply(" See you later!").catch(console.error);
}

/*
  Name: playVoice(Object interaction, String commandName, Object voiceInfo, String message)
  Description: Requests and plays speech over voice chat, assuming raw format
  Returns: None
*/
module.exports.playVoice = async(interaction, commandName, voiceInfo, message) => {

	const connection = getVoiceConnection(interaction.guildId);
	if (!connection) {
		interaction.reply(`I'm not connected to a voice channel! Use \`/join\` to join.\n\nMessage was \"${message}\"`).catch(console.error);
		return;
	}

	const player = audioPlayers.get(interaction.guildId);
	if (!player) {
		interaction.reply(`No audio player available!\n\nMessage was \"${message}\"`).catch(console.error);
		return;
	}

	await interaction.reply({
		content: `Requesting speech , please wait...`,
		ephemeral: true
	}).catch(console.error);

	// Launch speech request and poll until completion
	requestSpeech(voiceInfo.id, message).then(url => {

		// Send new message to avoid 15 minute interaction expiry time
		interaction.channel.send(`${interaction.user} \`${commandName}\` says \"${message}\" in voice chat!`).catch(console.error);
		const resource = createAudioResource(url, {
			inputType: StreamType.Raw
		});
		player.play(resource);

		resource.playStream.on("error", error => {
			interaction.channel.send(`${interaction.user} Failed to play speech! Here's the link instead:\n${url}\n\n`).catch(console.error);
			console.error(error);
		});

	}).catch(error => {
		interaction.channel.send(`${interaction.user} ${error}\n\nMessage was \"${message}\"`).catch(console.error);
		console.error(error);
	});
}