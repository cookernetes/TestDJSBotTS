const User = require("../schemas/User");

import { Command } from "../structures/Command";

export default new Command({
	name: "stats",
	description: "Find the stats for any player",
	options: [
		{
			name: "user",
			description: "The user to query stats for.",
			type: "USER",
		},
	],

	run: async ({ interaction }) => {
		const user = interaction.options.getUser("user") ?? interaction.user;

		const userExists = await User.findOne({
			discordID: user.id,
		});

		if (userExists.suspended === true) {
			interaction.reply(
				`${user.username} has been suspended from Ranked Games and cannot use this command.`
			);
			return;
		}

		if (!userExists) {
			interaction.reply(
				"You are not registered! Please use the **/register** slash command to get started!"
			);
			return;
		} else {
			const userPfp = user.displayAvatarURL();

			let past10games;
			var formattedHistory = [];

			if (userExists.gamehistory.length === 0) {
				past10games = "No past games.";
			} else {
				past10games = userExists.gamehistory.slice(
					-10,
					userExists.gamehistory.length
				);

				for (let i = 0; i < past10games.length; i++) {
					if (past10games[i] === 1) {
						past10games[i] = "<:win:964287115024281691>";
					} else {
						past10games[i] = "<:loss:964287148989771826>";
					}
				}
			}

			if (past10games === "No past games.") {
				formattedHistory = past10games;
			} else {
				formattedHistory = String(past10games.join(" "));
			}

			var lbpos = userExists.lbpos;

			if (lbpos === 0) {
				lbpos = "?";
			}

			interaction.reply({
				embeds: [
					{
						type: "rich",
						title: `${user.username} [${lbpos}]`,
						description: `Unranked\nGames Played - ${userExists.gamesPlayed}`,
						color: 0x3498db,
						fields: [
							{
								name: `Elo Rating`,
								value: `${userExists.elorating}`,
								inline: true,
							},
							{
								name: `**Win %**`,
								value: `${
									(userExists.wins / userExists.gamesPlayed).toFixed(1) * 100
								}%`,
								inline: true,
							},
							{
								name: `Wins`,
								value: `${userExists.wins}`,
								inline: true,
							},
							{
								name: `Losses`,
								value: `${userExists.losses}`,
								inline: true,
							},
							{
								name: `Past 10 Games`,
								value: `${formattedHistory}`,
							},
						],
						thumbnail: {
							url: `${userPfp}`,
						},
					},
				],
			});
		}
	},
});
