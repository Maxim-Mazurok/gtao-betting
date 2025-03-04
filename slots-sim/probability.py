import math

pA  = 3/32   # Probability(Ankh)
pC  = 3/32
pP  = 3/32
pM  = 2/32
pB  = 2/32
pS  = 2/32
pPh = 1/32

# Probabilities for exactly 3 of a kind
p3A  = pA**3
p3C  = pC**3
p3P  = pP**3
p3M  = pM**3
p3B  = pB**3
p3S  = pS**3
p3Ph = pPh**3

# Probabilities for exactly 2 Ankhs or exactly 1 Ankh
p2A = 3 * (pA**2) * (1 - pA)
p1A = 3 * pA * (1 - pA)**2

# (multiplier - 1) is the net profit (profit = payout - bet)
E_net = (
    p3A  * (500   - 1) +
    p3C  * (25    - 1) +
    p3P  * (50    - 1) +
    p3M  * (75    - 1) +
    p3B  * (100   - 1) +
    p3S  * (250   - 1) +
    p3Ph * (1000  - 1) +
    p2A  * (5     - 1) +
    p1A  * (2     - 1)
)

print("Expected net multiplier per 1 coin bet:", E_net)
print("Equivalent ROI in % =", E_net * 100)
