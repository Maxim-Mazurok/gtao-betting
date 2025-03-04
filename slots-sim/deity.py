import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

# Slot symbols and their payouts
symbol_payouts = {
    'Ankh': {1: 2, 2: 5, 3: 500},
    'Cherries': {3: 25},
    'Plums': {3: 50},
    'Melons': {3: 75},
    'Bells': {3: 100},
    'Sevens': {3: 250},
    'Pharaohs': {3: 1000}
}

# All symbols on the reels in order of appearance in game, and empty strings to represent "between symbols"
# NOTE: not sure if spaces are accurate, from observing the game I had 80 picture vs 40 empty spaces, so it's like 2:1 instead of expected 1:1, could be just luck tho
symbols = [
    'Ankh', '',
    'Melons', '',
    'Cherries', '',
    'Plums', '',
    'Sevens', '',
    'Ankh', '',
    'Cherries', '',
    'Bells', '',
    'Plums', '',
    'Ankh', '',
    'Melons', '',
    'Plums', '',
    'Sevens', '',
    'Bells', '',
    'Cherries', '',
    'Pharaohs', '',]

# Simulate a single slot spin
def spin_reels():
    # Each reel stops randomly at a symbol but can land between symbols
    stops = np.random.choice(symbols, 3, replace=True)
    return stops

# Calculate payout for a spin
def calculate_payout(reels):
    payout = 0
    
    # Count occurrences of each symbol
    unique, counts = np.unique(reels, return_counts=True)
    occurrences = dict(zip(unique, counts))
    
    # Check for payouts
    for symbol, count in occurrences.items():
        if symbol in symbol_payouts and count in symbol_payouts[symbol]:
            payout += symbol_payouts[symbol][count]
    
    return payout

# Monte Carlo Simulation
def monte_carlo_simulation(num_games=100000, bet_amount=2500):
    balance = 0
    balance_history = [balance]
    
    for _ in range(num_games):
        balance -= bet_amount  # Deduct bet
        reels = spin_reels()  # Spin reels
        payout_multiplier = calculate_payout(reels)  # Get payout multiplier
        winnings = bet_amount * payout_multiplier
        balance += winnings  # Add winnings
        balance_history.append(balance)
    
    return balance_history

# Function to update the plot
def update_plot(event):
    if event.key == ' ':
        balance_history = monte_carlo_simulation()
        line.set_ydata(balance_history)
        ax.relim()
        ax.autoscale_view()
        plt.draw()

# Run simulation
balance_history = monte_carlo_simulation()

# Plot balance over time
fig, ax = plt.subplots(figsize=(10, 5))
line, = ax.plot(balance_history, label='Balance Over Time', color='b')
ax.axhline(0, color='red', linestyle='--', label='Break-even')
ax.set_xlabel('Games Played')
ax.set_ylabel('Balance')
ax.set_title('Monte Carlo Simulation of GTAO Slots: Deity of the Sun')
ax.legend()
ax.grid()

# Format y-axis to show regular numbers with commas
formatter = FuncFormatter(lambda x, pos: f'{int(x):,}')
ax.yaxis.set_major_formatter(formatter)

# Connect the event handler
fig.canvas.mpl_connect('key_press_event', update_plot)

plt.show()
