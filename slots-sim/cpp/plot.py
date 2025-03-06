import matplotlib.pyplot as plt
import pandas as pd
import glob
import os
import numpy as np

def visualize_pmf(csv_folder):
    """Reads all CSV files and plots the PMF for each."""
    files = sorted(glob.glob(os.path.join(csv_folder, "game_*.csv")), 
                   key=lambda x: int(os.path.basename(x).split("_")[1].split(".")[0]))
    
    if not files:
        print("No CSV files found in the folder.")
        return
    
    latest_file = files[-1]
    
    plt.figure(figsize=(10, 6))
    
    df = pd.read_csv(latest_file)
    df = df.sort_values(by="Final Balance")  # Sort by Final Balance
    plt.plot(df["Final Balance"], df["Probability"], label=os.path.basename(latest_file))
    
    # Calculate the sum of all probabilities
    total_probability = df["Probability"].sum()
    print(f"Sum of all probabilities: {total_probability}")
    
    if np.isclose(total_probability, 1.0):
        print("The sum of all probabilities is approximately 1.")
    else:
        print("The sum of all probabilities is not 1.")
    
    plt.xlabel("Final Balance")
    plt.ylabel("Probability")
    # plt.yscale("log")
    # plt.xscale("symlog")
    plt.title("Probability Mass Function (PMF) for the Latest Game")
    plt.legend(loc="upper right", fontsize='small')
    plt.show()

if __name__ == "__main__":
    visualize_pmf("./")  # Change this path to your CSV folder
