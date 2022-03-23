import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';

import 'dotenv/config';

const bot: Telegraf<Context<Update>> = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => {
    ctx.reply('Hola ' + ctx.from.first_name + '!');
});

bot.help((ctx) => {
    ctx.reply('Send /start for help');
    ctx.reply('Send /quit to stop the bot');
});

bot.command('quit', async (ctx) => {
  // Explicit usage
    try {
        ctx.telegram.leaveChat(ctx.message.chat.id);// Context shortcut
        ctx.leaveChat();
    } catch (e) {
        console.error (e);
    }
});

bot.groupChat(ctx => {
    console.error ('group', ctx);
})
bot.on('text', (ctx) => {
  ctx.reply(
    'You choose the ' +
      (ctx.message.text === 'first' ? 'First' : 'Second') +
      ' Option!'
  );
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();

const run = async () => {
    console.log (await bot.telegram.getMe ())
}

run ();
