import asyncio
import os
import time
from random import randint

from meross_iot.http_api import MerossHttpClient
from meross_iot.manager import MerossManager
from meross_iot.model.enums import OnlineStatus

EMAIL = os.environ.get('MEROSS_EMAIL')
PASSWORD = os.environ.get('MEROSS_PASSWORD')

from flask import Flask, request

plugs = []

async def flash(iterations=10, delay=0.2):
    # Setup the HTTP client API from user-password
    http_api_client = await MerossHttpClient.async_from_user_password(email=EMAIL, password=PASSWORD)

    # Setup and start the device manager
    manager = MerossManager(http_client=http_api_client)
    await manager.async_init()

    # Retrieve the MSL120 devices that are registered on this account
    await manager.async_device_discovery()
    plugs = manager.find_devices(device_type="msl420", online_status=OnlineStatus.ONLINE)

    if len(plugs) < 1:
        print("No online msl420 smart bulbs found...")
        raise RuntimeError("No online bulbs")

    # Let's play with RGB colors. Note that not all light devices will support
    # rgb capabilities. For this reason, we first need to check for rgb before issuing
    # color commands.
    dev = plugs[0]

    # Update device status: this is needed only the very first time we play with this device (or if the
    #  connection goes down)
    await dev.async_update()

    if not dev.get_supports_rgb():
        print("Unfortunately, this device does not support RGB...")
        raise RuntimeError("No RGB support")

    # Check the current RGB color
    current_color = dev.get_rgb_color()
    print(f"Currently, device {dev.name} is set to color (RGB) = {current_color}")
    # Randomly chose a new color
    rgb = 255, 0, 0  #randint(0, 255), randint(0, 255), randint(0, 255)
    for i in range(iterations):
        await dev.async_set_light_color(rgb=rgb, luminance=100)
        time.sleep(delay)
        await dev.async_set_light_color(rgb=rgb, luminance=1)
        time.sleep(delay)

    # Close the manager and logout from http_api
    manager.close()
    await http_api_client.async_logout()

app = Flask(__name__)
app.config["DEBUG"] = True

loop = asyncio.get_event_loop()

@app.route('/', methods=['GET', 'POST'])
def home():
    # if os.name == 'nt':
#         asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    iterations = int(request.args.get("iterations") or 5)
    delay = float(request.args.get("delay") or 0.2)
    
    try:
        loop = asyncio.new_event_loop()
        loop.run_until_complete(flash(iterations, delay))
        loop.close()
    except RuntimeError as e:
        return e.__str__(), 500

    return "bulb flashed", 200
        

app.run(host="0.0.0.0", port=80)