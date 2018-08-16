'use strict';

/**
 * @typedef {import("eris").Message} Message
 */

const Command = require('../../structures/Command');

class Give extends Command {
    constructor() {
        super();
        this.help = {
            name: 'give',
            category: 'economy',
            description: 'Give some of your holy coins to the specified user',
            usage: '{prefix}give <user> <coins>'
        };
        this.conf = {
            requireDB: true,
            disabled: false,
            aliases: ['transfer'],
            requirePerms: [],
            guildOnly: true,
            ownerOnly: false,
            expectedArgs: [{
                description: 'To which user should i give the coins? You can specify a nickname, a username or a user ID'
            }, {
                description: 'How many coins do you want to give?'
            }]
        };
    }
    /**
     *
     *
     * @param {*} client hi
     * @param {Message} message hi
     * @param {Array} args hi 
     * @param {*} guildEntry hi
     * @param {*} userEntry hi
     * @returns {Promise<Message>} hi
     * @memberof Give
     */
    async run(client, message, args, guildEntry, userEntry) {
        const userInput = args.length >= 2 ? args.slice(0, args.length - 1) : false;
        if (!userInput) {
            return message.channel.createMessage(`:x: Invalid syntax or missing parameters, the correct syntax should be \`${this.help.usage.replace(/{prefix}/gim, guildEntry.prefix || client.config.prefix)}\``);
        }
        const receiver = await this.getUserFromText({ message: message, client: client, text: userInput.join(" ") });
        const coins = client.utils.isWholeNumber(args[args.length - 1]) ? Number(args[args.length - 1]) : false;
        if (!receiver || !coins) {
            return message.channel.createMessage(!receiver ? ':x: I couldn\'t find the user you specified' : ':x: Please specify a whole number !');
        } else if (coins > userEntry.economy.coins) {
            return message.channel.createMessage(':x: Yeah well, how to say this.. you can\'t give more coins than you have..');
        }
        //@ts-ignore
        const receiverEntry = await client.handlers.DatabaseWrapper.getUser(receiver.id) || client.structures.References.userEntry(receiver.id);
        const transaction = await client.handlers.EconomyManager.transfer({ from: userEntry, to: receiverEntry, amount: coins });
        //@ts-ignore
        return message.channel.createMessage(`:white_check_mark: You just transferred \`${transaction.donor.debited}\` of your holy coins to \`${receiver.username + '#' + receiver.discriminator}\``);
    }
}

module.exports = new Give();