import ui
import image
from record_plot import PlotRecord
from menu import Menu
from background import Background
from settings import *
class Records(Menu):
    def __init__(self, surface):
        self.record_plot = PlotRecord()
        super().__init__(surface)
        self.background = Background("Assets/Background_blurred")
    def draw(self):
        self.background.draw(self.surface)
        # draw title
        ui.draw_text(self.surface, RECORDS_TITLE, (SCREEN_WIDTH//2, 120), COLORS["title"], font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255), pos_mode="center")
        
        image_col = image.load("Assets/Record/record.png", size=(800, 600))
        image.draw(self.surface, image_col, (300, 100))
    def update(self):
        self.recordPlot()
        self.draw()
        if ui.button(self.surface, pos_y=20, pos_x=20,
                     text="Back", click_sound=self.click_sound):
            return "menu"
    def recordPlot(self):
        self.record_plot.plot_bar_chart()