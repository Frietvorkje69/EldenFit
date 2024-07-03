import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Modal from 'react-native-modal';
import {Audio} from 'expo-av';
import * as Haptics from "expo-haptics";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import HealthBar from './components/healthBar';
import exercises from './src/data/exercisesShort.json'; // change back
import enemies from './src/data/enemies.json';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Global variable to track custom mode
let isCustomMode = false;
let totalCalories = 0;
let totalDamageDone = 0;
let currentPlayerLevel = 0;

const Daily = ({navigation}) => {
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [muscleGroup, setMuscleGroup] = useState('');
    const [enemy, setEnemy] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [enemyHealth, setEnemyHealth] = useState(0);
    const [enemyMaxHealth, setEnemyMaxHealth] = useState(0);
    const [damageText, setDamageText] = useState('');
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [isEnemyDefeated, setEnemyDefeated] = useState(false);
    const [showVictoryPopup, setShowVictoryPopup] = useState(false);
    const [disableMoves, setDisableMoves] = useState(false);
    const [gold, setGold] = useState(0);
    const [boughtItems, setBoughtItems] = useState([]);
    const [exerciseTimer, setExerciseTimer] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);
    const buttonSelectSound = useRef(new Audio.Sound());
    const battleMusic = useRef(new Audio.Sound());
    const victoryMusic = useRef(new Audio.Sound());
    const swap = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const playMusic = async () => {
                try {
                    await battleMusic.current.loadAsync(require("../assets/music/battle.mp3"));
                    await battleMusic.current.setIsLoopingAsync(true);
                    await battleMusic.current.playAsync();

                    await victoryMusic.current.loadAsync(require("../assets/music/victory.mp3"));
                } catch (error) {
                    // console.error("Failed to load the music", error);
                }
            };

            const stopMusic = async () => {
                isCustomMode = false;
                try {
                    await Promise.all([
                        battleMusic.current.stopAsync(),
                        battleMusic.current.unloadAsync(),
                        victoryMusic.current.stopAsync(),
                        victoryMusic.current.unloadAsync()
                    ]);
                } catch (error) {
                    // console.error("Failed to stop the music", error);
                }
            };

            playMusic();

            return () => {
                stopMusic();
            };
        }, [])
    );

    useEffect(() => {
        const loadPlayerLevel = async () => {
            try {
                const storedPlayerLevel = await AsyncStorage.getItem('playerLevel');
                if (storedPlayerLevel !== null) {
                    currentPlayerLevel = storedPlayerLevel;
                }
            } catch (error) {
                console.error('Failed to load player level from storage:', error);
            }
        };

        loadPlayerLevel();
    }, []);

    useEffect(() => {
        const loadBoughtItemsFromStorage = async () => {
            try {
                const storedBoughtItems = await AsyncStorage.getItem('boughtItems');
                const boughtItemsArray = storedBoughtItems ? JSON.parse(storedBoughtItems) : [];
                setBoughtItems(boughtItemsArray);
            } catch (error) {
                console.error('Failed to load bought items from storage:', error);
            }
        };
        loadBoughtItemsFromStorage();
    }, []);

    useEffect(() => {
        const loadCustomMuscleGroup = async () => {
            try {
                const customMuscleGroup = await AsyncStorage.getItem('CustomMuscle');
                if (customMuscleGroup) {
                    isCustomMode = true;
                    console.log('in Custom Workout Mode')
                } else {
                    console.log('in Daily Workout Mode')
                }
            } catch (error) {
                console.error('Failed to load custom muscle group from storage:', error);
            }
        };

        loadCustomMuscleGroup();
    }, []);

    useEffect(() => {
        const loadFightState = async () => {
            if (!isCustomMode) {
                try {
                    const storedFightState = await AsyncStorage.getItem('fightState');
                    if (storedFightState) {
                        const {
                            savedEnemy,
                            savedEnemyHealth,
                            savedEnemyMaxHealth,
                            savedMuscleGroup,
                            savedExercises
                        } = JSON.parse(storedFightState);
                        setEnemy(savedEnemy);
                        setEnemyHealth(savedEnemyHealth);
                        setEnemyMaxHealth(savedEnemyMaxHealth);
                        setMuscleGroup(savedMuscleGroup);
                        setSelectedExercises(savedExercises);
                    } else {
                        startNewFight();
                    }
                } catch (error) {
                    console.error('Failed to load fight state from storage:', error);
                    startNewFight();
                }
            } else {
                startNewFight();
            }

            const loadButtonSelectSound = async () => {
                try {
                    await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
                } catch (error) {
                    // console.error("Failed to load the button select sound", error);
                }
            };
            loadButtonSelectSound();
        };


        const startNewFight = async () => {
            let selectedMuscleGroup;

            if (isCustomMode) {
                selectedMuscleGroup = await AsyncStorage.getItem('CustomMuscle');
                await AsyncStorage.removeItem('CustomMuscle');
            } else {
                const muscleGroups = [...new Set(exercises.map(exercise => exercise.muscleGroup))];
                let previousDaily = await AsyncStorage.getItem('previousDaily');

                if (!previousDaily) {
                    selectedMuscleGroup = chooseRandomItem(muscleGroups);
                } else {
                    const filteredMuscleGroups = muscleGroups.filter(group => group !== previousDaily);
                    if (filteredMuscleGroups.length > 0) {
                        selectedMuscleGroup = chooseRandomItem(filteredMuscleGroups);
                    } else {
                        selectedMuscleGroup = chooseRandomItem(muscleGroups);
                    }
                }

                await AsyncStorage.setItem('previousDaily', selectedMuscleGroup);
            }

            console.log(selectedMuscleGroup);
            setMuscleGroup(selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1));
            const exercisesInGroup = exercises.filter(exercise => exercise.muscleGroup === selectedMuscleGroup);

            const exerciseItems = boughtItems.filter(item => item.category === 'Exercise' && item.muscleGroup === selectedMuscleGroup);
            const combinedExercises = [...exercisesInGroup, ...exerciseItems];

            const selectedExercises = chooseRandomItems(combinedExercises, 4);

            setSelectedExercises(selectedExercises);

            const randomEnemy = chooseRandomItem(enemies);
            const enemyHP = randomEnemy.health + (currentPlayerLevel * 20)
            console.log(currentPlayerLevel)
            setEnemy(randomEnemy);
            setEnemyHealth(enemyHP);
            setEnemyMaxHealth(enemyHP);

            const loadButtonSelectSound = async () => {
                try {
                    await buttonSelectSound.current.loadAsync(require("../assets/sfx/buttonSelect.wav"));
                } catch (error) {
                    //console.error("Failed to load the button select sound", error);
                }
            };
            loadButtonSelectSound();

            return () => {
                buttonSelectSound.current.unloadAsync();
            };
        }

        loadFightState();
    }, [boughtItems, isCustomMode]);

    useEffect(() => {
        if (damageText) {
            const timer = setTimeout(() => {
                setDamageText('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [damageText]);

    useEffect(() => {
        let delay;

        const handleVictory = async () => {
            if (isEnemyDefeated) {
                delay = setTimeout(() => {
                    setShowVictoryPopup(true);
                    battleMusic.current.stopAsync();
                    victoryMusic.current.playAsync();
                }, 500);

                setDisableMoves(true);
                if (!isCustomMode) {


                    const currentDate = new Date().toISOString();
                    let previousWorkouts = await AsyncStorage.getItem('previousWorkouts');

                    previousWorkouts = previousWorkouts ? JSON.parse(previousWorkouts) : [];

                    previousWorkouts.push(currentDate);

                    await AsyncStorage.setItem('previousWorkouts', JSON.stringify(previousWorkouts));
                    await AsyncStorage.setItem('dailyBeaten', currentDate);

                    await AsyncStorage.removeItem('fightState');
                }

            }
        };

        handleVictory();

        return () => {
            if (delay) {
                clearTimeout(delay);
            }
        };
    }, [isEnemyDefeated]);


    useEffect(() => {
        const loadGoldFromStorage = async () => {
            try {
                const gold = await AsyncStorage.getItem('gold');
                if (gold !== null) {
                    setGold(parseInt(gold));
                } else {
                    setGold(0);
                }
            } catch (error) {
                console.error('Failed to load gold from storage:', error);
            }
        };
        loadGoldFromStorage();
    }, []);

    useEffect(() => {
        const saveFightState = async () => {
            try {
                if (!isCustomMode && enemy) {
                    const fightState = {
                        savedEnemy: enemy,
                        savedEnemyHealth: enemyHealth,
                        savedEnemyMaxHealth: enemyMaxHealth,
                        savedMuscleGroup: muscleGroup,
                        savedExercises: selectedExercises
                    };
                    await AsyncStorage.setItem('fightState', JSON.stringify(fightState));
                }
            } catch (error) {
                //console.error('Failed to save fight state to storage:', error);
            }
        };

        if (enemy) {
            saveFightState();
        }
    }, [enemy, enemyHealth, enemyMaxHealth, muscleGroup, selectedExercises]);

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
                <Ionicons key={i} name="star" size={10} color="white" style={styles.star}/>
            );
        }
        return stars;
    };

    const handleExercisePress = async (exercise) => {
        try {
            await buttonSelectSound.current.replayAsync();
        } catch (error) {
            console.error("Failed to play the button select sound", error);
        }
        setCurrentExercise(exercise);
        setModalVisible(true);
        setExerciseTimer(exercise.timer); // Initialize exercise timer
        setTimerStarted(false); // Reset timerStarted state
        Haptics.selectionAsync();
    };


    const handleStartPress = () => {
        setTimerStarted(true);
    };



    useEffect(() => {
        let timerInterval;
        if (isModalVisible && currentExercise && timerStarted) {
            if (exerciseTimer > 0) {
                timerInterval = setInterval(() => {
                    setExerciseTimer(prevTimer => prevTimer - 1);
                }, 1000);
            }
        } else {
            setExerciseTimer(currentExercise ? currentExercise.timer : 0); // Reset exercise timer when modal is closed
        }

        return () => clearInterval(timerInterval);
    }, [isModalVisible, currentExercise, exerciseTimer, timerStarted]);


    const handleDonePress = async () => {
        let baseDamage = currentExercise.baseDamage;
        totalCalories = totalCalories + currentExercise.caloriesBurned;
        let additionalDamage = Math.floor(Math.random() * 6) + 1;
        let criticalChance = 0.05;

        console.log('=============== DAMAGE CALCULATIONS ===============');
        console.log('=============== INITIAL ===============');
        console.log('Initial base damage:', baseDamage);
        console.log('Initial critical chance:', criticalChance);
        console.log('=============== RANDOMIZED BONUS ===============');
        console.log('Additional randomized damage:', additionalDamage);

        const highestBaseDamageItem = boughtItems
            .filter(item => item.category === "Base Damage")
            .reduce((max, item) => item.effect > max.effect ? item : max, {effect: 0});

        if (highestBaseDamageItem.effect > 0) {
            baseDamage += highestBaseDamageItem.effect;
        }

        boughtItems.forEach(item => {
            if (item.category === "Critical Rate") {
                criticalChance += item.effect;
            }
        });
        console.log('=============== ITEMS ===============');
        console.log('Base damage after item effects:', baseDamage);
        console.log('Critical chance after item effects:', criticalChance);

        const criticalHit = Math.random() < criticalChance;
        const totalDamage = baseDamage + additionalDamage + (criticalHit ? baseDamage : 0);

        totalDamageDone = totalDamageDone + totalDamage;

        console.log('Critical hit:', criticalHit);
        console.log('Total damage:', totalDamage);

        setEnemyHealth(prevHealth => Math.max(prevHealth - totalDamage, 0));
        setDamageText(`-${totalDamage}${criticalHit ? '!!' : '!'}`);
        setModalVisible(false);
        setExerciseTimer(0);
        Haptics.selectionAsync();

        const intensity = criticalHit ? 20 : 10;
        const duration = criticalHit ? 150 : 100;
        Animated.sequence([
            Animated.timing(shakeAnimation, {toValue: intensity, duration, useNativeDriver: true}),
            Animated.timing(shakeAnimation, {toValue: -intensity, duration, useNativeDriver: true}),
            Animated.timing(shakeAnimation, {toValue: intensity, duration, useNativeDriver: true}),
            Animated.timing(shakeAnimation, {toValue: 0, duration, useNativeDriver: true})
        ]).start();

        const soundFile = criticalHit ? require('../assets/sfx/criticalHit.wav') : require('../assets/sfx/hit.wav');

        if (soundFile) {
            const {sound} = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
        }

        if (enemyHealth - totalDamage <= 0) {
            setEnemyDefeated(true);
        }
    };

    const handleVictoryButtonPress = async (screenName) => {
        try {
            await buttonSelectSound.current.replayAsync();
            await Haptics.selectionAsync();
            let updatedGold;
            let reward;

            if (!isCustomMode) {
                reward = enemy.reward;
            } else {
                reward = Math.ceil(enemy.reward / 3);
            }

            updatedGold = gold + reward;
            setGold(updatedGold);

            await AsyncStorage.setItem('gold', updatedGold.toString());
            console.log('Gold saved to storage:', updatedGold);

            //TOTAL GOLD
            const storedTotalGold = await AsyncStorage.getItem('totalGold');
            const currentGold = storedTotalGold ? parseInt(storedTotalGold) : 0;
            const updatedTotalGold = currentGold + reward;
            await AsyncStorage.setItem('totalGold', updatedTotalGold.toString());

            //TOTAL CALORIES
            const storedTotalCalories = await AsyncStorage.getItem('totalCalories');
            const currentCalories = storedTotalCalories ? parseInt(storedTotalCalories) : 0;
            const updatedTotalCalories = currentCalories + totalCalories;
            await AsyncStorage.setItem('totalCalories', updatedTotalCalories.toString());

            //TOTAL DAMAGE
            const storedTotalDamage = await AsyncStorage.getItem('totalDamage');
            const currentDamage = storedTotalDamage ? parseInt(storedTotalDamage) : 0;
            const updatedTotalDamage = currentDamage + totalDamageDone;
            await AsyncStorage.setItem('totalDamage', updatedTotalDamage.toString());

            swap.navigate(screenName);
        } catch (error) {
            console.error("Failed to go back to home", error);
        }
    };

    const windowWidth = Dimensions.get('window').width;

    return (
        <View style={styles.container}>
            {enemy !== null && enemy !== undefined && (
                <ImageBackground
                    source={{uri: `${enemy.biome}`}}
                    style={styles.enemyContainer}
                >
                    <HealthBar health={enemyHealth} maxHealth={enemyMaxHealth}/>
                    <Animated.Image
                        source={{uri: `${enemy.image}`}}
                        style={[styles.enemyImage, {transform: [{translateX: shakeAnimation}]}]}
                    />
                    {damageText ? <Text
                        style={[styles.damageText, damageText.includes('!!') ? {color: 'orange'} : null]}>{damageText}</Text> : null}
                </ImageBackground>
            )}
            <Text style={styles.heading}>
                It's {isCustomMode ? `${muscleGroup} time!` : `${muscleGroup} Day!`}
            </Text>
            <View style={styles.movesContainer}>
                {selectedExercises.map((exercise, index) => (
                    <View style={[styles.buttonContainer, {width: '50%'}]} key={index}>
                        <TouchableOpacity
                            onPress={() => handleExercisePress(exercise)}
                            style={[styles.button, disableMoves && {opacity: 0.5}]}
                            disabled={disableMoves}
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
                            <Text style={styles.modalSubtitle}>Calories: {currentExercise.caloriesBurned}</Text>
                            <Text style={styles.modalSubtitle}>Time Remaining: {exerciseTimer} seconds</Text>
                            <Image source={{ uri: currentExercise.image }} style={styles.modalImage} />
                            {timerStarted ? (
                                <TouchableOpacity onPress={handleDonePress} disabled={exerciseTimer > 0} style={styles.doneButton}>
                                    <Text style={styles.doneButtonText}>Done</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={handleStartPress} style={styles.startButton}>
                                    <Text style={styles.startButtonText}>Start!</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </Modal>
            {showVictoryPopup && (
                <Modal isVisible={showVictoryPopup} backdropOpacity={0.7}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{enemy.name} Defeated!</Text>
                        <Text style={styles.modalSubtitle}>
                            You've burned{' '}
                            <Text style={{fontWeight: 'bold'}}>
                                {totalCalories}
                            </Text>
                            {' '}calories!
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            You've gained{' '}
                            <Text style={{fontWeight: 'bold'}}>
                                {Math.ceil(isCustomMode ? enemy.reward / 3 : enemy.reward)}
                            </Text>
                            {' '}gold.
                        </Text>
                        <Image source={require('../assets/images/icons/treasure.jpg')} style={styles.modalImage}/>
                        <TouchableOpacity onPress={() => handleVictoryButtonPress("index")} style={styles.doneButton}>
                            <Text style={styles.doneButtonText}>Head Back!</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
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
        height: 80,
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
    victoryPopup: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 999,
    },
    victoryText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    rewardText: {
        fontSize: 16,
        marginBottom: 20,
    },
    backButtonText: {
        color: 'blue',
        fontSize: 16,
    },
    startButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Daily;
