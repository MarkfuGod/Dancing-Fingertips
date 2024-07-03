import pygame
import random
import image
from card import Card
import settings


class ScrollBar(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()

        self.scroll_image = image.load("Assets/scroll_bar/scroll_bar.png", size=settings.SCROLL_BAR_SIZES)

        self.scroll_rect = self.scroll_image.get_rect(center=(600, 80))

        self.fire_num = random.randint(5, 10)
        self.ground_num = random.randint(5, 7)
        self.ice_num = random.randint(3, 6)
        self.golden_num = random.randint(4, 8)

        self.card_list = pygame.sprite.Group()

        self.last_added_time = pygame.time.get_ticks()

        self.add_card_interval = random.randint(2000, 5000)  # Randomize the initial interval

    def try_add_card(self):

        current_time = pygame.time.get_ticks()
        if len(self.card_list) < 9 and current_time - self.last_added_time > self.add_card_interval:

            card_types = ["card_ice", "card_fire", "card_golden", "card_ground"]

            ice_count = 0
            fire_count = 0
            golden_count = 0
            ground_count = 0

            for card_type in card_types:
                if card_type == "card_ice" and ice_count >= self.ice_num:
                    card_types.remove("card_ice")
                elif card_type == "card_fire" and fire_count >= self.fire_num:
                    card_types.remove("card_fire")
                elif card_type == "card_golden" and golden_count >= self.golden_num:
                    card_types.remove("card_golden")
                elif card_type == "card_ground" and ground_count >= self.ground_num:
                    card_types.remove("card_ground")

            if not card_types:
                return

            selected_type = random.choice(card_types)
            if selected_type == "card_ice":
                ice_count += 1
            elif selected_type == "card_fire":
                fire_count += 1
            elif selected_type == "card_golden":
                golden_count += 1
            elif selected_type == "card_ground":
                ground_count += 1

            self.add_card(Card(selected_type))
            self.last_added_time = current_time
            self.add_card_interval = random.randint(2000, 5000)  # Randomize the interval for the next card

    def add_card(self, card):

        self.card_list.add(card)
        last_card = None
        max_right = 0
        for c in self.card_list:
            if c.card_rect.right > max_right:
                max_right = c.card_rect.right
                last_card = c
        if last_card and last_card != card:

            card.card_rect.x = max_right + random.randint(50, 150)

    def add_card1(self, card):

        self.card_list.add(card)
        max_right = 0
        for c in self.card_list:
            if c.card_rect.right > max_right:
                max_right = c.card_rect.right

        card.card_rect.x = 100
        card.card_rect.y = 20

    def update(self, surface, enemy_handle, ball_handle):

        self.try_add_card()
        self.draw(surface)
        for card in self.card_list:
            card.update(self.scroll_rect, surface, enemy_handle)
            for other_card in self.card_list:
                if card != other_card and card.card_rect.colliderect(other_card.card_rect) and not other_card.moving:
                    card.moving = False

    def handle_card_collide(self):

        for card1 in self.card_list:
            card1.moving = True
            for card2 in self.card_list:
                if card1 != card2:
                    if card2.rect.colliderect(card1.rect) and not card1.is_drag and not card2.is_drag:
                        card2.rect.left = card1.rect.right + 5
                        card2.moving = False

    def draw(self, surface):

        surface.blit(self.scroll_image, self.scroll_rect)
        
        self.handle_card_collide()
        for card in self.card_list:
            card.draw(surface, self.scroll_rect)

    def reset(self):
        self.card_list.empty()  
        self.last_added_time = pygame.time.get_ticks()  
        self.add_card_interval = random.randint(2000, 5000)  
