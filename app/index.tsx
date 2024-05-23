import React, { useEffect, useRef } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons

export default function Index() {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const soundObject = useRef(new Audio.Sound());
    const navigation = useNavigation();

    useEffect(() => {
        const playMusic = async () => {
            try {
                await soundObject.current.loadAsync(require("../assets/music/main.mp3"));
                await soundObject.current.playAsync();
                await soundObject.current.setIsLoopingAsync(true);
            } catch (error) {
                console.error("Failed to load the sound", error);
            }
        };
        playMusic();

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
            soundObject.current.unloadAsync();
            animation.stop();
        };
    }, [rotateAnim]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["-5deg", "5deg"],
    });

    const handleButtonPress = async (screenName: string) => {
        await Haptics.selectionAsync();
        // @ts-ignore
        navigation.navigate(screenName);
    };

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require("../assets/images/logo.png")}
                style={[styles.logo, { transform: [{ rotate: rotateInterpolate }] }]}
                resizeMode="contain"
            />
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
        flexDirection: "row", // Change to row for icon and text
        alignItems: "center", // Keep alignItems for centering text vertically
        borderWidth: 1,
        borderColor: "white",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        flex: 1, // Make text flexible to fill remaining space
        marginLeft: 10,
    }, icon: {
        marginRight: 10, // Add margin to the right of the icon
    }
});
