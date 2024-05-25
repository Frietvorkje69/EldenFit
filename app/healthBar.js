import React from 'react';
import { View, StyleSheet } from 'react-native';

const HealthBar = ({ health, maxHealth }) => {
    const width = (health / maxHealth) * 100;

    return (
        <View style={styles.healthBarContainer}>
            <View style={[styles.healthBar, { width: `${width}%` }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    healthBarContainer: {
        width: '80%',
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgb(144,238,144)'
    },
    healthBar: {
        height: '100%',
        backgroundColor: 'green',
    },
});

export default HealthBar;
