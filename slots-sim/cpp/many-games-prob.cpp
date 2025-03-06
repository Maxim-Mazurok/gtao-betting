#include <iostream>
#include <fstream>
#include <map>
#include <vector>
#include <cmath>
#include <thread>
#include <mutex>

using namespace std;

using PMF = map<int, double>; // Use map to maintain sorted order
mutex pmf_mutex; // Mutex for thread safety

// Net gain function
inline int net_gain(int m) {
    return 2500 * m - 2500;
}

// Define probabilities
constexpr double p_ankh = 3.0 / 32;
constexpr double p_pharaoh = 1.0 / 32;
constexpr double p_seven = 2.0 / 32;
constexpr double p_bell = 2.0 / 32;
constexpr double p_melon = 2.0 / 32;
constexpr double p_cherry = 3.0 / 32;
constexpr double p_plum = 3.0 / 32;

// Function to convolve two PMFs using multi-threading
PMF convolve_pmf(const PMF& pmf1, const PMF& pmf2, int num_threads) {
    PMF result;
    vector<thread> threads;
    vector<PMF> thread_results(num_threads);
    auto it1 = pmf1.begin();
    int chunk_size = pmf1.size() / num_threads;
    
    auto worker = [&](int thread_id, auto start_it, auto end_it) {
        for (auto it = start_it; it != end_it; ++it) {
            for (const auto& [val2, p2] : pmf2) {
                thread_results[thread_id][it->first + val2] += it->second * p2;
            }
        }
    };
    
    for (int i = 0; i < num_threads; i++) {
        auto start_it = it1;
        advance(it1, (i < num_threads - 1) ? chunk_size : distance(it1, pmf1.end()));
        threads.emplace_back(worker, i, start_it, it1);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    for (const auto& thread_pmf : thread_results) {
        for (const auto& [key, value] : thread_pmf) {
            result[key] += value;
        }
    }
    
    return result;
}

// Write PMF to CSV file
void write_pmf_to_file(const PMF& pmf, int game_number) {
    string filename = "game_" + to_string(game_number) + ".csv";
    ofstream file(filename);
    if (!file.is_open()) {
        cerr << "Error opening file: " << filename << endl;
        return;
    }
    
    file << "Final Balance,Probability\n";
    for (const auto& [balance, probability] : pmf) {
        if (probability > 0.0) { // Skip zero probabilities
            file << balance << "," << probability << "\n";
        }
    }
    file.close();
}

int main() {
    PMF pmf_single;
    constexpr int num_threads = 20; // Use 20 threads

    // Define single-spin PMF
    pmf_single[net_gain(5000)] = pow(p_pharaoh, 3);
    pmf_single[net_gain(500)] = pow(p_ankh, 3);
    pmf_single[net_gain(250)] = pow(p_seven, 3);
    pmf_single[net_gain(100)] = pow(p_bell, 3);
    pmf_single[net_gain(75)] = pow(p_melon, 3);
    pmf_single[net_gain(50)] = pow(p_plum, 3);
    pmf_single[net_gain(25)] = pow(p_cherry, 3);
    
    double p2_ankh = 3 * pow(p_ankh, 2) * (1 - p_ankh);
    pmf_single[net_gain(5)] = p2_ankh;

    double p1_ankh = 3 * p_ankh * pow(1 - p_ankh, 2);
    pmf_single[net_gain(2)] = p1_ankh;
    
    double p_other = 1.0;
    for (const auto& [_, p] : pmf_single) {
        p_other -= p;
    }
    pmf_single[net_gain(0)] = p_other;

    // Perform convolutions
    PMF pmf_current = pmf_single;
    int num_spins = 0;
    int save_interval = 100;
    
    while (true) {
        num_spins++;

        if (num_spins % save_interval == 1) {
            write_pmf_to_file(pmf_current, num_spins);
        }
        
        pmf_current = convolve_pmf(pmf_current, pmf_single, num_threads);
    }

    return 0;
}
