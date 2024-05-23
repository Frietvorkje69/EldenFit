import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="daily" options={{ headerShown: false }} />
            <Stack.Screen name="custom" options={{ headerShown: false }} />
            <Stack.Screen name="shop" options={{ headerShown: false }} />
        </Stack>
    );
}
