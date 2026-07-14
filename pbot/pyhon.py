import os
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiohttp import web

# 1. Tokenni muhit o'zgaruvchisidan (Environment Variables) olamiz
TOKEN = os.getenv("BOT_TOKEN")

# 2. Bot va Dispatcher sozlamalari
bot = Bot(token=TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# 3. Render portni ochishni talab qiladi, shuning uchun oddiy veb-server yaratamiz
async def handle(request):
    return web.Response(text="Bot muvaffaqiyatli ishlamoqda!")

app = web.Application()
app.router.add_get('/', handle)

# 4. Bot xabarlarni qayta ishlash funksiyasi (Polling uchun)
async def start_bot():
    # Bu yerda botingizning buyruqlarini (handlers) yozasiz
    print("Bot polling rejimida ishga tushdi...")
    await dp.start_polling()

async def start_web_server():
    # Render avtomatik beradigan PORT ni o'qiymiz
    port = int(os.environ.get("PORT", 8080))
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()
    print(f"Web server {port}-portda ishlamoqda...")

# 5. Asosiy ishga tushirish qismi
if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    # Ham botni, ham veb-serverni bir vaqtda ishga tushiramiz
    loop.create_task(start_bot())
    loop.run_until_complete(start_web_server())
    loop.run_forever()





# import asyncio
# import logging
# from aiogram import Bot, Dispatcher, types
# from aiogram.filters import CommandStart
# from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# BOT_TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"
# WEBAPP_URL = "https://magazine-rbor.vercel.app/login"

# logging.basicConfig(level=logging.INFO)

# bot = Bot(token=BOT_TOKEN)
# dp = Dispatcher()

# @dp.message(CommandStart())
# async def cmd_start(message: types.Message):
#     keyboard = InlineKeyboardMarkup(
#         inline_keyboard=[
#             [
#                 InlineKeyboardButton(
#                     text="Open Pollwon App", 
#                     web_app=WebAppInfo(url=WEBAPP_URL)
#                 )
#             ]
#         ]
#     )
#     await message.answer("Hello. Welcome to the Pollwon app.", reply_markup=keyboard)

# async def main():
#     # MUHIM: Har safar bot ishga tushganda eski webhook'ni o'chirib tashlaymiz
#     # Bu TelegramConflictError xatosini butunlay yo'q qiladi
#     await bot.delete_webhook(drop_pending_updates=True)
    
#     print("Bot muvaffaqiyatli ishga tushdi!")
#     await dp.start_polling(bot)

# if __name__ == "__main__":
#     asyncio.run(main())





