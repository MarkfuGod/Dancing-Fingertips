import pygame

WINDOW_NAME = "HandGesture Master"
GAME_TITLE = WINDOW_NAME
EXTRA_TITLE = "Medal Collectoin"
RECORDS_TITLE = "Records"
MODE_TITLE = "Choose Mode"
MEDAL = "title"
MEDAL_NAMES = ["bronze","silver","gold"]
SCORES = ["60","80","100"]
SCREEN_WIDTH, SCREEN_HEIGHT = 1200, 700

FPS = 90
DRAW_FPS = True

#on/off
MEDAL_GET = [1,1,1]
with open("Assets/medal/status.txt", "r") as f:
    s = f.readline() #1 means off
    MEDAL_GET[0] = int(s[0])
    MEDAL_GET[1] = int(s[1])
    MEDAL_GET[2] = int(s[2])
    f.close()

# sizes
BUTTONS_SIZES = (240, 90)
HAND_SIZE = 200
HAND_HITBOX_SIZE = (60, 80)
HANDGESTURES_SIZES = (50, 38)
HANDGESTURE_SIZE_RANDOMIZE = (1,2) # for each new hand gesture, it will multiply the size with an random value beteewn X and Y
BOMB_SIZES = (50, 50)
BOMB_SIZE_RANDOMIZE = (1.2, 1.5)
MEDAL_SIZE = (245, 316)
MODE_SIZE = (329,193)

#positions
DEFAULT_BOTTON_POS_X = SCREEN_WIDTH//2 - BUTTONS_SIZES[0]//2
MEDAL_POS = (SCREEN_WIDTH//3-280, SCREEN_HEIGHT//3)
MODE_POS = (SCREEN_WIDTH//3-400, SCREEN_HEIGHT//3)
MEDAL_POS_X_INC = 350
MEDAL_POS_Y_INC = 200
MODE_POS_X_INC = 450
MODE_POS_Y_INC = 200
# drawing
DRAW_HITBOX = False # will draw all the hitbox

# animation
ANIMATION_SPEED = 0.08 # the frame of the hand gestures will change every X sec
MEDAL_ANIMATION_FRAMES = 5
MEDAL_ANIMATION_POS = (SCREEN_WIDTH//3 + 80, SCREEN_HEIGHT//3 - 60)
# difficulty
GAME_DURATION = 10 # the game will last X sec
HANDGESTURES_SPAWN_TIME = 2
HANDGESTURES_MOVE_SPEED = {"min": 1, "max": 5}
BOMB_PENALITY = 1 # will remove X of the score of the player (if he kills a bomb)

# colors
COLORS = {"title": (38, 61, 39), "score": (38, 61, 39), "timer": (38, 61, 39),
          "gold":(96,49,20),"silver":(33,81,78),"bronze":(94,40,41),
          "buttons": {"default": (56, 67, 209), "second":  (87, 99, 255),
                        "text": (255, 255, 255), "shadow": (46, 54, 163)}} # second is the color when the mouse is on the button

# sounds / music
MUSIC_VOLUME = 0.16 # value between 0 and 1
SOUNDS_VOLUME = 1

# fonts
pygame.font.init()
FONTS = {}
FONTS["small"] = pygame.font.Font("Silver.ttf", 40)
FONTS["medium"] = pygame.font.Font("Silver.ttf", 72)
FONTS["big"] = pygame.font.Font("Silver.ttf", 120)
LABEL_FONT = {
    'fontsize':20,
    'color':'gold'
}
