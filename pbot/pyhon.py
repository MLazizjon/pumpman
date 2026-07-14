import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# Sizning Bot Tokeningiz va Vercel havolangiz
BOT_TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"
WEBAPP_URL = "https://magazine-rbor.vercel.app/login"

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # Telegram ichida chiroyli oyna bo'lib ochiladigan WebApp tugmasi
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Open Pollwon App", 
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )
    
    # Bu yerda reply_markup=keyboard deb xatolik to'g'rilandi
    await message.answer("Hello. Welcome to the Pollwon app.", reply_markup=keyboard)

async def main():
    print("Bot muvaffaqiyatli ishga tushdi va faol holatda!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())