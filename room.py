# -*- coding: utf-8 -*-
"""
Created on Fri Dec  2 21:16:57 2022

@author: joyal
"""
import pywebio
from pywebio import start_server
from pywebio.input import *
from pywebio.output import *
import nest_asyncio
nest_asyncio.apply()
def roomrentcalc():
    water_D = int(input("Dhana, Enter Number of water can "))
    water_J = int(input("Joyal, Enter Number of water can "))
    water_A = int(input("Asar, Enter Number of water can "))
    water_T = int(input("Thiru, Enter Number of water can "))
    water_S = int(input("Sathish, Enter Number of water can "))
    petrol_S = int(input("Sathish, Enter total petrol amount "))
    other_D = int(input("Dhana, Enter other expenses amount if any "))
    other_J = int(input("Joyal, Enter other expenses amount if any "))
    other_A = int(input("Asar, Enter other expenses amount if any "))
    other_T = int(input("Thiru, Enter other expenses amount if any "))
    other_S = int(input("Sathish, Enter other expenses amount if any"))
    
    amount_water_D = water_D * 30
    amount_water_J = water_J * 30
    amount_water_A = water_A * 30
    amount_water_T = water_T * 30
    amount_water_S = water_S * 30
    
    Total_water = (amount_water_D + amount_water_J + amount_water_A + amount_water_T + amount_water_S) / 5
    
    Total_petrol = (petrol_S) / 5
    
    Total_other = (other_D + other_J + other_A + other_T + other_S) / 5
    
    Total_Rent_D = Total_water + Total_petrol + Total_other + 2000 - amount_water_D - other_D
    Total_Rent_J = Total_water + Total_petrol + Total_other + 2000 - amount_water_J - other_J
    Total_Rent_A = Total_water + Total_petrol + Total_other + 2000 - amount_water_A - other_A
    Total_Rent_T = Total_water + Total_petrol + Total_other + 2000 - amount_water_T - other_T
    Total_Rent_S = Total_water + Total_petrol + Total_other + 2000 - amount_water_S - petrol_S - other_S
    
    Total = Total_Rent_D + Total_Rent_J + Total_Rent_A + Total_Rent_T + Total_Rent_S
    
    put_text("Total Rent amount for Dhana is",Total_Rent_D)
    put_text("Total Rent amount for Joyal is",Total_Rent_J)
    put_text("Total Rent amount for Asar is",Total_Rent_A)
    put_text("Total Rent amount for Thiru is",Total_Rent_T)
    put_text("Total Rent amount for Sathish is",Total_Rent_S)
    put_text("Total =",Total)

if __name__ == '__main__':
    start_server(roomrentcalc, debug=True, port=8042)