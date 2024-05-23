import React from 'react';
import { Image, StyleSheet, Platform } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TitleScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome to RPG Elden Fit!</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 1: Start your journey</ThemedText>
                <ThemedText>
                    Begin by setting up your character and fitness goals.
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 2: Level up your workouts</ThemedText>
                <ThemedText>
                    Earn experience points by completing workouts and challenges.
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Step 3: Conquer your fitness quests</ThemedText>
                <ThemedText>
                    Embark on quests and defeat monsters with your fitness prowess.
                </ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    stepContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    logo: {
        height: 200,
        width: 200,
        alignSelf: 'center',
    },
});
