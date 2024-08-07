// Index.js
import React, { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
    const [gold, setGold] = useState(0);
    const [isDailyAvailable, setIsDailyAvailable] = useState(true);
    const [dailyStreak, setDailyStreak] = useState([]);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const soundObject = useRef(new Audio.Sound());
    const logoHitSound = useRef(new Audio.Sound());
    const buttonSelectSound = useRef(new Audio.Sound());
    const navigation = useNavigation();

    useEffect(() => {
        const loadLogoHitSound = async () => {
            try {
                await logoHitSound.current.loadAsync(require("../assets/sfx/logoHit.wav"));
            } catch (error) {
                // console.error("Failed to load the logo hit sound", error);
            }
        };
        loadLogoHitSound();

        const loadButtonSelectSound = async () => {
            try {
                await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
            } catch (error) {
                // console.error("Failed to load the button select sound", error);
            }
        };
        loadButtonSelectSound();

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => {
            logoHitSound.current.unloadAsync();
            buttonSelectSound.current.unloadAsync();
            animation.stop();
        };
    }, [rotateAnim]);

    useEffect(() => {
        const loadGoldFromStorage = async () => {
            try {
                const storedGold = await AsyncStorage.getItem('gold');
                const goldValue = storedGold !== null ? parseInt(storedGold) : 0;
                setGold(goldValue);
            } catch (error) {
                // console.error('Failed to load gold from storage:', error);
            }
        };
        loadGoldFromStorage();

        const initializePlayerLevel = async () => {
            try {
                const storedPlayerLevel = await AsyncStorage.getItem('playerLevel');
                if (storedPlayerLevel === null) {
                    await AsyncStorage.setItem('playerLevel', '0');
                }
            } catch (error) {
                console.error('Failed to initialize player level in storage:', error);
            }
        };
        initializePlayerLevel();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const loadGoldFromStorage = async () => {
                try {
                    const storedGold = await AsyncStorage.getItem('gold');
                    const goldValue = storedGold !== null ? parseInt(storedGold) : 0;
                    setGold(goldValue);
                } catch (error) {
                    console.error('Failed to load gold from storage:', error);
                }
            };
            loadGoldFromStorage();

            const checkDailyBeaten = async () => {
                try {
                    const storedDailyBeaten = await AsyncStorage.getItem('dailyBeaten');
                    if (storedDailyBeaten) {
                        const lastBeatenDate = new Date(storedDailyBeaten);
                        const currentDate = new Date();

                        // Compare only the date part, not the time
                        const isSameDay = lastBeatenDate.toDateString() === currentDate.toDateString();

                        if (isSameDay) {
                            setIsDailyAvailable(false);
                        } else {
                            setIsDailyAvailable(true);
                        }
                    } else {
                        setIsDailyAvailable(true);
                    }
                } catch (error) {
                    console.error('Failed to load dailyBeaten from storage:', error);
                }
            };
            checkDailyBeaten();

            const loadDailyStreak = async () => {
                try {
                    let previousWorkouts = await AsyncStorage.getItem('previousWorkouts');
                    previousWorkouts = previousWorkouts ? JSON.parse(previousWorkouts) : [];

                    const currentDate = new Date();
                    const updatedStreak = previousWorkouts.filter(workoutDate => {
                        const date = new Date(workoutDate);
                        const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
                        return diffDays <= 6;
                    });

                    // Update streak in local storage
                    await AsyncStorage.setItem('previousWorkouts', JSON.stringify(updatedStreak));

                    setDailyStreak(updatedStreak);
                } catch (error) {
                    console.error('Failed to load daily streak from storage:', error);
                }
            };
            loadDailyStreak();

            const playMusic = async () => {
                try {
                    await soundObject.current.loadAsync(require("../assets/music/main.mp3"));
                    await soundObject.current.playAsync();
                    await soundObject.current.setIsLoopingAsync(true);
                } catch (error) {
                    // console.error("Failed to load the sound", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await soundObject.current.stopAsync();
                    await soundObject.current.unloadAsync();
                } catch (error) {
                    // console.error("Failed to stop the sound", error);
                }
            };

            playMusic();

            return () => {
                stopMusic();
            };
        }, [])
    );

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["-5deg", "5deg"],
    });

    const handleButtonPress = async (screenName) => {
        try {
            await buttonSelectSound.current.replayAsync();
            await Haptics.selectionAsync();
            navigation.navigate(screenName);
        } catch (error) {
            // console.error("Failed to play the button select sound", error);
        }
    };

    const handleLogoPress = async () => {
        try {
            await logoHitSound.current.replayAsync();
            await AsyncStorage.setItem('gold', '2000');
        } catch (error) {
            console.error("Failed to play the logo hit sound", error);
        }
    };

    const handleClearStorage = async () => {
        try {
            await AsyncStorage.clear();
            console.log("Local storage cleared.");
            setGold(0);
        } catch (error) {
            console.error("Failed to clear local storage:", error);
        }
    };

    const handleStreakPress = () => {
        navigation.navigate("statistics");
    };

    const currentStreak = dailyStreak.length;
    const rewardText = currentStreak >= 6 ? "Gold is now 2x!!" : currentStreak >= 3 ? "Gold is now 1.5x!" : "";

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleLogoPress}>
                <Animated.Image
                    source={require("../assets/images/logo.png")}
                    style={[styles.logo, { transform: [{ rotate: rotateInterpolate }] }]}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, !isDailyAvailable && styles.disabledButton]}
                    onPress={() => handleButtonPress("daily")}
                    disabled={!isDailyAvailable}
                >
                    <Ionicons name="calendar-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>{isDailyAvailable ? "Daily Workout" : "Daily Beaten!"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleButtonPress("shop")}>
                    <Ionicons name="cart-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleButtonPress("custom")}>
                    <Ionicons name="settings-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>Custom</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.streakInfoContainer} onPress={handleStreakPress}>
                <Text style={styles.streakText}>Week 1 Streak: {currentStreak} day(s)</Text>
                <Text style={styles.rewardText}>{rewardText}</Text>
                <View style={styles.streakContainer}>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.streakCircle,
                                dailyStreak.length > index && styles.filledStreakCircle,
                            ]}
                        >
                            {(index === 2 || index === 5) && (
                                <Ionicons name="diamond-outline" size={20} color="white" />
                            )}
                        </View>
                    ))}
                </View>
            </TouchableOpacity>
            <View style={styles.footerContainer}>
                <View style={styles.goldContainer}>
                    <Text style={styles.goldText}>Gold: {gold}</Text>
                </View>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
                    <Ionicons name="trash-outline" size={24} color="white" style={styles.clearIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 15,
    },
    buttonContainer: {
        alignItems: "center",
    },
    button: {
        backgroundColor: "black",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
    },
    disabledButton: {
        backgroundColor: "#400000",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        flex: 1,
        marginLeft: 10,
    },
    icon: {
        marginRight: 10,
    },
    streakInfoContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    streakText: {
        color: "white",
        fontSize: 18,
        marginBottom: 5,
    },
    rewardText: {
        color: "white",
        fontSize: 16,
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
        justifyContent: "center",
        alignItems: "center",
    },
    filledStreakCircle: {
        backgroundColor: "#51a3a6",
    },
    footerContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    goldText: {
        color: 'white',
        fontSize: 16,
    },
    clearButton: {
        padding: 10,
    },
    clearIcon: {
        color: 'white',
    },
});
