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
    try {
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
            const inlineKeyboardData = getCallbackInlineKeyboardDataReport(textMessage);
            bot.sendMessage(chatId, 'עוד פרט קטן וסיימנו', inlineKeyboardData);
        } 
        else if (textMessage === getReportsLastDayOptions) {
            const oneDay = 1000 * 60 * 60 * 24;
            const lastDayReports = getLastReportsByTime(oneDay);
            const messageString = buildReportsListMessage(lastDayReports);
            bot.sendMessage(chatId, messageString, {parse_mode: 'HTML'});
        } else if (textMessage === getReportsLastHoutOptions) {
            const oneHour = 1000 * 60 * 60;
            const lastDayReports = getLastReportsByTime(oneHour);
            const messageString = buildReportsListMessage(lastDayReports);
            bot.sendMessage(chatId, messageString, {parse_mode: 'HTML'});
        } else if (textMessage.toUpperCase() === 'START') {
            const getStartedMessage = "יאללה, בואי נתחיל";
            bot.sendMessage(chatId, `${getStartedMessage} \n ${baseMenuMessage}`,
            { 
                reply_markup: baseMenuReplayMarkup
            });
        } else {
            const commandNotFoundMessage = "מצטער, לא מכירה את הפקודה";
            bot.sendMessage(chatId, `${commandNotFoundMessage} \n ${baseMenuMessage}`,
            { 
                reply_markup: baseMenuReplayMarkup
            });
        }
    } catch (error) {
        const commandNotFoundMessage = "ייתכן שמשהו השתבש, בואו ננסה מההתחלה";
        bot.sendMessage(chatId, `${commandNotFoundMessage} \n ${baseMenuMessage}`,
        { 
            reply_markup: baseMenuReplayMarkup
        });
    }
});

const getLastReportsByTime = (time) => {
    const increasDay = new Date(new Date() - time);
    return reports.filter(report => report.date > increasDay);
}

const buildReportsListMessage = (lastReports) => {
    if (lastReports.length === 0) {
        return `לא מצאו דיווחים, אם מישהו פספס, דווח לנו
        הליכה נעימה ובטוחה 😊`
    }
    let messageString = "";
    const reportDateTitle = "בשעה";
    lastReports.forEach(report => {
        const reportLocationTitle = `דווח מצ (${report.type}) ב`;
        const dateFormated = `${report.date.getHours().toString()}:${report.date.getMinutes().toString()}:${report.date.getSeconds().toString()}`;
        messageString += `${reportLocationTitle}<b>${report.location}</b> ${reportDateTitle} ${dateFormated} \n`
    })
    messageString += `\n הליכה בטוחה 😊 \n`;
    return messageString;
}

const baseMenuMessage = `
    על מנת לקבל דיווחים יש לשלוח את אחד מהפקודות
    /${getReportsLastHoutOptions}
    /${getReportsLastDayOptions}

    \n

    לדיווח חדש יש לשלוח את מיקום המצ
    מקומות מוכרים לבוט:
    ${loactions.join(", ")}
`;

const baseMenuReplayMarkup = {
    keyboard: [[newReportOptions], [getReportsLastHoutOptions], [getReportsLastDayOptions]],
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true,
}
// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(
//         chatId,
//         `
//             Welcome at <b>ArticleBot</b>, thank you for using my service
      
//             Available commands:
        
//             /bookmark <b>URL</b> - save interesting article URL
//         `, {
//             parse_mode: 'HTML',
//             reply_markup: {
//                 keyboard: [[newReportOptions], [getReportsLastHoutOptions], [getReportsLastDayOptions]],
//                 resize_keyboard: true,
//                 one_time_keyboard: true,
//                 force_reply: true,
//             }
//         });
// });

const regularMzType = "גלוי";
const undercoverMzType = "סמוי - אזרחי";
const undercoverUniformMzType = "סמוי - מדים";
const getCallbackInlineKeyboardDataReport = (location) => {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: regularMzType,
                        callback_data: JSON.stringify({
                            'command': regularMzType,
                            'answer': location
                        })
                    },
                    {
                        text: undercoverMzType,
                        callback_data: JSON.stringify({
                            'command': undercoverMzType,
                            'answer': location
                        })
                    },
                    {
                        text: undercoverUniformMzType,
                        callback_data: JSON.stringify({
                            'command': undercoverUniformMzType,
                            'answer': location
                        })
                    }
                ]
            ]
        }
    };
}


bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const dataResponse = JSON.parse(callbackQuery.data);
    const mzType = dataResponse.command;
    const mzLocation = dataResponse.answer;

    if (!dataResponse || !mzType || !mzLocation || !message) {
        bot.sendMessage(message.chat.id, `משהו לא הסתדר לי, נסו שוב מההתחלה`, 
        { 
            reply_markup: baseMenuReplayMarkup 
        });   
    }
    if (loactions.includes(mzLocation)) {
        const report = {
            date: new Date(),
            from: message.chat.first_name,
            location: mzLocation,
            type: mzType
        }
        reports.push(report);
        bot.sendMessage(message.chat.id, `דיווח מצ ב${mzLocation} התקבל בהצלחה`, 
        { 
            reply_markup: baseMenuReplayMarkup 
        });
    }
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
// bot.on('callback_query', (callbackQuery) => {
//     const message = callbackQuery.message;
//     const category = callbackQuery.data;

//     URLLabels.push({
//         url: tempSiteURL,
//         label: category,
//     });

//     tempSiteURL = '';

//     bot.sendMessage(message.chat.id, `URL has been labeled with category "${category}"`);
// });

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