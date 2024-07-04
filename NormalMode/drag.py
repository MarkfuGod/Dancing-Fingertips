import pygame

from ball import Ball
from hand_tracking import HandTracking
from hand import Hand
from scroll_bar import ScrollBar
from card import Card


class Drag:
    def __init__(self):

        self.is_draw = False
        self.which_card = ""

    def update(self, hand, ball_handle, surface, lane, hand_tracking, scroll_bar):
   
        
        if hand.left_click:
            if hand_tracking.love:
                
                for card in scroll_bar.card_list:
                    if card.rect.collidepoint(hand.rect.center) and card.get_card_type() == "card_ice":
                        
                        card.card_rect.center = hand.rect.center
                        card.move = True  
                        card.is_drag = True
            if hand_tracking.two_fingers_up:
                
                for card in scroll_bar.card_list:
                    if card.rect.collidepoint(hand.rect.center) and card.get_card_type() == "card_fire":
                        
                        card.card_rect.center = hand.rect.center
                        card.move = True  
                        card.is_drag = True
            if hand_tracking.six:
                
                for card in scroll_bar.card_list:
                    if card.rect.collidepoint(hand.rect.center) and card.get_card_type() == "card_golden":
                        
                        card.card_rect.center = hand.rect.center
                        card.move = True  
                        card.is_drag = True
            if hand_tracking.finger_up:
                
                for card in scroll_bar.card_list:
                    if card.rect.collidepoint(hand.rect.center) and card.get_card_type() == "card_ground":
                        
                        card.card_rect.center = hand.rect.center
                        card.move = True  
                        card.is_drag = True
        else:
            
            for card in scroll_bar.card_list:
                card.is_drag = False
                if card.move:
                    
                    if card.rect.collidepoint((200, 230)):
                        self.which_card = card.get_card_type()
                        self.is_draw = True
                        card.move = False  
                        card.kill()
                        
                        if not card.has_used:
                            card.ball.rect.center = (200, 230)
                            ball_handle.ball_list.add(card.ball)
                            card.has_used = True
                    elif card.rect.collidepoint((200, 400)):
                        self.which_card = card.get_card_type()
                        self.is_draw = True
                        card.move = False  
                        card.kill()
                        
                        if not card.has_used:
                            card.ball.rect.center = (200, 400)
                            ball_handle.ball_list.add(card.ball)
                            card.has_used = True
                    elif card.rect.collidepoint((200, 550)):
                        self.which_card = card.get_card_type()
                        self.is_draw = True
                        card.move = False  
                        card.kill()
                        
                        if not card.has_used:
                            card.ball.rect.center = (200, 550)
                            ball_handle.ball_list.add(card.ball)
                            card.has_used = True
                    if not (card.rect.collidepoint((200, 230)) or card.rect.collidepoint(
                            (200, 400)) or card.rect.collidepoint((200, 550))):
                        
                        card.move = False  
                        scroll_bar.add_card1(card)  
        return self.which_card, self.is_draw
