import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { Audio } from 'expo-av';
import * as Haptics from "expo-haptics";
import HealthBar from './healthBar';
import exercises from './src/data/exercises.json';
import enemies from './src/data/enemies.json';

const Daily = () => {
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [muscleGroup, setMuscleGroup] = useState('');
    const [enemy, setEnemy] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [enemyHealth, setEnemyHealth] = useState(0);
    const [enemyMaxHealth, setEnemyMaxHealth] = useState(0);
    const [sound, setSound] = useState(null);
    const [damageText, setDamageText] = useState('');

    useEffect(() => {
        const muscleGroups = [...new Set(exercises.map(exercise => exercise.muscleGroup))];
        const selectedMuscleGroup = chooseRandomItem(muscleGroups);

        setMuscleGroup(selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1));

        const exercisesInGroup = exercises.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);
        const selectedExercises = chooseRandomItems(exercisesInGroup, 4);

        setSelectedExercises(selectedExercises);

        const randomEnemy = chooseRandomItem(enemies);
        const enemyHP = randomEnemy.health;
        setEnemy(randomEnemy);
        setEnemyHealth(enemyHP);
        setEnemyMaxHealth(enemyHP);
    }, []);

    useEffect(() => {
        if (damageText) {
            const timer = setTimeout(() => {
                setDamageText('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [damageText]);

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

    const handleExercisePress = (exercise) => {1
        setCurrentExercise(exercise);
        setModalVisible(true);
        Haptics.selectionAsync();
    };

    const handleDonePress = async () => {
        const baseDamage = currentExercise.baseDamage;
        const additionalDamage = Math.floor(Math.random() * 6) + 1;
        const criticalChance = Math.random() < 0.05;
        const totalDamage = baseDamage + additionalDamage + (criticalChance ? baseDamage : 0);

        if (criticalChance) {
            console.log('Critical Hit!');
        }
        console.log('Additional Damage:', additionalDamage);

        setEnemyHealth(prevHealth => Math.max(prevHealth - totalDamage, 0));
        setDamageText(`-${totalDamage}${criticalChance ? '!!' : '!'}`);
        setModalVisible(false);
        Haptics.selectionAsync();

        const soundFile = criticalChance ? require('../assets/sfx/criticalHit.wav') : require('../assets/sfx/hit.wav');

        if (soundFile) {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
        }
    };

    const windowWidth = Dimensions.get('window').width;

    return (
        <View style={styles.container}>
            {enemy !== null && enemy !== undefined && (
                <ImageBackground
                    source={{ uri: `${enemy.biome}` }}
                    style={styles.enemyContainer}
                >
                    <HealthBar health={enemyHealth} maxHealth={enemyMaxHealth} />
                    <Image
                        source={{ uri: `${enemy.image}` }}
                        style={styles.enemyImage}
                    />
                    {damageText ? <Text style={[styles.damageText, damageText.includes('!!') ? { color: 'orange' } : null]}>{damageText}</Text> : null}
                </ImageBackground>
            )}
            <Text style={styles.heading}>It's {muscleGroup} Day!</Text>
            <View style={styles.movesContainer}>
                {selectedExercises.map((exercise, index) => (
                    <View style={[styles.buttonContainer, { width: '50%' }]} key={index}>
                        <TouchableOpacity
                            onPress={() => handleExercisePress(exercise)}
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
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    {currentExercise && (
                        <>
                            <Text style={styles.modalTitle}>{currentExercise.name}</Text>
                            <Text style={styles.modalSubtitle}>Reps: {currentExercise.amount}</Text>
                            <Image source={{ uri: currentExercise.animation }} style={styles.modalImage} />
                            <TouchableOpacity onPress={handleDonePress} style={styles.doneButton}>
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
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
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    doneButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
    },
    damageText: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
});

export default Daily;

