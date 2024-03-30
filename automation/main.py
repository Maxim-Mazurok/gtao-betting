import pygetwindow as gw
import pydirectinput
from PIL import Image, ImageDraw
import time
import win32gui
import easyocr
import numpy as np
import pyautogui
import Levenshtein as lev
import keyboard

PAUSED = False

GAME_TITLE = 'Grand Theft Auto V'
# GAME_TITLE = 'FiveM'

# (left, upper, right, lower); use https://www.image-map.net/ and flip upper and lower if needed
SELECT_GAME_CROP = (751, 782, 1209, 880)
SELECT_GAME_NAME = "1_SELECT_GAME"

SELECT_HORSE_1_CROP = (139, 262, 499, 376)
SELECT_HORSE_1_NAME = "2_SELECT_HORSE_1"
SELECT_HORSE_2_CROP = (
    139, SELECT_HORSE_1_CROP[1] + 115, 499, SELECT_HORSE_1_CROP[3] + 115)
SELECT_HORSE_2_NAME = "2_SELECT_HORSE_2"
SELECT_HORSE_3_CROP = (
    139, SELECT_HORSE_2_CROP[1] + 115, 499, SELECT_HORSE_2_CROP[3] + 115)
SELECT_HORSE_3_NAME = "2_SELECT_HORSE_3"
SELECT_HORSE_4_CROP = (
    139, SELECT_HORSE_3_CROP[1] + 115, 499, SELECT_HORSE_3_CROP[3] + 115)
SELECT_HORSE_4_NAME = "2_SELECT_HORSE_4"
SELECT_HORSE_5_CROP = (
    139, SELECT_HORSE_4_CROP[1] + 115, 499, SELECT_HORSE_4_CROP[3] + 115)
SELECT_HORSE_5_NAME = "2_SELECT_HORSE_5"
SELECT_HORSE_6_CROP = (
    139, SELECT_HORSE_5_CROP[1] + 115, 499, SELECT_HORSE_5_CROP[3] + 115)
SELECT_HORSE_6_NAME = "2_SELECT_HORSE_6"

GET_BALANCE_CROP = (651, 347, 1209, 432)
GET_BALANCE_NAME = "3_GET_BALANCE"

SET_BET_AMOUNT_LEFT_CROP = (688, 467, 720, 514)
SET_BET_AMOUNT_LEFT_NAME = "4_SET_BET_AMOUNT_LEFT"
# SET_BET_AMOUNT_RIGHT_CROP = (1140, 468, 1172, 515)
SET_BET_AMOUNT_RIGHT_CROP = (1140-150, 468, 1172-150, 515)
SET_BET_AMOUNT_RIGHT_NAME = "4_SET_BET_AMOUNT_RIGHT"
# TODO: maybe need to read bet amount as well?...

PLACE_BET_CROP = (632, 703, 1218, 793)
PLACE_BET_NAME = "5_PLACE_BET"

FIRST_PLACE_CROP = (433, 491, 844, 572)
FIRST_PLACE_NAME = "6_1_PLACE"

SECOND_PLACE_CROP = (1, 489, 343, 555)
SECOND_PLACE_NAME = "6_2_PLACE"

THIRD_PLACE_CROP = (922, 488, 1279, 557)
THIRD_PLACE_NAME = "6_3_PLACE"

BET_AGAIN_CROP = (412, 900, 864, 988)
BET_AGAIN_NAME = "7_BET_AGAIN"

WINNER_ODDS_CROP = (435, 668, 560, 736)

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
    try:
        # Find the window
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

            # print(f"client_left: {screen_left}, client_top: {screen_top}")

            screen_right, screen_bottom = win32gui.ClientToScreen(
                hwnd, (client_right, client_bottom))

            # Calculate width and height
            width = screen_right - screen_left
            height = screen_bottom - screen_top

            # Capture the screen
            screenshot = pyautogui.screenshot(
                region=(screen_left, screen_top, width, height))

            if save_screen:
                # Save or process the screenshot
                screenshot.save('screenshot.png')
            return screenshot
        else:
            print(f"{GAME_TITLE} window not found.")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def visualize_all_crops():
    visualize_crop(SELECT_GAME_NAME, SELECT_GAME_CROP)
    visualize_crop(SELECT_HORSE_1_NAME, SELECT_HORSE_1_CROP)
    visualize_crop(SELECT_HORSE_2_NAME, SELECT_HORSE_2_CROP)
    visualize_crop(SELECT_HORSE_3_NAME, SELECT_HORSE_3_CROP)
    visualize_crop(SELECT_HORSE_4_NAME, SELECT_HORSE_4_CROP)
    visualize_crop(SELECT_HORSE_5_NAME, SELECT_HORSE_5_CROP)
    visualize_crop(SELECT_HORSE_6_NAME, SELECT_HORSE_6_CROP)
    visualize_crop(GET_BALANCE_NAME, GET_BALANCE_CROP)
    visualize_crop(SET_BET_AMOUNT_LEFT_NAME, SET_BET_AMOUNT_LEFT_CROP)
    visualize_crop(SET_BET_AMOUNT_RIGHT_NAME, SET_BET_AMOUNT_RIGHT_CROP)
    visualize_crop(PLACE_BET_NAME, PLACE_BET_CROP)
    visualize_crop(FIRST_PLACE_NAME, FIRST_PLACE_CROP)
    visualize_crop(SECOND_PLACE_NAME, SECOND_PLACE_CROP)
    visualize_crop(THIRD_PLACE_NAME, THIRD_PLACE_CROP)
    visualize_crop(BET_AGAIN_NAME, BET_AGAIN_CROP)


