"use strict";

// Import SlashCommandBuilder from discord package
const { SlashCommandBuilder } = require("@discordjs/builders");

const axios = require("axios").default;


module.exports = {
    data: new SlashCommandBuilder()
     .setName("pickup")
     .setDescription("Try your luck with this command"),

    async execute(interaction) {
       await axios.get("https://pickup-lines.herokuapp.com/api/v1/random")
              .then((res) => {
               // console.log('Response:',res.data.line);
                interaction.reply(res.data.line)
              }).catch((err) => {
                console.error('Error:',err);
                interaction.reply("Something went wrong. Please try again later");
              });

       // await interaction.reply({content: "Bot is working!"})
    }
    
}

