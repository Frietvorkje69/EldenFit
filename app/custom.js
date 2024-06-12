import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
                    console.error("Failed to load the custom music", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await customMusic.current.stopAsync();
                    await customMusic.current.unloadAsync();
                } catch (error) {
                    console.error("Failed to stop the custom music", error);
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
            <Text style={styles.title}>Into the Custom Realm</Text>
            <Text style={styles.subtitle}>Choose a muscle group. This will enter a workout (fight) based on the muscles you wish to train.</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Back')}>
                    <Image source={require('../assets/images/icons/back.png')} style={styles.icon} />
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Legs')}>
                    <Image source={require('../assets/images/icons/legs.png')} style={styles.icon} />
                    <Text style={styles.buttonText}>Legs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handlePress('Chest')}>
                    <Image source={require('../assets/images/icons/chest.png')} style={styles.icon} />
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
        fontSize: 28,
        color: 'white',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        width: 250,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default Custom;
