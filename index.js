require('dotenv').config();
const TelegramAPI = require('node-telegram-bot-api');

const { gameOptions, againOptions } = require('./options');
const redisClient = require('./db');

const token = process.env.TOKEN;

const bot = new TelegramAPI(token, { polling: true });

const chats = {};

async function startGame(chatId) {
  await bot.sendMessage(chatId, `I'll generate some random number from 0 to 9`);

  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;

  await bot.sendMessage(chatId, `Okay, I have a number, try to guess it :)`, gameOptions);
}

async function start() {
  bot.setMyCommands([
    { command: '/start', description: 'Start bot' },
    { command: '/info', description: 'Get the information about yourself' },
    { command: '/game', description: 'Get the information about yourself' }
  ]);

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id.toString();

    try {
      if (text === '/start') {
        const user = await redisClient.HGET(chatId, 'right');

        if (!user) {
          await redisClient.HSET(chatId, {
            right: 0,
            wrong: 0
          });
        }

        return bot.sendMessage(chatId, `You sent me next: ${text}`);
      }

      if (text === '/info') {
        const userInfo = await redisClient.HGETALL(chatId);
        const right = userInfo.right;
        const wrong = userInfo.wrong;

        return bot.sendMessage(
          chatId,
          `Hello, ${msg.from.first_name} ${msg.from.last_name} \nYou have ${right} right and ${wrong} wrong answers`
        );
      }

      if (text === '/game') {
        return startGame(chatId);
      }

      return bot.sendMessage(chatId, `Sorry, but I don't understand your command`);
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, 'Oops... some unpredictable error happend');
    }
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id.toString();
    const userInfo = await redisClient.HGETALL(chatId);
    const right = +userInfo.right;
    const wrong = +userInfo.wrong;

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      await redisClient.HSET(chatId, {
        right: right + 1,
        wrong
      });

      return bot.sendMessage(chatId, `Gratz! The number was exaclty ${chats[chatId]}`, againOptions);
    } else {
      await redisClient.HSET(chatId, {
        right,
        wrong: wrong + 1
      });

      return bot.sendMessage(chatId, `Sorry, but you fucked up, the number was ${chats[chatId]}`, againOptions);
    }
  });
}

start();
