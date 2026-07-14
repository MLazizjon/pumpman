import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"
WEBAPP_URL = "https://magazine-rbor.vercel.app/login"

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
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
    await message.answer("Hello. Welcome to the Pollwon app.", reply_markup=keyboard)

async def main():
    # MUHIM: Har safar bot ishga tushganda eski webhook'ni o'chirib tashlaymiz
    # Bu TelegramConflictError xatosini butunlay yo'q qiladi
    await bot.delete_webhook(drop_pending_updates=True)
    
    print("Bot muvaffaqiyatli ishga tushdi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())