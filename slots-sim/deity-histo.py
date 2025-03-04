import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import threading
import time

# Slot symbols and their payouts
symbol_payouts = {
    'Ankh': {1: 2, 2: 5, 3: 500},
    'Cherries': {3: 25},
    'Plums': {3: 50},
    'Melons': {3: 75},
    'Bells': {3: 100},
    'Sevens': {3: 250},
    'Pharaohs': {3: 5000}
}

# All symbols on the reels in order of appearance in game, including empty spaces
symbols = [
    'Ankh', '', 'Melons', '', 'Cherries', '', 'Plums', '', 'Sevens', '',
    'Ankh', '', 'Cherries', '', 'Bells', '', 'Plums', '', 'Ankh', '',
    'Melons', '', 'Plums', '', 'Sevens', '', 'Bells', '', 'Cherries', '', 'Pharaohs', ''
]

# Simulate a single slot spin
def spin_reels():
    return np.random.choice(symbols, 3, replace=True)

# Calculate payout for a spin
def calculate_payout(reels):
    payout = 0
    unique, counts = np.unique(reels, return_counts=True)
    occurrences = dict(zip(unique, counts))
    
    for symbol, count in occurrences.items():
        if symbol in symbol_payouts and count in symbol_payouts[symbol]:
            payout += symbol_payouts[symbol][count]
    
    return payout

# Monte Carlo Simulation
def monte_carlo_simulation(num_games=5000, bet_amount=2500):
    balance = 0
    
    for _ in range(num_games):
        balance -= bet_amount  # Deduct bet
        reels = spin_reels()  # Spin reels
        payout_multiplier = calculate_payout(reels)  # Get payout multiplier
        winnings = bet_amount * payout_multiplier
        balance += winnings  # Add winnings
    
    return balance

# Run initial 5000 simulations
num_simulations = 10
final_balances = [monte_carlo_simulation() for _ in range(num_simulations)]
total_games = num_simulations * 5000

# Function to continuously run simulations and update plot
def continuous_simulation():
    global final_balances, total_games
    while True:
        new_balances = [monte_carlo_simulation() for _ in range(10)]
        final_balances.extend(new_balances)
        total_games += 10 * 5000  # Update total games played
        
        avg_balance = np.mean(final_balances)
        median_balance = np.median(final_balances)
        roi = (avg_balance / (total_games * 2500)) * 100  # ROI as percentage
        
        ax.clear()
        ax.hist(final_balances, bins=50, color='blue', edgecolor='black', alpha=0.7)
        ax.axvline(0, color='red', linestyle='--', label='Break-even')
        ax.axvline(avg_balance, color='green', linestyle='--', label=f'Avg Balance: {int(avg_balance):,}')
        ax.axvline(median_balance, color='orange', linestyle='--', label=f'Median Balance: {int(median_balance):,}')
        ax.set_xlabel('Final Balance')
        ax.set_ylabel('Frequency')
        ax.set_title(f'Distribution of Final Balances After 5000 Games ({len(final_balances)} Simulations)\nROI: {roi:.2f}%')
        ax.legend()
        ax.grid()
        ax.xaxis.set_major_formatter(FuncFormatter(lambda x, pos: f'{int(x):,}'))
        plt.draw()

# Plot histogram
fig, ax = plt.subplots(figsize=(10, 5))
ax.hist(final_balances, bins=50, color='blue', edgecolor='black', alpha=0.7)
ax.axvline(0, color='red', linestyle='--', label='Break-even')
ax.axvline(np.mean(final_balances), color='green', linestyle='--', label=f'Avg Balance: {int(np.mean(final_balances)):,}')
ax.axvline(np.median(final_balances), color='orange', linestyle='--', label=f'Median Balance: {int(np.median(final_balances)):,}')
ax.set_xlabel('Final Balance')
ax.set_ylabel('Frequency')
ax.set_title(f'Distribution of Final Balances After 5000 Games ({num_simulations} Simulations)')
ax.legend()
ax.grid()

# Format x-axis to show regular numbers with commas
ax.xaxis.set_major_formatter(FuncFormatter(lambda x, pos: f'{int(x):,}'))

# Start continuous simulation in a separate thread
threading.Thread(target=continuous_simulation, daemon=True).start()

plt.show()
