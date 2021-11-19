import fetch from "node-fetch";


let DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks"

let DISCORD_CHAT_IDS = {
  cronjobs: "854968524262866995/qqy26fRf80m6-Bgee28N0NKmZB9wAxPgBjoLe02R2IhP1tArGUckoR3vDY_bfW_J-yPV",
}

let SITE_URL = process.env.NODE_ENV === "production"
  ? "https://www.gunmarketplace.com.au"
  : "https://dev.gunmarketplace.com.au"



const discordCronjobLogMessage = async ({
  cronjobTitle,
  message,
}: {
  cronjobTitle: string,
  message: string,
}) => {
  let url = `${DISCORD_WEBHOOK_URL}/${DISCORD_CHAT_IDS?.cronjobs}`
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `>>> [Google Cloud Scheduler]: ${cronjobTitle} triggered.`
      + `\n Message: ${message}\n`
    })
  })
}



export const discordServerAlerts = {
  cronjobs: discordCronjobLogMessage,
}