import math
import matplotlib.pyplot as plt

# 1) Compute single-spin PMF
p_ankh    = 3/32
p_pharaoh = 1/32
p_seven   = 2/32
p_bell    = 2/32
p_melon   = 2/32
p_cherry  = 3/32
p_plum    = 3/32

def net_gain(m): 
    """Net gain after subtracting the 2500 bet."""
    return 2500*m - 2500

pmf_single_spin = {}

# Probabilities for 3-of-a-kind
pmf_single_spin[net_gain(5000)] = (p_pharaoh) ** 3   # 3 Pharaohs
pmf_single_spin[net_gain(500)]  = (p_ankh)    ** 3   # 3 Ankhs
pmf_single_spin[net_gain(250)]  = (p_seven)   ** 3   # 3 Sevens
pmf_single_spin[net_gain(100)]  = (p_bell)    ** 3   # 3 Bells
pmf_single_spin[net_gain(75)]   = (p_melon)   ** 3   # 3 Melons
pmf_single_spin[net_gain(50)]   = (p_plum)    ** 3   # 3 Plums
pmf_single_spin[net_gain(25)]   = (p_cherry)  ** 3   # 3 Cherries

# 2 Ankhs
p2_ankh = 3 * (p_ankh**2) * (1 - p_ankh)
pmf_single_spin[net_gain(5)] = p2_ankh

# 1 Ankh
p1_ankh = 3 * p_ankh * ((1 - p_ankh)**2)
pmf_single_spin[net_gain(2)] = p1_ankh

# Probability of zero multiplier => lose entire bet
p_other = 1 - sum(pmf_single_spin.values())
pmf_single_spin[net_gain(0)] = p_other

# 2) Sort results by net gain
sorted_yvals = sorted(pmf_single_spin.keys())
probabilities = [pmf_single_spin[y] for y in sorted_yvals]

# 3) Plot
plt.bar(sorted_yvals, probabilities, width=10000)  # Widen bars just for visibility

# Set labels
plt.xlabel("Net Gain (Y) in One Spin")
plt.ylabel("Probability")

plt.title("Single-Game Net Gain Distribution")

plt.show()
