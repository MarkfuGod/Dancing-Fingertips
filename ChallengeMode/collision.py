import time

import pygame
import  image
from ball import Ball
from normal_settings import  ENEMY_SIZES
class Collision:
    @staticmethod
    def collide_with_element(ball, enemy_group, game):
        """
        detect collision between ball and enemy
        
        """
        collided_enemies = pygame.sprite.spritecollide(ball, enemy_group, False)
        for enemy in collided_enemies:
            if Ball.get_card_type(ball) == 'card_golden' and not enemy.collided and not enemy.enchanted:
                enemy.enchanted = True
                ball.clear_image()
                #game.score += 20
                if enemy.frozen:  
                    enemy.frozen = False  
            elif Ball.get_card_type(ball) == 'card_fire':
                enemy.fired = True
                enemy.fired_time = time.time()
                #game.score += 20
                #enemy.state = False
                ball.clear_image()
                if enemy.frozen:  
                    enemy.frozen = False  
            elif Ball.get_card_type(ball) == 'card_ice' and not enemy.frozen:
                enemy.frozen = True
                enemy.frozen_time = time.time()
                ball.clear_image()
            elif Ball.get_card_type(ball) == 'card_ground' and ball.effected_by_card_ground and enemy.affected_by_card_ground:
                if ball.rect.x >= 1050:  
                    
                    ball.kill()  
                else:
                    enemy.move_right()
                ball.effected_by_card_ground = False
                enemy.affected_by_card_ground = False
            elif Ball.get_card_type(
                    ball) == 'card_ground' and ball.effected_by_card_ground == False and enemy.affected_by_card_ground == False:
                if ball.rect.x >= 1050:  
                   
                    ball.kill() 
                else:
                    enemy.move_right()
                
        return False

    @staticmethod
    def collide_with_cart(cart,  enemy_group):
        collide_enemies = pygame.sprite.spritecollide(cart, enemy_group, False)
        for enemy in collide_enemies:
            enemy.kill()
            if not cart.collided:
                cart.collided = True


    def enemy_turned(self, enemy_group):
        for enemy in enemy_group:
            if enemy.enchanted:
                enemy.enemy_move_right()
                collided_enemies = pygame.sprite.spritecollide(enemy, enemy_group, False)
                for target_enemy in collided_enemies:
                    if target_enemy != enemy:  
                        enemy.remove_from_group()  
                        target_enemy.remove_from_group()  

    def game_state(self, enemy_handle):
        """
                judge game state
                :param enemy_handle: Spirits of Enemy
                """
        if len(enemy_handle.enemy_list) == 0:
            print("Victory！")  
            return 1
        
        for enemy in enemy_handle.enemy_list:
            if enemy.rect.x <= 300:  
                print("You Lose！")  
                
                return 2
        return 0
