import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

const Shop = () => {
    const shopMusic = useRef(new Audio.Sound());

    useFocusEffect(
        React.useCallback(() => {
            const playMusic = async () => {
                try {
                    await shopMusic.current.loadAsync(require("../assets/music/shop.mp3"));
                    await shopMusic.current.playAsync();
                    await shopMusic.current.setIsLoopingAsync(true);
                } catch (error) {
                    console.error("Failed to load the shop music", error);
                }
            };

            const stopMusic = async () => {
                try {
                    await shopMusic.current.stopAsync();
                    await shopMusic.current.unloadAsync();
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

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>This is the Shop Screen!</Text>
            <Text>Coming soon - A place to buy new exercises and cosmetics!</Text>
        </View>
    );
};

export default Shop;