def get_balance():
    balance = get_text_from_crop(GET_BALANCE_CROP)
    # replace all non-numeric characters with empty string using regex:
    return ''.join(filter(str.isdigit, balance))


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
    crop = screen.crop(crop_coords)
    crop_np = np.array(crop)
    results = reader.readtext(crop_np)
    text = ' '.join([result[1] for result in results])
    return text


def wait_for_text(text, crop_coords, timeout=None):
    while True:
        found_text = get_text_from_crop(crop_coords)
        if found_text == text:
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
        time.sleep(0.1)  # Small delay

        if click_type == 'down-and-up':
            pydirectinput.press('enter')
        elif click_type == 'down':
            pydirectinput.keyDown('enter')
        elif click_type == 'up':
            pydirectinput.keyUp('enter')
    except Exception as e:
        print(f"An error occurred: {e}")


def select_game():
    wait_for_text("PLACE BET", SELECT_GAME_CROP)
    click_in_the_middle_of_crop(SELECT_GAME_CROP)


def normalize_string(input_string):
    # Convert to lowercase and replace comma with space
    return input_string.lower().replace(',', '')


def find_best_match(ocr_line, reference_lines):
    best_match = None
    min_distance = float('inf')

    normalized_ocr_line = normalize_string(ocr_line)
    normalized_reference_lines = [
        normalize_string(line) for line in reference_lines]

    for i, ref_line in enumerate(normalized_reference_lines):
        distance = lev.distance(normalized_ocr_line, ref_line)
        if distance < min_distance:
            min_distance = distance
            best_match = (i, reference_lines[i], distance)
    return best_match


def record_results():
    wait_for_text("BET AGAIN", BET_AGAIN_CROP)
    first_place = detect_horse(get_text_from_crop(FIRST_PLACE_CROP))
    second_place = detect_horse(get_text_from_crop(SECOND_PLACE_CROP))
    third_place = detect_horse(get_text_from_crop(THIRD_PLACE_CROP))
    result = f"{first_place[0]},\"{first_place[1]}\",{second_place[0]},\"{second_place[1]}\",{third_place[0]},\"{third_place[1]}\""
    print(result)
    with open('results_log.csv', 'a') as file:
        file.write(result + '\n')


def detect_horse(ocr_input):
    return find_best_match(ocr_input, horses)


def test_detect_horse():
    ocr_input = "pRETTY AS A PISTOL 4/1"
    expected_match = 'Pretty as a Pistol, 4/1'
    actual_match = detect_horse(ocr_input)
    assert actual_match[1] == expected_match, f"Expected {expected_match} but got {actual_match[1]}"


