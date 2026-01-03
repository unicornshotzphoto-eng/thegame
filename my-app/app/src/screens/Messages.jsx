import React from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import DirectMessages from './DirectMessages';
import BackgroundWrapper from '../components/BackgroundWrapper';

function Messages() {
    const router = useRouter();
    
    return (
        <BackgroundWrapper overlayOpacity={0.5}>
            <View style={styles.container}>
                <DirectMessages navigation={{ navigate: (screen) => router.push(screen) }} />
            </View>
        </BackgroundWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default Messages;
