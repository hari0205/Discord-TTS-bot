"use strict";


const { SlashCommandBuilder } = require("@discordjs/builders");


const axios = require("axios").default;



module.exports = {
    data:   new SlashCommandBuilder ()
            .setName("prices")
            .setDescription(" Crypto prices")
            .addStringOption(coin =>
                option.setName("Coin")
                    .setDescription("Name of the currency")
                    .setRequired(true))

    async execute (interaction)  {
            await axios.get()

    }

}
