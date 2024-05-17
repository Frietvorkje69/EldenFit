import React, { useEffect, useRef } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { Audio } from "expo-av";

export default function Index() {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const playMusic = async () => {
            const soundObject = new Audio.Sound();
            try {
                await soundObject.loadAsync(require("../assets/music/main.mp3"));
                await soundObject.playAsync();
                await soundObject.setIsLoopingAsync(true);
            } catch (error) {
                console.error("Failed to load the sound", error);
            }
        };
        playMusic();

        Animated.loop(
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
            ]),
        ).start();

        return () => {
            let soundObject;
            soundObject.unloadAsync();
        };
    }, []);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "10deg"],
    });

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require("../assets/images/logo.png")}
                style={[styles.logo, { transform: [{ rotate: rotateInterpolate }] }]}
                resizeMode="contain"
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Daily Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
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
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
});

