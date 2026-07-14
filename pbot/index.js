require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.command('start', (ctx) => {
    ctx.reply('Assalomu alaykum! Pumpman ilovasiga kirish uchun kontaktni yuboring:', {
        reply_markup: {
            keyboard: [[{ text: '📱 Kontaktni yuborish', request_contact: true }]],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    });
});

bot.on('contact', async (ctx) => {
    const { phone_number, user_id, first_name } = ctx.message.contact;

    // Supabase'ga saqlash
    const { error } = await supabase.from('users').upsert({
        telegram_id: user_id,
        phone: phone_number,
        full_name: first_name
    });

    if (error) {
        return ctx.reply('Xatolik yuz berdi, keyinroq urinib ko\'ring.');
    }

    ctx.reply('Rahmat! Endi ilovani ochishingiz mumkin:', {
        reply_markup: {
            inline_keyboard: [[
                { 
                    text: '🚀 Ilovani ochish', 
                    web_app: { url: 'https://Sizning-Vercel-Linkiz.vercel.app' } 
                }
            ]]
        }
    });
});

bot.launch();
console.log('Bot ishga tushdi!');