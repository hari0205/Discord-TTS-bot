"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const { getVoiceList } = require("../shared/fakeYou.js");
const { playVoice } = require("../shared/voiceManager.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ttss")
		.setDescription("Generates speech through voice chat.")
		.addStringOption(option =>
			option.setName("voice")
				.setDescription("Voice model to speak with. Use /voices to list all options.")
				.setRequired(true))
		.addStringOption(option =>
			option.setName("message")
				.setDescription("Message to speak.")
				.setRequired(true)),
	async execute(interaction) {

		const voice = interaction.options.getString("voice").toLowerCase();
		const message = interaction.options.getString("message");
		if (!voice || !message) {
			interaction.reply("Both `voice` and `message` are required!").catch(console.error);
			return;
		}

		const voiceList = await getVoiceList();
		if (!voiceList) {
			interaction.reply(`Failed to get voice list!\n\nMessage was \"${message}\"`).catch(console.error);
			return;
		}

		const voiceInfo = voiceList[voice];
		if (!voiceInfo) {
			interaction.reply(`No voice named \`${voice}\`! Use \`/voices\` to list available voices.\n\nMessage was \"${message}\"`).catch(console.error);
			return;
		}

		// Request and attempt to play speech file
		playVoice(interaction, voice, voiceInfo, message);
	}
};