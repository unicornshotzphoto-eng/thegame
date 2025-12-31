import React, { useState } from 'react';
import { 
    Text,
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    StyleSheet, 
    TextInput, 
    View, 
    ScrollView, 
    Keyboard,
    KeyboardAvoidingView,
    SafeAreaView
    } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '../utils/alert';
import api from '../core/api';
import { log } from '../core/utils';
import useStore from '../core/global';
import { storeUserData, storeAuthToken, clearSecureStorage } from '../core/secureStorage';
import { THEME } from '../constants/appTheme';

function Signin(props) {
    console.log('Signin component rendered');
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useStore((state) => state.login);

    const validate = () => {
        console.log('Validating...');
        if (!username.trim()) {
            console.log('Username is empty');
            showAlert('Username required', 'Please enter your username');
            return false;
        }
        if (!password.trim()) {
            console.log('Password is empty');
            showAlert('Password required', 'Please enter your password');
            return false;
        }
        if (password.length < 6) {
            console.log('Password too short');
            showAlert('Weak password', 'Password must be at least 6 characters');
            return false;
        }
        console.log('Validation passed');
        return true;
    };

    const handleSubmit = async () => {
        console.log('Sign in button pressed');
        console.log('Username:', username);
        console.log('Password:', password);
        if (!validate()) return;
        
        // Clear any existing expired token before sign in
        await clearSecureStorage();
        console.log('Cleared old auth token before signin');
        
        console.log('Making API request to quiz/signin/');
        api({
            method: 'POST',
            url: 'quiz/signin/',
            data: {
                username: username,
                password: password
            }
        })
        .then(async response => {
            console.log('=== Sign in Response JSON ===');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('=== End Response ===');
            
            // Update Zustand store with user data
            login(response.data.user);
            
            // Save user data to encrypted storage for persistence
            await storeUserData(response.data.user);
            
            // Store auth token (access token from JWT)
            if (response.data.access) {
                await storeAuthToken(response.data.access);
                console.log('Auth token stored successfully');
            } else if (response.data.token) {
                await storeAuthToken(response.data.token);
                console.log('Auth token stored successfully');
            }
            
            // Clear input fields
            setUsername('');
            setPassword('');
            
            // Navigate to Home screen using Expo Router
            router.replace('/(tabs)');
            
            showAlert('Sign in successful', `Welcome back, ${response.data.user.username}!`);
        })
        .catch(error => {
            console.log('=== Sign in Error ===');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
                console.log('Headers:', error.response.headers);
                showAlert('Sign in failed', `Error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.log('No response received:', error.request);
                console.log('Full error:', error);
                showAlert('Network Error', 'Could not connect to server. Make sure the API is running at http://localhost:8000');
            } else {
                console.log('Sign in error:', error.message);
                showAlert('Sign in failed', error.message);
            }
        });
    };

    const handleSignUp = () => {
        router.push('/Signup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView behavior='padding' style={styles.keyboardView}>
                    <View style={styles.centerContainer}>
                        <View style={styles.cardContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Sign in</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Your username"
                        placeholderTextColor="#999"
                        style={styles.input}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        autoComplete='off'
                        autoCapitalize='none'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="At least 6 characters"
                        placeholderTextColor="#999"
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
                        </TouchableOpacity>
                    </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Signin;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: THEME.secondary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: THEME.spacing.xl,
    },
    keyboardView: {
        flex: 1,
        width: '100%',
    },
    centerContainer: {
        width: '85%',
        maxWidth: 500,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { 
        padding: THEME.spacing.xl, 
        paddingTop: THEME.spacing.xl,
    },
    cardContainer: {
        width: '100%',
        backgroundColor: THEME.surfaceDark,
        borderRadius: THEME.borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    title: { 
        color: THEME.text.primary, 
        fontSize: 28, 
        fontWeight: '700', 
        marginBottom: THEME.spacing.xl, 
        textAlign: 'center' 
    },
    field: { 
        marginBottom: THEME.spacing.lg 
    },
    label: { 
        color: THEME.text.secondary, 
        marginBottom: THEME.spacing.sm,
        fontWeight: '500'
    },
    input: { 
        backgroundColor: THEME.surfaceDark, 
        color: THEME.text.primary,
        paddingHorizontal: THEME.spacing.md, 
        paddingVertical: THEME.spacing.md, 
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.borderLight
    },
    button: { 
        marginTop: THEME.spacing.lg, 
        backgroundColor: THEME.primary, 
        paddingVertical: THEME.spacing.md, 
        borderRadius: THEME.borderRadius.md, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: THEME.text.primary, 
        fontWeight: '700',
        fontSize: 16
    },
    ghostButton: { 
        marginTop: THEME.spacing.md, 
        alignItems: 'center' 
    },
    ghostText: { 
        color: THEME.text.tertiary 
    },
    divider: { 
        marginTop: THEME.spacing.xl, 
        marginBottom: THEME.spacing.xl, 
        height: 1, 
        backgroundColor: THEME.borderLight 
    },
    signupButton: { 
        alignItems: 'center' 
    },
    signupText: { 
        color: THEME.text.secondary, 
        fontSize: 14 
    },
    signupLink: { 
        color: THEME.primary, 
        fontWeight: '700' 
    },
});