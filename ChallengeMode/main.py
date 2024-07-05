# Setup Python ----------------------------------------------- #
import os
import sys
import pygame
import subprocess
from settings import *
from game_mode import Mode
from game import Game
from menu import Menu
from extra import Extra
from records import Records
from hexagon import *
from lane import Lane
from ball import BallHandle
from enemy import EnemyHandle
from scroll_bar import ScrollBar
from normal_settings import LANE_X, LANE_Y, LANE_VEL
from normal_main  import NormalMode
# Setup pygame/window --------------------------------------------- #
os.environ['SDL_VIDEO_WINDOW_POS'] = "%d,%d" % (100,32) # windows position
pygame.init()
pygame.display.set_caption(WINDOW_NAME)
SCREEN = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT),0,32)

mainClock = pygame.time.Clock()

# Fonts ----------------------------------------------------------- #
fps_font = pygame.font.SysFont("Silver.ttf", 22)

# Music ----------------------------------------------------------- #
pygame.mixer.music.load("Assets/Sounds/background.mp3")
pygame.mixer.music.set_volume(MUSIC_VOLUME)
pygame.mixer.music.play(-1)
# Variables ------------------------------------------------------- #
state = "menu"

# Creation -------------------------------------------------------- #
mode = Mode(SCREEN)
challenge = Game(SCREEN)
menu = Menu(SCREEN)
extra = Extra(SCREEN)
records = Records(SCREEN)
#Initiation of NormalMode
normal = NormalMode()

# Functions ------------------------------------------------------ #
def user_events():
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()


def update():
    global state
    if state == "mode":
        if mode.update() == "menu":
            state = "menu"
        elif mode.update() == "challenge":
            challenge.reset() # reset the game to start a new game
            state = "challenge"
        elif mode.update() == "normal":
            normal.main()
            state = "mode"
        
    elif state == "menu":
        if menu.update() == "mode":
            state = "mode"
        elif menu.update() == "extra":
            state = "extra"
        elif menu.update() == "records":
            state = "records"
    elif state == "challenge":
        if challenge.update() == "mode":
            state = "mode"
    #elif state == "normal":
        #if normal.update() == "mode":
            #state = "mode"
    elif state == "extra":
        if extra.update() == "menu":
            state = "menu"
    elif state == "records":
        if records.update() == "menu":
            state = "menu"
    pygame.display.update()
    mainClock.tick(FPS)



# Loop ------------------------------------------------------------ #
while True:

    # Buttons ----------------------------------------------------- #
    user_events()

    # Update ------------------------------------------------------ #
    update()

    # FPS
    if DRAW_FPS:
        fps_label = fps_font.render(f"FPS: {int(mainClock.get_fps())}", 1, (255,200,20))
        SCREEN.blit(fps_label, (5,5))
