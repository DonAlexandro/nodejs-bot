require('dotenv').config();
const TelegramAPI = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');

const token = process.env.TOKEN;

const bot = new TelegramAPI(token, { polling: true });

const chats = {};

async function startGame(chatId) {
  await bot.sendMessage(chatId, `I'll generate some random number from 0 to 9`);

  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;

  await bot.sendMessage(chatId, `Okay, I have a number, try to guess it :)`, gameOptions);
}

function start() {
  bot.setMyCommands([
    { command: '/start', description: 'Start bot' },
    { command: '/info', description: 'Get the information about yourself' },
    { command: '/game', description: 'Get the information about yourself' }
  ]);

  bot.on('message', (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      return bot.sendMessage(chatId, `You sent me next: ${text}`);
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Hello, ${msg.from.first_name} ${msg.from.last_name}`);
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, `Sorry, but I don't understand your command`);
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `Gratz! The number was exaclty ${chats[chatId]}`, againOptions);
    } else {
      return bot.sendMessage(chatId, `Sorry, but you fucked up, the number was ${chats[chatId]}`, againOptions);
    }
  });
}

start();
