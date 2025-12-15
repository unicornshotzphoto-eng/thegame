import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const TypingIndicator = ({ visible = true }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            const animateDot = (dot, delay) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(dot, {
                            toValue: -8,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            const animation = Animated.parallel([
                animateDot(dot1, 0),
                animateDot(dot2, 150),
                animateDot(dot3, 300),
            ]);

            animation.start();

            return () => animation.stop();
        }
    }, [visible, dot1, dot2, dot3]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        marginLeft: 16,
    },
    bubble: {
        backgroundColor: '#333',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#888',
        marginHorizontal: 3,
    },
});

export default TypingIndicator;
