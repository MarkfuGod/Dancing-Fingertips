import ui
from menu import Menu
from settings import *

class Records(Menu):
    def draw(self):
        self.background.draw(self.surface)
        # draw title
        ui.draw_text(self.surface, RECORDS_TITLE, (SCREEN_WIDTH//2, 120), COLORS["title"], font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255), pos_mode="center")
    def update(self):
        self.draw()
        if ui.button(self.surface, pos_y=20, pos_x=20,
                     text="Back", click_sound=self.click_sound):
            return "menu"