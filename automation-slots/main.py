import pygetwindow as gw
import pydirectinput
from PIL import Image, ImageDraw
import time
import win32gui
import easyocr
import numpy as np
import Levenshtein as lev
import keyboard
import mss
import mss.tools

BET_ON = "1st"
# BET_ON = "3rd"

PAUSED = False

GAME_TITLE = 'Grand Theft Auto V'
# GAME_TITLE = 'FiveM'

# (left, upper, right, lower); use https://www.image-map.net/ and flip upper and lower if needed
QUIT_ESC_CROP = (1167, 961, 1271, 1016)
QUIT_ESC_NAME = "1_QUIT_ESC"

GET_BALANCE_CROP = (902, 2, 1277, 61)
GET_BALANCE_NAME = "2_GET_BALANCE"

reader = easyocr.Reader(['en'], gpu=False, verbose=False)
with open('../horses.txt', 'r') as file:
    horses = file.read().split('\n')


def pause_key_is_pressed():
    # Check if 'T' key is pressed
    if keyboard.is_pressed('T'):
        return True
    return False


def save_crop(crop_coords, name):
    screen = capture_game_screen()
    crop = screen.crop(crop_coords)
    crop.save(name + '.png')


def wait_for_window(title, timeout=None):
    """
    Waits for a window with a specific title to become active.
    :param title: Title of the window to wait for.
    :param timeout: Optional timeout in seconds after which the function will return False.
    :return: True if the window is found and active, False otherwise.
    """
    start_time = time.time()
    while True:
        # Check if the timeout is reached (if specified)
        if timeout and (time.time() - start_time) > timeout:
            return False

        try:
            # Find the window by title
            window = gw.getWindowsWithTitle(title)[0]
            if window.isActive:
                return True
        except IndexError:
            # Window not found
            pass

        # Wait a bit before the next check to avoid high CPU usage
        time.sleep(0.1)


