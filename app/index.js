import React, { useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
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
                console.error("Failed to load the logo hit sound", error);
            }
        };
        loadLogoHitSound();

        const loadButtonSelectSound = async () => {
            try {
                await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
            } catch (error) {
                console.error("Failed to load the button select sound", error);
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

    useFocusEffect(
        React.useCallback(() => {
            const playMusic = async () => {
                try {
                    await soundObject.current.loadAsync(require("../assets/music/main.mp3"));
                    await soundObject.current.playAsync();
                    await soundObject.current.setIsLoopingAsync(true);
                } catch (error) {
                    console.error("Failed to load the sound", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await soundObject.current.stopAsync();
                    await soundObject.current.unloadAsync();
                } catch (error) {
                    console.error("Failed to stop the sound", error);
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
            console.error("Failed to play the button select sound", error);
        }
    };

    const handleLogoPress = async () => {
        try {
            await logoHitSound.current.replayAsync();
        } catch (error) {
            console.error("Failed to play the logo hit sound", error);
        }
    };

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
                <TouchableOpacity style={styles.button} onPress={() => handleButtonPress("daily")}>
                    <Ionicons name="calendar-outline" size={24} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>Daily Workout</Text>
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
    buttonText: {
        color: "white",
        fontSize: 16,
        flex: 1,
        marginLeft: 10,
    },
    icon: {
        marginRight: 10,
    },
});
