const Discord = require("discord.js");
const cheerio = require("cheerio");

function get(url) {
	return new Promise(function(a,r) {
		require("snekfetch").get(url).then(a).catch(r)
	})
}

const assetTypes = ["???", "Image", "T-Shirt", "Audio", "Mesh", "Lua", "HTML", "Text", "Hat", "Place", "Model", "Shirt", "Pants", "Decal", "???","???", "Avatar", "Head", "Face", "Gear", "???", "Badge", "Group Emblem", "???", "Animation", "Arms", "Legs", "Torso", "Right Arm", "Left Arm", "Left Leg", "Right Leg", "Package", "YouTubeVideo", "Game Pass", "App", "???", "Code", "Plugin", "SolidModel", "MeshPart", "Hair Accessory", "Face Accessory", "Neck Accessory", "Shoulder Accessory", "Front Accessory", "Back Accessory", "Waist Accessory", "Climb Animation", "Death Animation", "Fall Animation", "Idle Animation", "Jump Animation", "Run Animation", "Swim Animation", "Walk Animation", "Pose Animation"]

module.exports = {
	name: "Roblox API Support",
	author: "theLMGN",
	version: 1,
	description: "Connection to Roblox",
	commands: [
		{
			name: "rblxprofile",
			usage: "theLMGN",
			description: "Shows you the profile of a Roblox user. You can pass either a Roblox username (e.g. theLMGN), a Roblox user ID, (e.g 47757673) or mention a user if they've verified with [RoVer](https://eryn.io/RoVer/)",
			execute: async(c, m, a) => {
				var input = a[0]

				var e = await m.reply({ embed: new Discord.MessageEmbed()
					.setTitle("Working...")
					.setDescription(`Please wait a few seconds`)
					.setColor("#ffdd57") });
				if (a.length > 1) {
					return e.edit({ embed: new Discord.MessageEmbed()
						.setAuthor("414: Too many arguments.", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
						.setColor("#ff3860")
						.setFooter('This command only accepts 1 argument, Username, User ID or Discord mention') });
				} else if (a.length == 1) {
					var userID = 0;
					var userName = ""
					if (!isNaN(new Number(input))) { // UserID checker
						userID = +input
						var apiResponse = await get("https://api.roblox.com/users/" + input)
						if (apiResponse.body.errors) {
							return e.edit({ embed: new Discord.MessageEmbed()
								.setAuthor(`${apiResponse.body.errors[0].code}: ${apiResponse.body.errors[0].message}.`, "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
								.setColor("#ff3860")
								.setFooter('Make sure you got the UserID correct') });
						}
						userName = apiResponse.body.Username
					} else if (!new RegExp("[^A-Za-z0-9_]").exec(input)) { // Username checker
						var apiResponse = await get("https://api.roblox.com/users/get-by-username?username=" + input)
						if (apiResponse.body.errorMessage) {
							return e.edit({ embed: new Discord.MessageEmbed()
								.setAuthor("404: " + apiResponse.body.errorMessage, "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
								.setColor("#ff3860")
								.setFooter('Make sure you got the username correct.') });
						} else {
							userID = apiResponse.body.Id
							userName = apiResponse.body.Username
						}
					} else if (input.startsWith("<@") && input.endsWith(">") && (!isNaN(input.replace("<@","").replace(">","").replace("!","")))) { // Mention checker
						var discordID = input.replace("<@","").replace(">","").replace("!","")
						var apiResponse = await get("https://verify.eryn.io/api/user/" + discordID)
						if (apiResponse.body.robloxId) {
							userID = apiResponse.body.robloxId
							userName = apiResponse.body.robloxUsername
						} else {
							return e.edit({ embed: new Discord.MessageEmbed()
								.setAuthor(`${apiResponse.body.errorCode}: ${apiResponse.body.error}`, "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
								.setColor("#ff3860")
								.setFooter('Make sure you mentioned the right user and they are signed up on http://verify.eryn.io') });
						}
					} else {
						return e.edit({ embed: new Discord.MessageEmbed()
							.setAuthor("400: Bad format.", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
							.setColor("#ff3860")
							.setFooter('This command only accepts 1 argument, Username, User ID or Discord mention') });
					}
					var profilePage  = null
					try {
						var profilePage = await get(`https://www.roblox.com/users/${userID}/profile`)
					} catch(er) {
						if (er.toString() == "Error: 404 Not Found") {
							return e.edit({ embed: new Discord.MessageEmbed()
								.setAuthor(`**${userName}**`)
								.setColor("#ff3860")
								.setDescription("**Banned!**")
								.addField("ID",userID)
								.setThumbnail("https://discordemoji.com/assets/emoji/BlobBanhammerCouncil.png") });
						}
					}
					if (profilePage) {
						var $ = cheerio.load(profilePage.body.toString())
						var info = $(".profile-header-content > div")[0].attribs
						var bcBadge = ""
						if ($(".header-title > span")[0]) {
							bcBadge = $(".header-title > span")[0].attribs.class.replace("icon-","")
							if (bcBadge == "obc") {
								bcBadge = "[OBC]"
							}
							if (bcBadge == "tbc") {
								bcBadge = "[TBC]"
							}
							if (bcBadge == "bc") {
								bcBadge = "[BC]"
							}
							bcBadge = bcBadge + " "
						}
						var embed = new Discord.MessageEmbed()
						.setColor("#E2231A")
						.addField("Friends",info["data-friendscount"],true)
						.addField("Followers",info["data-followerscount"],true)
						.addField("Following",info["data-followingscount"],true)
						.addField("Creation Date",$("#about > div.section.profile-statistics > div.section-content > ul > li:nth-child(1) > p.text-lead")[0].childNodes[0].data,true)
						.addField("Place Visits",$("#about > div.section.profile-statistics > div.section-content > ul > li:nth-child(2) > p.text-lead")[0].childNodes[0].data,true)
						.setThumbnail("https://www.roblox.com/avatar-thumbnail/image?width=420&height=420&format=png&userId=" + userID)
						.setFooter('User ID: ' + userID)
						try {embed.addField("Previous Usernames",JSON.parse($(".profile-header-content > script")[0].childNodes[0].data.replace(`var Roblox=Roblox||{};Roblox.ProfileHeaderData=`,"").replace(`;`,"")).previoususernames)}catch{}
						try {embed.addField("Status",info["data-statustext"],false)}catch{}
						try {embed.setDescription($(".profile-about-content-text")[0].childNodes[0].data)}catch{}
						embed.setAuthor(bcBadge + userName, "https://www.roblox.com/headshot-thumbnail/image?width=420&height=420&format=png&userId=" + userID)
						e.edit({embed:embed})
					}

				} else if (a.length < 1) {
					return e.edit({ embed: new Discord.MessageEmbed()
						.setTitle("400: Too few arguments.", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
						.setColor("#ff3860")
						.setFooter('This command only accepts 1 argument, Username, User ID or Discord mention') });
				}
			},
		},




		{
			name: "rblxasset",
			usage: "14083380",
			description: "Shows you the information of a Roblox asset provided by it's ID",
			execute: async(c, m, a) => {
				var input = a[0]

				var e = await m.reply({ embed: new Discord.MessageEmbed()
					.setTitle("Working...")
					.setDescription(`Please wait a few seconds`)
					.setColor("#ffdd57") });
				if (a.length > 1) {
					return e.edit({ embed: new Discord.MessageEmbed()
						.setAuthor("414: Too many arguments.", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
						.setColor("#ff3860")
						.setFooter('This command only accepts 1 argument, asset id') });
				} else if (a.length == 1) {
					if (isNaN(input)) {
						return e.edit({ embed: new Discord.MessageEmbed()
							.setAuthor("400: Invalid ID", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
							.setColor("#ff3860")
							.setFooter('This command only accepts 1 argument, asset id') });
					}
					try {
						var details = (await get(`https://api.roblox.com/marketplace/productinfo?assetId=${input}`)).body
					} catch(err) {
						return e.edit({ embed: new Discord.MessageEmbed()
							.setAuthor("404: Not found", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
							.setColor("#ff3860")
							.setFooter('Double check the provided ID') });
					}
					if (details) {
						var tags = []
						if (details.IsNew) {
							tags.push("[New]")
						}
						if (details.IsLimited && !details.IsLimitedUnique) {
							tags.push("[Limited]")
						}
						if (details.IsLimited && details.IsLimitedUnique) {
							tags.push("[LimitedU]")
						}
						if (details.MinimumMembershipLevel > 0) {
							tags.push("[BC Only]")
						}
						if (details.ContentRatingTypeId > 0) {
							tags.push("[13+]")
						}
						tags.push(details.Name)
						var pfp = undefined
						if (details.Creator.CreatorType == "Player") {
							pfp = "https://www.roblox.com/headshot-thumbnail/image?width=420&height=420&format=png&userId=" + details.Creator.Id
						}
						var embed = new Discord.MessageEmbed()
						.setColor("#E2231A")
						.setThumbnail("https://www.roblox.com/asset-thumbnail/image?width=420&height=420&format=png&assetId=" + details.AssetId)
						.setDescription(details.Description)
						.setTitle(tags.join(" "))
						.setAuthor(details.Creator.Name, pfp, details.Creator.CreatorType == "Player" ? `https://roblox.com/users/${details.Creator.Id}/profile` : `https://roblox.com/Groups/Group.aspx?gid=${details.Creator.Id}`)
						.addField("Type", assetTypes[details.AssetTypeId])
						.addField("Public Domain?", details.IsPublicDomain ? "Yes" : "No")
						.addField("For Sale?", details.IsForSale ? "Yes" : "No")
						.addField("Created", new Date(details.Created))
						.addField("Updated", new Date(details.Updated))
						if (details.Sales > 0 || details.PriceInRobux) {
							embed.addField(details.PriceInRobux ? "Price" : "Sales", details.PriceInRobux ? `R$${details.PriceInRobux} (${details.Sales} sales)` : details.Sales)
						}
						if (details.IsLimited || details.Remaining) {
							embed.addField("Remaining", details.Remaining || "0")
						}

						e.edit({embed:embed})
					}

				} else if (a.length < 1) {
					return e.edit({ embed: new Discord.MessageEmbed()
						.setTitle("400: Too few arguments.", "https://cdn.discordapp.com/attachments/423185454582464512/425761155940745239/emote.png")
						.setColor("#ff3860")
						.setFooter('This command only accepts 1 argument, Username, User ID or Discord mention') });
				}
			},
		},
	],
	events: [],
	timer: [],
};