def activate_game_window():
    try:
        # Find the window
        window = gw.getWindowsWithTitle(GAME_TITLE)[0]
        if window:
            # Bring the window to the foreground (optional)
            window.activate()
            # Wait for the window to be active (optional)
            wait_for_window(GAME_TITLE, 5)
        else:
            print(f"{GAME_TITLE} window not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


def capture_game_screen(save_screen=False):
    if PAUSED:
        return None

    # Find the window by title
    window = gw.getWindowsWithTitle(GAME_TITLE)[0]
    if window:
        # Get the handle to the window
        hwnd = window._hWnd

        # Get the position of the window's client area
        client_rect = win32gui.GetClientRect(hwnd)
        client_left, client_top, client_right, client_bottom = client_rect

        # Map the client area position to the screen
        screen_left, screen_top = win32gui.ClientToScreen(
            hwnd, (client_left, client_top))

        screen_right, screen_bottom = win32gui.ClientToScreen(
            hwnd, (client_right, client_bottom))

        # Calculate width and height
        width = screen_right - screen_left
        height = screen_bottom - screen_top

        with mss.mss() as sct:
            # Define the monitor region to capture based on the window's rectangle
            monitor = {
                "top": screen_top,
                "left": screen_left,
                "width": width,
                "height": height,
                "mon": -1,  # Monitor index isn't needed here
            }

            print

            # Capture the specified region
            sct_img = sct.grab(monitor)

            if save_screen:
                # Save the screenshot
                output_filename = "screenshot.png"
                mss.tools.to_png(sct_img.rgb, sct_img.size,
                                 output=output_filename)
                print(f"Screenshot saved as {output_filename}")

            return sct_img
    else:
        print(f"Window titled '{GAME_TITLE}' not found.")
        return None


def visualize_all_crops():
    visualize_crop(QUIT_ESC_NAME, QUIT_ESC_CROP)
    visualize_crop(GET_BALANCE_NAME, GET_BALANCE_CROP)


def get_balance():
    balance = get_text_from_crop(GET_BALANCE_CROP)
    # replace all non-numeric characters with empty string using regex:
    balance = ''.join(filter(str.isdigit, balance))
    if (int(balance) > 100_000_000):
        # remove first character if it's 2, because it's a bug in OCR - coins
        balance = balance[1:]
    return balance


def get_center_of_crop(crop_coords):
    return ((crop_coords[0] + crop_coords[2]) // 2, (crop_coords[1] + crop_coords[3]) // 2)


def visualize_crop(name, crop):
    source = Image.open(name + '.png')
    draw = ImageDraw.Draw(source)
    draw.rectangle(crop, outline="green", width=6)
    draw.rectangle(crop, outline="red", width=3)
    # draw a circle at the center
    center_x, center_y = get_center_of_crop(crop)
    draw.ellipse((center_x - 10, center_y - 10, center_x + 10,
                  center_y + 10), fill='green', outline='green')
    draw.ellipse((center_x - 5, center_y - 5, center_x + 5,
                  center_y + 5), fill='red', outline='red')
    source.save(name + 'z_crop.png')


def get_text_from_crop(crop_coords):
    screen = capture_game_screen()

    # Convert the screenshot to a PIL Image object
    img = Image.frombytes("RGB", screen.size, screen.bgra, "raw", "BGRX")

    # Now you can crop it
    crop = img.crop(crop_coords)
    crop_np = np.array(crop)
    results = reader.readtext(crop_np)
    text = ' '.join([result[1] for result in results])
    return text


def wait_for_text(text, crop_coords, timeout=None, distance_threshold=1):
    while True:
        found_text = get_text_from_crop(crop_coords)
        # print(f"Found text: {found_text}")
        if lev.distance(normalize_string(text), normalize_string(found_text)) <= distance_threshold:
            break
        time.sleep(0.5)


def click_in_the_middle_of_crop(crop_coords, click_type='down-and-up'):
    try:
        # Find the game window and get its handle
        window = gw.getWindowsWithTitle(GAME_TITLE)[0]
        hwnd = window._hWnd

        # Get the position of the window's client area
        client_rect = win32gui.GetClientRect(hwnd)
        client_left, client_top, client_right, client_bottom = client_rect

        # Map the client area position to the screen
        screen_left, screen_top = win32gui.ClientToScreen(
            hwnd, (client_left, client_top))

        # print(f"client_left: {screen_left}, client_top: {screen_top}")

        screen_right, screen_bottom = win32gui.ClientToScreen(
            hwnd, (client_right, client_bottom))

        # Get the center point of the adjusted crop
        center_x, center_y = get_center_of_crop(
            (crop_coords))

        screen_center_x = screen_left + center_x
        screen_center_y = screen_top + center_y

        # Move the mouse to the center point and click
        pydirectinput.moveTo(screen_center_x, screen_center_y)
        time.sleep(0.1)
        # sometimes it doesn't move on the first try
        pydirectinput.moveTo(screen_center_x, screen_center_y)

        # tried increase delay, looked like sometimes the cursor is still on the "Bet Again" button which is actually "Rules" button by that time, but didn't help
        time.sleep(0.1)

        if click_type == 'down-and-up':
            pydirectinput.press('enter')
        elif click_type == 'down':
            pydirectinput.keyDown('enter')
        elif click_type == 'up':
            pydirectinput.keyUp('enter')
    except Exception as e:
        print(f"An error occurred: {e}")


def normalize_string(input_string):
    # Convert to lowercase and replace comma with space
    return input_string.lower().replace(',', '')


# seems like 1h per day is the limit for GTAO before you get banned from betting for about 1-1.5 weeks
# SESSION_LIMIT_HOURS = 0.95
SESSION_LIMIT_HOURS = 999


def main():
    global PAUSED

    # activate_game_window()
    # time.sleep(1)
    # capture_game_screen(True)
    # time.sleep(1)
    # capture_game_screen(True)
    # time.sleep(1)
    # capture_game_screen(True)
    # exit()
    # visualize_all_crops()
    # exit()

    wait_for_text("Quit ESC", QUIT_ESC_CROP, 0.9)

    games_played = 0
    start_time = time.time()

    starting_balance = get_balance()

    while (True):
        if not PAUSED:
            activate_game_window()

            wait_for_text("Quit ESC", QUIT_ESC_CROP, 0.9)

            tag = "RESULT" if games_played > 0 else "START"
            balance = get_balance()
            balance_string = f"{tag}, {balance}, \"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}\""
            print(balance_string)
            with open(f'bet_max_deity_log.csv', 'a') as file:
                file.write(balance_string + '\n')

            if games_played > 0:
                print(
                    f"Average return per game, $: {(int(balance) - int(starting_balance)) / games_played}")

            pydirectinput.press('enter')
            # print("Pressed Enter")

            games_played += 1
            # print(f"Games played: {games_played}")

        if time.time() - start_time > SESSION_LIMIT_HOURS * 60 * 60:
            print(f"Session limit of {SESSION_LIMIT_HOURS} hours reached.")
            break

        if pause_key_is_pressed():
            if PAUSED:
                PAUSED = False
                time.sleep(1)
            else:
                PAUSED = True
                # TODO: release ALL keys including mouse?
                pydirectinput.mouseUp()
                pydirectinput.keyUp('enter')
                time.sleep(1)


if __name__ == "__main__":
    main()
