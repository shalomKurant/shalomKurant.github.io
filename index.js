process.versions.node = "12.18.3";
const TelegramBot = require('node-telegram-bot-api');
const token = "1984515967:AAGsQQkT1uqmbz2ctQV7kIIdQ7PbPQ9IYxg"; // process.env.TOKEN;

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
    polling: true
});

const loactions = ['כיכר', 'אחר'];
const newReportOptions = "דיווח חדש";
const getReportsLastHoutOptions = "קבל דיווחים מהשעה האחרונה";
const getReportsLastDayOptions = "קבל דיווחים מהיום האחרון";
const reports = [];
bot.on('message', (msg) => {

    const textMessage = msg.text.toString();
    const chatId = msg.chat.id;

    if (textMessage === newReportOptions) {
        bot.sendMessage(chatId, `בחר מיקום מהרשימה`, {
            reply_markup: {
                keyboard: [loactions],
                resize_keyboard: true,
                one_time_keyboard: true,
                force_reply: true,
            }
        });
    } else if (loactions.includes(textMessage)) {
        const report = {
            date: new Date(),
            from: msg.from.first_name,
            location: textMessage
        }
        reports.push(report);
        bot.sendMessage(chatId, `דיווח מצ ב${textMessage} התקבל בהצלחה`);
    } else if (textMessage === getReportsLastDayOptions) {
        const oneDay = 1000 * 60 * 60 * 24;
        const lastDayReports = getLastReportsByTime(oneDay);
        const messageString = buildReportsListMessage(lastDayReports);
        bot.sendMessage(chatId, messageString);
    } else if (textMessage === getReportsLastHoutOptions) {
        const oneHour = 1000 * 60 * 60;
        const lastDayReports = getLastReportsByTime(oneHour);
        const messageString = buildReportsListMessage(lastDayReports);
        bot.sendMessage(chatId, messageString);
    } else {
        const commandNotFoundMessage = "מצטער, לא לא מכירה את הפקודה";
        bot.sendMessage(chatId, `${commandNotFoundMessage} \n ${baseMenuMessage}`,
        { 
                reply_markup: {
                keyboard: [[newReportOptions], [getReportsLastHoutOptions], [getReportsLastDayOptions]],
                resize_keyboard: true,
                one_time_keyboard: true,
                force_reply: true,
            }
        });
    }
    
});

const getLastReportsByTime = (time) => {
    const increasDay = new Date(new Date() - time);
    return reports.filter(report => report.date > increasDay);
}

const buildReportsListMessage = (lastReports) => {
    let messageString = "";
    const reportLocationTitle = "דווח מצ ב";
    const reportDateTitle = "בשעה";
    lastReports.forEach(report => {
        const dateFormated = `${report.date.getHours().toString()}:${report.date.getMinutes().toString()}:${report.date.getSeconds().toString()}`;
        messageString += `${reportLocationTitle}${report.location} ${reportDateTitle} ${dateFormated} \n`
    })
    messageString += `\n הליכה בטוחה :) \n`;
    return messageString;
}

const baseMenuMessage = `
    על מנת לקבל דיווחים יש לשלוח את אחד מהפקודות
    /${getReportsLastHoutOptions}
    /${getReportsLastDayOptions}

    \n

    לדיווח חדש יש לשלוח את מיקום המצ
    מקומות מוכרים לבוט
    ${loactions.join(", ")}
`
// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `
            Welcome at <b>ArticleBot</b>, thank you for using my service
      
            Available commands:
        
            /bookmark <b>URL</b> - save interesting article URL
        `, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [[newReportOptions], [getReportsLastHoutOptions], [getReportsLastDayOptions]],
                resize_keyboard: true,
                one_time_keyboard: true,
                force_reply: true,
            }
        });
});

// =====================================
const URLs = [];
const URLLabels = [];
let tempSiteURL = '';

// Listener (handler) for telegram's /bookmark event
bot.onText(/\/bookmark/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match.input.split(' ')[1];
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    if (url === undefined) {
        bot.sendMessage(
            chatId,
            'Please provide URL of article!',
        );
        return;
    }

    URLs.push(url);
    bot.sendMessage(
        chatId,
        'URL has been successfully saved!',
    );
});

// Listener (handler) for telegram's /label event
bot.onText(/\/label/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match.input.split(' ')[1];

    if (url === undefined) {
        bot.sendMessage(
            chatId,
            'Please provide URL of article!',
        );
        return;
    }

    tempSiteURL = url;
    bot.sendMessage(
        chatId,
        'URL has been successfully saved!',
        {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: 'Development',
                        callback_data: 'development'
                    }, {
                        text: 'Lifestyle',
                        callback_data: 'lifestyle'
                    }, {
                        text: 'Other',
                        callback_data: 'other'
                    }
                ]]
            }
        }
    );
});

// Listener (handler) for callback data from /label command
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const category = callbackQuery.data;

    URLLabels.push({
        url: tempSiteURL,
        label: category,
    });

    tempSiteURL = '';

    bot.sendMessage(message.chat.id, `URL has been labeled with category "${category}"`);
});

// Listener (handler) for showcasing different keyboard layout
bot.onText(/\/keyboard/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Alternative keybaord layout', {
        'reply_markup': {
            'keyboard': [loactions],
            resize_keyboard: true,
            one_time_keyboard: true,
            force_reply: true,
        }
    });
});

bot.onText(/\/keyboard/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Alternative keybaord layout', {
        'reply_markup': {
            'keyboard': [loactions],
            resize_keyboard: true,
            one_time_keyboard: true,
            force_reply: true,
        }
    });
});

// Inline keyboard options
const inlineKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'YES',
                    callback_data: JSON.stringify({
                        'command': 'mycommand1',
                        'answer': 'YES'
                    })
                },
                {
                    text: 'NO',
                    callback_data: JSON.stringify({
                        'command': 'mycommand1',
                        'answer': 'NO'
                    })
                },
            ]
        ]
    }
};

// Listener (handler) for showcasing inline keyboard layout
bot.onText(/\/inline/, (msg) => {
    bot.sendMessage(msg.chat.id, 'You have to agree with me, OK?', inlineKeyboard);
});

// Keyboard layout for requesting phone number access
const requestPhoneKeyboard = {
    "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [[{
            text: "My phone number",
            request_contact: true,
            one_time_keyboard: true
        }], ["Cancel"]]
    }
};

// Listener (handler) for retrieving phone number
bot.onText(/\/phone/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Can we get access to your phone number?', requestPhoneKeyboard);
});

// Handler for phone number request when user gives permission
bot.on('contact', async (msg) => {
    const phone = msg.contact.phone_number;
    bot.sendMessage(msg.chat.id, `Phone number saved: ${phone}`);
})