import React from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import DirectMessages from './DirectMessages';

function Messages() {
    const router = useRouter();
    
    return (
        <View style={styles.container}>
            <DirectMessages navigation={{ navigate: (screen) => router.push(screen) }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});

export default Messages;
