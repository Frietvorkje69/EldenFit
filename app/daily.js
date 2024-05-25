import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HealthBar from './healthBar';
import exercises from './src/data/exercises.json';
import enemies from './src/data/enemies.json';

const Daily = () => {
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [muscleGroup, setMuscleGroup] = useState('');
    const [enemy, setEnemy] = useState(null);

    useEffect(() => {
        const muscleGroups = [...new Set(exercises.map(exercise => exercise.muscleGroup))];
        const selectedMuscleGroup = chooseRandomItem(muscleGroups);

        setMuscleGroup(selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1));

        const exercisesInGroup = exercises.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);
        const selectedExercises = chooseRandomItems(exercisesInGroup, 4);

        setSelectedExercises(selectedExercises);

        const randomEnemy = chooseRandomItem(enemies);
        setEnemy(randomEnemy);

    }, []);

    const chooseRandomItem = (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    const chooseRandomItems = (arr, count) => {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const renderStars = (difficulty) => {
        const stars = [];
        for (let i = 0; i < difficulty; i++) {
            stars.push(
                <Ionicons key={i} name="star" size={10} color="white" style={styles.star} />
            );
        }
        return stars;
    };

    const windowWidth = Dimensions.get('window').width;

    return (

        <View style={styles.container}>
            {enemy !== null && enemy !== undefined && (
                <ImageBackground
                    source={{ uri: `${enemy.biome}` }}
                    style={styles.enemyContainer}
                >
                    <HealthBar health={enemy.health} maxHealth={enemy.maxHealth} />
                    <Image
                        source={{ uri: `${enemy.image}` }}
                        style={styles.enemyImage}
                    />
                </ImageBackground>
            )}
            <Text style={styles.heading}>It's {muscleGroup} Day!</Text>
            <View style={styles.movesContainer}>
                {selectedExercises.map((exercise, index) => (
                    <View style={[styles.buttonContainer, { width: '50%' }]} key={index}>
                        <TouchableOpacity
                            onPress={() => alert(exercise.description)}
                            style={styles.button}
                        >
                            <View style={styles.starsContainer}>
                                {renderStars(exercise.difficulty)}
                            </View>
                            <Text style={styles.buttonText}>{exercise.name}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
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
    heading: {
        color: 'white',
        fontSize: 20,
        marginBottom: 20,
        textTransform: 'capitalize',
    },
    movesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    buttonContainer: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    button: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'white',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
        marginLeft: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    star: {
        marginRight: 2,
    },
    enemyContainer: {
        width: '100%',
        aspectRatio: 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    enemyImage: {
        width: '75%',
        height: '75%',
        resizeMode: 'contain',
    },
});

export default Daily;
