import React from 'react';
import { View, StyleSheet } from 'react-native';

const HealthBar = ({ health, maxHealth }) => {
    const remainingWidth = (health / maxHealth) * 100;
    const depletedWidth = 100 - remainingWidth;

    return (
        <View style={styles.healthBarContainer}>
            <View style={[styles.depletedHealthBar, { width: `${depletedWidth}%` }]} />
            <View style={[styles.remainingHealthBar, { width: `${remainingWidth}%` }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    healthBarContainer: {
        width: '80%',
        height: 10,
        backgroundColor: 'rgba(0,0,0,0)',
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgb(144,238,144)',
        position: 'relative',
    },
    remainingHealthBar: {
        height: '100%',
        backgroundColor: 'green',
        position: 'absolute',
        left: 0,
    },
    depletedHealthBar: {
        height: '100%',
        backgroundColor: 'red',
        position: 'absolute',
        right: 0,
    },
});

export default HealthBar;
