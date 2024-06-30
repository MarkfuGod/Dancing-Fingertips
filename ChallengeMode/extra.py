import ui
import os
import image
import threading
from menu import Menu
from settings import *


class Extra(Menu):
    def __init__(self, surface):
        # status = 0 means medal is unlocked
        self.status = MEDAL_GET
        self.images = [[],[],[]]
        self.load_medalImg_async()
        super().__init__(surface)
    def draw(self):
        self.background.draw(self.surface)
        # draw title
        ui.draw_text(self.surface, EXTRA_TITLE, (SCREEN_WIDTH//2, 120), COLORS["title"], font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255), pos_mode="center")
        self.status = MEDAL_GET
        self.load_medalImg_async()
        for i in range(3):
            self.draw_medal(i)
    def update(self):
        self.draw()
        if ui.button(self.surface, pos_y=20, pos_x=20, 
                    text="Back", click_sound=self.click_sound):
            return "menu"
    def load_medalImg(self,path,rank):
        image_lst = [os.path.join(path,f"{i+1+self.status[rank]*5}.png") for i in range(MEDAL_ANIMATION_FRAMES)]
        imgs = []
        for img in image_lst:
            imgs.append(image.load(img,size=MEDAL_SIZE))
        self.images[rank] = imgs
        
        
    def load_medalImg_async(self):
        threading.Thread(target=self.load_medalImg, 
                                  kwargs={"path":"Assets/medal/bronze/","rank":0}).start()
        threading.Thread(target=self.load_medalImg, 
                                  kwargs={"path":"Assets/medal/silver/","rank":1}).start()
        threading.Thread(target=self.load_medalImg, 
                                  kwargs={"path":"Assets/medal/gold/","rank":2}).start()
    def draw_medal(self,rank):
        
        current_frame = (pygame.time.get_ticks() // 600) % 2 + 3
        pos = (MEDAL_POS[0]+(rank%3)*MEDAL_POS_X_INC, MEDAL_POS[1]+(rank//4)*MEDAL_POS_Y_INC)
        image.draw(self.surface, self.images[rank][current_frame], pos=pos)
        ui.draw_text(self.surface, SCORES[rank], (pos[0]+MEDAL_SIZE[0]//2,pos[1]+MEDAL_SIZE[1]+30), 
                     COLORS[MEDAL_NAMES[rank]], font=FONTS["medium"],
                     shadow=True, shadow_color=(255,255,255), pos_mode="center")
        