using Plots
using StatsBase

# 1) SINGLE-SPIN PMF DEFINITION
p_ankh    = 3/32
p_pharaoh = 1/32
p_seven   = 2/32
p_bell    = 2/32
p_melon   = 2/32
p_cherry  = 3/32
p_plum    = 3/32

# Function to compute net gain
net_gain(m) = 2500 * m - 2500

# Build single-spin PMF as a Dict {Y_value => probability}
pmf_single = Dict(
    net_gain(5000) => (p_pharaoh)^3,    # 3 Pharaohs
    net_gain(500)  => (p_ankh)^3,       # 3 Ankhs
    net_gain(250)  => (p_seven)^3,      # 3 Sevens
    net_gain(100)  => (p_bell)^3,       # 3 Bells
    net_gain(75)   => (p_melon)^3,      # 3 Melons
    net_gain(50)   => (p_plum)^3,       # 3 Plums
    net_gain(25)   => (p_cherry)^3,     # 3 Cherries
)

# Add probabilities for 1 or 2 Ankhs
p2_ankh = 3 * (p_ankh^2) * (1 - p_ankh) # Exactly 2 Ankhs
pmf_single[net_gain(5)] = p2_ankh

p1_ankh = 3 * p_ankh * ((1 - p_ankh)^2) # Exactly 1 Ankh
pmf_single[net_gain(2)] = p1_ankh

# Probability of no payout
p_other = 1 - sum(values(pmf_single))
pmf_single[net_gain(0)] = p_other

# 2) CONVOLUTION FUNCTION
function convolve_pmf(pmf1::Dict, pmf2::Dict)
    """
    Convolves two discrete PMFs (Dictionaries {value => probability}).
    Returns a new Dict: {value => probability} for the sum.
    """
    result = Dict{Int, Float64}()
    for (val1, p1) in pmf1
        for (val2, p2) in pmf2
            new_val = val1 + val2
            result[new_val] = get(result, new_val, 0.0) + p1 * p2
        end
    end
    return result
end

function run_simulation()
    # Ensure local scope inside function
    pmf_current = deepcopy(pmf_single)
    num_spins = 0

    plot_obj = plot(legend=false, xlabel="Final Balance", ylabel="Probability", title="PMF After 0 Spins")

    while true
        num_spins += 1

        # 1) Filter out zero probabilities to avoid log(0) issues
        nonzero_items = filter(x -> x[2] > 0, collect(pmf_current))
        if isempty(nonzero_items)
            break
        end

        # Sort by balance
        sorted_data = sort(nonzero_items, by=x->x[1])
        sorted_balances = first.(sorted_data)
        probabilities = last.(sorted_data)

        # 2) Clear the current plot and redraw
        plot!(plot_obj, sorted_balances, probabilities, seriestype=:scatter, marker=:circle, markersize=2)
        title!(plot_obj, "PMF After $num_spins Spins")
        display(plot_obj)

        # 3) Short pause to update plot
        sleep(0.1)

        # 4) Convolve with one more spin
        pmf_current = convolve_pmf(pmf_current, pmf_single)
    end
end

# Run the simulation
run_simulation()
