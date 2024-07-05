# Setup Python ----------------------------------------------- #
import sys
import os

import normal_ui as ui
from normal_settings import *
from lane import Lane
from enemy import EnemyHandle
from normal_game import *
from ball import BallHandle
from hexagon import *

    # from game import Game
    # from menu import Menu
    # Setup pygame/window --------------------------------------------- #
class NormalMode():
    def __init__(self):
        os.environ['SDL_VIDEO_WINDOW_POS'] = "%d,%d" % (100, 32)  # windows position
        pygame.init()
        pygame.display.set_caption(WINDOW_NAME)
        self.SCREEN = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), 0, 32)

        self.mainClock = pygame.time.Clock()
        # Fonts ----------------------------------------------------------- #
        self.fps_font = pygame.font.SysFont("Silver.ttf", 22)

        # Music ----------------------------------------------------------- #
        pygame.mixer.music.load("NormalAssets/Sounds/background.mp3")
        pygame.mixer.music.set_volume(MUSIC_VOLUME)
        pygame.mixer.music.play(-1)


    def user_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()


    def update(self):
        pygame.display.update()
        self.mainClock.tick(FPS)

    def main(self):
        lane = [Lane(LANE_X, LANE_Y),
                Lane(LANE_X, LANE_Y + LANE_VEL),
                Lane(LANE_X, LANE_Y + LANE_VEL * 2)]

        hexagon1 = Hexagon(LANE_X + 30, LANE_Y)
        hexagon2 = Hexagon(LANE_X + 30, LANE_Y + LANE_VEL)
        hexagon3 = Hexagon(LANE_X + 30, LANE_Y + LANE_VEL * 2)

        scroll_bar = ScrollBar()
        ball_handle = BallHandle()
        enemy_handle = EnemyHandle(surface=self.SCREEN)
        game = Game(self.SCREEN, ball_handle, enemy_handle, scroll_bar)

        # Loop ------------------------------------------------------------ #
        while True:
            self.user_events()
            self.SCREEN.fill((255, 255, 255))
            self.SCREEN.blit(background, background_rect)

            hexagon1.draw_hexagon(self.SCREEN)
            hexagon2.draw_hexagon(self.SCREEN)
            hexagon3.draw_hexagon(self.SCREEN)
            # lane[0].draw_lane(SCREEN)
            # lane[1].draw_lane(SCREEN)
            # lane[2].draw_lane(SCREEN)
            game.update(ball_handle, self.SCREEN, lane, enemy_handle, scroll_bar)
            game.draw_score()

            self.update()


            if ui.button(self.SCREEN, 10, 10, "Restart"):
                game.reset()  


            pygame.display.flip()
            # FPS
            if DRAW_FPS:
                fps_label = self.fps_font.render(f"FPS: {int(self.mainClock.get_fps())}", 1, (255, 200, 20))
                self.SCREEN.blit(fps_label, (5, 5))

if __name__ == '__main__':
    launcher = NormalMode()
    launcher.main()