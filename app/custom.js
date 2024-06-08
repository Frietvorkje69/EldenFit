import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from "expo-av";

const Custom = () => {
    const navigation = useNavigation();
    const buttonSelectSound = useRef(new Audio.Sound());
    const customMusic = useRef(new Audio.Sound());

    useFocusEffect(
        React.useCallback(() => {
            const playMusic = async () => {
                try {
                    await customMusic.current.loadAsync(require("../assets/music/custom.mp3"));
                    await customMusic.current.playAsync();
                    await customMusic.current.setIsLoopingAsync(true);
                } catch (error) {
                    console.error("Failed to load the shop music", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await customMusic.current.stopAsync();
                    await customMusic.current.unloadAsync();
                } catch (error) {
                    console.error("Failed to stop the shop music", error);
                }
            };

            playMusic();

            return () => {
                stopMusic();
            };
        }, [])
    );

    useEffect(() => {
        const loadButtonSelectSound = async () => {
            try {
                await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
            } catch (error) {
                console.error("Failed to load the button select sound", error);
            }
        };

        loadButtonSelectSound();

        return () => {
            buttonSelectSound.current.unloadAsync();
        };
    }, []);

    const handlePress = async (muscleGroup) => {
        try {
            await buttonSelectSound.current.replayAsync();
            await AsyncStorage.setItem('CustomMuscle', muscleGroup);
            navigation.navigate('daily');
        } catch (error) {
            console.error('Failed to save the muscle group to local storage', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose a Muscle Group</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Back')}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Legs')}>
                    <Text style={styles.buttonText}>Legs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Chest')}>
                    <Text style={styles.buttonText}>Chest</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    title: {
        fontSize: 24,
        color: 'white',
        marginBottom: 20,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
    },
});

export default Custom;
