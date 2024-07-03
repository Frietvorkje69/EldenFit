// Statistics.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Statistics() {
    const [totalGold, setTotalGold] = useState(0);
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalDamage, setTotalDamage] = useState(0);
    const [dailyStreak, setDailyStreak] = useState([]);

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                const storedTotalGold = await AsyncStorage.getItem("totalGold");
                setTotalGold(storedTotalGold ? parseInt(storedTotalGold) : 0);

                const storedTotalCalories = await AsyncStorage.getItem("totalCalories");
                setTotalCalories(storedTotalCalories ? parseInt(storedTotalCalories) : 0);

                const storedTotalDamage = await AsyncStorage.getItem("totalDamage");
                setTotalDamage(storedTotalDamage ? parseInt(storedTotalDamage) : 0);

                let previousWorkouts = await AsyncStorage.getItem('previousWorkouts');
                previousWorkouts = previousWorkouts ? JSON.parse(previousWorkouts) : [];

                const currentDate = new Date();
                const updatedStreak = previousWorkouts.filter(workoutDate => {
                    const date = new Date(workoutDate);
                    const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
                    return diffDays <= 6;
                });

                setDailyStreak(updatedStreak);
            } catch (error) {
                console.error("Failed to load statistics from storage:", error);
            }
        };

        loadStatistics();
    }, []);

    const currentStreak = dailyStreak.length;

    return (
        <Animated.View style={styles.container}>
            <Text style={styles.title}>Statistics</Text>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Gold Earned</Text>
                <Text style={styles.statValue}>{totalGold}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Calories Burned</Text>
                <Text style={styles.statValue}>{totalCalories}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Damage Done</Text>
                <Text style={styles.statValue}>{totalDamage}</Text>
            </View>
            <View style={styles.streakBox}>
                <Text style={styles.streakLabel}>Current Week Streak</Text>
                <Text style={styles.streakValue}>{currentStreak} day(s)</Text>
                <View style={styles.streakContainer}>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.streakCircle,
                                dailyStreak.length > index && styles.filledStreakCircle,
                            ]}
                        />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        padding: 20,
    },
    title: {
        fontSize: 28,
        color: "#FFD700",
        marginBottom: 20,
        fontWeight: "bold",
    },
    statBox: {
        backgroundColor: "black",
        padding: 15,
        borderRadius: 10,
        width: '90%',
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "white",
    },
    statLabel: {
        fontSize: 18,
        color: "white",
        marginBottom: 5,
    },
    statValue: {
        fontSize: 24,
        color: "#FFD700",
        fontWeight: "bold",
    },
    streakBox: {
        backgroundColor: "black",
        padding: 15,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "white",
    },
    streakLabel: {
        fontSize: 18,
        color: "white",
        marginBottom: 5,
    },
    streakValue: {
        fontSize: 24,
        color: "#FFD700",
        fontWeight: "bold",
        marginBottom: 10,
    },
    streakContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    streakCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#333",
        margin: 5,
    },
    filledStreakCircle: {
        backgroundColor: "#51a3a6",
    },
});
