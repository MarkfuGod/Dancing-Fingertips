import ui
import image
from record_plot import PlotRecord
from menu import Menu
from background import Background
from settings import *
class Mode(Menu):
    def __init__(self, surface):
        super().__init__(surface)
        self.background = Background("Assets/Background_blurred")
        self.images  = [image.load("Assets/Mode/challenge.png",size=MODE_SIZE),
                        image.load("Assets/Mode/normal.png",size=MODE_SIZE),
                        ]
        self.string = ""
    def draw(self):
        self.background.draw(self.surface)
        # draw title
        ui.draw_text(self.surface, MODE_TITLE, (SCREEN_WIDTH//2, 120), COLORS["title"], font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255), pos_mode="center")
        for i in range(2):
            self.draw_mode(i)
        
    def draw_mode(self,mode):
        pos = (MODE_POS[0]+(mode%3)*MODE_POS_X_INC, MODE_POS[1]+(mode//4)*MODE_POS_Y_INC)
        image.draw(self.surface, self.images[mode], pos=pos)
        if mode == 0:
            if ui.button(self.surface, pos_y=pos[1]+MODE_SIZE[1]+30,pos_x=pos[0]+45,
                        text="catch wind",click_sound=self.click_sound):
                self.string = "challenge"
        elif mode == 1:
            if ui.button(self.surface, pos_y=pos[1]+MODE_SIZE[1]+30,pos_x=pos[0]+45,
                        text="defence",click_sound=self.click_sound):
                self.string = "normal"
           
    def update(self):
        self.string = ""
        self.draw()
        if ui.button(self.surface, pos_y=20, pos_x=20,
                     text="Back", click_sound=self.click_sound):
            return "menu"
        return self.string
        