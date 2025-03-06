import collections
import matplotlib.pyplot as plt
import numpy as np

# 1) SINGLE-SPIN PMF DEFINITION
p_ankh    = 3/32
p_pharaoh = 1/32
p_seven   = 2/32
p_bell    = 2/32
p_melon   = 2/32
p_cherry  = 3/32
p_plum    = 3/32

def net_gain(m):
    """Net gain = (payout_multiplier * 2500) - 2500."""
    return 2500*m - 2500

# Build single-spin PMF as a dict {Y_value: probability}
pmf_single = {}

pmf_single[net_gain(5000)] = (p_pharaoh)**3            # 3 Pharaohs
pmf_single[net_gain(500)]  = (p_ankh)**3               # 3 Ankhs
pmf_single[net_gain(250)]  = (p_seven)**3              # 3 Sevens
pmf_single[net_gain(100)]  = (p_bell)**3               # 3 Bells
pmf_single[net_gain(75)]   = (p_melon)**3              # 3 Melons
pmf_single[net_gain(50)]   = (p_plum)**3               # 3 Plums
pmf_single[net_gain(25)]   = (p_cherry)**3             # 3 Cherries

p2_ankh = 3 * (p_ankh**2) * (1 - p_ankh)                # Exactly 2 Ankhs
pmf_single[net_gain(5)] = p2_ankh

p1_ankh = 3 * p_ankh * ((1 - p_ankh)**2)                # Exactly 1 Ankh
pmf_single[net_gain(2)] = p1_ankh

p_other = 1 - sum(pmf_single.values())                  # Everything else = no payout
pmf_single[net_gain(0)] = p_other

# 2) CONVOLUTION FUNCTION
def convolve_pmf(pmf1, pmf2):
    """
    Convolves two discrete PMFs (dictionaries {value: probability}).
    Returns a new dict: {value: probability} for the sum.
    """
    result = collections.defaultdict(float)
    for val1, p1 in pmf1.items():
        for val2, p2 in pmf2.items():
            result[val1 + val2] += p1 * p2
    return dict(result)

# --- Continuous/Incremental Plotting ---

plt.ion()  # Turn on interactive mode for updating plots

pmf_current = dict(pmf_single)
num_spins = 0

while True:
    num_spins += 1
    
    # 1) Filter out any zero probabilities to avoid log(0) issues
    nonzero_items = [(b, p) for b, p in pmf_current.items() if p > 0]
    if not nonzero_items:
        # If everything somehow ended up at zero, just break
        break

    # Sort by balance
    sorted_balances, probabilities = zip(*sorted(nonzero_items, key=lambda x: x[0]))

    # 2) Clear the current plot and redraw
    plt.clf()
    plt.plot(sorted_balances, probabilities)
    plt.xlabel("Final Balance")
    plt.ylabel("Probability")
    plt.title(f"PMF After {num_spins} Spins")
    
    # Use a log scale on the x-axis
    plt.xscale("symlog")
    
    # 3) Brief pause to allow the plot to update
    plt.pause(0.1)
    
    # 4) Convolve with one more spin
    pmf_current = convolve_pmf(pmf_current, pmf_single)

# NOTE:
#  - This will run indefinitely until you interrupt the execution (Ctrl+C).
#  - Use plt.ioff() if you need to stop interactive mode after breaking out.