def select_horse():

    # TODO: probably wait for something, like a good match maybe?
    text_1 = get_text_from_crop(SELECT_HORSE_1_CROP)
    horse_1 = detect_horse(text_1)
    # print(f"From {text_1} detected {horse_1[1]}")
    text_2 = get_text_from_crop(SELECT_HORSE_2_CROP)
    horse_2 = detect_horse(text_2)
    # print(f"From {text_2} detected {horse_2[1]}")
    text_3 = get_text_from_crop(SELECT_HORSE_3_CROP)
    horse_3 = detect_horse(text_3)
    # print(f"From {text_3} detected {horse_3[1]}")
    text_4 = get_text_from_crop(SELECT_HORSE_4_CROP)
    horse_4 = detect_horse(text_4)
    # print(f"From {text_4} detected {horse_4[1]}")
    text_5 = get_text_from_crop(SELECT_HORSE_5_CROP)
    horse_5 = detect_horse(text_5)
    # print(f"From {text_5} detected {horse_5[1]}")
    text_6 = get_text_from_crop(SELECT_HORSE_6_CROP)
    horse_6 = detect_horse(text_6)
    # print(f"From {text_6} detected {horse_6[1]}")

    # print(
    #     f"Detected horses:\n{horse_1}\n{horse_2}\n{horse_3}\n{horse_4}\n{horse_5}\n{horse_6}\n")
    line_up = f"{horse_1[0]},\"{horse_1[1]}\",{horse_2[0]},\"{horse_2[1]}\",{horse_3[0]},\"{horse_3[1]}\",{horse_4[0]},\"{horse_4[1]}\",{horse_5[0]},\"{horse_5[1]}\",{horse_6[0]},\"{horse_6[1]}\""
    print(line_up)
    with open('line_up_log.csv', 'a') as file:
        file.write(line_up + '\n')

    # each horse is like this: (98, 'Yellow Sunshine, 5/1')
    # select the horse with the lowest numerator
    horses = [horse_1, horse_2, horse_3, horse_4, horse_5, horse_6]
    # sort by numerator converted to number
    horses.sort(key=lambda x: int(x[1].split(',')[1].split(
        '/')[0]) if x[1].split(',')[1].strip() != 'EVENS' else 1)
    lowest_numerator = horses[0]
    # print(f"Selected horse: {lowest_numerator}")

    # click on the horse
    if lowest_numerator == horse_1:
        click_in_the_middle_of_crop(SELECT_HORSE_1_CROP)
    elif lowest_numerator == horse_2:
        click_in_the_middle_of_crop(SELECT_HORSE_2_CROP)
    elif lowest_numerator == horse_3:
        click_in_the_middle_of_crop(SELECT_HORSE_3_CROP)
    elif lowest_numerator == horse_4:
        click_in_the_middle_of_crop(SELECT_HORSE_4_CROP)
    elif lowest_numerator == horse_5:
        click_in_the_middle_of_crop(SELECT_HORSE_5_CROP)
    elif lowest_numerator == horse_6:
        click_in_the_middle_of_crop(SELECT_HORSE_6_CROP)

    # third_lowest_numerator = horses[2]
    # # print(f"Selected horse: {lowest_numerator}")

    # # click on the horse
    # if third_lowest_numerator == horse_1:
    #     click_in_the_middle_of_crop(SELECT_HORSE_1_CROP)
    # elif third_lowest_numerator == horse_2:
    #     click_in_the_middle_of_crop(SELECT_HORSE_2_CROP)
    # elif third_lowest_numerator == horse_3:
    #     click_in_the_middle_of_crop(SELECT_HORSE_3_CROP)
    # elif third_lowest_numerator == horse_4:
    #     click_in_the_middle_of_crop(SELECT_HORSE_4_CROP)
    # elif third_lowest_numerator == horse_5:
    #     click_in_the_middle_of_crop(SELECT_HORSE_5_CROP)
    # elif third_lowest_numerator == horse_6:
    #     click_in_the_middle_of_crop(SELECT_HORSE_6_CROP)

    # save screenshot
    # capture_game_screen().save('screenshot.png')


def place_bet():
    wait_for_text("PLACE BET", PLACE_BET_CROP)
    time.sleep(0.5)
    click_in_the_middle_of_crop(PLACE_BET_CROP)


def bet_again():
    wait_for_text("BET AGAIN", BET_AGAIN_CROP)
    time.sleep(0.5)
    click_in_the_middle_of_crop(BET_AGAIN_CROP)


def select_bet_amount():
    wait_for_text("PLACE BET", PLACE_BET_CROP)
    time.sleep(0.5)

    if GAME_TITLE == 'FiveM':
        for _ in range(13):
            click_in_the_middle_of_crop(SET_BET_AMOUNT_RIGHT_CROP)
            time.sleep(0.1)
    else:
        # click_in_the_middle_of_crop(SET_BET_AMOUNT_RIGHT_CROP, 'down')
        # time.sleep(8)
        # click_in_the_middle_of_crop(SET_BET_AMOUNT_RIGHT_CROP, 'up')
        # for _ in range(27):
        #     click_in_the_middle_of_crop(SET_BET_AMOUNT_RIGHT_CROP)
        pydirectinput.press('tab')  # max bet


# seems like 1h per day is the limit for GTAO before you get banned from betting for about 1-1.5 weeks
SESSION_LIMIT_HOURS = 0.95


def main():
    global PAUSED

    # capture_game_screen(True)
    # exit()
    # visualize_all_crops()
    # exit()
    test_detect_horse()

    games_played = 0
    start_time = time.time()

    while (True):
        if not PAUSED:
            activate_game_window()

            if not (GAME_TITLE == 'FiveM' and games_played > 0):
                select_game()

            if GAME_TITLE == 'FiveM':
                click_in_the_middle_of_crop(SELECT_HORSE_1_CROP)
            else:
                select_horse()
                balance_string = f"{get_balance()},\"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}\""
                print(balance_string)
                with open('log.csv', 'a') as file:
                    file.write(balance_string + '\n')
                select_bet_amount()

            place_bet()
            games_played += 1
            # print(f"Games played: {games_played}")

            if GAME_TITLE == 'FiveM':
                time.sleep(5.75 * 60)

                winner_odds = get_text_from_crop(WINNER_ODDS_CROP)
                print(f"Winner odds: {winner_odds}")

                pydirectinput.press('esc')

                if games_played % 3 == 0:
                    pydirectinput.press('esc')
                    time.sleep(0.1)
                    pydirectinput.press('esc')
                    time.sleep(0.1)
                    pydirectinput.press('esc')
                    time.sleep(5)
                    pydirectinput.press('e')
                    time.sleep(5)
                    pydirectinput.press('enter')
                    select_game()

            else:
                time.sleep(30)
                record_results()
                bet_again()

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
